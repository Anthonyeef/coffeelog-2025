import { useEffect, useState } from 'react'
import { useCoffeeStatistics, useCoffeeTransactions, useCoffeeByDate } from './hooks/useCoffeeData'
import { CoffeeDataByDate, CoffeeStatistics, CoffeeTransaction } from './types'

function App() {
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coffeeTransactions, setCoffeeTransactions] = useState<CoffeeTransaction[]>([])
  const [coffeeByDate, setCoffeeByDate] = useState<CoffeeDataByDate>({})
  const [statistics, setStatistics] = useState<CoffeeStatistics | null>(null)

  useEffect(() => {
    // Load preprocessed data from JSON file
    const loadPreprocessedData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/data/coffee-data.json')
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Coffee Diary 2025</h1>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2>Statistics</h2>
        {statistics && statistics.totalPurchases > 0 ? (
          <div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
              <strong>Total Coffee Purchases: {statistics.totalPurchases}</strong>
            </p>
            <p><strong>Total Spending:</strong> ¥{statistics.totalSpending.toFixed(2)}</p>
            <p><strong>Average per Month:</strong> {statistics.averagePerMonth.toFixed(1)}</p>
            <p><strong>Average per Week:</strong> {statistics.averagePerWeek.toFixed(1)}</p>
            <p><strong>Most Frequent Shop:</strong> {statistics.mostFrequentShop || 'N/A'}</p>
            <div style={{ marginTop: '10px' }}>
              <strong>Monthly Frequency:</strong>
              <ul>
                {Object.entries(statistics.purchaseFrequency)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, count]) => (
                    <li key={month}>{month}: {count} purchases</li>
                  ))}
              </ul>
            </div>
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {showDetails ? 'Hide' : 'Show'} Coffee Transactions Details
              </button>
            </div>
            {showDetails && coffeeTransactions && coffeeTransactions.length > 0 && (
              <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                <h3>Coffee Transactions ({coffeeTransactions.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Date</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Merchant</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Description</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>Amount</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Source</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Keywords</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coffeeTransactions
                      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
                      .map((t, i) => (
                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                          <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{t.date} {t.time}</td>
                          <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{t.merchant}</td>
                          <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{t.description}</td>
                          <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>¥{t.amount.toFixed(2)}</td>
                          <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{t.source}</td>
                          <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                            {t.matchedKeywords.join(', ') || 'N/A'} ({(t.confidence * 100).toFixed(0)}%)
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p>No coffee transactions found.</p>
        )}
      </div>
    </div>
  )
}

export default App
