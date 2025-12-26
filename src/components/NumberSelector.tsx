import { useCoffeeCodes } from '../hooks/useCoffeeCodes';
import { CoffeeNumber } from '../types';

interface NumberSelectorProps {
  selectedLetter: string;
  onSelectNumber: (number1: number, number2: number) => void;
  onBack: () => void;
}

export default function NumberSelector({
  selectedLetter,
  onSelectNumber,
  onBack,
}: NumberSelectorProps) {
  const { data, isLoading, error } = useCoffeeCodes();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading flavor categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>Error loading flavor categories</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const numbers: CoffeeNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      style={{
        padding: '40px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <button
        onClick={onBack}
        style={{
          marginBottom: '30px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
        }}
      >
        ← Back
      </button>

      <h2
        style={{
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600',
          color: '#333',
        }}
      >
        Select Flavor Combination for {selectedLetter}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '10px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        className="number-grid"
      >
        {numbers.map((num1) =>
          numbers.map((num2) => (
            <button
              key={`${num1}${num2}`}
              onClick={() => onSelectNumber(num1, num2)}
              style={{
                padding: '20px 10px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#fff',
                border: '2px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#999';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              {num1}
              {num2}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

