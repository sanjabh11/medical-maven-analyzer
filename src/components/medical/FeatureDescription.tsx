import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface FeatureDescriptionProps {
  title: string;
  description: string;
  bestPractices: string[];
}

const FeatureDescription = ({ title, description, bestPractices }: FeatureDescriptionProps) => {
  return (
    <Card className="mb-6 bg-medical-light/5 border-medical-blue/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-medical-blue mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">{title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
            {bestPractices.length > 0 && (
              <div>
                <h4 className="font-medium text-medical-blue mb-2">Best Practices:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {bestPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureDescription;