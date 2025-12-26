import { CoffeeStatistics } from '../types'

interface StatisticsProps {
  statistics: CoffeeStatistics
}

export default function Statistics({ statistics }: StatisticsProps) {
  if (!statistics || statistics.totalPurchases === 0) {
    return null
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Statistics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Purchases</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513' }}>
            {statistics.totalPurchases}
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Spending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513' }}>
            ¥{statistics.totalSpending.toFixed(2)}
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Avg per Month</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513' }}>
            {statistics.averagePerMonth.toFixed(1)}
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Avg per Week</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513' }}>
            {statistics.averagePerWeek.toFixed(1)}
          </div>
        </div>
      </div>

      {statistics.mostFrequentShop && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Most Frequent Shop</div>
          <div style={{ fontSize: '18px', fontWeight: '500' }}>{statistics.mostFrequentShop}</div>
        </div>
      )}

      {Object.keys(statistics.purchaseFrequency).length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Monthly Frequency</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(statistics.purchaseFrequency)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, count]) => (
                <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{month}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginLeft: '16px' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '20px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: '#8B4513',
                          width: `${(count / Math.max(...Object.values(statistics.purchaseFrequency))) * 100}%`,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span style={{ minWidth: '30px', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}



