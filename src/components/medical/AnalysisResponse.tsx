import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Share2, Phone, AlertCircle } from "lucide-react";

interface AnalysisResponseProps {
  response: string;
  timestamp: Date;
  isAI?: boolean;
}

const AnalysisResponse = ({ response, timestamp, isAI = true }: AnalysisResponseProps) => {
  const formatResponse = (text: string) => {
    const sections = text.split(/\d+\.\s+/).filter(Boolean);
    return sections.map((section, index) => (
      <div key={index} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-medical-light text-medical-blue w-8 h-8 rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="font-semibold text-medical-blue">
            {["Analysis", "Key Findings", "Recommendations", "Summary"][index] || `Section ${index + 1}`}
          </h4>
        </div>
        <p className="text-gray-700 pl-10">{section.trim()}</p>
      </div>
    ));
  };

  return (
    <Card className={`p-4 mb-4 ${isAI ? 'bg-white' : 'bg-medical-light'}`}>
      <div className="mb-2 text-sm text-gray-500">
        {isAI ? 'AI Assistant' : 'You'} • {timestamp.toLocaleTimeString()}
      </div>
      <div className="prose max-w-none">
        {formatResponse(response)}
      </div>
      {isAI && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Consultation
          </Button>
          <Button
            variant="outline"
            className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
          <Button
            variant="outline"
            className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <Phone className="mr-2 h-4 w-4" />
            Contact Specialist
          </Button>
          <Button
            variant="outline"
            className="bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Get Second Opinion
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AnalysisResponse;