import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Activity, Plus } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import FeatureDescription from "./FeatureDescription";

interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
}

const VitalsMonitor = () => {
  const [readings, setReadings] = useState<VitalReading[]>([]);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [showChat, setShowChat] = useState(false);

  const addReading = () => {
    const newReading = {
      date: new Date().toLocaleDateString(),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate)
    };
    setReadings([...readings, newReading]);
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { label: "Normal", color: "text-green-500" };
    if (systolic < 130 && diastolic < 80) return { label: "Elevated", color: "text-yellow-500" };
    return { label: "High", color: "text-red-500" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <FeatureDescription
        title="Vitals Monitor"
        description="Track and visualize your vital signs over time to better understand your health trends."
        bestPractices={[
          "Take measurements at consistent times of day",
          "Use properly calibrated devices for accurate readings",
          "Record any relevant factors that might affect readings",
          "Share your tracking data with healthcare providers during checkups"
        ]}
      />

      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-medical-blue flex items-center">
            <span className="bg-medical-light p-2 rounded-full mr-3">
              ❤️
            </span>
            Blood Pressure & Heart Rate Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Systolic BP (mmHg)</label>
              <Input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                min="70"
                max="200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Diastolic BP (mmHg)</label>
              <Input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                min="40"
                max="130"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Heart Rate (BPM)</label>
              <Input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="75"
                min="40"
                max="200"
              />
            </div>
          </div>

          <Button
            onClick={addReading}
            disabled={!systolic || !diastolic || !heartRate}
            className="w-full bg-medical-blue hover:bg-medical-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Reading
          </Button>

          {readings.length > 0 && (
            <div className="space-y-6">
              <div className="h-[300px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
                    <Line type="monotone" dataKey="heartRate" stroke="#10b981" name="Heart Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-medical-light rounded-lg p-4">
                <h3 className="font-semibold mb-2">Latest Reading Analysis</h3>
                {readings.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      Blood Pressure: {readings[readings.length - 1].systolic}/{readings[readings.length - 1].diastolic} mmHg
                      <span className={`ml-2 ${getBPCategory(readings[readings.length - 1].systolic, readings[readings.length - 1].diastolic).color}`}>
                        ({getBPCategory(readings[readings.length - 1].systolic, readings[readings.length - 1].diastolic).label})
                      </span>
                    </p>
                    <p className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-green-500" />
                      Heart Rate: {readings[readings.length - 1].heartRate} BPM
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {readings.length > 0 && (
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
                  apiKey={null} 
                  analysisResults={JSON.stringify(readings)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
};

export default VitalsMonitor;
