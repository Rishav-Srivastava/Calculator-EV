import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define calculation history schema
export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "basic", "age", or "weight"
  calculation: text("calculation").notNull(), // The calculation string
  result: text("result").notNull(), // The result string
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertCalculationSchema = createInsertSchema(calculations).pick({
  type: true,
  calculation: true,
  result: true,
});

export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;

// Calculator types
export const calculatorTypes = ["basic", "age", "weight", "percentage", "time", "length"] as const;
export type CalculatorType = typeof calculatorTypes[number];

// Weight units
export const weightUnits = ["kg", "g", "lb", "oz", "st"] as const;
export type WeightUnit = typeof weightUnits[number];

// Length units
export const lengthUnits = ["m", "cm", "mm", "km", "in", "ft", "yd", "mi"] as const;
export type LengthUnit = typeof lengthUnits[number];

// Time units
export const timeUnits = ["seconds", "minutes", "hours", "days", "weeks", "months", "years"] as const;
export type TimeUnit = typeof timeUnits[number];
