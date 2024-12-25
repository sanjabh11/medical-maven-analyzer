import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfigurationSidebarProps {
  apiKey: string | null;
  onReset: () => void;
}

const ConfigurationSidebar = ({
  apiKey,
  onReset,
}: ConfigurationSidebarProps) => {
  return (
    <Card className="w-full bg-medical-light">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-medical-blue">
          ℹ️ Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!apiKey ? (
          <Alert className="bg-yellow-50 border-yellow-500">
            <AlertDescription className="text-yellow-800">
              Connecting to medical analysis services...
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-medical-green">
              <AlertDescription className="text-green-800">
                Connected to medical analysis services
              </AlertDescription>
            </Alert>
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full border-medical-blue text-medical-blue hover:bg-medical-blue/10"
            >
              🔄 Reset Connection
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