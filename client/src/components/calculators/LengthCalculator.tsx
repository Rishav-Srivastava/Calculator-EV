import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LengthUnit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface LengthCalculatorProps {
  onAddToHistory: (calculation: string) => void;
}

interface LengthConversionResult {
  result: number;
  conversions: {
    m: number;
    cm: number;
    mm: number;
    km: number;
    in: number;
    ft: number;
    yd: number;
    mi: number;
  };
}

export default function LengthCalculator({ onAddToHistory }: LengthCalculatorProps) {
  const [length, setLength] = useState<number | "">("");
  const [fromUnit, setFromUnit] = useState<LengthUnit>("m");
  const [toUnit, setToUnit] = useState<LengthUnit>("cm");
  const [result, setResult] = useState<LengthConversionResult | null>(null);
  const { toast } = useToast();

  // Define available length units with display labels
  const lengthUnits: { value: LengthUnit; label: string }[] = [
    { value: "m", label: "Meters (m)" },
    { value: "cm", label: "Centimeters (cm)" },
    { value: "mm", label: "Millimeters (mm)" },
    { value: "km", label: "Kilometers (km)" },
    { value: "in", label: "Inches (in)" },
    { value: "ft", label: "Feet (ft)" },
    { value: "yd", label: "Yards (yd)" },
    { value: "mi", label: "Miles (mi)" }
  ];

  const convertLengthMutation = useMutation({
    mutationFn: async (data: { length: number; fromUnit: LengthUnit; toUnit: LengthUnit }) => {
      const response = await apiRequest(
        "POST",
        "/api/calculator/length",
        data
      );
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      
      // Add to calculation history
      const formattedLength = String(length);
      const historyItem = `${formattedLength} ${fromUnit} = ${data.result.toFixed(4)} ${toUnit}`;
      onAddToHistory(historyItem);
      
      toast({
        title: "Length Conversion",
        description: "Length converted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to convert length. Please try again.",
        variant: "destructive",
      });
      console.error("Error converting length:", error);
    },
  });

  const handleConvertLength = () => {
    if (length === "") {
      toast({
        title: "Error",
        description: "Please enter a length value",
        variant: "destructive",
      });
      return;
    }

    if (typeof length === "number" && length <= 0) {
      toast({
        title: "Error",
        description: "Length must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    convertLengthMutation.mutate({
      length: typeof length === "number" ? length : parseFloat(String(length)),
      fromUnit,
      toUnit,
    });
  };

  // Format length values with appropriate precision
  const formatLengthValue = (value: number): string => {
    // For very small or very large numbers, use exponential notation
    if (value < 0.0001 || value > 10000000) {
      return value.toExponential(4);
    }
    // For values with decimal part
    if (value % 1 !== 0) {
      return value.toFixed(4);
    }
    // For integer values
    return value.toString();
  };
  
  // Display unit symbols correctly
  const getUnitSymbol = (unit: string): string => {
    switch(unit) {
      case 'in': return 'in';
      case 'ft': return 'ft';
      case 'yd': return 'yd';
      case 'mi': return 'mi';
      default: return unit;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 dark:bg-blue-950">
        <CardTitle className="text-xl font-bold">Length Converter</CardTitle>
        <CardDescription>Convert between different length units</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Enter Length</Label>
              <Input
                id="length"
                type="number"
                placeholder="Enter a length value"
                value={length}
                onChange={(e) => setLength(e.target.value === "" ? "" : parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fromUnit">From Unit</Label>
              <Select value={fromUnit} onValueChange={(value: LengthUnit) => setFromUnit(value)}>
                <SelectTrigger id="fromUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {lengthUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toUnit">To Unit</Label>
              <Select value={toUnit} onValueChange={(value: LengthUnit) => setToUnit(value)}>
                <SelectTrigger id="toUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {lengthUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleConvertLength} 
                className="w-full"
                disabled={convertLengthMutation.isPending}
              >
                {convertLengthMutation.isPending ? "Converting..." : "Convert"}
              </Button>
            </div>
          </div>
          
          {result && (
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="font-bold text-lg mb-2">Conversion Result</h3>
                <p className="text-xl font-semibold">
                  {length} {getUnitSymbol(fromUnit)} = <span className="text-blue-600 dark:text-blue-400">{formatLengthValue(result.result)}</span> {getUnitSymbol(toUnit)}
                </p>
              </div>
              
              <div className="mt-4">
                <h3 className="font-bold text-md mb-2">All Conversions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(result.conversions).map(([unit, value]) => (
                    <div key={unit} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <span className="font-medium">{unit}:</span>
                      <span>{formatLengthValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}