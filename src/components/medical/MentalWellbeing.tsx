import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, Heart, SmilePlus } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import FeatureDescription from "./FeatureDescription";

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself?",
  "Trouble concentrating?",
  "Moving or speaking slowly/being fidgety or restless?",
  "Thoughts of self-harm?"
];

const MentalWellbeing = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [apiKey] = React.useState<string | null>(localStorage.getItem("GOOGLE_API_KEY"));

  const handleAnswer = (questionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0);
  };

  const getRecommendation = (score: number) => {
    if (score >= 20) return "Severe depression symptoms. Please seek professional help immediately.";
    if (score >= 15) return "Moderately severe depression symptoms. Consider consulting a mental health professional.";
    if (score >= 10) return "Moderate depression symptoms. Talk to your healthcare provider.";
    if (score >= 5) return "Mild depression symptoms. Monitor your mood and practice self-care.";
    return "Minimal depression symptoms. Continue monitoring your mental health.";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <FeatureDescription
        title="Mental Well-being Assessment"
        description="A comprehensive tool to assess your mental health using standardized questionnaires and provide personalized recommendations."
        bestPractices={[
          "Answer questions honestly for the most accurate assessment",
          "Take the assessment regularly to track changes over time",
          "Use the results as a starting point for conversations with mental health professionals",
          "Remember that this is a screening tool, not a diagnostic tool"
        ]}
      />

      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-medical-blue flex items-center">
            <span className="bg-medical-light p-2 rounded-full mr-3">
              🧠
            </span>
            Mental Well-being Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {PHQ9_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-2">
              <p className="font-medium text-gray-700">{index + 1}. {question}</p>
              <RadioGroup
                onValueChange={(value) => handleAnswer(index, parseInt(value))}
                className="flex space-x-4"
              >
                {[
                  { value: "0", label: "Not at all" },
                  { value: "1", label: "Several days" },
                  { value: "2", label: "More than half the days" },
                  { value: "3", label: "Nearly every day" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`q${index}-${option.value}`} />
                    <Label htmlFor={`q${index}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <Button
            onClick={() => {
              setShowResults(true);
              setAssessment(getRecommendation(calculateScore()));
            }}
            disabled={Object.keys(answers).length < PHQ9_QUESTIONS.length}
            className="w-full bg-medical-blue hover:bg-medical-blue/90 mt-6"
          >
            Calculate Score
          </Button>

          {showResults && (
            <div className="mt-6 p-4 bg-medical-light rounded-lg space-y-4">
              <h3 className="text-xl font-semibold text-medical-blue">Assessment Results</h3>
              <p className="text-lg">Your PHQ-9 Score: {calculateScore()}</p>
              <p className="text-gray-700">{assessment}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="w-full">
                  <Brain className="mr-2 h-4 w-4" />
                  Find Therapist
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Crisis Helpline
                </Button>
                <Button variant="outline" className="w-full">
                  <SmilePlus className="mr-2 h-4 w-4" />
                  Meditation Resources
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {assessment && (
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
              analysisResults={assessment}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MentalWellbeing;
