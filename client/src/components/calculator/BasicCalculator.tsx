import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Backspace, Percent, Divide, X, Minus, Plus, PlusCircle } from "lucide-react";

export default function BasicCalculator() {
  const { toast } = useToast();
  const [currentInput, setCurrentInput] = useState("0");
  const [previousInput, setPreviousInput] = useState("");
  const [operation, setOperation] = useState<string | null>(null);
  const [resetInput, setResetInput] = useState(false);
  
  // Calculate mutation
  const calculateMutation = useMutation({
    mutationFn: async (expression: string) => {
      const response = await apiRequest("POST", "/api/calculate/basic", { expression });
      return response.json();
    },
    onSuccess: (data) => {
      // Save calculation to history
      saveCalculationMutation.mutate({
        type: "basic",
        input: JSON.stringify({ expression: `${previousInput} ${operation} ${currentInput}` }),
        result: JSON.stringify({ result: data.result })
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the result",
        variant: "destructive",
      });
    },
  });
  
  // Save calculation mutation
  const saveCalculationMutation = useMutation({
    mutationFn: async (calculationData: any) => {
      await apiRequest("POST", "/api/calculations", calculationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
    },
    onError: () => {
      // Quietly fail - the calculation was successful, just not saved
    },
  });
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigitInput(e.key);
      } else if (e.key === ".") {
        handleDigitInput(".");
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        handleOperation(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        handleOperation("=");
      } else if (e.key === "Escape") {
        handleOperation("clear");
      } else if (e.key === "Backspace") {
        handleOperation("backspace");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentInput, previousInput, operation, resetInput]);
  
  const handleDigitInput = (digit: string) => {
    if (resetInput) {
      setCurrentInput("0");
      setResetInput(false);
    }
    
    if (digit === "." && currentInput.includes(".")) return;
    
    if (currentInput === "0" && digit !== ".") {
      setCurrentInput(digit);
    } else {
      setCurrentInput(currentInput + digit);
    }
  };
  
  const handleOperation = (op: string) => {
    switch(op) {
      case "clear":
        setCurrentInput("0");
        setPreviousInput("");
        setOperation(null);
        setResetInput(false);
        break;
      case "backspace":
        if (currentInput.length > 1) {
          setCurrentInput(currentInput.slice(0, -1));
        } else {
          setCurrentInput("0");
        }
        break;
      case "+-":
        setCurrentInput((parseFloat(currentInput) * -1).toString());
        break;
      case "=":
        if (previousInput && operation) {
          calculate();
          setPreviousInput("");
          setOperation(null);
          setResetInput(true);
        }
        break;
      default:
        if (previousInput && operation && !resetInput) {
          calculate();
        }
        setPreviousInput(currentInput);
        setOperation(op);
        setResetInput(true);
        break;
    }
  };
  
  const calculate = () => {
    const expression = `${previousInput} ${operation} ${currentInput}`;
    calculateMutation.mutate(expression);
    
    // For immediate UI feedback, also calculate locally
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch(operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
      case "/":
        result = prev / current;
        break;
      case "%":
        result = (prev * current) / 100;
        break;
      default:
        return;
    }
    
    setCurrentInput(result.toString());
  };
  
  const getDisplayOperation = (op: string | null) => {
    switch(op) {
      case "+": return "+";
      case "-": return "-";
      case "*": return "×";
      case "/": return "÷";
      case "%": return "%";
      default: return "";
    }
  };

  return (
    <div id="basic-calculator" className="calculator-content">
      <h2 className="text-xl font-medium mb-4">Basic Calculator</h2>
      
      {/* Calculator Display */}
      <div className="bg-neutral-50 mb-4 p-4 rounded-md">
        <div className="text-right text-gray-600 text-sm mb-1">
          {previousInput && operation ? `${previousInput} ${getDisplayOperation(operation)}` : ""}
        </div>
        <div className="text-right text-2xl font-medium">
          {currentInput}
        </div>
      </div>
      
      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-neutral-200 hover:bg-neutral-300 text-gray-800"
          onClick={() => handleOperation("clear")}
        >
          C
        </Button>
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-neutral-200 hover:bg-neutral-300 text-gray-800"
          onClick={() => handleOperation("backspace")}
        >
          <Backspace className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-neutral-200 hover:bg-neutral-300 text-gray-800"
          onClick={() => handleOperation("%")}
        >
          <Percent className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-secondary text-white hover:bg-secondary/80"
          onClick={() => handleOperation("/")}
        >
          <Divide className="h-5 w-5" />
        </Button>
        
        {/* Row 2 */}
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("7")}
        >
          7
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("8")}
        >
          8
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("9")}
        >
          9
        </Button>
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-secondary text-white hover:bg-secondary/80"
          onClick={() => handleOperation("*")}
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Row 3 */}
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("4")}
        >
          4
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("5")}
        >
          5
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("6")}
        >
          6
        </Button>
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-secondary text-white hover:bg-secondary/80"
          onClick={() => handleOperation("-")}
        >
          <Minus className="h-5 w-5" />
        </Button>
        
        {/* Row 4 */}
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("1")}
        >
          1
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("2")}
        >
          2
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("3")}
        >
          3
        </Button>
        <Button
          variant="secondary"
          className="py-3 text-xl font-medium bg-secondary text-white hover:bg-secondary/80"
          onClick={() => handleOperation("+")}
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        {/* Row 5 */}
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleOperation("+-")}
        >
          ±
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="py-3 text-xl font-medium"
          onClick={() => handleDigitInput(".")}
        >
          .
        </Button>
        <Button
          className="py-3 text-xl font-medium bg-primary text-white hover:bg-primary/80"
          onClick={() => handleOperation("=")}
        >
          =
        </Button>
      </div>
    </div>
  );
}
