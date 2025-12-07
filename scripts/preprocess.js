import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coffee detection keywords
const COFFEE_KEYWORDS = {
  english: [
    'coffee', 'starbucks', 'luckin', 'manner', 'grid coffee', 'cafe', 'café',
    'espresso', 'latte', 'cappuccino', 'americano', 'mocha', 'frappuccino',
    'coffee shop', 'coffeehouse', 'barista',
  ],
  chinese: [
    '咖啡', '星巴克', '瑞幸', 'luckin', 'manner', 'Manner', 'Grid Coffee',
    'grid coffee', '咖啡馆', '咖啡店', '咖啡厅', '咖啡吧', '手冲咖啡',
    '精品咖啡', '意式咖啡', '美式咖啡', '拿铁', '卡布奇诺', '摩卡',
    '浓缩咖啡', '咖啡豆', '咖啡机',
  ],
  merchantNames: [
    'starbucks', '星巴克', 'luckin', '瑞幸', 'manner', 'Manner',
    'mannercoffee', 'grid coffee', 'Grid Coffee', 'coffee', '咖啡',
    '北京茵赫餐饮管理有限公司', '茵赫', // Manner Coffee official company name
  ],
};

function detectCoffee(transaction) {
  const merchant = transaction.merchant || '';
  const merchantLower = merchant.toLowerCase();
  const description = (transaction.description || '').toLowerCase();
  const account = (transaction.account || '').toLowerCase(); // Also check account field
  
  const matchedKeywords = [];
  let confidence = 0;
  
  // Check merchant name (handle both Chinese and English)
  for (const keyword of COFFEE_KEYWORDS.merchantNames) {
    // For Chinese keywords, check original case; for English, check lowercase
    const merchantToCheck = /[\u4e00-\u9fa5]/.test(keyword) ? merchant : merchantLower;
    const keywordToCheck = /[\u4e00-\u9fa5]/.test(keyword) ? keyword : keyword.toLowerCase();
    
    if (merchantToCheck.includes(keywordToCheck)) {
      matchedKeywords.push(keyword);
      confidence += 0.8;
      break;
    }
  }
  
  // Check account field for coffee-related domains/emails (e.g., mannercoffee.com.cn)
  if (account.includes('mannercoffee') || account.includes('starbucks') || account.includes('luckin') || account.includes('coffee')) {
    if (!matchedKeywords.some(k => k.toLowerCase().includes('manner') || k.toLowerCase().includes('coffee'))) {
      matchedKeywords.push('account-domain');
      confidence += 0.9; // High confidence for domain match
    }
  }
  
  // Check English keywords in merchant, description, and account
  for (const keyword of COFFEE_KEYWORDS.english) {
    const keywordLower = keyword.toLowerCase();
    if (merchantLower.includes(keywordLower) || description.includes(keywordLower) || account.includes(keywordLower)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 0.6;
      }
    }
  }
  
  // Check Chinese keywords in merchant, description, and account
  for (const keyword of COFFEE_KEYWORDS.chinese) {
    if (merchant.includes(keyword) || description.includes(keyword) || account.includes(keyword)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 0.7;
      }
    }
  }
  
  confidence = Math.min(confidence, 1.0);
  const isCoffee = confidence > 0.5;
  
  return { isCoffee, confidence, matchedKeywords };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseAlipayCSV(filePath) {
  console.log(`Parsing Alipay CSV: ${filePath}`);
  let content;
  try {
    // Read as buffer and decode from GBK
    const buffer = fs.readFileSync(filePath);
    content = iconv.decode(buffer, 'gbk');
  } catch (e) {
    console.error(`  Error reading file: ${e.message}`);
    return [];
  }
  const lines = content.split(/\r?\n/);
  
  // Header is at line 25 (index 24)
  const dataLines = lines.slice(25).filter(line => line.trim());
  
  const transactions = [];
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    const row = parseCSVLine(line);
    if (row.length < 12) continue;
    
    const [
      datetime, category, merchant, account, description,
      type, amount, paymentMethod, status,
      transactionId, merchantOrderId, note
    ] = row;
    
    const dateMatch = datetime?.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
    if (!dateMatch) continue;
    
    const date = dateMatch[1];
    const time = dateMatch[2];
    
    // Filter: only 2025 and "支出"
    if (!date.startsWith('2025') || type !== '支出') {
      continue;
    }
    
    const amountNum = parseFloat(amount?.replace(/,/g, '') || '0');
    
    transactions.push({
      date,
      time,
      datetime: datetime || '',
      category: category || '',
      merchant: merchant || '',
      account: account || '',
      description: description || '',
      type: '支出',
      amount: amountNum,
      paymentMethod: paymentMethod || '',
      status: status || '',
      transactionId: transactionId?.trim() || '',
      merchantOrderId: merchantOrderId?.trim() || '',
      note: note || '',
      source: 'alipay',
    });
  }
  
  console.log(`  Found ${transactions.length} transactions from 2025`);
  return transactions;
}

