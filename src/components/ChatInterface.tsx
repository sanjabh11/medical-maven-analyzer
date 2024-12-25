import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import AnalysisResponse from "@/components/medical/AnalysisResponse";

interface ChatInterfaceProps {
  apiKey: string | null;
  analysisResults: string | null;
  onImageUpload?: (file: File) => void;
}

const ChatInterface = ({ apiKey, analysisResults, onImageUpload }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: Date }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !apiKey) return;

    setIsLoading(true);
    const newMessage = { 
      role: "user", 
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Given this medical analysis: ${analysisResults}\n\nUser question: ${inputMessage}\n\nPlease provide a clear, accurate, and helpful response based on the medical analysis provided. Format your response in numbered sections:\n1. Analysis\n2. Key Findings\n3. Recommendations\n4. Summary`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImageUpload) {
      onImageUpload(e.target.files[0]);
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded for reference.",
      });
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <AnalysisResponse
              key={index}
              response={message.content}
              timestamp={message.timestamp}
              isAI={message.role === "assistant"}
            />
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a follow-up question about your diagnosis..."
          disabled={isLoading}
          className="flex-1"
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="text-medical-blue hover:bg-medical-blue hover:text-white"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-medical-blue hover:bg-medical-blue/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;