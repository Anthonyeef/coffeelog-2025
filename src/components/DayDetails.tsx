import { useState, useEffect } from 'react'
import { CoffeeTransaction } from '../types'
import { format } from 'date-fns'

interface DayDetailsProps {
  date: string
  transactions: CoffeeTransaction[]
  onClose: () => void
  onDateChange: (date: string) => void
  availableDates: string[] // All dates that have transactions, sorted
}

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

export default function DayDetails({ date, transactions, onClose, onDateChange, availableDates }: DayDetailsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const formattedDate = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')
  
  // Sort transactions by time
  const sortedTransactions = [...transactions].sort((a, b) => a.time.localeCompare(b.time))

  // Keyboard navigation - navigate between dates
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (availableDates.length === 0) return
      
      const currentDateIndex = availableDates.indexOf(date)
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        if (currentDateIndex > 0) {
          onDateChange(availableDates[currentDateIndex - 1])
        } else {
          // Wrap to last date
          onDateChange(availableDates[availableDates.length - 1])
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        if (currentDateIndex < availableDates.length - 1) {
          onDateChange(availableDates[currentDateIndex + 1])
        } else {
          // Wrap to first date
          onDateChange(availableDates[0])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [date, availableDates, onDateChange, onClose])

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
          padding: isMobile ? '20px 15px' : '30px',
          maxWidth: isMobile ? '100%' : '600px',
          maxHeight: isMobile ? '100vh' : '80vh',
          overflowY: 'auto',
          width: isMobile ? '100%' : '90%',
          height: isMobile ? '100%' : 'auto',
          border: '1px solid #ddd',
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedTransactions.map((transaction, index) => (
              <div
                key={`${transaction.date}-${transaction.time}-${index}`}
                style={{
                  padding: '16px 0',
                  borderBottom: index < sortedTransactions.length - 1 ? '1px dotted #e0e0e0' : 'none',
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
                
                <div style={{ fontSize: '12px', color: '#999' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span>{transaction.time}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>{transaction.source}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

