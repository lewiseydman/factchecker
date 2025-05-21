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
  confidenceScore?: number;
  serviceBreakdown?: Array<{
    name: string;
    verdict: string;
    confidence: number;
  }>;
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
      // Call the backend API with our input (can be either a question or statement)
      console.log("Sending statement:", { statement });
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
                placeholder={isListening ? "Speak now..." : "Enter a statement or question..."}
                className={`rounded-none ${hasRecognitionSupport ? '' : 'rounded-r-md'} p-3 ${isListening ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
              />
              {hasRecognitionSupport && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`inline-flex items-center justify-center px-3 border border-l-0 border-gray-300 rounded-r-md h-10 transition-colors ${
                    isListening 
                      ? 'bg-red-50 text-red-500 border-red-300' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="material-icons">{isListening ? 'mic' : 'mic_none'}</span>
                </button>
              )}
            </div>
            {isListening && (
              <div className="mt-2 text-sm text-red-500 flex items-center">
                <span className="relative flex h-2.5 w-2.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                Listening to your voice input...
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {hasRecognitionSupport ? (
                  <>Use your voice or type to ask any question or verify a statement</>
                ) : (
                  <>Your browser doesn't support voice input, please type your query</>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={checkFactMutation.isPending}
              className="inline-flex items-center w-full sm:w-auto"
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
