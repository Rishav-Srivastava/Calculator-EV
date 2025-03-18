import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { WeightUnit } from "@shared/schema";

interface WeightConversionResult {
  kg: number;
  g: number;
  lb: number;
  oz: number;
  st: number;
}

interface WeightCalculatorProps {
  onAddToHistory: (calculation: string) => void;
}

export default function WeightCalculator({ onAddToHistory }: WeightCalculatorProps) {
  const [weight, setWeight] = useState<string>("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [conversionResult, setConversionResult] = useState<WeightConversionResult | null>(null);
  const { toast } = useToast();

  const convertWeightMutation = useMutation({
    mutationFn: async (data: { weight: number; unit: WeightUnit }) => {
      const response = await apiRequest('POST', '/api/calculator/weight', data);
      return response.json();
    },
    onSuccess: (data) => {
      setConversionResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    },
    onError: (error) => {
      toast({
        title: "Weight Conversion Error",
        description: error instanceof Error ? error.message : "Failed to convert weight",
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

  function handleConvertWeight() {
    const weightValue = parseFloat(weight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid positive weight value",
        variant: "destructive"
      });
      return;
    }

    convertWeightMutation.mutate({ weight: weightValue, unit });

    // Add to history when conversion is successful
    historyMutation.mutate({
      type: "weight",
      calculation: `${weightValue} ${unit}`,
      result: "Weight conversion"
    });
    
    onAddToHistory(`Weight: ${weightValue} ${unit} converted`);
  }

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Weight Comparison</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="weight-value">Weight Value</Label>
              <Input
                id="weight-value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="weight-unit">Unit</Label>
              <Select value={unit} onValueChange={(value) => setUnit(value as WeightUnit)}>
                <SelectTrigger id="weight-unit" className="mt-1">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="lb">Pounds (lb)</SelectItem>
                  <SelectItem value="oz">Ounces (oz)</SelectItem>
                  <SelectItem value="st">Stone (st)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleConvertWeight}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={convertWeightMutation.isPending}
          >
            {convertWeightMutation.isPending ? "Converting..." : "Convert"}
          </Button>
          
          {conversionResult && (
            <div>
              <h3 className="text-md font-medium text-gray-900">Converted Weight</h3>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-sm text-gray-500">Kilograms</span>
                  <span className="block text-lg font-semibold text-gray-900">
                    {conversionResult.kg.toFixed(2)} kg
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-sm text-gray-500">Grams</span>
                  <span className="block text-lg font-semibold text-gray-900">
                    {conversionResult.g.toFixed(2)} g
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-sm text-gray-500">Pounds</span>
                  <span className="block text-lg font-semibold text-gray-900">
                    {conversionResult.lb.toFixed(2)} lb
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-sm text-gray-500">Ounces</span>
                  <span className="block text-lg font-semibold text-gray-900">
                    {conversionResult.oz.toFixed(2)} oz
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-sm text-gray-500">Stone</span>
                  <span className="block text-lg font-semibold text-gray-900">
                    {conversionResult.st.toFixed(2)} st
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
