import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  daysUntilBirthday: number;
  nextBirthday: string;
}

interface AgeCalculatorProps {
  onAddToHistory: (calculation: string) => void;
}

export default function AgeCalculator({ onAddToHistory }: AgeCalculatorProps) {
  const [birthDate, setBirthDate] = useState("");
  const [calcDate, setCalcDate] = useState(formatDateForInput(new Date()));
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const { toast } = useToast();

  const calculateAgeMutation = useMutation({
    mutationFn: async (data: { birthDate: string; calcDate?: string }) => {
      const response = await apiRequest('POST', '/api/calculator/age', data);
      return response.json();
    },
    onSuccess: (data) => {
      setAgeResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    },
    onError: (error) => {
      toast({
        title: "Age Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate age",
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

  function formatDateForInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function handleCalculateAge() {
    if (!birthDate) {
      toast({
        title: "Missing Information",
        description: "Please enter a birth date",
        variant: "destructive"
      });
      return;
    }

    const data: { birthDate: string; calcDate?: string } = { birthDate };
    if (calcDate) {
      data.calcDate = calcDate;
    }

    calculateAgeMutation.mutate(data);

    // Add to history when calculation is successful
    const birthDateObj = new Date(birthDate);
    const calcDateObj = calcDate ? new Date(calcDate) : new Date();
    
    const formattedBirthDate = birthDateObj.toLocaleDateString();
    const formattedCalcDate = calcDateObj.toLocaleDateString();
    
    historyMutation.mutate({
      type: "age",
      calculation: `From ${formattedBirthDate} to ${formattedCalcDate}`,
      result: "Age calculation"
    });
    
    onAddToHistory(`Age: ${formattedBirthDate} to ${formattedCalcDate}`);
  }

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Age Calculator</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="birth-date">Birth Date</Label>
            <Input 
              type="date" 
              id="birth-date" 
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="calc-date">Calculate Age As Of (default: today)</Label>
            <Input 
              type="date" 
              id="calc-date" 
              value={calcDate}
              onChange={(e) => setCalcDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleCalculateAge}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={calculateAgeMutation.isPending}
          >
            {calculateAgeMutation.isPending ? "Calculating..." : "Calculate Age"}
          </Button>
          
          {ageResult && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900">Results</h3>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="block text-2xl font-bold text-primary">{ageResult.years}</span>
                    <span className="text-sm text-gray-500">Years</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-primary">{ageResult.months}</span>
                    <span className="text-sm text-gray-500">Months</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-primary">{ageResult.days}</span>
                    <span className="text-sm text-gray-500">Days</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">Total days: {ageResult.totalDays}</p>
                  <p className="text-sm text-gray-700">Total weeks: {ageResult.totalWeeks}</p>
                  <p className="text-sm text-gray-700">
                    Next birthday: {new Date(ageResult.nextBirthday).toLocaleDateString()} 
                    (in {ageResult.daysUntilBirthday} days)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
