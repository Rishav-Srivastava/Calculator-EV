import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Calculation } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function CalculationHistory() {
  const [calculations, setCalculations] = useState<string[]>([]);

  const historyQuery = useQuery({
    queryKey: ['/api/calculator/history'],
    queryFn: async () => {
      const response = await fetch('/api/calculator/history', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch calculation history');
      }
      return response.json() as Promise<Calculation[]>;
    }
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/calculator/history');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
      setCalculations([]);
    }
  });

  function addCalculation(calculation: string) {
    setCalculations(prev => [calculation, ...prev].slice(0, 10));
  }

  function clearHistory() {
    clearHistoryMutation.mutate();
  }

  // Format timestamp to local time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Calculation History</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto" id="calculation-history">
          {historyQuery.isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-gray-500 mt-2">Loading history...</p>
            </div>
          ) : historyQuery.data && historyQuery.data.length > 0 ? (
            historyQuery.data.map((calc) => (
              <div key={calc.id} className="p-3 bg-gray-50 rounded-md text-sm">
                {calc.calculation}
                <div className="text-xs text-gray-400 mt-1">
                  {formatTime(calc.timestamp.toString())}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm text-center py-8">
              No calculations yet
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearHistory}
            disabled={clearHistoryMutation.isPending || (historyQuery.data?.length === 0)}
            className="text-xs font-medium text-gray-700"
          >
            {clearHistoryMutation.isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Clearing...
              </>
            ) : "Clear History"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
