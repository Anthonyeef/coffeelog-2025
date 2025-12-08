import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { CoffeeDataByDate } from '../types'

interface CalendarViewProps {
  coffeeByDate: CoffeeDataByDate
  onDateClick: (date: string) => void
}

export default function CalendarView({ coffeeByDate, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // Start at January 2025

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (coffeeByDate[dateStr]) {
      onDateClick(dateStr)
    }
  }

  const getCoffeeCount = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return coffeeByDate[dateStr]?.length || 0
  }

  const isCoffeeDate = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return !!coffeeByDate[dateStr] && coffeeByDate[dateStr].length > 0
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Month Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        borderBottom: '1px dotted #ccc',
        paddingBottom: '10px'
      }}>
        <button
          onClick={handlePreviousMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#666',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#333'}
          onMouseOut={(e) => e.currentTarget.style.color = '#666'}
        >
          ←
        </button>
        
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'normal', color: '#333', letterSpacing: '0.5px' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={handleNextMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#666',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#333'}
          onMouseOut={(e) => e.currentTarget.style.color = '#666'}
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ border: 'none' }}>
        {/* Days of Week Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: '8px'
        }}>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              style={{
                padding: '8px',
                textAlign: 'center',
                fontWeight: 'normal',
                fontSize: '13px',
                color: '#999',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '4px',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const hasCoffee = isCoffeeDate(day)
            const coffeeCount = getCoffeeCount(day)
            const dateStr = format(day, 'yyyy-MM-dd')
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                onClick={() => hasCoffee && handleDateClick(day)}
                style={{
                  minHeight: '90px',
                  padding: '8px 4px',
                  backgroundColor: isCurrentMonth ? '#fff' : '#fafafa',
                  cursor: hasCoffee ? 'pointer' : 'default',
                  position: 'relative',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  if (hasCoffee) {
                    e.currentTarget.style.backgroundColor = isCurrentMonth ? '#f9f9f9' : '#f5f5f5'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isCurrentMonth ? '#fff' : '#fafafa'
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: isCurrentMonth ? (isToday ? '#d32f2f' : '#333') : '#ccc',
                    marginBottom: '4px',
                    fontWeight: isToday ? 'bold' : 'normal',
                  }}
                >
                  {format(day, 'd')}
                </div>
                {hasCoffee && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#d32f2f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 'normal',
                      marginTop: '4px',
                    }}
                    title={`${coffeeCount} coffee purchase${coffeeCount > 1 ? 's' : ''} on ${dateStr}`}
                  >
                    {coffeeCount > 1 ? coffeeCount : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

