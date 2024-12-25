import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ChatInterfaceProps {
  apiKey: string | null;
  analysisResults: string | null;
}

const ChatInterface = ({ apiKey, analysisResults }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !apiKey) return;

    setIsLoading(true);
    const newMessage = { role: "user", content: inputMessage };
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
                    text: `Given this medical analysis: ${analysisResults}\n\nUser question: ${inputMessage}\n\nPlease provide a clear, accurate, and helpful response based on the medical analysis provided.`,
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
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
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

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow space-y-4">
      <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === "user"
                ? "bg-medical-blue text-white ml-8"
                : "bg-gray-100 text-gray-800 mr-8"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a follow-up question about your diagnosis..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;