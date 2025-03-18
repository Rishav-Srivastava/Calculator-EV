import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AgeCalculator() {
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState("");
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
  const [ageResult, setAgeResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
  } | null>(null);
  
  // Calculate age mutation
  const calculateAgeMutation = useMutation({
    mutationFn: async (data: { birthDate: string; targetDate: string }) => {
      const response = await apiRequest("POST", "/api/calculate/age", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAgeResult(data);
      
      // Save calculation to history
      saveCalculationMutation.mutate({
        type: "age",
        input: JSON.stringify({ birthDate, targetDate }),
        result: JSON.stringify(data)
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the age",
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
  
  const handleCalculateAge = () => {
    if (!birthDate) {
      toast({
        title: "Missing Information",
        description: "Please enter a birth date",
        variant: "destructive",
      });
      return;
    }
    
    const birthDateObj = new Date(birthDate);
    const targetDateObj = new Date(targetDate);
    
    if (birthDateObj > targetDateObj) {
      toast({
        title: "Invalid Dates",
        description: "Birth date cannot be later than target date",
        variant: "destructive",
      });
      return;
    }
    
    calculateAgeMutation.mutate({ birthDate, targetDate });
  };

  return (
    <div id="age-calculator" className="calculator-content">
      <h2 className="text-xl font-medium mb-4">Age Calculator</h2>
      
      <div className="mb-6">
        <Label className="block text-gray-700 mb-2">Birth Date</Label>
        <Input 
          type="date" 
          value={birthDate} 
          onChange={(e) => setBirthDate(e.target.value)} 
          className="w-full p-2 border border-neutral-200"
        />
      </div>
      
      <div className="mb-6">
        <Label className="block text-gray-700 mb-2">Current Date (or target date)</Label>
        <Input 
          type="date" 
          value={targetDate} 
          onChange={(e) => setTargetDate(e.target.value)} 
          className="w-full p-2 border border-neutral-200"
        />
      </div>
      
      <Button 
        className="bg-primary text-white hover:bg-primary/80"
        onClick={handleCalculateAge}
        disabled={calculateAgeMutation.isPending}
      >
        {calculateAgeMutation.isPending ? "Calculating..." : "Calculate Age"}
      </Button>
      
      {ageResult && (
        <div className="mt-6 p-4 bg-neutral-50 rounded-md">
          <h3 className="font-medium text-lg mb-2">Age Results:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-600">Years</div>
              <div className="text-2xl font-medium">{ageResult.years}</div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-600">Months</div>
              <div className="text-2xl font-medium">{ageResult.months}</div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-600">Days</div>
              <div className="text-2xl font-medium">{ageResult.days}</div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-600">Total Days</div>
              <div className="text-2xl font-medium">{ageResult.totalDays.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
