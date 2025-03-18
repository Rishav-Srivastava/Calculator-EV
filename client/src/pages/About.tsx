import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Calculator EV</h1>
        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="prose max-w-none">
              <p>Calculator EV is a comprehensive calculation tool designed to help users with a wide variety of calculation needs in a single application:</p>
              <ul>
                <li><strong>Basic Calculator:</strong> Perform standard arithmetic operations with a clean, intuitive interface.</li>
                <li><strong>Age Calculator:</strong> Calculate exact age between two dates, including years, months, days, and time until next birthday.</li>
                <li><strong>Weight Comparison:</strong> Convert weights between different units (kg, g, lb, oz, and stone).</li>
                <li><strong>Percentage Calculator:</strong> Calculate percentages in three different ways: percentage of a value, percentage change between values, and what percentage one value is of another.</li>
                <li><strong>Time Converter:</strong> Convert between different time units (seconds, minutes, hours, days, weeks, months, and years).</li>
                <li><strong>Length Converter:</strong> Convert between different length units (meters, centimeters, millimeters, kilometers, inches, feet, yards, and miles).</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">How to Use</h2>
              <p>Simply select the type of calculator you need from the tabs at the top of the main page. Each calculator has specific features:</p>
              <ul>
                <li>The <strong>Basic Calculator</strong> works like a standard calculator with digits and operations, displaying both the current expression and result.</li>
                <li>The <strong>Age Calculator</strong> requires you to input birth date and calculation date (defaults to today) to get detailed age information.</li>
                <li>The <strong>Weight Comparison</strong> tool converts a weight value between multiple units simultaneously.</li>
                <li>The <strong>Percentage Calculator</strong> lets you select the calculation type and enter values to get percentage results.</li>
                <li>The <strong>Time Converter</strong> allows you to convert a time value from one unit to another, showing all unit conversions.</li>
                <li>The <strong>Length Converter</strong> transforms length measurements between metric and imperial units with precise results.</li>
              </ul>
              
              <p className="mt-4">All calculations are saved to your history, accessible from the sidebar panel on the right. You can clear your history at any time.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">About the Developer</h2>
              <p>This application was developed by Rishav Srivastava, a passionate web developer focused on creating useful tools for everyday problems. With a strong background in mathematics and programming, Rishav created Calculator EV to provide a comprehensive calculation solution for users of all backgrounds.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">Technologies Used</h2>
              <p>Calculator EV is built using modern web technologies:</p>
              <ul>
                <li><strong>Frontend:</strong> React with TypeScript, Tailwind CSS, and shadcn/ui component library</li>
                <li><strong>Backend:</strong> Node.js with Express</li>
                <li><strong>Data Management:</strong> TanStack Query for efficient data fetching and state management</li>
                <li><strong>Form Handling:</strong> React Hook Form with Zod for robust form validation</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">Future Enhancements</h2>
              <p>We're continuously working to improve Calculator EV with new features:</p>
              <ul>
                <li>Scientific calculator functions</li>
                <li>Currency conversion</li>
                <li>BMI calculator</li>
                <li>Mortgage and loan calculators</li>
                <li>Data export options</li>
              </ul>
              
              <p className="mt-4">Have a suggestion for a new calculator? Visit our Contact page to send us your ideas!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
