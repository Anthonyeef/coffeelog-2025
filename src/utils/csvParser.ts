import Papa from 'papaparse'
import { Transaction } from '../types'

/**
 * Parse Alipay CSV file with GBK encoding
 * CSV format: Header at line 25, data starts at line 26
 * Columns: 交易时间,交易分类,交易对方,对方账号,商品说明,收/支,金额,收/付款方式,交易状态,交易订单号,商家订单号,备注
 */
export async function parseAlipayCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    // Read file as text first to handle encoding
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n')
        
        // Skip header rows (lines 1-24) and find the actual header
        // Header is at line 25 (index 24)
        const headerLine = lines[24]?.trim()
        if (!headerLine) {
          reject(new Error('Could not find CSV header'))
          return
        }
        
        // Extract data rows (starting from line 26, index 25)
        const dataLines = lines.slice(25).filter(line => line.trim())
        
        // Parse CSV manually since we need to handle GBK encoding
        const transactions: Transaction[] = []
        
        for (const line of dataLines) {
          if (!line.trim()) continue
          
          // Parse CSV line (handle quoted fields)
          const row = parseCSVLine(line)
          
          if (row.length < 12) continue // Skip incomplete rows
          
          const [
            datetime,      // 交易时间
            category,      // 交易分类
            merchant,      // 交易对方
            account,       // 对方账号
            description,   // 商品说明
            type,          // 收/支
            amount,        // 金额
            paymentMethod, // 收/付款方式
            status,        // 交易状态
            transactionId, // 交易订单号
            merchantOrderId, // 商家订单号
            note           // 备注
          ] = row
          
          // Parse datetime: YYYY-MM-DD HH:MM:SS
          const dateMatch = datetime?.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/)
          if (!dateMatch) continue
          
          const date = dateMatch[1]
          const time = dateMatch[2]
          
          // Filter: only 2025 transactions and only "支出" (outgoing payments)
          if (!date.startsWith('2025') || type !== '支出') {
            continue
          }
          
          // Parse amount (remove commas, handle Chinese decimal separator if any)
          const amountNum = parseFloat(amount?.replace(/,/g, '') || '0')
          
          transactions.push({
            date,
            time,
            datetime: datetime || '',
            category: category || '',
            merchant: merchant || '',
            account: account || '',
            description: description || '',
            type: type as '支出' | '收入' | '收入/支出',
            amount: amountNum,
            paymentMethod: paymentMethod || '',
            status: status || '',
            transactionId: transactionId?.trim() || '',
            merchantOrderId: merchantOrderId?.trim() || '',
            note: note || '',
            source: 'alipay',
          })
        }
        
        resolve(transactions)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    // Read as text - browser will handle encoding based on file
    // For GBK files, we may need to use a library or convert server-side
    // For now, assume UTF-8 or let browser handle it
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current.trim())
  
  return result
}

