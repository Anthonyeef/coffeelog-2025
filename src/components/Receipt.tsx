import { ReceiptData } from '../utils/receiptDataAggregator'
import { useRef, useEffect } from 'react'

interface ReceiptProps {
  data: ReceiptData
  onRefReady?: (ref: HTMLDivElement | null) => void
}

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function Receipt({ data, onRefReady }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (receiptRef.current && onRefReady) {
      onRefReady(receiptRef.current)
    }
  }, [onRefReady])

  const maxMonthlyCount = Math.max(...MONTH_LABELS.map(month => data.monthly[month] || 0), 1)

  return (
    <div
      ref={receiptRef}
      style={{
        backgroundColor: '#f5f5f5',
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'monospace, "Courier New", Courier, monospace',
        color: '#000',
        position: 'relative',
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0,0,0,0.02) 10px,
            rgba(0,0,0,0.02) 20px
          )
        `,
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          COFFEE LOG RECEIPT 2025
        </h1>
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#333',
            letterSpacing: '1px',
          }}
        >
          {data.receiptId}
        </div>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            textDecoration: 'underline',
            marginBottom: '10px',
            letterSpacing: '1px',
          }}
        >
          TOTAL
        </div>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginLeft: '10px',
          }}
        >
          {data.total}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px dashed #000',
          marginBottom: '25px',
        }}
      />

      <div style={{ marginBottom: '25px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            textDecoration: 'underline',
            marginBottom: '15px',
            letterSpacing: '1px',
          }}
        >
          MONTHLY
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {MONTH_LABELS.map((month) => {
            const count = data.monthly[month] || 0
            const barWidth = maxMonthlyCount > 0 ? (count / maxMonthlyCount) * 100 : 0
            return (
              <div
                key={month}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    width: '35px',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                  }}
                >
                  {month}
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '20px',
                      backgroundColor: '#000',
                      minWidth: count > 0 ? '4px' : '0',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '11px',
                      minWidth: '25px',
                      textAlign: 'left',
                      fontFamily: 'monospace',
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px dashed #000',
          marginBottom: '25px',
        }}
      />

      {data.topShops.length > 0 && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'underline',
                marginBottom: '12px',
                letterSpacing: '1px',
              }}
            >
              TOP COFFEE SHOPS
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {data.topShops.map((shop, index) => {
                const rank = index > 0 && data.topShops[index - 1].count === shop.count
                  ? data.topShops.findIndex(s => s.count === shop.count) + 1
                  : index + 1

                return (
                  <div
                    key={shop.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span>
                      #{rank} {shop.name.length > 40 ? shop.name.substring(0, 40) + '...' : shop.name}
                    </span>
                    <span style={{ marginLeft: '10px' }}>{shop.count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div
            style={{
              borderTop: '1px dashed #000',
              marginBottom: '25px',
            }}
          />
        </>
      )}

      {data.topBeanMerchants.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              textDecoration: 'underline',
              marginBottom: '12px',
              letterSpacing: '1px',
            }}
          >
            TOP BEAN MERCHANTS
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {data.topBeanMerchants.map((merchant, index) => {
              const rank = index > 0 && data.topBeanMerchants[index - 1].count === merchant.count
                ? data.topBeanMerchants.findIndex(m => m.count === merchant.count) + 1
                : index + 1

              return (
                <div
                  key={merchant.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                >
                  <span>
                    #{rank} {merchant.name.length > 40 ? merchant.name.substring(0, 40) + '...' : merchant.name}
                  </span>
                  <span style={{ marginLeft: '10px' }}>{merchant.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#333',
        }}
      >
        <div>Generated by Coffee Log Receipt</div>
        <div style={{ marginTop: '5px' }}>{data.generatedDate}</div>
      </div>
    </div>
  )
}
