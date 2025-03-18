import { Link, useLocation } from "wouter";
import { Calculator } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-medium flex items-center">
          <Calculator className="mr-2 h-6 w-6" />
          Calculator EV
        </h1>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/" 
                className={`hover:text-neutral-50 ${location === "/" ? "font-medium" : ""}`}
              >
                Calculator
              </Link>
            </li>
            <li>
              <Link 
                href="/analytics" 
                className={`hover:text-neutral-50 ${location === "/analytics" ? "font-medium" : ""}`}
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                className={`hover:text-neutral-50 ${location === "/about" ? "font-medium" : ""}`}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                href="/contact" 
                className={`hover:text-neutral-50 ${location === "/contact" ? "font-medium" : ""}`}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
