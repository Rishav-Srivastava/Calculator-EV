import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TimeUnit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TimeCalculatorProps {
  onAddToHistory: (calculation: string) => void;
}

interface TimeConversionResult {
  result: number;
  conversions: {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
    months: number;
    years: number;
  };
}

export default function TimeCalculator({ onAddToHistory }: TimeCalculatorProps) {
  const [time, setTime] = useState<number | "">("");
  const [fromUnit, setFromUnit] = useState<TimeUnit>("hours");
  const [toUnit, setToUnit] = useState<TimeUnit>("minutes");
  const [result, setResult] = useState<TimeConversionResult | null>(null);
  const { toast } = useToast();

  // Define available time units with display labels
  const timeUnits: { value: TimeUnit; label: string }[] = [
    { value: "seconds", label: "Seconds" },
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
    { value: "years", label: "Years" }
  ];

  const convertTimeMutation = useMutation({
    mutationFn: async (data: { time: number; fromUnit: TimeUnit; toUnit: TimeUnit }) => {
      const response = await apiRequest(
        "POST",
        "/api/calculator/time",
        data
      );
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      
      // Add to calculation history
      const formattedTime = String(time);
      const historyItem = `${formattedTime} ${fromUnit} = ${data.result.toFixed(4)} ${toUnit}`;
      onAddToHistory(historyItem);
      
      toast({
        title: "Time Conversion",
        description: "Time converted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to convert time. Please try again.",
        variant: "destructive",
      });
      console.error("Error converting time:", error);
    },
  });

  const handleConvertTime = () => {
    if (time === "") {
      toast({
        title: "Error",
        description: "Please enter a time value",
        variant: "destructive",
      });
      return;
    }

    if (typeof time === "number" && time <= 0) {
      toast({
        title: "Error",
        description: "Time must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    convertTimeMutation.mutate({
      time: typeof time === "number" ? time : parseFloat(String(time)),
      fromUnit,
      toUnit,
    });
  };

  // Format time values with appropriate precision
  const formatTimeValue = (value: number): string => {
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

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 dark:bg-blue-950">
        <CardTitle className="text-xl font-bold">Time Converter</CardTitle>
        <CardDescription>Convert between different time units</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Enter Time</Label>
              <Input
                id="time"
                type="number"
                placeholder="Enter a time value"
                value={time}
                onChange={(e) => setTime(e.target.value === "" ? "" : parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fromUnit">From Unit</Label>
              <Select value={fromUnit} onValueChange={(value: TimeUnit) => setFromUnit(value)}>
                <SelectTrigger id="fromUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {timeUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toUnit">To Unit</Label>
              <Select value={toUnit} onValueChange={(value: TimeUnit) => setToUnit(value)}>
                <SelectTrigger id="toUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {timeUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleConvertTime} 
                className="w-full"
                disabled={convertTimeMutation.isPending}
              >
                {convertTimeMutation.isPending ? "Converting..." : "Convert"}
              </Button>
            </div>
          </div>
          
          {result && (
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="font-bold text-lg mb-2">Conversion Result</h3>
                <p className="text-xl font-semibold">
                  {time} {fromUnit} = <span className="text-blue-600 dark:text-blue-400">{formatTimeValue(result.result)}</span> {toUnit}
                </p>
              </div>
              
              <div className="mt-4">
                <h3 className="font-bold text-md mb-2">All Conversions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(result.conversions).map(([unit, value]) => (
                    <div key={unit} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <span className="font-medium capitalize">{unit}:</span>
                      <span>{formatTimeValue(value)}</span>
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