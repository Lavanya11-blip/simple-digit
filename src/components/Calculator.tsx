import { useState, useEffect, useCallback } from 'react';
import { CalculatorButton } from './CalculatorButton';
import { Delete } from 'lucide-react';

type Operator = '+' | '-' | '×' | '÷' | null;

export const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  const formatNumber = (num: string): string => {
    const parts = num.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      // Limit display to 12 digits
      if (display.replace(/[^0-9]/g, '').length >= 12) return;
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    if (display === '0') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  }, [display]);

  const percentage = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperator: Operator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
      setExpression(`${display} ${nextOperator}`);
    } else if (operator) {
      const currentValue = parseFloat(previousValue);
      let result: number;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            setDisplay('Error');
            setPreviousValue(null);
            setOperator(null);
            setWaitingForOperand(true);
            setExpression('');
            return;
          }
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      // Handle floating point precision
      const resultStr = parseFloat(result.toPrecision(12)).toString();
      
      // Check for overflow
      if (resultStr.replace(/[^0-9]/g, '').length > 12) {
        setDisplay('Overflow');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        setExpression('');
        return;
      }

      setDisplay(resultStr);
      setPreviousValue(resultStr);
      setExpression(`${resultStr} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, previousValue]);

  const calculate = useCallback(() => {
    if (!operator || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result: number;

    switch (operator) {
      case '+':
        result = currentValue + inputValue;
        break;
      case '-':
        result = currentValue - inputValue;
        break;
      case '×':
        result = currentValue * inputValue;
        break;
      case '÷':
        if (inputValue === 0) {
          setDisplay('Error');
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(true);
          setExpression('');
          return;
        }
        result = currentValue / inputValue;
        break;
      default:
        return;
    }

    const resultStr = parseFloat(result.toPrecision(12)).toString();
    
    if (resultStr.replace(/[^0-9]/g, '').length > 12) {
      setDisplay('Overflow');
    } else {
      setDisplay(resultStr);
    }
    
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setExpression('');
  }, [display, operator, previousValue]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === '%') {
        percentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculate, clearAll, backspace, percentage]);

  const isError = display === 'Error' || display === 'Overflow';
  const displayValue = isError ? display : formatNumber(display);

  return (
    <div className="calc-container rounded-3xl p-6 w-full max-w-sm animate-scale-in">
      {/* Display */}
      <div className="calc-display rounded-2xl p-6 mb-6 min-h-[120px] flex flex-col justify-end items-end overflow-hidden">
        {expression && (
          <div className="text-muted-foreground text-sm font-mono mb-2 opacity-70">
            {expression}
          </div>
        )}
        <div 
          className={`font-mono font-semibold text-right w-full truncate transition-all duration-200 ${
            isError ? 'text-destructive' : 'text-foreground'
          } ${displayValue.length > 10 ? 'text-3xl' : displayValue.length > 7 ? 'text-4xl' : 'text-5xl'}`}
        >
          {displayValue}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <CalculatorButton variant="function" onClick={display === '0' ? clearAll : clearEntry}>
          {display === '0' ? 'AC' : 'C'}
        </CalculatorButton>
        <CalculatorButton variant="function" onClick={toggleSign}>
          +/−
        </CalculatorButton>
        <CalculatorButton variant="function" onClick={percentage}>
          %
        </CalculatorButton>
        <CalculatorButton 
          variant="operator" 
          onClick={() => performOperation('÷')}
          active={operator === '÷' && waitingForOperand}
        >
          ÷
        </CalculatorButton>

        {/* Row 2 */}
        <CalculatorButton variant="number" onClick={() => inputDigit('7')}>7</CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit('8')}>8</CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit('9')}>9</CalculatorButton>
        <CalculatorButton 
          variant="operator" 
          onClick={() => performOperation('×')}
          active={operator === '×' && waitingForOperand}
        >
          ×
        </CalculatorButton>

        {/* Row 3 */}
        <CalculatorButton variant="number" onClick={() => inputDigit('4')}>4</CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit('5')}>5</CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit('6')}>6</CalculatorButton>
        <CalculatorButton 
          variant="operator" 
          onClick={() => performOperation('-')}
          active={operator === '-' && waitingForOperand}
        >
          −
        </CalculatorButton>

        {/* Row 4 */}
        <CalculatorButton variant="number" onClick={() => inputDigit('1')}>1</CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit('2')}>2</CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit('3')}>3</CalculatorButton>
        <CalculatorButton 
          variant="operator" 
          onClick={() => performOperation('+')}
          active={operator === '+' && waitingForOperand}
        >
          +
        </CalculatorButton>

        {/* Row 5 */}
        <CalculatorButton variant="number" onClick={() => inputDigit('0')} className="col-span-1">
          0
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={backspace}>
          <Delete className="w-5 h-5" />
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={inputDecimal}>
          .
        </CalculatorButton>
        <CalculatorButton variant="operator" onClick={calculate} className="animate-glow-pulse">
          =
        </CalculatorButton>
      </div>

      {/* Keyboard hint */}
      <div className="mt-6 text-center text-xs text-muted-foreground opacity-50">
        Keyboard supported • Press keys to calculate
      </div>
    </div>
  );
};
