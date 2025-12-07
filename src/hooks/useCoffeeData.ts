import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parseAlipayCSV } from '../utils/csvParser'
import { parseWeChatPayExcelFiles } from '../utils/excelParser'
import { processAllTransactions } from '../utils/dataAggregator'
import { CoffeeTransaction, CoffeeDataByDate, CoffeeStatistics, Transaction } from '../types'

const STORAGE_KEYS = {
  COFFEE_DATA: 'coffee-diary-coffee-data',
  COFFEE_BY_DATE: 'coffee-diary-coffee-by-date',
  STATISTICS: 'coffee-diary-statistics',
}

/**
 * Load coffee data from localStorage
 */
function loadCoffeeDataFromStorage(): {
  coffeeTransactions: CoffeeTransaction[]
  coffeeByDate: CoffeeDataByDate
  statistics: CoffeeStatistics
} | null {
  try {
    const coffeeData = localStorage.getItem(STORAGE_KEYS.COFFEE_DATA)
    const coffeeByDate = localStorage.getItem(STORAGE_KEYS.COFFEE_BY_DATE)
    const statistics = localStorage.getItem(STORAGE_KEYS.STATISTICS)
    
    if (coffeeData && coffeeByDate && statistics) {
      return {
        coffeeTransactions: JSON.parse(coffeeData),
        coffeeByDate: JSON.parse(coffeeByDate),
        statistics: JSON.parse(statistics),
      }
    }
  } catch (error) {
    console.error('Error loading coffee data from storage:', error)
  }
  
  return null
}

/**
 * Save coffee data to localStorage
 */
function saveCoffeeDataToStorage(
  coffeeTransactions: CoffeeTransaction[],
  coffeeByDate: CoffeeDataByDate,
  statistics: CoffeeStatistics
) {
  try {
    localStorage.setItem(STORAGE_KEYS.COFFEE_DATA, JSON.stringify(coffeeTransactions))
    localStorage.setItem(STORAGE_KEYS.COFFEE_BY_DATE, JSON.stringify(coffeeByDate))
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(statistics))
  } catch (error) {
    console.error('Error saving coffee data to storage:', error)
  }
}

/**
 * Mutation hook for processing uploaded files
 */
export function useProcessFiles() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (files: File[]) => {
      // Separate CSV and Excel files
      const csvFiles = files.filter(f => f.name.endsWith('.csv'))
      const excelFiles = files.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))
      
      // Parse Alipay CSV files
      const alipayTransactions: Transaction[] = []
      for (const file of csvFiles) {
        try {
          const transactions = await parseAlipayCSV(file)
          alipayTransactions.push(...transactions)
        } catch (error) {
          console.error(`Error parsing CSV file ${file.name}:`, error)
          throw error
        }
      }
      
      // Parse WeChat Pay Excel files
      const wechatPayTransactions = await parseWeChatPayExcelFiles(excelFiles)
      
      // Process all transactions
      const result = processAllTransactions(alipayTransactions, wechatPayTransactions)
      
      // Save to localStorage
      saveCoffeeDataToStorage(
        result.coffeeTransactions,
        result.coffeeByDate,
        result.statistics
      )
      
      return result
    },
    onSuccess: (data) => {
      // Invalidate and refetch coffee data queries
      queryClient.setQueryData(['coffeeTransactions'], data.coffeeTransactions)
      queryClient.setQueryData(['coffeeByDate'], data.coffeeByDate)
      queryClient.setQueryData(['coffeeStatistics'], data.statistics)
    },
  })
}

/**
 * Query hook for coffee transactions
 */
export function useCoffeeTransactions() {
  return useQuery({
    queryKey: ['coffeeTransactions'],
    queryFn: async () => {
      // Try to load from localStorage first
      const cached = loadCoffeeDataFromStorage()
      if (cached) {
        return cached.coffeeTransactions
      }
      
      // Return empty array if no cached data
      return []
    },
    initialData: () => {
      const cached = loadCoffeeDataFromStorage()
      return cached?.coffeeTransactions || []
    },
  })
}

/**
 * Query hook for coffee transactions grouped by date
 */
export function useCoffeeByDate() {
  return useQuery({
    queryKey: ['coffeeByDate'],
    queryFn: async () => {
      const cached = loadCoffeeDataFromStorage()
      if (cached) {
        return cached.coffeeByDate
      }
      return {}
    },
    initialData: () => {
      const cached = loadCoffeeDataFromStorage()
      return cached?.coffeeByDate || {}
    },
  })
}

/**
 * Query hook for coffee statistics
 */
export function useCoffeeStatistics() {
  return useQuery({
    queryKey: ['coffeeStatistics'],
    queryFn: async () => {
      const cached = loadCoffeeDataFromStorage()
      if (cached) {
        return cached.statistics
      }
      return {
        totalPurchases: 0,
        totalSpending: 0,
        averagePerMonth: 0,
        averagePerWeek: 0,
        mostFrequentShop: '',
        purchaseFrequency: {},
      }
    },
    initialData: () => {
      const cached = loadCoffeeDataFromStorage()
      return cached?.statistics || {
        totalPurchases: 0,
        totalSpending: 0,
        averagePerMonth: 0,
        averagePerWeek: 0,
        mostFrequentShop: '',
        purchaseFrequency: {},
      }
    },
  })
}

/**
 * Mutation hook for updating transaction confirmation status
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      transactionId,
      isConfirmed,
    }: {
      transactionId: string
      isConfirmed: boolean
    }) => {
      // Get current data
      const coffeeTransactions = queryClient.getQueryData<CoffeeTransaction[]>(['coffeeTransactions']) || []
      
      // Update the transaction
      const updated = coffeeTransactions.map(t => {
        if (t.transactionId === transactionId) {
          return {
            ...t,
            isConfirmed,
          }
        }
        return t
      })
      
      // Re-process to update grouped data and statistics
      const alipayTransactions: Transaction[] = []
      const wechatPayTransactions: Transaction[] = []
      
      updated.forEach(t => {
        const { isCoffee, confidence, matchedKeywords, isConfirmed: _, ...transaction } = t
        if (t.source === 'alipay') {
          alipayTransactions.push(transaction)
        } else {
          wechatPayTransactions.push(transaction)
        }
      })
      
      const result = processAllTransactions(alipayTransactions, wechatPayTransactions)
      
      // Re-apply confirmation status
      result.coffeeTransactions = result.coffeeTransactions.map(t => {
        const original = updated.find(ot => ot.transactionId === t.transactionId)
        return original ? { ...t, isConfirmed: original.isConfirmed } : t
      })
      
      // Save to localStorage
      saveCoffeeDataToStorage(
        result.coffeeTransactions,
        result.coffeeByDate,
        result.statistics
      )
      
      return result
    },
    onSuccess: (data) => {
      // Update all related queries
      queryClient.setQueryData(['coffeeTransactions'], data.coffeeTransactions)
      queryClient.setQueryData(['coffeeByDate'], data.coffeeByDate)
      queryClient.setQueryData(['coffeeStatistics'], data.statistics)
    },
  })
}

