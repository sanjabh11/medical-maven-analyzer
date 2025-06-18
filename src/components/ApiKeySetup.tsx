import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setGoogleApiKey } from '@/utils/apiKeyManager';
import { toast } from '@/components/ui/use-toast';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid API key',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Test the API key by making a simple request
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );

      if (testResponse.ok) {
        setGoogleApiKey(apiKey);
        onApiKeySet(apiKey);
        toast({
          title: 'Success',
          description: 'API key validated and saved successfully!',
        });
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid API key. Please check and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-medical-blue">
            Setup Google API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              To use this medical analysis tool, you need to provide a Google Gemini API key. 
              You can get one from the Google AI Studio.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                Google Gemini API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Gemini API key"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-medical-blue hover:bg-medical-blue/90"
              disabled={isLoading}
            >
              {isLoading ? 'Validating...' : 'Save API Key'}
            </Button>
          </form>
          
          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong>How to get an API key:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-medical-blue hover:underline">Google AI Studio</a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy the generated key and paste it above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};