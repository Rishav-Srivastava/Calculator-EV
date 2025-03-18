import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalculatorButton } from "@/components/ui/calculator-button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface BasicCalculatorProps {
  onAddToHistory: (calculation: string) => void;
}

export default function BasicCalculator({ onAddToHistory }: BasicCalculatorProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const [calculationDisplay, setCalculationDisplay] = useState("");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [operator, setOperator] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (expression: string) => {
      const response = await apiRequest('POST', '/api/calculator/basic', { expression });
      return response.json();
    },
    onSuccess: (data) => {
      setDisplayValue(data.result.toString());
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate",
        variant: "destructive"
      });
    }
  });

  const historyMutation = useMutation({
    mutationFn: async (data: { type: string; calculation: string; result: string }) => {
      const response = await apiRequest('POST', '/api/calculator/history', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    }
  });

  function inputDigit(digit: string) {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? digit : displayValue + digit);
    }
    
    // Update calculation display
    if (operator && firstOperand !== null) {
      if (waitingForSecondOperand) {
        setCalculationDisplay(`${firstOperand}${displayOperator(operator)}${digit}`);
      } else {
        const newValue = displayValue === "0" ? digit : displayValue + digit;
        setCalculationDisplay(`${firstOperand}${displayOperator(operator)}${newValue}`);
      }
    }
  }

  function inputDecimal() {
    if (waitingForSecondOperand) {
      setDisplayValue("0.");
      setWaitingForSecondOperand(false);
      
      // Update calculation display
      if (operator && firstOperand !== null) {
        setCalculationDisplay(`${firstOperand}${displayOperator(operator)}0.`);
      }
      return;
    }

    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
      
      // Update calculation display
      if (operator && firstOperand !== null) {
        setCalculationDisplay(`${firstOperand}${displayOperator(operator)}${displayValue}.`);
      }
    }
  }

  function handleOperator(nextOperator: string) {
    const inputValue = parseFloat(displayValue);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
      // Set calculation display when first operand is entered
      setCalculationDisplay(`${inputValue}${displayOperator(nextOperator)}`);
    } else if (operator) {
      const expression = `${firstOperand} ${operator} ${inputValue}`;
      calculateMutation.mutate(expression);
      
      // Add to history
      const result = calculate(firstOperand, inputValue, operator);
      const calculationText = `${firstOperand} ${displayOperator(operator)} ${inputValue} = ${result}`;
      historyMutation.mutate({
        type: "basic",
        calculation: expression,
        result: result.toString()
      });
      onAddToHistory(calculationText);
      
      setFirstOperand(result);
      
      // Update calculation display to show the result and new operator
      setCalculationDisplay(`${result}${displayOperator(nextOperator)}`);
    } else {
      // Update the operator in the calculation display without calculating
      setCalculationDisplay(`${firstOperand}${displayOperator(nextOperator)}`);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  }

  function calculate(first: number, second: number, op: string): number {
    switch (op) {
      case "+":
        return first + second;
      case "-":
        return first - second;
      case "*":
        return first * second;
      case "/":
        return first / second;
      default:
        return second;
    }
  }

  function handleEquals() {
    if (firstOperand === null || operator === null) return;

    const secondOperand = parseFloat(displayValue);
    const expression = `${firstOperand} ${operator} ${secondOperand}`;
    
    calculateMutation.mutate(expression);
    
    // Format calculation for history
    const result = calculate(firstOperand, secondOperand, operator);
    const calculationText = `${firstOperand} ${displayOperator(operator)} ${secondOperand} = ${result}`;
    
    // Update the calculation display to show the complete equation
    setCalculationDisplay(`${firstOperand}${displayOperator(operator)}${secondOperand}=${result}`);
    
    historyMutation.mutate({
      type: "basic",
      calculation: expression,
      result: result.toString()
    });
    onAddToHistory(calculationText);
    
    setFirstOperand(null);
    setWaitingForSecondOperand(false);
    setOperator(null);
  }

  function displayOperator(op: string) {
    const symbols: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    return symbols[op] || op;
  }

  function resetCalculator() {
    setDisplayValue("0");
    setCalculationDisplay("");
    setFirstOperand(null);
    setWaitingForSecondOperand(false);
    setOperator(null);
  }

  function handleBackspace() {
    if (operator && firstOperand !== null && !waitingForSecondOperand) {
      // Update calculation display if we're entering the second operand
      const updatedDisplay = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
      setCalculationDisplay(`${firstOperand}${displayOperator(operator)}${updatedDisplay}`);
    }
    
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  }

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Basic Calculator</h2>
        <div className="mb-4 space-y-2">
          <Input 
            type="text" 
            value={calculationDisplay} 
            readOnly 
            className="text-right text-sm font-medium text-gray-600 bg-gray-50 h-8" 
          />
          <Input 
            type="text" 
            value={displayValue} 
            readOnly 
            className="text-right text-2xl font-semibold bg-gray-50 h-12" 
          />
        </div>
        <div className="grid grid-cols-4 gap-2 w-full">
          <CalculatorButton variant="clear" colSpan={2} onClick={resetCalculator}>
            Clear
          </CalculatorButton>
          <CalculatorButton variant="operator" onClick={handleBackspace}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mx-auto"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
                clipRule="evenodd"
              />
            </svg>
          </CalculatorButton>
          <CalculatorButton variant="operator" onClick={() => handleOperator("/")}>
            ÷
          </CalculatorButton>
          
          <CalculatorButton onClick={() => inputDigit("7")}>7</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit("8")}>8</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit("9")}>9</CalculatorButton>
          <CalculatorButton variant="operator" onClick={() => handleOperator("*")}>
            ×
          </CalculatorButton>
          
          <CalculatorButton onClick={() => inputDigit("4")}>4</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit("5")}>5</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit("6")}>6</CalculatorButton>
          <CalculatorButton variant="operator" onClick={() => handleOperator("-")}>
            −
          </CalculatorButton>
          
          <CalculatorButton onClick={() => inputDigit("1")}>1</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit("2")}>2</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit("3")}>3</CalculatorButton>
          <CalculatorButton variant="operator" onClick={() => handleOperator("+")}>
            +
          </CalculatorButton>
          
          <CalculatorButton onClick={() => inputDigit("0")}>0</CalculatorButton>
          <CalculatorButton onClick={inputDecimal}>.</CalculatorButton>
          <CalculatorButton variant="equals" colSpan={2} onClick={handleEquals}>
            =
          </CalculatorButton>
        </div>
      </CardContent>
    </Card>
  );
}