function parseWeChatPayExcel(filePath) {
  console.log(`Parsing WeChat Pay Excel: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    console.warn(`  No worksheet found in ${filePath}`);
    return [];
  }
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  
  if (jsonData.length === 0) {
    return [];
  }
  
  // Find header row - WeChat Pay has header at row 16 (index 16)
  // Look for row that starts with "交易时间"
  let headerRowIndex = -1;
  let headerRow = [];
  
  for (let i = 0; i < Math.min(20, jsonData.length); i++) {
    const row = jsonData[i];
    if (Array.isArray(row) && row.length > 0) {
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '交易时间' || firstCell.includes('交易时间')) {
        headerRowIndex = i;
        headerRow = row.map(cell => String(cell || '').trim());
        break;
      }
    }
  }
  
  if (headerRowIndex === -1) {
    console.warn(`  Could not find header row in ${filePath}`);
    return [];
  }
  
  // Map columns
  const columnMap = {};
  headerRow.forEach((col, index) => {
    const colLower = col.toLowerCase();
    if (colLower.includes('交易时间') || colLower.includes('支付时间') || colLower.includes('时间')) {
      columnMap.datetime = String(index);
    } else if (colLower.includes('交易类型') || colLower.includes('类型')) {
      columnMap.category = String(index);
    } else if (colLower.includes('交易对方') || colLower.includes('对方')) {
      columnMap.merchant = String(index);
    } else if (colLower.includes('商品') || colLower.includes('商品说明')) {
      columnMap.description = String(index);
    } else if (colLower.includes('收/支') || colLower.includes('收支')) {
      columnMap.type = String(index);
    } else if (colLower.includes('金额') || colLower.includes('金额(元)')) {
      columnMap.amount = String(index);
    } else if (colLower.includes('支付方式') || colLower.includes('付款方式')) {
      columnMap.paymentMethod = String(index);
    } else if (colLower.includes('交易状态') || colLower.includes('状态')) {
      columnMap.status = String(index);
    } else if (colLower.includes('交易单号') || colLower.includes('交易订单号')) {
      columnMap.transactionId = String(index);
    } else if (colLower.includes('商户单号') || colLower.includes('商家订单号')) {
      columnMap.merchantOrderId = String(index);
    } else if (colLower.includes('备注')) {
      columnMap.note = String(index);
    }
  });
  
  const transactions = [];
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!Array.isArray(row) || row.length === 0) continue;
    
    const datetime = String(row[parseInt(columnMap.datetime || '0')] || '').trim();
    const type = String(row[parseInt(columnMap.type || '0')] || '').trim();
    
    // Skip empty rows
    if (!datetime || datetime === '' || datetime === '/') continue;
    
    let date = '';
    let time = '';
    
    // WeChat Pay format: "2025-12-01 13:58:02"
    const dateMatch = datetime.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
    if (dateMatch) {
      date = dateMatch[1];
      time = dateMatch[2];
    } else {
      // Try other formats
      const dateMatch2 = datetime.match(/^(\d{4}[-/]\d{2}[-/]\d{2})/);
      if (dateMatch2) {
        date = dateMatch2[1].replace(/\//g, '-');
        time = '00:00:00';
      } else {
        continue;
      }
    }
    
    if (!date.startsWith('2025')) continue;
    // WeChat Pay uses "支出" for outgoing payments
    if (type !== '支出' && !type.includes('支出')) continue;
    
    const category = String(row[parseInt(columnMap.category || '1')] || '').trim();
    const merchant = String(row[parseInt(columnMap.merchant || '2')] || '').trim();
    const description = String(row[parseInt(columnMap.description || '3')] || '').trim();
    const amountStr = String(row[parseInt(columnMap.amount || '5')] || '').trim();
    const paymentMethod = String(row[parseInt(columnMap.paymentMethod || '6')] || '').trim();
    const status = String(row[parseInt(columnMap.status || '7')] || '').trim();
    const transactionId = String(row[parseInt(columnMap.transactionId || '8')] || '').trim();
    const merchantOrderId = String(row[parseInt(columnMap.merchantOrderId || '9')] || '').trim();
    const note = String(row[parseInt(columnMap.note || '10')] || '').trim();
    
    // Remove currency symbols and parse amount
    // WeChat Pay format: "¥14.80" or "14.80"
    const amountNum = parseFloat(amountStr.replace(/[¥,\s]/g, '') || '0');
    
    transactions.push({
      date,
      time,
      datetime: datetime || `${date} ${time}`,
      category,
      merchant,
      account: '',
      description,
      type: '支出',
      amount: amountNum,
      paymentMethod,
      status,
      transactionId,
      merchantOrderId,
      note,
      source: 'wechatpay',
    });
  }
  
  console.log(`  Found ${transactions.length} transactions from 2025`);
  return transactions;
}

// Main processing
console.log('Starting data preprocessing...\n');

const alipayPath = path.join(__dirname, '../alipay-record/alipay.csv');
const wechatPayDir = path.join(__dirname, '../wechatpay-record');

// Parse Alipay
let allTransactions = [];
if (fs.existsSync(alipayPath)) {
  allTransactions.push(...parseAlipayCSV(alipayPath));
} else {
  console.warn(`Alipay file not found: ${alipayPath}`);
}

// Parse WeChat Pay files
if (fs.existsSync(wechatPayDir)) {
  const files = fs.readdirSync(wechatPayDir).filter(f => f.endsWith('.xlsx'));
  for (const file of files) {
    const filePath = path.join(wechatPayDir, file);
    allTransactions.push(...parseWeChatPayExcel(filePath));
  }
} else {
  console.warn(`WeChat Pay directory not found: ${wechatPayDir}`);
}

console.log(`\nTotal transactions from 2025: ${allTransactions.length}`);

// Detect coffee transactions
console.log('\nDetecting coffee transactions...');
const coffeeTransactions = [];
for (const transaction of allTransactions) {
  const { isCoffee, confidence, matchedKeywords } = detectCoffee(transaction);
  if (isCoffee) {
    coffeeTransactions.push({
      ...transaction,
      isCoffee: true,
      confidence,
      matchedKeywords,
    });
  }
}

console.log(`Found ${coffeeTransactions.length} coffee transactions`);

// Group by date
const coffeeByDate = {};
for (const transaction of coffeeTransactions) {
  const date = transaction.date;
  if (!coffeeByDate[date]) {
    coffeeByDate[date] = [];
  }
  coffeeByDate[date].push(transaction);
}

// Sort transactions within each date
for (const date in coffeeByDate) {
  coffeeByDate[date].sort((a, b) => a.time.localeCompare(b.time));
}

// Calculate statistics
const totalPurchases = coffeeTransactions.length;
const totalSpending = coffeeTransactions.reduce((sum, t) => sum + t.amount, 0);
const purchaseFrequency = {};
const shopFrequency = {};

for (const transaction of coffeeTransactions) {
  const month = transaction.date.substring(0, 7);
  purchaseFrequency[month] = (purchaseFrequency[month] || 0) + 1;
  
  const shop = transaction.merchant || 'Unknown';
  shopFrequency[shop] = (shopFrequency[shop] || 0) + 1;
}

const months = Object.keys(purchaseFrequency);
const averagePerMonth = months.length > 0 ? totalPurchases / months.length : 0;
const weeks = months.length * 4.33;
const averagePerWeek = weeks > 0 ? totalPurchases / weeks : 0;

let mostFrequentShop = '';
let maxCount = 0;
for (const shop in shopFrequency) {
  if (shopFrequency[shop] > maxCount) {
    maxCount = shopFrequency[shop];
    mostFrequentShop = shop;
  }
}

const statistics = {
  totalPurchases,
  totalSpending,
  averagePerMonth,
  averagePerWeek,
  mostFrequentShop,
  purchaseFrequency,
};

// Create output directory
const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write preprocessed data
const outputData = {
  coffeeTransactions,
  coffeeByDate,
  statistics,
  processedAt: new Date().toISOString(),
};

const outputPath = path.join(outputDir, 'coffee-data.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

console.log(`\n✅ Preprocessing complete!`);
console.log(`📊 Statistics:`);
console.log(`   Total Coffee Purchases: ${statistics.totalPurchases}`);
console.log(`   Total Spending: ¥${statistics.totalSpending.toFixed(2)}`);
console.log(`   Average per Month: ${statistics.averagePerMonth.toFixed(1)}`);
console.log(`   Most Frequent Shop: ${statistics.mostFrequentShop}`);
console.log(`\n💾 Output saved to: ${outputPath}`);
console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

