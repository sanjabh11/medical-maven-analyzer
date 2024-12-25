import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Calendar, Share2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AnalysisResultsProps {
  loading: boolean;
  results: string | null;
}

const AnalysisResults = ({ loading, results }: AnalysisResultsProps) => {
  if (!loading && !results) return null;

  const formatResults = (text: string) => {
    const sections = text.split(/\d+\.\s+/).filter(Boolean);
    const sectionTitles = [
      "Image Type & Region",
      "Key Findings",
      "Diagnostic Assessment",
      "Patient-Friendly Explanation"
    ];
    
    return sections.map((section, index) => {
      const title = sectionTitles[index] || "Additional Information";
      
      return (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-semibold text-medical-blue mb-3 flex items-center">
            <span className="bg-medical-light text-medical-blue w-8 h-8 rounded-full flex items-center justify-center mr-2">
              {index + 1}
            </span>
            {title}
          </h3>
          <div className="prose text-gray-700 pl-10">
            <p className="leading-relaxed">{section.trim()}</p>
          </div>
          {index === sections.length - 1 && (
            <>
              <Separator className="my-6" />
              <div className="pl-10 space-y-4">
                <h4 className="text-lg font-semibold text-medical-blue mb-3">
                  Recommended Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white w-full"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Follow-up
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Results
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white w-full"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Specialist
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white w-full"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Request Second Opinion
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-medical-blue flex items-center">
          <span className="bg-medical-light p-2 rounded-full mr-3">
            📋
          </span>
          Analysis Results
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