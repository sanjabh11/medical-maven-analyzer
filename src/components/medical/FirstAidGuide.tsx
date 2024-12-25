import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bandage, Activity } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
</lov-replace>
<lov-search>
      <Footer />
    </div>
</lov-search>
<lov-replace>
    </div>
import FeatureDescription from "./FeatureDescription";

const FIRST_AID_TOPICS = {
  "Minor Cuts": {
    steps: [
      "Clean your hands thoroughly with soap and water",
      "Clean the wound with mild soap and water",
      "Apply antibiotic ointment if available",
      "Cover with a sterile bandage",
      "Change the dressing daily or whenever it gets wet or dirty"
    ],
    emergency: false,
    icon: <Bandage className="h-5 w-5" />
  },
  "CPR": {
    steps: [
      "Check the scene is safe and the person is unresponsive",
      "Call emergency services (911) or ask someone else to",
      "Begin chest compressions: 30 compressions at 100-120 per minute",
      "Give 2 rescue breaths",
      "Continue cycles of 30 compressions and 2 breaths"
    ],
    emergency: true,
    icon: <Heart className="h-5 w-5" />
  },
  "Choking": {
    steps: [
      "Ask if the person is choking",
      "Perform abdominal thrusts (Heimlich maneuver)",
      "Alternate between 5 back blows and 5 abdominal thrusts",
      "Continue until the object is forced out or person becomes unconscious",
      "If unconscious, start CPR"
    ],
    emergency: true,
    icon: <Activity className="h-5 w-5" />
  }
};

const FirstAidGuide = () => {
  const [selectedTopic, setSelectedTopic] = useState("Minor Cuts");
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <FeatureDescription
        title="First Aid Guide"
        description="Quick access to essential first aid instructions for common emergency situations."
        bestPractices={[
          "Familiarize yourself with basic first aid procedures before emergencies occur",
          "Always call emergency services for serious situations",
          "Keep a well-stocked first aid kit readily available",
          "Take a certified first aid course for hands-on training"
        ]}
      />

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-medical-blue flex items-center">
            <span className="bg-medical-light p-2 rounded-full mr-3">
              🚑
            </span>
            First Aid Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Minor Cuts" className="w-full" onValueChange={setSelectedTopic}>
            <TabsList className="grid grid-cols-3 mb-4">
              {Object.keys(FIRST_AID_TOPICS).map((topic) => (
                <TabsTrigger
                  key={topic}
                  value={topic}
                  className="flex items-center gap-2"
                >
                  {FIRST_AID_TOPICS[topic].icon}
                  {topic}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(FIRST_AID_TOPICS).map(([topic, data]) => (
              <TabsContent key={topic} value={topic} className="mt-4">
                {data.emergency && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                    <p className="text-red-700">
                      ⚠️ Emergency Situation - Call emergency services immediately!
                    </p>
                  </div>
                )}
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <ol className="space-y-4">
                    {data.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-medical-light text-medical-blue font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-7">{step}</p>
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {selectedTopic && (
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
              analysisResults={JSON.stringify(FIRST_AID_TOPICS[selectedTopic])}
            />
          )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default FirstAidGuide;
