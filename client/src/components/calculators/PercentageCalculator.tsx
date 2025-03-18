import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface PercentageCalculatorProps {
  onAddToHistory: (calculation: string) => void;
}

type CalculationType = "percentage_of" | "percentage_change" | "percentage_difference";

interface PercentageResult {
  result: number;
}

export default function PercentageCalculator({ onAddToHistory }: PercentageCalculatorProps) {
  const [value1, setValue1] = useState<string>("");
  const [value2, setValue2] = useState<string>("");
  const [calculationType, setCalculationType] = useState<CalculationType>("percentage_of");
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const percentageMutation = useMutation({
    mutationFn: async (data: { value: number; percentage: number; calculationType: CalculationType }) => {
      const response = await apiRequest('POST', '/api/calculator/percentage', data);
      return response.json() as Promise<PercentageResult>;
    },
    onSuccess: (data) => {
      setResult(data.result);
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate percentage",
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

  const getLabel1 = () => {
    switch (calculationType) {
      case "percentage_of":
        return "Value";
      case "percentage_change":
        return "Final Value";
      case "percentage_difference":
        return "Value";
      default:
        return "Value";
    }
  };

  const getLabel2 = () => {
    switch (calculationType) {
      case "percentage_of":
        return "Percentage (%)";
      case "percentage_change":
        return "Initial Value";
      case "percentage_difference":
        return "Total Value";
      default:
        return "Value";
    }
  };

  const getResultLabel = () => {
    switch (calculationType) {
      case "percentage_of":
        return "Result";
      case "percentage_change":
        return "Percentage Change (%)";
      case "percentage_difference":
        return "Percentage (%)";
      default:
        return "Result";
    }
  };

  function handleCalculate() {
    if (!value1 || !value2) {
      toast({
        title: "Missing Values",
        description: "Please enter both values to calculate",
        variant: "destructive"
      });
      return;
    }

    const numValue1 = parseFloat(value1);
    const numValue2 = parseFloat(value2);

    if (isNaN(numValue1) || isNaN(numValue2)) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid numbers",
        variant: "destructive"
      });
      return;
    }

    percentageMutation.mutate({
      value: numValue1,
      percentage: numValue2,
      calculationType
    });

    // Format the calculation for history
    let calculationText = "";
    switch (calculationType) {
      case "percentage_of":
        calculationText = `${numValue2}% of ${numValue1} = ${(numValue2 / 100) * numValue1}`;
        break;
      case "percentage_change":
        const change = ((numValue1 - numValue2) / numValue2) * 100;
        calculationText = `Change from ${numValue2} to ${numValue1} = ${change.toFixed(2)}%`;
        break;
      case "percentage_difference":
        calculationText = `${numValue1} is ${(numValue1 / numValue2) * 100}% of ${numValue2}`;
        break;
    }

    historyMutation.mutate({
      type: "percentage",
      calculation: calculationText,
      result: calculationType === "percentage_of" 
        ? ((numValue2 / 100) * numValue1).toString()
        : calculationType === "percentage_change"
          ? (((numValue1 - numValue2) / numValue2) * 100).toString()
          : ((numValue1 / numValue2) * 100).toString()
    });

    onAddToHistory(calculationText);
  }

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Percentage Calculator</h2>
        
        <div className="mb-4">
          <Label htmlFor="calculationType">Calculation Type</Label>
          <Select 
            value={calculationType} 
            onValueChange={(value) => setCalculationType(value as CalculationType)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select calculation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage_of">Percentage of a value</SelectItem>
              <SelectItem value="percentage_change">Percentage change</SelectItem>
              <SelectItem value="percentage_difference">What percentage is X of Y</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="value1">{getLabel1()}</Label>
            <Input
              id="value1"
              type="number"
              step="any"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="value2">{getLabel2()}</Label>
            <Input
              id="value2"
              type="number"
              step="any"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={handleCalculate}
            className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white" 
            disabled={percentageMutation.isPending}
          >
            {percentageMutation.isPending ? "Calculating..." : "Calculate"}
          </Button>
          
          {result !== null && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <Label className="text-sm font-medium text-gray-500">{getResultLabel()}</Label>
              <div className="text-2xl font-semibold text-gray-800 mt-1">
                {calculationType === "percentage_change" || calculationType === "percentage_difference" 
                  ? `${result.toFixed(2)}%` 
                  : result.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}