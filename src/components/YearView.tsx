import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { CoffeeDataByDate } from '../types'

interface YearViewProps {
  coffeeByDate: CoffeeDataByDate
  onDateClick: (date: string) => void
  year: number
  highlightColor?: string
}

export default function YearView({ coffeeByDate, onDateClick, year, highlightColor = '#d32f2f' }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (coffeeByDate[dateStr]) {
      onDateClick(dateStr)
    }
  }

  const isCoffeeDate = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return !!coffeeByDate[dateStr] && coffeeByDate[dateStr].length > 0
  }

  const getCoffeeCount = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return coffeeByDate[dateStr]?.length || 0
  }

  // Only highlight dates that are in their own month
  // This prevents dates from being highlighted multiple times when they appear in adjacent months
  const shouldHighlight = (day: Date, monthDate: Date): boolean => {
    const isCurrentMonth = isSameMonth(day, monthDate)
    const hasCoffee = isCoffeeDate(day)
    
    // Only show highlight if the date is in the current month and has coffee
    return isCurrentMonth && hasCoffee
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>

      {/* 12 Months Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '30px 20px',
        marginBottom: '30px'
      }}>
        {months.map((monthDate) => {
          const monthStart = startOfMonth(monthDate)
          const monthEnd = endOfMonth(monthDate)
          const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
          const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

          const calendarDays = eachDayOfInterval({
            start: calendarStart,
            end: calendarEnd,
          })

          return (
            <div key={monthDate.toISOString()} style={{ marginBottom: '20px' }}>
              {/* Month Header */}
              <div style={{ 
                marginBottom: '12px',
                borderBottom: '1px dotted #ccc',
                paddingBottom: '8px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: 'normal', 
                  color: '#333',
                  textAlign: 'center'
                }}>
                  {format(monthDate, 'MMMM')}
                </h3>
              </div>

              {/* Days of Week Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)',
                marginBottom: '4px'
              }}>
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    style={{
                      padding: '4px 2px',
                      textAlign: 'center',
                      fontWeight: 'normal',
                      fontSize: '10px',
                      color: '#999',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    {day.charAt(0)}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {calendarDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, monthDate)
                  const hasCoffee = isCoffeeDate(day)
                  const shouldShowHighlight = shouldHighlight(day, monthDate)
                  const coffeeCount = getCoffeeCount(day)
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => hasCoffee && handleDateClick(day)}
                      style={{
                        minHeight: '32px',
                        padding: '2px',
                        backgroundColor: isCurrentMonth ? '#fff' : '#fafafa',
                        cursor: hasCoffee ? 'pointer' : 'default',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
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
                          fontSize: '11px',
                          color: isCurrentMonth ? (isToday ? '#d32f2f' : '#333') : '#ccc',
                          fontWeight: isToday ? 'bold' : 'normal',
                          marginBottom: '2px',
                        }}
                      >
                        {format(day, 'd')}
                      </div>
                      {shouldShowHighlight && (
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: highlightColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '7px',
                            fontWeight: 'normal',
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
          )
        })}
      </div>
    </div>
  )
}

