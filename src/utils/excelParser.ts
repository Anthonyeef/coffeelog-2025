import * as XLSX from 'xlsx'
import { Transaction } from '../types'

/**
 * Parse WeChat Pay Excel file
 * Excel files contain transaction records with similar structure to Alipay
 */
export async function parseWeChatPayExcel(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          reject(new Error('No worksheet found in Excel file'))
          return
        }
        
        const worksheet = workbook.Sheets[sheetName]
        
        // Convert to JSON - this will give us an array of objects
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false 
        }) as any[][]
        
        if (jsonData.length === 0) {
          resolve([])
          return
        }
        
        // Find header row (usually first non-empty row with column names)
        let headerRowIndex = -1
        let headerRow: string[] = []
        
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
          const row = jsonData[i]
          if (Array.isArray(row) && row.length > 0) {
            const firstCell = String(row[0] || '').trim()
            // Look for common header indicators
            if (firstCell.includes('交易时间') || firstCell.includes('支付时间') || firstCell.includes('时间')) {
              headerRowIndex = i
              headerRow = row.map(cell => String(cell || '').trim())
              break
            }
          }
        }
        
        if (headerRowIndex === -1) {
          // Try to use first row as header
          headerRowIndex = 0
          headerRow = jsonData[0].map(cell => String(cell || '').trim())
        }
        
        // Map WeChat Pay columns to our structure
        // Common WeChat Pay column names (may vary):
        // 交易时间, 交易类型, 交易对方, 商品, 收/支, 金额(元), 支付方式, 交易状态, 交易单号, 商户单号, 备注
        const columnMap: { [key: string]: string } = {}
        headerRow.forEach((col, index) => {
          const colLower = col.toLowerCase()
          if (colLower.includes('交易时间') || colLower.includes('支付时间') || colLower.includes('时间')) {
            columnMap.datetime = String(index)
          } else if (colLower.includes('交易类型') || colLower.includes('类型')) {
            columnMap.category = String(index)
          } else if (colLower.includes('交易对方') || colLower.includes('对方')) {
            columnMap.merchant = String(index)
          } else if (colLower.includes('商品') || colLower.includes('商品说明')) {
            columnMap.description = String(index)
          } else if (colLower.includes('收/支') || colLower.includes('收支')) {
            columnMap.type = String(index)
          } else if (colLower.includes('金额') || colLower.includes('金额(元)')) {
            columnMap.amount = String(index)
          } else if (colLower.includes('支付方式') || colLower.includes('付款方式')) {
            columnMap.paymentMethod = String(index)
          } else if (colLower.includes('交易状态') || colLower.includes('状态')) {
            columnMap.status = String(index)
          } else if (colLower.includes('交易单号') || colLower.includes('交易订单号')) {
            columnMap.transactionId = String(index)
          } else if (colLower.includes('商户单号') || colLower.includes('商家订单号')) {
            columnMap.merchantOrderId = String(index)
          } else if (colLower.includes('备注')) {
            columnMap.note = String(index)
          }
        })
        
        const transactions: Transaction[] = []
        
        // Process data rows (skip header row)
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!Array.isArray(row) || row.length === 0) continue
          
          const datetime = String(row[parseInt(columnMap.datetime || '0')] || '').trim()
          const type = String(row[parseInt(columnMap.type || '0')] || '').trim()
          
          // Parse datetime
          let date = ''
          let time = ''
          
          // Try different datetime formats
          const dateMatch = datetime.match(/^(\d{4}[-/]\d{2}[-/]\d{2})[\sT](\d{2}:\d{2}:\d{2})?/)
          if (dateMatch) {
            date = dateMatch[1].replace(/\//g, '-')
            time = dateMatch[2] || '00:00:00'
          } else {
            // Try YYYYMMDD format
            const dateMatch2 = datetime.match(/^(\d{4})(\d{2})(\d{2})/)
            if (dateMatch2) {
              date = `${dateMatch2[1]}-${dateMatch2[2]}-${dateMatch2[3]}`
              time = '00:00:00'
            } else {
              continue // Skip invalid date rows
            }
          }
          
          // Filter: only 2025 transactions and only outgoing payments
          // WeChat Pay uses "支出" or "已支出" or "支出-" etc.
          if (!date.startsWith('2025')) continue
          if (!type.includes('支出') && type !== '支出') continue
          
          const category = String(row[parseInt(columnMap.category || '1')] || '').trim()
          const merchant = String(row[parseInt(columnMap.merchant || '2')] || '').trim()
          const description = String(row[parseInt(columnMap.description || '3')] || '').trim()
          const amountStr = String(row[parseInt(columnMap.amount || '5')] || '').trim()
          const paymentMethod = String(row[parseInt(columnMap.paymentMethod || '6')] || '').trim()
          const status = String(row[parseInt(columnMap.status || '7')] || '').trim()
          const transactionId = String(row[parseInt(columnMap.transactionId || '8')] || '').trim()
          const merchantOrderId = String(row[parseInt(columnMap.merchantOrderId || '9')] || '').trim()
          const note = String(row[parseInt(columnMap.note || '10')] || '').trim()
          
          // Parse amount (remove currency symbols, commas, etc.)
          const amountNum = parseFloat(amountStr.replace(/[^\d.-]/g, '') || '0')
          
          transactions.push({
            date,
            time,
            datetime: datetime || `${date} ${time}`,
            category,
            merchant,
            account: '', // WeChat Pay may not have this field
            description,
            type: '支出' as '支出' | '收入' | '收入/支出',
            amount: amountNum,
            paymentMethod,
            status,
            transactionId,
            merchantOrderId,
            note,
            source: 'wechatpay',
          })
        }
        
        resolve(transactions)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse multiple WeChat Pay Excel files (quarterly files)
 */
export async function parseWeChatPayExcelFiles(files: File[]): Promise<Transaction[]> {
  const allTransactions: Transaction[] = []
  
  for (const file of files) {
    try {
      const transactions = await parseWeChatPayExcel(file)
      allTransactions.push(...transactions)
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error)
      // Continue with other files even if one fails
    }
  }
  
  return allTransactions
}

