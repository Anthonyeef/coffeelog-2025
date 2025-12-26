import { useCoffeeCodes } from '../hooks/useCoffeeCodes';
import { useCoffeeProduct } from '../hooks/useCoffeeProduct';
import { getLetterCategory, getFlavorCategory } from '../data/coffeeCodes';
import { CoffeeLetter, CoffeeNumber } from '../types';

interface CodeDetailProps {
  letter: CoffeeLetter;
  number1: CoffeeNumber;
  number2: CoffeeNumber;
  onBack: () => void;
}

export default function CodeDetail({
  letter,
  number1,
  number2,
  onBack,
}: CodeDetailProps) {
  const { data: codesData } = useCoffeeCodes();
  const code = `${letter}${number1}${number2}`;
  const { data: product, isLoading: productLoading } = useCoffeeProduct(code);

  if (!codesData) {
    return null;
  }

  const letterCategory = getLetterCategory(letter);
  const flavor1 = getFlavorCategory(number1);
  const flavor2 = getFlavorCategory(number2);

  if (!letterCategory || !flavor1 || !flavor2) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Invalid code</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  const backgroundColor = letterCategory.backgroundColor;
  const textColor = letterCategory.textColor;

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: backgroundColor,
        minHeight: '100vh',
        color: textColor,
      }}
    >
      <button
        onClick={onBack}
        style={{
          marginBottom: '30px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          color: textColor,
          border: `1px solid ${textColor}`,
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        {/* Code Square - Top Left */}
        <div
          style={{
            backgroundColor: '#000',
            color: '#fff',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {code}
        </div>

        {/* Vertical Separator Line */}
        <div
          style={{
            width: '2px',
            backgroundColor: textColor,
            height: 'auto',
            minHeight: '200px',
            marginTop: '0',
            opacity: 0.3,
          }}
        />

        {/* Content Area - Top Right */}
        <div style={{ flex: 1, paddingLeft: '10px' }}>
          {/* Coffee Name */}
          {productLoading ? (
            <div style={{ marginBottom: '20px' }}>Loading product...</div>
          ) : product ? (
            <div style={{ marginBottom: '30px' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {product.chineseName}
              </div>
              <div style={{ fontSize: '18px', opacity: 0.9 }}>
                {product.englishName}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '30px' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {letterCategory.chineseTitle}
              </div>
              <div style={{ fontSize: '18px', opacity: 0.9 }}>
                {letterCategory.englishTitle}
              </div>
            </div>
          )}

          {/* Breakdown Section */}
          <div style={{ marginTop: '30px' }}>
            <div
              style={{
                fontSize: '18px',
                marginBottom: '12px',
                lineHeight: '1.8',
              }}
            >
              <strong>{letter}</strong> _ {letterCategory.chineseTitle}
            </div>
            <div
              style={{
                fontSize: '18px',
                marginBottom: '12px',
                lineHeight: '1.8',
              }}
            >
              <strong>{number1}</strong> _ {flavor1.chineseName}
            </div>
            <div
              style={{
                fontSize: '18px',
                marginBottom: '12px',
                lineHeight: '1.8',
              }}
            >
              <strong>{number2}</strong> _ {flavor2.chineseName}
            </div>
          </div>
        </div>
      </div>

      {/* Letter Category Description */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor:
            textColor === '#FFFFFF'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
          borderRadius: '8px',
          lineHeight: '1.8',
          fontSize: '16px',
        }}
      >
        {letterCategory.description}
      </div>
    </div>
  );
}

