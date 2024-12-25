import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Leaf, Scale } from "lucide-react";

interface HealthProfile {
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
}

const HealthRecommendations = () => {
  const [profile, setProfile] = useState<HealthProfile>({
    age: 30,
    height: 170,
    weight: 70,
    activityLevel: "moderate",
    goal: "maintain"
  });
  const [recommendations, setRecommendations] = useState<{
    bmi: number;
    diet: string;
    exercise: string;
  } | null>(null);

  const calculateBMI = () => {
    return profile.weight / Math.pow(profile.height / 100, 2);
  };

  const generateRecommendations = () => {
    const bmi = calculateBMI();
    let diet = "", exercise = "";

    if (profile.goal === "lose") {
      diet = "Focus on a calorie deficit with plenty of protein, vegetables, and whole grains. Aim for 500 calories less than maintenance.";
      exercise = "Combine cardio (30 mins, 5x/week) with strength training (3x/week). Focus on compound exercises.";
    } else if (profile.goal === "gain") {
      diet = "Increase caloric intake with healthy fats, complex carbs, and lean proteins. Eat frequent, nutrient-dense meals.";
      exercise = "Prioritize strength training (4x/week) with progressive overload. Add light cardio for heart health.";
    } else {
      diet = "Balanced diet with adequate protein, complex carbs, and healthy fats. Focus on whole, unprocessed foods.";
      exercise = "Mix of cardio and strength training (3-4x/week). Include flexibility work and recovery days.";
    }

    setRecommendations({ bmi, diet, exercise });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-medical-blue flex items-center">
          <span className="bg-medical-light p-2 rounded-full mr-3">
            🥗
          </span>
          Personalized Health Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Age</label>
            <Input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
              min={1}
              max={120}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Height (cm)</label>
            <Input
              type="number"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
              min={100}
              max={250}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input
              type="number"
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
              min={30}
              max={300}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Activity Level</label>
            <Select
              value={profile.activityLevel}
              onValueChange={(value) => setProfile({ ...profile, activityLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Lightly Active</SelectItem>
                <SelectItem value="moderate">Moderately Active</SelectItem>
                <SelectItem value="very">Very Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Goal</label>
          <Select
            value={profile.goal}
            onValueChange={(value) => setProfile({ ...profile, goal: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">Weight Loss</SelectItem>
              <SelectItem value="maintain">Maintain Weight</SelectItem>
              <SelectItem value="gain">Weight Gain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateRecommendations}
          className="w-full bg-medical-blue hover:bg-medical-blue/90"
        >
          Generate Recommendations
        </Button>

        {recommendations && (
          <div className="mt-6 p-4 bg-medical-light rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-medical-blue">Your Recommendations</h3>
              <span className="text-sm bg-white px-3 py-1 rounded-full">
                BMI: {recommendations.bmi.toFixed(1)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Leaf className="h-5 w-5 text-medical-blue mt-1" />
                <div>
                  <h4 className="font-medium">Diet Recommendations</h4>
                  <p className="text-gray-700">{recommendations.diet}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Dumbbell className="h-5 w-5 text-medical-blue mt-1" />
                <div>
                  <h4 className="font-medium">Exercise Recommendations</h4>
                  <p className="text-gray-700">{recommendations.exercise}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" className="w-full">
                <Scale className="mr-2 h-4 w-4" />
                Track Progress
              </Button>
              <Button variant="outline" className="w-full">
                Save Plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthRecommendations;