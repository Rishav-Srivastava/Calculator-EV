import { useState } from "react";
import BasicCalculator from "@/components/calculators/BasicCalculator";
import AgeCalculator from "@/components/calculators/AgeCalculator";
import WeightCalculator from "@/components/calculators/WeightCalculator";
import PercentageCalculator from "@/components/calculators/PercentageCalculator";
import TimeCalculator from "@/components/calculators/TimeCalculator";
import LengthCalculator from "@/components/calculators/LengthCalculator";
import CalculationHistory from "@/components/history/CalculationHistory";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

type CalculatorTab = "basic" | "age" | "weight" | "percentage" | "time" | "length";

export default function Home() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("basic");

  const historyMutation = useMutation({
    mutationFn: async (data: { type: string; calculation: string; result: string }) => {
      const response = await apiRequest('POST', '/api/calculator/history', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    }
  });

  const handleAddToHistory = (calculation: string) => {
    historyMutation.mutate({
      type: activeTab,
      calculation,
      result: "Calculation result"
    });
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Multi-Purpose Calculator</h1>
        
        {/* Tabs navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Calculator Types">
            <Button
              variant="link"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "basic"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("basic")}
            >
              Basic Calculator
            </Button>
            <Button
              variant="link"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "age"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("age")}
            >
              Age Calculator
            </Button>
            <Button
              variant="link"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "weight"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("weight")}
            >
              Weight Comparison
            </Button>
            <Button
              variant="link"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "percentage"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("percentage")}
            >
              Percentage Calculator
            </Button>
            <Button
              variant="link"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "time"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("time")}
            >
              Time Converter
            </Button>
            <Button
              variant="link"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "length"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("length")}
            >
              Length Converter
            </Button>
          </nav>
        </div>
        
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Calculator section */}
          <div className="lg:col-span-2">
            {activeTab === "basic" && <BasicCalculator onAddToHistory={handleAddToHistory} />}
            {activeTab === "age" && <AgeCalculator onAddToHistory={handleAddToHistory} />}
            {activeTab === "weight" && <WeightCalculator onAddToHistory={handleAddToHistory} />}
            {activeTab === "percentage" && <PercentageCalculator onAddToHistory={handleAddToHistory} />}
            {activeTab === "time" && <TimeCalculator onAddToHistory={handleAddToHistory} />}
            {activeTab === "length" && <LengthCalculator onAddToHistory={handleAddToHistory} />}
          </div>
          
          {/* Analytical space */}
          <div className="mt-8 lg:mt-0">
            <CalculationHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
