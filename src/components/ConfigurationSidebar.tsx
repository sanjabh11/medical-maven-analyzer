import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfigurationSidebarProps {
  apiKey: string | null;
  onApiKeySubmit: (key: string) => void;
  onReset: () => void;
}

const ConfigurationSidebar = ({
  apiKey,
  onApiKeySubmit,
  onReset,
}: ConfigurationSidebarProps) => {
  const [tempKey, setTempKey] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeySubmit(tempKey);
  };

  return (
    <Card className="w-full bg-medical-light">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-medical-blue">
          ℹ️ Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!apiKey ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Google API Key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full"
              />
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-medical-blue hover:underline"
              >
                Get your API key from Google AI Studio 🔑
              </a>
            </div>
            <Button type="submit" className="w-full bg-medical-blue hover:bg-medical-blue/90">
              Save API Key
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-medical-green">
              <AlertDescription className="text-green-800">
                API Key is configured
              </AlertDescription>
            </Alert>
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full border-medical-blue text-medical-blue hover:bg-medical-blue/10"
            >
              🔄 Reset API Key
            </Button>
          </div>
        )}

        <Alert className="bg-blue-50 border-medical-blue mt-4">
          <AlertDescription className="text-sm text-gray-600">
            This tool provides AI-powered analysis of medical imaging data using
            advanced computer vision and radiological expertise.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive" className="bg-red-50">
          <AlertDescription className="text-sm text-red-800">
            ⚠️ DISCLAIMER: This tool is for educational and informational purposes
            only. All analyses should be reviewed by qualified healthcare
            professionals. Do not make medical decisions based solely on this
            analysis.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ConfigurationSidebar;