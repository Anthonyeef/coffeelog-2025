import { useCoffeeCodes } from '../hooks/useCoffeeCodes';
import { LetterCategory } from '../types';

interface LetterSelectorProps {
  onSelectLetter: (letter: string) => void;
}

export default function LetterSelector({ onSelectLetter }: LetterSelectorProps) {
  const { data, isLoading, error } = useCoffeeCodes();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading coffee categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>Error loading coffee categories</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 200px)',
      }}
      className="letter-selector-grid"
    >
      {data.letterCategories.map((category: LetterCategory) => (
        <div
          key={category.letter}
          onClick={() => onSelectLetter(category.letter)}
          style={{
            backgroundColor: category.backgroundColor,
            color: category.textColor,
            padding: '30px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}
          >
            {category.letter}
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
            }}
          >
            {category.englishTitle}
          </div>
          <div
            style={{
              fontSize: '16px',
              marginBottom: '12px',
            }}
          >
            {category.chineseTitle}
          </div>
        </div>
      ))}
    </div>
  );
}

