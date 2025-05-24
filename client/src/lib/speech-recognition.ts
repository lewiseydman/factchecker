import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  
  // Setup recognition object
  const recognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      return recognition;
    }
    
    return null;
  }, []);
  
  useEffect(() => {
    const recognitionObj = recognition();
    setHasRecognitionSupport(!!recognitionObj);
  }, [recognition]);
  
  const startListening = useCallback(() => {
    const recognitionObj = recognition();
    if (!recognitionObj) return;
    
    setTranscript('');
    setIsListening(true);
    
    recognitionObj.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
      
      // Stop listening when we get a final result
      if (finalTranscript) {
        recognitionObj.stop();
        setIsListening(false);
      }
    };
    
    recognitionObj.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognitionObj.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognitionObj.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }, [recognition]);
  
  const stopListening = useCallback(() => {
    const recognitionObj = recognition();
    if (!recognitionObj) return;
    
    recognitionObj.stop();
    setIsListening(false);
  }, [recognition]);
  
  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
  };
};
