import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AnalysisResultsProps {
  loading: boolean;
  results: string | null;
}

const AnalysisResults = ({ loading, results }: AnalysisResultsProps) => {
  if (!loading && !results) return null;

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
            <div dangerouslySetInnerHTML={{ __html: results || "" }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;