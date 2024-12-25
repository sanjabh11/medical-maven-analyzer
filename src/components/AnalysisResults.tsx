import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisResultsProps {
  loading: boolean;
  results: string | null;
}

const AnalysisResults = ({ loading, results }: AnalysisResultsProps) => {
  if (!loading && !results) return null;

  const formatResults = (text: string) => {
    // Split the text into sections
    const sections = text.split(/\d+\.\s+/).filter(Boolean);
    
    return sections.map((section, index) => {
      const sectionTitles = [
        "Image Type & Region",
        "Key Findings",
        "Diagnostic Assessment",
        "Patient-Friendly Explanation"
      ];
      
      const title = sectionTitles[index] || "Additional Information";
      
      return (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold text-medical-blue mb-3">
            {title}
          </h3>
          <div className="prose text-gray-700">
            <p>{section.trim()}</p>
          </div>
          {index === 3 && ( // Add call-to-action buttons after the patient explanation
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white">
                <AlertCircle className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white">
                Share Results
              </Button>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-medical-blue">
          📋 Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-medical-blue animate-spin" />
            <span className="ml-3 text-gray-600">Analyzing image...</span>
          </div>
        ) : (
          <div className="prose max-w-none">
            {results && formatResults(results)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;