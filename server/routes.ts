import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for calculator operations
  const calculatorRouter = express.Router();
  
  // Get calculation history
  calculatorRouter.get("/history", async (req: Request, res: Response) => {
    try {
      // Parse limit from query
      const limitSchema = z.object({
        limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
      });
      
      const { limit } = limitSchema.parse(req.query);
      const calculations = await storage.getCalculations(limit);
      
      res.json(calculations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to retrieve calculation history" });
      }
    }
  });
  
  // Add a calculation to history
  calculatorRouter.post("/history", async (req: Request, res: Response) => {
    try {
      const calculationData = insertCalculationSchema.parse(req.body);
      const calculation = await storage.addCalculation(calculationData);
      
      res.status(201).json(calculation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to save calculation" });
      }
    }
  });
  
  // Clear calculation history
  calculatorRouter.delete("/history", async (_req: Request, res: Response) => {
    try {
      await storage.clearCalculationHistory();
      res.status(200).json({ message: "Calculation history cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear calculation history" });
    }
  });
  
  // Perform basic calculation
  calculatorRouter.post("/basic", (req: Request, res: Response) => {
    try {
      const schema = z.object({
        expression: z.string()
      });
      
      const { expression } = schema.parse(req.body);
      
      // Simple validation to prevent code execution
      if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
        return res.status(400).json({ message: "Invalid expression" });
      }
      
      try {
        // Using Function to evaluate expression safely with limited operators
        const result = new Function(`return ${expression}`)();
        res.json({ result });
      } catch (evalError) {
        res.status(400).json({ message: "Invalid expression" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to perform calculation" });
      }
    }
  });
  
  // Perform age calculation
  calculatorRouter.post("/age", (req: Request, res: Response) => {
    try {
      const schema = z.object({
        birthDate: z.string().refine(date => !isNaN(new Date(date).getTime()), {
          message: "Invalid birth date"
        }),
        calcDate: z.string().optional().refine(date => !date || !isNaN(new Date(date).getTime()), {
          message: "Invalid calculation date"
        })
      });
      
      const { birthDate, calcDate } = schema.parse(req.body);
      
      const birthDateObj = new Date(birthDate);
      const calcDateObj = calcDate ? new Date(calcDate) : new Date();
      
      if (birthDateObj > calcDateObj) {
        return res.status(400).json({ message: "Birth date cannot be in the future of calculation date" });
      }
      
      const ageDetails = calculateAge(birthDateObj, calcDateObj);
      res.json(ageDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to calculate age" });
      }
    }
  });
  
  // Perform weight conversion
  calculatorRouter.post("/weight", (req: Request, res: Response) => {
    try {
      const schema = z.object({
        weight: z.number().positive(),
        unit: z.enum(["kg", "g", "lb", "oz", "st"])
      });
      
      const { weight, unit } = schema.parse(req.body);
      const conversions = convertWeight(weight, unit);
      
      res.json(conversions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to convert weight" });
      }
    }
  });
  
  // Perform percentage calculations
  calculatorRouter.post("/percentage", (req: Request, res: Response) => {
    try {
      const schema = z.object({
        value: z.number(),
        percentage: z.number(),
        calculationType: z.enum(["percentage_of", "percentage_change", "percentage_difference"])
      });
      
      const { value, percentage, calculationType } = schema.parse(req.body);
      let result: number;
      
      switch (calculationType) {
        case "percentage_of":
          // Calculate percentage of value (e.g., 10% of 100 = 10)
          result = (percentage / 100) * value;
          break;
          
        case "percentage_change":
          // Calculate percentage change (e.g., 90 to 100 = 11.11% increase)
          result = ((value - percentage) / percentage) * 100;
          break;
          
        case "percentage_difference":
          // Calculate what percentage value1 is of value2 (e.g., 10 is what % of 50 = 20%)
          result = (value / percentage) * 100;
          break;
          
        default:
          return res.status(400).json({ message: "Invalid calculation type" });
      }
      
      res.json({ result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to calculate percentage" });
      }
    }
  });
  
  // Perform time conversion
  calculatorRouter.post("/time", (req: Request, res: Response) => {
    try {
      const schema = z.object({
        time: z.number().positive(),
        fromUnit: z.enum(["seconds", "minutes", "hours", "days", "weeks", "months", "years"]),
        toUnit: z.enum(["seconds", "minutes", "hours", "days", "weeks", "months", "years"])
      });
      
      const { time, fromUnit, toUnit } = schema.parse(req.body);
      
      const timeInSeconds = convertTimeToSeconds(time, fromUnit);
      const result = convertTimeFromSeconds(timeInSeconds, toUnit);
      
      res.json({ 
        result,
        conversions: {
          seconds: convertTimeFromSeconds(timeInSeconds, "seconds"),
          minutes: convertTimeFromSeconds(timeInSeconds, "minutes"),
          hours: convertTimeFromSeconds(timeInSeconds, "hours"),
          days: convertTimeFromSeconds(timeInSeconds, "days"),
          weeks: convertTimeFromSeconds(timeInSeconds, "weeks"),
          months: convertTimeFromSeconds(timeInSeconds, "months"),
          years: convertTimeFromSeconds(timeInSeconds, "years")
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to convert time" });
      }
    }
  });
  
  // Perform length conversion
  calculatorRouter.post("/length", (req: Request, res: Response) => {
    try {
      const schema = z.object({
        length: z.number().positive(),
        fromUnit: z.enum(["m", "cm", "mm", "km", "in", "ft", "yd", "mi"]),
        toUnit: z.enum(["m", "cm", "mm", "km", "in", "ft", "yd", "mi"])
      });
      
      const { length, fromUnit, toUnit } = schema.parse(req.body);
      
      const lengthInMeters = convertLengthToMeters(length, fromUnit);
      const result = convertLengthFromMeters(lengthInMeters, toUnit);
      
      res.json({ 
        result,
        conversions: {
          m: convertLengthFromMeters(lengthInMeters, "m"),
          cm: convertLengthFromMeters(lengthInMeters, "cm"),
          mm: convertLengthFromMeters(lengthInMeters, "mm"),
          km: convertLengthFromMeters(lengthInMeters, "km"),
          in: convertLengthFromMeters(lengthInMeters, "in"),
          ft: convertLengthFromMeters(lengthInMeters, "ft"),
          yd: convertLengthFromMeters(lengthInMeters, "yd"),
          mi: convertLengthFromMeters(lengthInMeters, "mi")
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to convert length" });
      }
    }
  });
  
  // Register routes
  app.use("/api/calculator", calculatorRouter);

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate age
function calculateAge(birthDate: Date, currentDate: Date) {
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  let days = currentDate.getDate() - birthDate.getDate();
  
  // If days are negative, adjust months and recalculate days
  if (days < 0) {
    months--;
    // Get the last day of the previous month
    const lastDayOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();
    days += lastDayOfPrevMonth;
  }
  
  // If months are negative, adjust years and recalculate months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Calculate total days between the two dates
  const diffTime = Math.abs(currentDate.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  
  // Calculate next birthday
  let nextBirthday = new Date(
    currentDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  
  if (nextBirthday < currentDate) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  
  const daysUntilBirthday = Math.floor(
    (nextBirthday.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    daysUntilBirthday,
    nextBirthday
  };
}

// Helper function to convert weight
function convertWeight(weight: number, fromUnit: string) {
  let kg = 0;
  
  // Convert to kg first
  switch (fromUnit) {
    case 'kg':
      kg = weight;
      break;
    case 'g':
      kg = weight / 1000;
      break;
    case 'lb':
      kg = weight * 0.45359237;
      break;
    case 'oz':
      kg = weight * 0.0283495231;
      break;
    case 'st':
      kg = weight * 6.35029318;
      break;
  }
  
  // Convert kg to all units
  return {
    kg: kg,
    g: kg * 1000,
    lb: kg / 0.45359237,
    oz: kg / 0.0283495231,
    st: kg / 6.35029318
  };
}

// Helper function to convert time to seconds
function convertTimeToSeconds(time: number, unit: string): number {
  switch (unit) {
    case 'seconds':
      return time;
    case 'minutes':
      return time * 60;
    case 'hours':
      return time * 60 * 60;
    case 'days':
      return time * 24 * 60 * 60;
    case 'weeks':
      return time * 7 * 24 * 60 * 60;
    case 'months':
      return time * 30 * 24 * 60 * 60; // Approximation
    case 'years':
      return time * 365 * 24 * 60 * 60; // Approximation
    default:
      return time;
  }
}

// Helper function to convert seconds to target time unit
function convertTimeFromSeconds(seconds: number, unit: string): number {
  switch (unit) {
    case 'seconds':
      return seconds;
    case 'minutes':
      return seconds / 60;
    case 'hours':
      return seconds / (60 * 60);
    case 'days':
      return seconds / (24 * 60 * 60);
    case 'weeks':
      return seconds / (7 * 24 * 60 * 60);
    case 'months':
      return seconds / (30 * 24 * 60 * 60); // Approximation
    case 'years':
      return seconds / (365 * 24 * 60 * 60); // Approximation
    default:
      return seconds;
  }
}

// Helper function to convert length to meters
function convertLengthToMeters(length: number, unit: string): number {
  switch (unit) {
    case 'm':
      return length;
    case 'cm':
      return length / 100;
    case 'mm':
      return length / 1000;
    case 'km':
      return length * 1000;
    case 'in':
      return length * 0.0254;
    case 'ft':
      return length * 0.3048;
    case 'yd':
      return length * 0.9144;
    case 'mi':
      return length * 1609.34;
    default:
      return length;
  }
}

// Helper function to convert meters to target length unit
function convertLengthFromMeters(meters: number, unit: string): number {
  switch (unit) {
    case 'm':
      return meters;
    case 'cm':
      return meters * 100;
    case 'mm':
      return meters * 1000;
    case 'km':
      return meters / 1000;
    case 'in':
      return meters / 0.0254;
    case 'ft':
      return meters / 0.3048;
    case 'yd':
      return meters / 0.9144;
    case 'mi':
      return meters / 1609.34;
    default:
      return meters;
  }
}
