import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSpeechRecognition } from "@/lib/speech-recognition";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Mic, MicOff, Search } from "lucide-react";

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
  tierName?: string;
  modelsUsed?: number;
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center mb-4">
            <label htmlFor="fact-input" className="sr-only">Enter a fact to check</label>
            <div className="flex w-full">
              <button
                type="submit"
                disabled={!statement.trim() || checkFactMutation.isPending}
                className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Search and verify fact"
              >
                <Search className="h-4 w-4" />
              </button>
              <Input
                id="fact-input"
                ref={inputRef}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder={isListening ? "Listening..." : "Enter a statement or question..."}
                className={`rounded-none ${hasRecognitionSupport ? '' : 'rounded-r-md'} p-3 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 ${isListening ? 'border-red-300' : ''}`}
              />
              {hasRecognitionSupport && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`inline-flex items-center justify-center px-3 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md h-10 transition-colors ${
                      isListening 
                        ? 'bg-red-500 text-white border-red-500' 
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                  {isListening && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
              )}
            </div>
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
