import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ChatInterface from "@/components/ChatInterface";
import FeatureDescription from "./FeatureDescription";

interface SymptomCheckerProps {
  apiKey: string | null;
}

const SymptomChecker = ({ apiKey }: SymptomCheckerProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim() || !apiKey) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `As a medical triage expert, analyze these symptoms: "${symptoms}". 
                Provide a list of potential conditions, their severity (Mild, Moderate, Severe) 
                and whether the person should consult a doctor or if it can be managed at home. 
                Limit to 3-4 potential conditions, keep it concise, use bullet points.`
              }]
            }]
          })
        }
      );

      if (!response.ok) throw new Error("Failed to analyze symptoms");
      
      const data = await response.json();
      setAnalysis(data.candidates[0].content.parts[0].text);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <FeatureDescription
        title="Symptom Checker"
        description="Our AI-powered symptom checker helps you understand potential causes for your symptoms and provides guidance on whether to seek medical attention."
        bestPractices={[
          "Be as specific as possible when describing your symptoms",
          "Include when the symptoms started and their severity",
          "Mention any relevant medical history",
          "Use this tool for guidance only - it's not a replacement for professional medical advice"
        ]}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Describe Your Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe your symptoms (e.g., headache, fever, cough)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={analyzeSymptoms}
            disabled={loading || !symptoms.trim()}
            className="w-full bg-medical-blue hover:bg-medical-blue/90 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              "Analyze Symptoms"
            )}
          </Button>

          {analysis && (
            <div className="mt-6 p-4 bg-medical-light rounded-lg">
              <h3 className="text-xl font-semibold text-medical-blue mb-4">Analysis Results</h3>
              <div className="prose max-w-none">
                {analysis.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Contact Doctor
                </Button>
                <Button variant="outline" className="flex-1">
                  Save Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setShowChat(!showChat)}
              className="bg-medical-blue hover:bg-medical-blue/90"
            >
              {showChat ? "Hide Follow-up Questions" : "Ask Follow-up Questions"}
            </Button>
          </div>

          {showChat && (
            <ChatInterface 
              apiKey={apiKey} 
              analysisResults={analysis}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SymptomChecker;
