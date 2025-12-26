import { useState } from 'react';
import LetterSelector from './components/LetterSelector';
import NumberSelector from './components/NumberSelector';
import CodeDetail from './components/CodeDetail';
import { CoffeeLetter, CoffeeNumber } from './types';

type View = 'letters' | 'numbers' | 'detail';

function CoffeeCodeApp() {
  const [view, setView] = useState<View>('letters');
  const [selectedLetter, setSelectedLetter] = useState<CoffeeLetter | null>(null);
  const [selectedNumber1, setSelectedNumber1] = useState<CoffeeNumber | null>(null);
  const [selectedNumber2, setSelectedNumber2] = useState<CoffeeNumber | null>(null);

  const handleSelectLetter = (letter: string) => {
    setSelectedLetter(letter as CoffeeLetter);
    setView('numbers');
  };

  const handleSelectNumber = (number1: number, number2: number) => {
    setSelectedNumber1(number1 as CoffeeNumber);
    setSelectedNumber2(number2 as CoffeeNumber);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'detail') {
      setView('numbers');
      setSelectedNumber1(null);
      setSelectedNumber2(null);
    } else if (view === 'numbers') {
      setView('letters');
      setSelectedLetter(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {view === 'letters' && (
        <>
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px 20px',
              backgroundColor: '#fff',
              borderBottom: '1px solid #eee',
            }}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '8px',
              }}
            >
              Coffee Code Explainer
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              选择一个字母系列开始探索咖啡风味代码
            </p>
          </div>
          <LetterSelector onSelectLetter={handleSelectLetter} />
        </>
      )}
      {view === 'numbers' && selectedLetter && (
        <NumberSelector
          selectedLetter={selectedLetter}
          onSelectNumber={handleSelectNumber}
          onBack={handleBack}
        />
      )}
      {view === 'detail' &&
        selectedLetter &&
        selectedNumber1 !== null &&
        selectedNumber2 !== null && (
          <CodeDetail
            letter={selectedLetter}
            number1={selectedNumber1}
            number2={selectedNumber2}
            onBack={handleBack}
          />
        )}
    </div>
  );
}

export default CoffeeCodeApp;

