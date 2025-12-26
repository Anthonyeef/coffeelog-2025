import { CoffeeTransaction } from '../types'

export interface ReceiptData {
  total: number
  monthly: { [month: string]: number }
  topShops: Array<{ name: string; count: number }>
  topBeanMerchants: Array<{ name: string; count: number }>
  receiptId: string
  generatedDate: string
}

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function generateReceiptId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

export function formatMonthLabel(monthIndex: number): string {
  return MONTH_LABELS[monthIndex] || 'UNK'
}

function getMonthIndex(date: string): number {
  const month = parseInt(date.substring(5, 7), 10)
  return month - 1
}

export function aggregateReceiptData(transactions: CoffeeTransaction[]): ReceiptData {
  const total = transactions.length

  const monthly: { [month: string]: number } = {}
  MONTH_LABELS.forEach((month) => {
    monthly[month] = 0
  })

  transactions.forEach((transaction) => {
    const monthIndex = getMonthIndex(transaction.date)
    const monthLabel = formatMonthLabel(monthIndex)
    monthly[monthLabel] = (monthly[monthLabel] || 0) + 1
  })

  const shopCounts: { [shop: string]: number } = {}
  transactions.forEach((transaction) => {
    if (transaction.isBeans !== true) {
      const shop = transaction.merchant || 'Unknown'
      shopCounts[shop] = (shopCounts[shop] || 0) + 1
    }
  })

  const topShops = Object.entries(shopCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const beanMerchantCounts: { [merchant: string]: number } = {}
  transactions.forEach((transaction) => {
    if (transaction.isBeans === true) {
      const merchant = transaction.merchant || 'Unknown'
      beanMerchantCounts[merchant] = (beanMerchantCounts[merchant] || 0) + 1
    }
  })

  const topBeanMerchants = Object.entries(beanMerchantCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const receiptId = generateReceiptId()
  const now = new Date()
  const generatedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`

  return {
    total,
    monthly,
    topShops,
    topBeanMerchants,
    receiptId,
    generatedDate,
  }
}
