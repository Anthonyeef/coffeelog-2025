import { useEffect, useState } from 'react'
import { CoffeeDataByDate, CoffeeStatistics, CoffeeTransaction } from './types'
import YearView from './components/YearView'
import DayDetails from './components/DayDetails'

// Hook for responsive breakpoints
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setCoffeeTransactions] = useState<CoffeeTransaction[]>([])
  const [coffeeByDate, setCoffeeByDate] = useState<CoffeeDataByDate>({})
  const [, setStatistics] = useState<CoffeeStatistics | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterManner, setFilterManner] = useState(false)
  const [filterGrid, setFilterGrid] = useState(false)
  const [filterDozzze, setFilterDozzze] = useState(false)
  const [filterHans, setFilterHans] = useState(false)
  const [filterBeans, setFilterBeans] = useState(false)
  const [filterCafe, setFilterCafe] = useState(false)
  const [selectedCafeName, setSelectedCafeName] = useState<string | null>(null)
  const [selectedBeanMerchant, setSelectedBeanMerchant] = useState<string | null>(null)
  const [filterEspresso, setFilterEspresso] = useState(false)

  useEffect(() => {
    // Load preprocessed data from JSON file
    const loadPreprocessedData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Use base URL from Vite config (defaults to '/coffee-2025/')
        const baseUrl = (import.meta as any).env?.BASE_URL || '/coffee-2025/'
        const response = await fetch(`${baseUrl}data/coffee-data.json`)
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        setCoffeeTransactions(data.coffeeTransactions || [])
        setCoffeeByDate(data.coffeeByDate || {})
        setStatistics(data.statistics || null)
        
        // Save to localStorage for query hooks
        localStorage.setItem('coffee-diary-coffee-data', JSON.stringify(data.coffeeTransactions))
        localStorage.setItem('coffee-diary-coffee-by-date', JSON.stringify(data.coffeeByDate))
        localStorage.setItem('coffee-diary-statistics', JSON.stringify(data.statistics))
        
        console.log(`Loaded ${data.coffeeTransactions?.length || 0} coffee transactions`)
      } catch (err) {
        console.error('Error loading preprocessed data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadPreprocessedData()
  }, [])

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
  }

  const handleCloseDetails = () => {
    setSelectedDate(null)
  }

  // Extract cafe name from transaction
  const getCafeName = (transaction: CoffeeTransaction): string => {
    const merchant = transaction.merchant || ''
    const desc = transaction.description || ''
    
    // If merchant looks like a cafe name (not a platform), use it
    if (merchant && !merchant.includes('淘宝') && !merchant.includes('美团') && 
        merchant.length > 1 && merchant.length < 50) {
      return merchant
    }
    
    // Try to extract from description
    // Match patterns like "Cafe Name咖啡", "Cafe Name·咖啡", "Cafe Name coffee", etc.
    const patterns = [
      /([^·(（]+(?:coffee|咖啡|咖啡店|咖啡厅|咖啡吧|cafe|café)[^·(（]*)/i,
      /([A-Za-z\s]+(?:coffee|cafe|café))/i,
      /([^·(（]+咖啡[^·(（]*)/i,
    ]
    
    for (const pattern of patterns) {
      const match = desc.match(pattern)
      if (match) {
        const name = match[1].trim()
        if (name.length > 1 && name.length < 50) {
          return name
        }
      }
    }
    
    // Fallback: use first part of description
    return desc.split(/[·(（]/)[0].trim() || merchant || 'Unknown Cafe'
  }

  // Get all unique cafe names from cafe transactions
  const getCafeNames = (): string[] => {
    const chains = ['manner', 'grid', 'starbucks', 'luckin', '星巴克', '瑞幸', '北京茵赫', '茵赫', 'dozzze', '豆仔', 'hans', '憨憨', '白鲸']
    const cafeNames = new Set<string>()
    
    for (const transactions of Object.values(coffeeByDate)) {
      for (const t of transactions) {
        const merchant = (t.merchant || '').toLowerCase()
        const desc = (t.description || '').toLowerCase()
        
        const isChain = chains.some(chain => 
          merchant.includes(chain.toLowerCase()) || 
          desc.includes(chain.toLowerCase()) ||
          (chain.toLowerCase() === 'manner' && t.isMannerAccount === true)
        )
        const isBeans = t.isBeans === true
        const isEquipment = desc.includes('滤纸') || desc.includes('粉碗') || desc.includes('手柄') ||
                           desc.includes('咖啡壶') || desc.includes('咖啡杯') || desc.includes('冷萃壶') ||
                           desc.includes('冷泡') || desc.includes('过滤') || desc.includes('咖啡机')
        
        if (!isChain && !isBeans && !isEquipment) {
          const cafeName = getCafeName(t)
          if (cafeName && cafeName !== 'Unknown Cafe' && !cafeName.includes('淘宝') && !cafeName.includes('美团')) {
            cafeNames.add(cafeName)
          }
        }
      }
    }
    
    return Array.from(cafeNames).sort()
  }

  // Get all unique bean merchant names
  const getBeanMerchants = (): string[] => {
    const merchants = new Set<string>()
    
    for (const transactions of Object.values(coffeeByDate)) {
      for (const t of transactions) {
        if (t.isBeans === true) {
          const merchant = t.merchant || ''
          if (merchant && merchant.length > 1) {
            merchants.add(merchant)
          }
        }
      }
    }
    
    return Array.from(merchants).sort()
  }

  // Filter coffee data by Manner, Grid, DOzzZE豆仔, Hans coffee, Beans, or Cafe if filters are enabled
  const getFilteredCoffeeByDate = (): CoffeeDataByDate => {
    if (!filterManner && !filterGrid && !filterDozzze && !filterHans && !filterBeans && !filterCafe) {
      return coffeeByDate
    }
    
    const filtered: CoffeeDataByDate = {}
    for (const [date, transactions] of Object.entries(coffeeByDate)) {
      let filteredTransactions = transactions
      
      if (filterManner) {
        filteredTransactions = filteredTransactions.filter(t => {
          const isManner = 
            t.merchant.toLowerCase().includes('manner') ||
            t.merchant.includes('北京茵赫') ||
            t.merchant.includes('茵赫') ||
            t.isMannerAccount === true ||
            t.matchedKeywords.some(k => k.toLowerCase().includes('manner'))
          
          if (!isManner) return false
          
          // If espresso filter is active, only show transactions <= 5 RMB
          if (filterEspresso) {
            return t.amount <= 5
          }
          
          return true
        })
      }
      
      if (filterGrid) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.merchant.toLowerCase().includes('grid') ||
          t.merchant.includes('Grid') ||
          t.description.toLowerCase().includes('grid coffee') ||
          t.matchedKeywords.some(k => k.toLowerCase().includes('grid'))
        )
      }
      
      if (filterDozzze) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.merchant.includes('DOzzZE') ||
          t.merchant.includes('豆仔') ||
          t.description.includes('DOzzZE') ||
          t.description.includes('豆仔')
        )
      }
      
      if (filterHans) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.merchant.toLowerCase().includes('hans') ||
          t.description.toLowerCase().includes('hans') ||
          t.merchant.includes('憨憨')
        )
      }
      
      if (filterBeans) {
        filteredTransactions = filteredTransactions.filter(t => {
          // Use the isBeans property from the transaction data if available
          let isBean = false
          if (t.isBeans !== undefined) {
            isBean = t.isBeans === true
          } else {
            // Fallback to keyword matching if isBeans is not set
            const desc = (t.description || '').toLowerCase()
            const merchant = (t.merchant || '').toLowerCase()
            // Match transactions with 咖啡豆 (coffee beans) keyword
            isBean = desc.includes('咖啡豆') || merchant.includes('咖啡豆') ||
                     (desc.includes('咖啡') && (
                       desc.includes('豆') || desc.includes('bean') || 
                       desc.includes('烘焙') || desc.includes('roast') ||
                       desc.includes('拼配') || desc.includes('blend') ||
                       desc.includes('瑰夏') || desc.includes('geisha') ||
                       desc.includes('埃塞') || desc.includes('ethiopia') ||
                       desc.includes('庄园') || desc.includes('estate')
                     ))
          }
          
          // If a specific merchant is selected, filter by merchant name
          if (isBean && selectedBeanMerchant) {
            return t.merchant === selectedBeanMerchant
          }
          
          return isBean
        })
      }
      
      if (filterCafe) {
        filteredTransactions = filteredTransactions.filter(t => {
          // Exclude chain stores
          const merchant = (t.merchant || '').toLowerCase()
          const desc = (t.description || '').toLowerCase()
          
          const isChain = 
            merchant.includes('manner') || merchant.includes('北京茵赫') || merchant.includes('茵赫') ||
            merchant.includes('grid') || merchant.includes('grid coffee') ||
            merchant.includes('starbucks') || merchant.includes('星巴克') ||
            merchant.includes('luckin') || merchant.includes('瑞幸') ||
            merchant.includes('dozzze') || merchant.includes('豆仔') ||
            merchant.includes('hans') || merchant.includes('憨憨') ||
            merchant.includes('白鲸') ||
            desc.includes('manner') || desc.includes('grid coffee') || desc.includes('starbucks') ||
            desc.includes('luckin') || desc.includes('dozzze') || desc.includes('豆仔') ||
            desc.includes('hans') || desc.includes('憨憨') || desc.includes('白鲸') ||
            t.isMannerAccount === true
          
          // Exclude bean purchases
          const isBeans = t.isBeans === true
          
          // Exclude equipment purchases (filters, cups, bottles, etc.)
          const isEquipment = desc.includes('滤纸') || desc.includes('粉碗') || desc.includes('手柄') ||
                             desc.includes('咖啡壶') || desc.includes('咖啡杯') || desc.includes('冷萃壶') ||
                             desc.includes('冷泡') || desc.includes('过滤') || desc.includes('咖啡机')
          
          // Exclude delivery orders (food delivery platforms)
          const isDelivery = merchant.includes('淘宝闪购') || merchant.includes('淘宝') ||
                            merchant.includes('美团') || merchant.includes('饿了么') ||
                            merchant.includes('ele.me') || merchant.includes('meituan') ||
                            desc.includes('淘宝闪购') || desc.includes('外卖订单') ||
                            desc.includes('美团') || desc.includes('饿了么') ||
                            desc.includes('ele.me') || desc.includes('meituan') ||
                            t.isDeliveryAccount === true
          
          const isCafe = !isChain && !isBeans && !isEquipment && !isDelivery
          
          // If a specific cafe is selected, filter by cafe name
          if (isCafe && selectedCafeName) {
            const cafeName = getCafeName(t)
            return cafeName === selectedCafeName
          }
          
          return isCafe
        })
      }
      
      if (filteredTransactions.length > 0) {
        filtered[date] = filteredTransactions
      }
    }
    return filtered
  }

  const filteredCoffeeByDate = getFilteredCoffeeByDate()
  const activeFilter = filterGrid ? 'grid' : filterManner ? 'manner' : filterDozzze ? 'dozzze' : filterHans ? 'hans' : filterBeans ? 'beans' : filterCafe ? 'cafe' : null
  const hasActiveFilter = filterManner || filterGrid || filterDozzze || filterHans || filterBeans || filterCafe
  
  // Helper function to get button style with dim effect
  const getButtonStyle = (isActive: boolean, color: string, isDimmed: boolean) => ({
    background: isActive ? color : 'transparent',
    border: `1px solid ${color}`,
    fontSize: '12px',
    color: isActive ? '#fff' : isDimmed ? '#ccc' : color,
    cursor: isDimmed ? 'not-allowed' : 'pointer',
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 'normal',
    opacity: isDimmed ? 0.4 : 1,
    transition: 'opacity 0.2s ease',
  })
  
  // Calculate filtered statistics
  const getFilteredStats = () => {
    const allFilteredTransactions = Object.values(filteredCoffeeByDate).flat()
    const count = allFilteredTransactions.length
    const totalSpending = allFilteredTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    return { count, totalSpending }
  }
  
  const filteredStats = getFilteredStats()

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading coffee data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          Make sure to run <code>npm run preprocess</code> first to generate the data file.
        </p>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: isMobile ? '15px 10px' : '40px 20px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: isMobile ? '20px' : '30px',
        borderBottom: '1px solid #ddd',
        paddingBottom: isMobile ? '15px' : '20px'
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '22px' : '28px', 
          fontWeight: 'bold', 
          marginBottom: isMobile ? '12px' : '15px',
          color: '#333',
          letterSpacing: '1px'
        }}>
          yifen's coffee log 2025
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '10px',
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: isMobile ? '6px' : '10px',
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto'
          }}>
            <button
              onClick={() => {
                setFilterManner(!filterManner)
                if (!filterManner) {
                  setFilterGrid(false)
                  setFilterDozzze(false)
                  setFilterHans(false)
                  setFilterBeans(false)
                  setFilterCafe(false)
                  setFilterEspresso(false)
                } else {
                  setFilterEspresso(false) // Reset espresso filter when enabling manner filter
                }
              }}
              style={getButtonStyle(filterManner, '#d32f2f', hasActiveFilter && !filterManner)}
            >
              manner
            </button>
            <button
              onClick={() => {
                setFilterGrid(!filterGrid)
                if (!filterGrid) {
                  setFilterManner(false)
                  setFilterDozzze(false)
                  setFilterHans(false)
                  setFilterBeans(false)
                  setFilterCafe(false)
                }
              }}
              style={getButtonStyle(filterGrid, '#8B4513', hasActiveFilter && !filterGrid)}
            >
              grid
            </button>
            <button
              onClick={() => {
                setFilterDozzze(!filterDozzze)
                if (!filterDozzze) {
                  setFilterManner(false)
                  setFilterGrid(false)
                  setFilterHans(false)
                  setFilterBeans(false)
                  setFilterCafe(false)
                }
              }}
              style={getButtonStyle(filterDozzze, '#666', hasActiveFilter && !filterDozzze)}
            >
              dozzze
            </button>
            <button
              onClick={() => {
                setFilterHans(!filterHans)
                if (!filterHans) {
                  setFilterManner(false)
                  setFilterGrid(false)
                  setFilterDozzze(false)
                  setFilterBeans(false)
                  setFilterCafe(false)
                }
              }}
              style={getButtonStyle(filterHans, '#9C27B0', hasActiveFilter && !filterHans)}
            >
              hans
            </button>
            <button
              onClick={() => {
                setFilterBeans(!filterBeans)
                if (!filterBeans) {
                  setFilterManner(false)
                  setFilterGrid(false)
                  setFilterDozzze(false)
                  setFilterHans(false)
                  setFilterCafe(false)
                }
              }}
              style={getButtonStyle(filterBeans, '#FF9800', hasActiveFilter && !filterBeans)}
            >
              beans
            </button>
            <button
              onClick={() => {
                setFilterCafe(!filterCafe)
                if (!filterCafe) {
                  setFilterManner(false)
                  setFilterGrid(false)
                  setFilterDozzze(false)
                  setFilterHans(false)
                  setFilterBeans(false)
                  setSelectedCafeName(null)
                } else {
                  setSelectedCafeName(null) // Reset cafe sub-filter when enabling cafe filter
                }
              }}
              style={getButtonStyle(filterCafe, '#4CAF50', hasActiveFilter && !filterCafe)}
            >
              cafe
            </button>
            {(filterManner || filterGrid || filterDozzze || filterHans || filterBeans || filterCafe) && (
              <button
                onClick={() => {
                  setFilterManner(false)
                  setFilterGrid(false)
                  setFilterDozzze(false)
                  setFilterHans(false)
                  setFilterBeans(false)
                  setFilterCafe(false)
                  setSelectedCafeName(null)
                  setSelectedBeanMerchant(null)
                  setFilterEspresso(false)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '12px',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontWeight: 'normal',
                }}
              >
                reset
              </button>
            )}
          </div>
          
          <div style={{
            fontSize: isMobile ? '11px' : '12px',
            color: '#666',
            marginLeft: isMobile ? '0' : 'auto',
            marginTop: isMobile ? '10px' : '0',
            width: isMobile ? '100%' : 'auto'
          }}>
            {filteredStats.count} records, spend ¥{filteredStats.totalSpending.toFixed(2)}
          </div>
        </div>
        
        {/* Manner espresso sub-filter row */}
        {filterManner && (
          <div style={{
            marginTop: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '12px', color: '#999', marginRight: '5px' }}>type:</span>
            <button
              onClick={() => setFilterEspresso(false)}
              style={{
                background: !filterEspresso ? '#d32f2f' : 'transparent',
                border: '1px solid #d32f2f',
                fontSize: '11px',
                color: !filterEspresso ? '#fff' : '#d32f2f',
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '15px',
                fontWeight: 'normal',
              }}
            >
              all
            </button>
            <button
              onClick={() => setFilterEspresso(!filterEspresso)}
              style={{
                background: filterEspresso ? '#d32f2f' : 'transparent',
                border: '1px solid #d32f2f',
                fontSize: '11px',
                color: filterEspresso ? '#fff' : '#d32f2f',
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '15px',
                fontWeight: 'normal',
              }}
            >
              espresso
            </button>
          </div>
        )}
        
        {/* Beans sub-filter row */}
        {filterBeans && (
          <div style={{
            marginTop: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '12px', color: '#999', marginRight: '5px' }}>merchants:</span>
            <button
              onClick={() => setSelectedBeanMerchant(null)}
              style={{
                background: selectedBeanMerchant === null ? '#FF9800' : 'transparent',
                border: '1px solid #FF9800',
                fontSize: '11px',
                color: selectedBeanMerchant === null ? '#fff' : '#FF9800',
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '15px',
                fontWeight: 'normal',
              }}
            >
              all
            </button>
            {getBeanMerchants().map(merchant => (
              <button
                key={merchant}
                onClick={() => setSelectedBeanMerchant(merchant === selectedBeanMerchant ? null : merchant)}
                style={{
                  background: selectedBeanMerchant === merchant ? '#FF9800' : 'transparent',
                  border: '1px solid #FF9800',
                  fontSize: '11px',
                  color: selectedBeanMerchant === merchant ? '#fff' : '#FF9800',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: '15px',
                  fontWeight: 'normal',
                }}
              >
                {merchant.length > 20 ? merchant.substring(0, 20) + '...' : merchant}
              </button>
            ))}
          </div>
        )}
        
        {/* Cafe sub-filter row */}
        {filterCafe && (
          <div style={{
            marginTop: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '12px', color: '#999', marginRight: '5px' }}>cafes:</span>
            <button
              onClick={() => setSelectedCafeName(null)}
              style={{
                background: selectedCafeName === null ? '#4CAF50' : 'transparent',
                border: '1px solid #4CAF50',
                fontSize: '11px',
                color: selectedCafeName === null ? '#fff' : '#4CAF50',
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '15px',
                fontWeight: 'normal',
              }}
            >
              all
            </button>
            {getCafeNames().map(cafeName => (
              <button
                key={cafeName}
                onClick={() => setSelectedCafeName(cafeName === selectedCafeName ? null : cafeName)}
                style={{
                  background: selectedCafeName === cafeName ? '#4CAF50' : 'transparent',
                  border: '1px solid #4CAF50',
                  fontSize: '11px',
                  color: selectedCafeName === cafeName ? '#fff' : '#4CAF50',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: '15px',
                  fontWeight: 'normal',
                }}
              >
                {cafeName.length > 20 ? cafeName.substring(0, 20) + '...' : cafeName}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <YearView 
        coffeeByDate={filteredCoffeeByDate} 
        onDateClick={handleDateClick} 
        year={2025} 
        highlightColor={
          activeFilter === 'grid' ? '#8B4513' : 
          activeFilter === 'dozzze' ? '#666' : 
          activeFilter === 'hans' ? '#9C27B0' :
          activeFilter === 'beans' ? '#FF9800' :
          activeFilter === 'cafe' ? '#4CAF50' :
          '#d32f2f'
        } 
      />
      
      {selectedDate && filteredCoffeeByDate[selectedDate] && (
        <DayDetails
          date={selectedDate}
          transactions={filteredCoffeeByDate[selectedDate]}
          onClose={handleCloseDetails}
          onDateChange={setSelectedDate}
          availableDates={Object.keys(filteredCoffeeByDate).sort()}
        />
      )}
    </div>
  )
}

export default App
