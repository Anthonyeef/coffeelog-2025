import { Transaction, CoffeeTransaction } from '../types'

/**
 * Coffee-related keywords for matching
 */
const COFFEE_KEYWORDS = {
  english: [
    'coffee',
    'starbucks',
    'luckin',
    'manner',
    'grid coffee',
    'cafe',
    'café',
    'espresso',
    'latte',
    'cappuccino',
    'americano',
    'mocha',
    'frappuccino',
    'coffee shop',
    'coffeehouse',
    'barista',
  ],
  chinese: [
    '咖啡',
    '星巴克',
    '瑞幸',
    'luckin',
    'manner',
    'Manner',
    'Grid Coffee',
    'grid coffee',
    '咖啡馆',
    '咖啡店',
    '咖啡厅',
    '咖啡吧',
    '手冲咖啡',
    '精品咖啡',
    '意式咖啡',
    '美式咖啡',
    '拿铁',
    '卡布奇诺',
    '摩卡',
    '浓缩咖啡',
    '咖啡豆',
    '咖啡机',
  ],
  merchantNames: [
    'starbucks',
    '星巴克',
    'luckin',
    '瑞幸',
    'manner',
    'Manner',
    'mannercoffee',
    'grid coffee',
    'Grid Coffee',
    'coffee',
    '咖啡',
    '北京茵赫餐饮管理有限公司',
    '茵赫', // Manner Coffee official company name
  ],
}

/**
 * Check if a transaction is coffee-related
 */
export function detectCoffee(transaction: Transaction): CoffeeTransaction {
  const merchant = transaction.merchant || ''
  const merchantLower = merchant.toLowerCase()
  const description = (transaction.description || '').toLowerCase()
  const account = (transaction.account || '').toLowerCase() // Also check account field
  
  const matchedKeywords: string[] = []
  let confidence = 0
  
  // Check merchant name (handle both Chinese and English)
  for (const keyword of COFFEE_KEYWORDS.merchantNames) {
    // For Chinese keywords, check original case; for English, check lowercase
    const merchantToCheck = /[\u4e00-\u9fa5]/.test(keyword) ? merchant : merchantLower
    const keywordToCheck = /[\u4e00-\u9fa5]/.test(keyword) ? keyword : keyword.toLowerCase()
    
    if (merchantToCheck.includes(keywordToCheck)) {
      matchedKeywords.push(keyword)
      confidence += 0.8 // High confidence for merchant match
      break
    }
  }
  
  // Check account field for coffee-related domains/emails (e.g., mannercoffee.com.cn)
  if (account.includes('mannercoffee') || account.includes('starbucks') || account.includes('luckin') || account.includes('coffee')) {
    if (!matchedKeywords.some(k => k.toLowerCase().includes('manner') || k.toLowerCase().includes('coffee'))) {
      matchedKeywords.push('account-domain')
      confidence += 0.9 // High confidence for domain match
    }
  }
  
  // Check English keywords in merchant, description, and account
  for (const keyword of COFFEE_KEYWORDS.english) {
    const keywordLower = keyword.toLowerCase()
    if (merchantLower.includes(keywordLower) || description.includes(keywordLower) || account.includes(keywordLower)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword)
        confidence += 0.6
      }
    }
  }
  
  // Check Chinese keywords in merchant, description, and account
  for (const keyword of COFFEE_KEYWORDS.chinese) {
    if (merchant.includes(keyword) || description.includes(keyword) || account.includes(keyword)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword)
        confidence += 0.7
      }
    }
  }
  
  // Normalize confidence to 0-1 range
  confidence = Math.min(confidence, 1.0)
  
  // Consider it coffee if confidence > 0.5
  const isCoffee = confidence > 0.5
  
  return {
    ...transaction,
    isCoffee,
    confidence,
    matchedKeywords,
  }
}

/**
 * Detect coffee for multiple transactions
 */
export function detectCoffeeBatch(transactions: Transaction[]): CoffeeTransaction[] {
  return transactions.map(detectCoffee)
}

/**
 * Filter only coffee transactions
 */
export function filterCoffeeTransactions(transactions: CoffeeTransaction[]): CoffeeTransaction[] {
  return transactions.filter(t => t.isCoffee)
}

