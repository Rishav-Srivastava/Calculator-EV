import { 
  users, type User, type InsertUser,
  calculations, type Calculation, type InsertCalculation
} from "@shared/schema";

// Interface defining storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calculation operations
  addCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(limit?: number): Promise<Calculation[]>;
  clearCalculationHistory(): Promise<void>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calculationHistory: Map<number, Calculation>;
  private userCurrentId: number;
  private calculationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.calculationHistory = new Map();
    this.userCurrentId = 1;
    this.calculationCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Calculation operations
  async addCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const id = this.calculationCurrentId++;
    const calculation: Calculation = { 
      ...insertCalculation, 
      id, 
      timestamp: new Date() 
    };
    this.calculationHistory.set(id, calculation);
    return calculation;
  }

  async getCalculations(limit: number = 10): Promise<Calculation[]> {
    // Get all calculations, sort by timestamp descending, and limit to the specified number
    return Array.from(this.calculationHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async clearCalculationHistory(): Promise<void> {
    this.calculationHistory.clear();
  }
}

export const storage = new MemStorage();
