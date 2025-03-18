import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calculation } from "@shared/schema";
import { Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function Analytics() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");

  // Get calculations based on filter
  const { data: calculations = [], isLoading } = useQuery({
    queryKey: filter === "all" ? ["/api/calculations"] : ["/api/calculations", filter],
    refetchOnWindowFocus: true,
  });
  
  // Delete single calculation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/calculations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      toast({
        title: "Success",
        description: "Calculation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete calculation",
        variant: "destructive",
      });
    },
  });
  
  // Clear all calculations
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/calculations");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      toast({
        title: "Success",
        description: "All calculations cleared successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear calculations",
        variant: "destructive",
      });
    },
  });
  
  // Calculate statistics
  const totalCalculations = calculations.length;
  
  const typeCounts = calculations.reduce((counts: Record<string, number>, calc: Calculation) => {
    counts[calc.type] = (counts[calc.type] || 0) + 1;
    return counts;
  }, {});
  
  const mostUsedType = Object.entries(typeCounts).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: "none", count: 0 }
  );
  
  const today = new Date().toDateString();
  const todayCount = calculations.filter((calc: Calculation) => 
    new Date(calc.timestamp).toDateString() === today
  ).length;
  
  // Helper function to format calculation result for display
  const formatCalculationResult = (calculation: Calculation) => {
    const { type, input, result } = calculation;
    
    try {
      if (type === "basic") {
        const inputData = JSON.parse(input);
        const resultData = JSON.parse(result);
        return `${inputData.expression} = ${resultData.result}`;
      } else if (type === "age") {
        const inputData = JSON.parse(input);
        const resultData = JSON.parse(result);
        const birthDate = new Date(inputData.birthDate).toLocaleDateString();
        const targetDate = new Date(inputData.targetDate).toLocaleDateString();
        return `From ${birthDate} to ${targetDate}: ${resultData.years} years, ${resultData.months} months, ${resultData.days} days`;
      } else if (type === "weight") {
        const inputData = JSON.parse(input);
        const resultData = JSON.parse(result);
        return `${inputData.weight1.value} ${inputData.weight1.unit} vs ${inputData.weight2.value} ${inputData.weight2.unit}: ${resultData.percentDiff}% ${resultData.comparison}`;
      }
      return JSON.stringify(result);
    } catch (error) {
      return "Error displaying result";
    }
  };
  
  const formatDisplayName = (type: string) => {
    const names: Record<string, string> = {
      "basic": "Basic Calculator",
      "age": "Age Calculator",
      "weight": "Weight Calculator"
    };
    return names[type] || type;
  };

  return (
    <section id="analytics-section" className="mb-12">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-medium mb-6">Calculation History</h2>
          
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <label className="mr-2">Filter by:</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All calculations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All calculations</SelectItem>
                  <SelectItem value="basic">Basic calculator</SelectItem>
                  <SelectItem value="age">Age calculator</SelectItem>
                  <SelectItem value="weight">Weight calculator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => clearAllMutation.mutate()}
              disabled={calculations.length === 0 || clearAllMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Loading calculation history...</div>
          ) : calculations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No calculation history found</div>
          ) : (
            <div className="overflow-auto max-h-96">
              {calculations.map((calculation: Calculation) => (
                <div key={calculation.id} className="border-b border-neutral-200 py-3 hover:bg-neutral-50 rounded-md mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{formatDisplayName(calculation.type)}</span>
                      <span className="text-gray-600 text-sm ml-2">
                        {format(new Date(calculation.timestamp), "dd/MM/yyyy, HH:mm")}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          // Handle reuse calculation logic
                          toast({
                            title: "Coming Soon",
                            description: "This feature will be available in a future update",
                          });
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(calculation.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-800">{formatCalculationResult(calculation)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 bg-neutral-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm text-center">
                <div className="text-sm text-gray-600">Total Calculations</div>
                <div className="text-2xl font-medium">{totalCalculations}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm text-center">
                <div className="text-sm text-gray-600">Most Used</div>
                <div className="text-xl font-medium">
                  {mostUsedType.type !== "none" 
                    ? formatDisplayName(mostUsedType.type) 
                    : "None"}
                </div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm text-center">
                <div className="text-sm text-gray-600">Today</div>
                <div className="text-2xl font-medium">{todayCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
