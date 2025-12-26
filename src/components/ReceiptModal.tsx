import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import Receipt from './Receipt'
import { ReceiptData } from '../utils/receiptDataAggregator'

interface ReceiptModalProps {
  data: ReceiptData
  onClose: () => void
}

export default function ReceiptModal({ data, onClose }: ReceiptModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const receiptRef = useRef<HTMLDivElement | null>(null)

  const handleRefReady = (ref: HTMLDivElement | null) => {
    receiptRef.current = ref
  }

  const downloadReceiptImage = async () => {
    if (!receiptRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `coffee-log-receipt-2025-${data.receiptId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating receipt image:', error)
      alert('Failed to generate receipt image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!receiptRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            alert('Receipt copied to clipboard!')
          }).catch((err) => {
            console.error('Failed to copy to clipboard:', err)
            alert('Failed to copy to clipboard. Please try downloading instead.')
          })
        }
      })
    } catch (error) {
      console.error('Error copying receipt to clipboard:', error)
      alert('Failed to copy receipt. Please try downloading instead.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            padding: '15px 20px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Coffee Log Receipt</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <Receipt data={data} onRefReady={handleRefReady} />
        </div>

        <div
          style={{
            padding: '15px 20px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={downloadReceiptImage}
            disabled={isGenerating}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? 'Generating...' : 'Download Image'}
          </button>
          <button
            onClick={copyToClipboard}
            disabled={isGenerating}
            style={{
              padding: '8px 16px',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? 'Generating...' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}
