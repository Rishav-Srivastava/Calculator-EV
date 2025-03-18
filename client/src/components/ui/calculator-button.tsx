import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalculatorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "operator" | "equals" | "clear";
  colSpan?: 1 | 2;
  children: React.ReactNode;
}

export const CalculatorButton = ({
  variant = "default",
  colSpan = 1,
  className,
  children,
  ...props
}: CalculatorButtonProps) => {
  return (
    <Button
      type="button"
      className={cn(
        "h-12 w-full text-sm font-medium rounded-md shadow-sm flex items-center justify-center",
        colSpan === 2 && "col-span-2",
        variant === "default" && "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100",
        variant === "operator" && "border border-blue-500 bg-blue-500 text-white hover:bg-blue-600",
        variant === "equals" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "clear" && "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
