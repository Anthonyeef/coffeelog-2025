import { CoffeeTransaction } from '../types'
import { format } from 'date-fns'

interface DayDetailsProps {
  date: string
  transactions: CoffeeTransaction[]
  onClose: () => void
}

export default function DayDetails({ date, transactions, onClose }: DayDetailsProps) {
  const formattedDate = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '0',
          padding: '30px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          width: '90%',
          border: '1px solid #ddd',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          borderBottom: '1px dotted #ccc',
          paddingBottom: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal', color: '#333' }}>{formattedDate}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '30px',
              height: '30px',
              lineHeight: '1',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#333'}
            onMouseOut={(e) => e.currentTarget.style.color = '#999'}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          {transactions.length} coffee purchase{transactions.length > 1 ? 's' : ''} • Total: ¥{transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {transactions
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((transaction, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 0',
                  borderBottom: index < transactions.length - 1 ? '1px dotted #e0e0e0' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'normal', fontSize: '15px', color: '#333' }}>{transaction.merchant}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'normal', color: '#d32f2f' }}>
                    ¥{transaction.amount.toFixed(2)}
                  </div>
                </div>
                
                {transaction.description && (
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    {transaction.description}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#999' }}>
                  <span>{transaction.time}</span>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>{transaction.source}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

