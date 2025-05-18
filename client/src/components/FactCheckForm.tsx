import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSpeechRecognition } from "@/lib/speech-recognition";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

type FactCheckResponse = {
  id: number;
  statement: string; 
  isTrue: boolean;
  explanation: string;
  historicalContext?: string;
  sources: Array<{
    name: string;
    url: string;
  }>;
  checkedAt: string;
};

interface FactCheckFormProps {
  onFactChecked: (factCheck: FactCheckResponse) => void;
}

const FactCheckForm = ({ onFactChecked }: FactCheckFormProps) => {
  const [statement, setStatement] = useState("");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    hasRecognitionSupport
  } = useSpeechRecognition();
  
  useEffect(() => {
    if (transcript) {
      setStatement(transcript);
    }
  }, [transcript]);

  const checkFactMutation = useMutation({
    mutationFn: async () => {
      // Call the actual backend API that uses Perplexity for fact checking
      const response = await apiRequest("POST", "/api/fact-check", { statement });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/trending'] });
      onFactChecked(data);
      setStatement("");
    },
    onError: (error) => {
      toast({
        title: "Error checking fact",
        description: error instanceof Error ? error.message : "Failed to verify fact",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) {
      toast({
        title: "Empty statement",
        description: "Please enter a statement to verify",
        variant: "destructive"
      });
      return;
    }
    
    checkFactMutation.mutate();
  };

  const toggleVoiceInput = () => {
    if (!hasRecognitionSupport) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({
        title: "Listening...",
        description: "Speak now to provide your statement",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center mb-4">
            <label htmlFor="fact-input" className="sr-only">Enter a fact to check</label>
            <div className="flex w-full">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <span className="material-icons">search</span>
              </span>
              <Input
                id="fact-input"
                ref={inputRef}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Enter a statement to verify..."
                className="rounded-none rounded-r-md p-3"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={toggleVoiceInput}
                className={`inline-flex items-center ${isListening ? 'bg-red-50 text-red-500 border-red-300' : ''}`}
              >
                <span className="material-icons mr-2">mic</span>
                Voice Input
              </Button>
              
              {isListening && (
                <div className="flex items-center text-red-500">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Recording...
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={checkFactMutation.isPending}
              className="inline-flex items-center"
            >
              {checkFactMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>Verify Fact</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FactCheckForm;
