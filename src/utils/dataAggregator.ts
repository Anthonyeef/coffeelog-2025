import { Transaction, CoffeeTransaction, CoffeeDataByDate, CoffeeStatistics } from '../types'
import { detectCoffeeBatch, filterCoffeeTransactions } from './coffeeDetector'

/**
 * Combine transactions from Alipay and WeChat Pay
 */
export function combineTransactions(
  alipayTransactions: Transaction[],
  wechatPayTransactions: Transaction[]
): Transaction[] {
  return [...alipayTransactions, ...wechatPayTransactions]
}

/**
 * Group coffee transactions by date
 */
export function groupCoffeeTransactionsByDate(
  transactions: CoffeeTransaction[]
): CoffeeDataByDate {
  const grouped: CoffeeDataByDate = {}
  
  for (const transaction of transactions) {
    const date = transaction.date // YYYY-MM-DD format
    
    if (!grouped[date]) {
      grouped[date] = []
    }
    
    grouped[date].push(transaction)
  }
  
  // Sort transactions within each date by time
  for (const date in grouped) {
    grouped[date].sort((a, b) => {
      return a.time.localeCompare(b.time)
    })
  }
  
  return grouped
}

/**
 * Calculate coffee statistics
 */
export function calculateCoffeeStatistics(
  coffeeTransactions: CoffeeTransaction[]
): CoffeeStatistics {
  if (coffeeTransactions.length === 0) {
    return {
      totalPurchases: 0,
      totalSpending: 0,
      averagePerMonth: 0,
      averagePerWeek: 0,
      mostFrequentShop: '',
      purchaseFrequency: {},
    }
  }
  
  const totalPurchases = coffeeTransactions.length
  const totalSpending = coffeeTransactions.reduce((sum, t) => sum + t.amount, 0)
  
  // Group by month for frequency calculation
  const purchaseFrequency: { [month: string]: number } = {}
  const shopFrequency: { [shop: string]: number } = {}
  
  for (const transaction of coffeeTransactions) {
    // Extract month (YYYY-MM)
    const month = transaction.date.substring(0, 7)
    purchaseFrequency[month] = (purchaseFrequency[month] || 0) + 1
    
    // Count shop frequency
    const shop = transaction.merchant || 'Unknown'
    shopFrequency[shop] = (shopFrequency[shop] || 0) + 1
  }
  
  // Calculate average per month
  const months = Object.keys(purchaseFrequency)
  const averagePerMonth = months.length > 0 ? totalPurchases / months.length : 0
  
  // Calculate average per week (approximate: total purchases / (months * 4.33))
  const weeks = months.length * 4.33
  const averagePerWeek = weeks > 0 ? totalPurchases / weeks : 0
  
  // Find most frequent shop
  let mostFrequentShop = ''
  let maxCount = 0
  for (const shop in shopFrequency) {
    if (shopFrequency[shop] > maxCount) {
      maxCount = shopFrequency[shop]
      mostFrequentShop = shop
    }
  }
  
  return {
    totalPurchases,
    totalSpending,
    averagePerMonth,
    averagePerWeek,
    mostFrequentShop,
    purchaseFrequency,
  }
}

/**
 * Process all transactions: combine, detect coffee, group by date, calculate stats
 */
export function processAllTransactions(
  alipayTransactions: Transaction[],
  wechatPayTransactions: Transaction[]
): {
  allTransactions: Transaction[]
  coffeeTransactions: CoffeeTransaction[]
  coffeeByDate: CoffeeDataByDate
  statistics: CoffeeStatistics
} {
  // Combine all transactions
  const allTransactions = combineTransactions(alipayTransactions, wechatPayTransactions)
  
  // Detect coffee transactions
  const allCoffeeTransactions = detectCoffeeBatch(allTransactions)
  const coffeeTransactions = filterCoffeeTransactions(allCoffeeTransactions)
  
  // Group by date
  const coffeeByDate = groupCoffeeTransactionsByDate(coffeeTransactions)
  
  // Calculate statistics
  const statistics = calculateCoffeeStatistics(coffeeTransactions)
  
  return {
    allTransactions,
    coffeeTransactions,
    coffeeByDate,
    statistics,
  }
}

