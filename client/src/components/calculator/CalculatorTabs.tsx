import { Button } from "@/components/ui/button";

type CalculatorType = "basic" | "age" | "weight";

interface CalculatorTabsProps {
  activeCalculator: CalculatorType;
  onChange: (calculator: CalculatorType) => void;
}

export default function CalculatorTabs({ activeCalculator, onChange }: CalculatorTabsProps) {
  return (
    <div className="bg-primary text-white px-4 py-2 flex border-b">
      <Button
        variant="ghost"
        className={`px-4 py-2 font-medium rounded-t-lg ${
          activeCalculator === "basic" 
            ? "bg-white text-primary" 
            : "text-white hover:bg-primary/80"
        }`}
        onClick={() => onChange("basic")}
      >
        Basic
      </Button>
      <Button
        variant="ghost"
        className={`px-4 py-2 font-medium rounded-t-lg ${
          activeCalculator === "age" 
            ? "bg-white text-primary" 
            : "text-white hover:bg-primary/80"
        }`}
        onClick={() => onChange("age")}
      >
        Age
      </Button>
      <Button
        variant="ghost"
        className={`px-4 py-2 font-medium rounded-t-lg ${
          activeCalculator === "weight" 
            ? "bg-white text-primary" 
            : "text-white hover:bg-primary/80"
        }`}
        onClick={() => onChange("weight")}
      >
        Weight
      </Button>
    </div>
  );
}
