import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

type Source = {
  name: string;
  url: string;
};

interface FactResultProps {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  historicalContext?: string;
  sources: Source[];
  savedByUser?: boolean;
  checkedAt: string;
  onDelete?: (id: number) => void;
  confidenceScore?: number;
  serviceBreakdown?: Array<{
    name: string;
    verdict: string;
    confidence: number;
  }>;
  // New fields for enhanced fact checking
  isQuestion?: boolean;
  transformedStatement?: string;
  implicitClaims?: string[];
  domainInfo?: {
    detectedDomains: string[];
    modelWeights: {
      claude: number;
      openai: number;
      perplexity: number;
    };
    explanation: string;
  };
  factualConsensus?: number;
  manipulationScore?: number;
  contradictionIndex?: number;
  // Subscription tier information
  tierName?: string;
  modelsUsed?: number;
}

const FactResult = ({
  id,
  statement,
  isTrue,
  explanation,
  historicalContext,
  sources,
  savedByUser = false,
  checkedAt,
  onDelete,
  confidenceScore,
  serviceBreakdown,
  isQuestion,
  transformedStatement,
  implicitClaims,
  domainInfo,
  factualConsensus,
  manipulationScore,
  contradictionIndex,
  tierName = "Free Tier",
  modelsUsed = 2
}: FactResultProps) => {
  const [isSaved, setIsSaved] = useState(savedByUser);
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Safely format date or use fallback
  let formattedDate = "Just now";
  try {
    if (checkedAt) {
      formattedDate = formatDistanceToNow(new Date(checkedAt), { addSuffix: true });
    }
  } catch (error) {
    console.error("Date formatting error:", error);
    // Keep the default "Just now"
  }

  const saveMutation = useMutation({
    mutationFn: async (saved: boolean) => {
      const response = await apiRequest("PUT", `/api/fact-checks/${id}/save`, { saved });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/saved'] });
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Fact unsaved" : "Fact saved",
        description: isSaved ? "Removed from your saved facts" : "Added to your saved facts",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save fact",
        variant: "destructive"
      });
    }
  });

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to save facts",
        variant: "destructive"
      });
      return;
    }
    
    saveMutation.mutate(!isSaved);
  };

  // Prepare a shortened version of explanation if it's very long
  const shortenedExplanation = explanation?.length > 300 
    ? explanation.substring(0, 300) + "..." 
    : explanation;

  return (
    <div className={`bg-white border-l-4 ${isTrue ? 'border-true' : 'border-false'} rounded-lg shadow-sm p-6 mb-4`}>
      {/* Question Transformation Info */}
      {isQuestion && transformedStatement && (
        <div className="mb-4 p-3 bg-purple-50 rounded-md border border-purple-100">
          <h4 className="text-sm font-medium text-purple-800 mb-1 flex items-center">
            <span className="material-icons text-sm mr-1">help</span>
            Question Analyzed
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            Your question was analyzed as checking this statement:
          </p>
          <p className="text-sm font-medium bg-white p-2 rounded border border-purple-100">
            "{transformedStatement}"
          </p>
          
          {implicitClaims && implicitClaims.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">Implicit claims detected:</p>
              <ul className="text-xs text-gray-600 list-disc pl-4 mt-1">
                {implicitClaims.map((claim, index) => (
                  <li key={index}>{claim}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-800 font-medium mb-2">{statement}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`flex items-center ${isTrue ? 'text-true' : 'text-false'} font-bold`}>
              <span className="material-icons mr-1">{isTrue ? 'check_circle' : 'cancel'}</span>
              {isTrue ? 'TRUE' : 'FALSE'}
            </span>
            {confidenceScore && (
              <span className="text-gray-700 text-sm bg-gray-100 px-2 py-0.5 rounded">
                Confidence: {(confidenceScore * 100).toFixed(0)}%
              </span>
            )}
            <span className="text-gray-500 text-sm">Verified {formattedDate}</span>
            
            {/* Subscription Tier Badge */}
            <span className={`text-xs py-0.5 px-2 rounded-full font-medium ml-2 ${
              tierName === "Premium Tier" 
                ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white" 
              : tierName === "Standard Tier" 
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
              : tierName === "Basic Tier"
                ? "bg-gradient-to-r from-teal-500 to-teal-700 text-white"  
              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
            }`}>
              {tierName ? tierName.replace(" Tier", "") : "Free"} 
              {modelsUsed ? ` (${modelsUsed} models)` : ""}
            </span>
          </div>
        </div>
        {isAuthenticated && (
          <div>
            <button 
              className={`${isSaved ? 'text-primary' : 'text-gray-400'} hover:${isSaved ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={handleSaveToggle}
              disabled={saveMutation.isPending}
            >
              <span className="material-icons">{isSaved ? 'bookmark' : 'bookmark_border'}</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Domain Detection Info */}
      {domainInfo && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <h4 className="text-sm font-medium text-blue-700 mb-1 flex items-center">
            <span className="material-icons text-sm mr-1">category</span>
            Topic Analysis
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Domains detected: {domainInfo.detectedDomains.map(d => 
              d.charAt(0).toUpperCase() + d.slice(1)
            ).join(', ')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-2">
            {Object.entries(domainInfo.modelWeights).map(([model, weight]) => (
              <div key={model} className="bg-white p-1 rounded border border-blue-50 text-center">
                <div className="text-xs font-medium">{model.charAt(0).toUpperCase() + model.slice(1)}</div>
                <div className="text-xs">Weight: {(weight * 100).toFixed(0)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${weight * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Multi-AI Verification */}
      {serviceBreakdown && serviceBreakdown.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="material-icons text-sm mr-1">analytics</span>
            Multi-AI Verification
          </h4>
          
          {/* Contribution summary bar - Shows which AI model had the most impact */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">AI Model Contributions</div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
              {serviceBreakdown.map((service, index) => {
                // Sort services by confidence to determine width proportion
                const totalConfidence = serviceBreakdown.reduce((sum, s) => sum + s.confidence, 0);
                const widthPercent = (service.confidence / totalConfidence) * 100;
                
                // Determine color based on service
                let color = "bg-gray-400";
                if (service.name === "Claude") color = "bg-purple-500";
                if (service.name === "GPT-4") color = "bg-green-500";
                if (service.name === "Perplexity") color = "bg-blue-500";
                if (service.name === "Gemini") color = "bg-blue-400";
                if (service.name === "Mistral") color = "bg-indigo-500";
                if (service.name === "Llama") color = "bg-blue-600";
                
                return (
                  <div 
                    key={index} 
                    className={`h-full ${color}`} 
                    style={{ width: `${widthPercent}%` }}
                    title={`${service.name}: ${(service.confidence * 100).toFixed(0)}% confidence`}
                  ></div>
                );
              })}
            </div>
            
            {/* Legend for the contribution bar */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
              {serviceBreakdown.map((service, index) => {
                // Calculate normalized percentage (each service's relative contribution)
                const totalConfidence = serviceBreakdown.reduce((sum, s) => sum + s.confidence, 0);
                const contributionPercent = totalConfidence > 0 ? (service.confidence / totalConfidence) * 100 : 0;
                
                // Determine color based on service
                let dotColor = "bg-gray-400";
                if (service.name === "Claude") dotColor = "bg-purple-500";
                if (service.name === "GPT-4") dotColor = "bg-green-500";
                if (service.name === "Perplexity") dotColor = "bg-blue-500";
                if (service.name === "Gemini") dotColor = "bg-blue-400";
                if (service.name === "Mistral") dotColor = "bg-indigo-500";
                if (service.name === "Llama") dotColor = "bg-blue-600";
                
                // Highlight the model with the highest contribution
                const isHighestContribution = service.confidence === Math.max(...serviceBreakdown.map(s => s.confidence));
                
                return (
                  <div key={index} className={`flex items-center text-xs ${isHighestContribution ? 'font-semibold' : ''}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${dotColor}`}></span>
                    <span>{service.name}</span>
                    <span className="text-gray-500 ml-1">({contributionPercent.toFixed(0)}%)</span>
                    {isHighestContribution && (
                      <span className="text-xs ml-1 text-gray-700">★</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {serviceBreakdown.map((service, index) => {
              // Calculate normalized percentage for each service
              const totalConfidence = serviceBreakdown.reduce((sum, s) => sum + s.confidence, 0);
              const contributionPercent = totalConfidence > 0 ? (service.confidence / totalConfidence) * 100 : 0;
              // Sort services by confidence to highlight the most influential
              const isHighestConfidence = service.confidence === Math.max(...serviceBreakdown.map(s => s.confidence));
              
              return (
                <div 
                  key={index} 
                  className={`p-2 border rounded bg-white transition-all ${isHighestConfidence ? 'ring-2 ring-offset-1 ring-primary/30 border-primary/20' : ''}`}
                >
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 mr-2 flex items-center justify-center">
                      {service.name === "Claude" && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm2.6 14.1c0 1.575-1.025 2.6-2.6 2.6-1.575 0-2.6-1.025-2.6-2.6 0-.275.225-.5.5-.5s.5.225.5.5c0 .975.625 1.6 1.6 1.6s1.6-.625 1.6-1.6V8.9c0-.975-.625-1.6-1.6-1.6s-1.6.625-1.6 1.6c0 .275-.225.5-.5.5s-.5-.225-.5-.5c0-1.575 1.025-2.6 2.6-2.6 1.575 0 2.6 1.025 2.6 2.6v6.2z" fill="#8E44EC"/>
                        </svg>
                      )}
                      {service.name === "GPT-4" && (
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5093-2.6067-1.4998z" fill="#10A37F"/>
                        </svg>
                      )}
                      {service.name === "Perplexity" && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <path d="M9.75 2a2.25 2.25 0 0 0-2.25 2.25V9a2.25 2.25 0 0 0 2.25 2.25A2.25 2.25 0 0 0 12 9V4.25A2.25 2.25 0 0 0 9.75 2zm11.234 2.53a2.25 2.25 0 0 0-3.056.82L15.384 9a2.25 2.25 0 0 0 .82 3.056 2.25 2.25 0 0 0 3.056-.82l2.544-3.65a2.25 2.25 0 0 0-.82-3.056zm-15.102.002a2.25 2.25 0 0 0-.82 3.057l2.544 3.65a2.25 2.25 0 0 0 3.056.82 2.25 2.25 0 0 0 .82-3.055L8.938 5.353a2.25 2.25 0 0 0-3.056-.82zm12.618 7.354a2.25 2.25 0 0 0-3.056.82L12.9 16.358a2.25 2.25 0 0 0 .82 3.056 2.25 2.25 0 0 0 3.056-.82l2.544-3.65a2.25 2.25 0 0 0-.82-3.056zm-10.134 0a2.25 2.25 0 0 0-.82 3.057l2.544 3.65a2.25 2.25 0 0 0 3.056.82 2.25 2.25 0 0 0 .82-3.055l-2.544-3.652a2.25 2.25 0 0 0-3.056-.82zm5.134 2.364A2.25 2.25 0 0 0 9.75 16.5v4.75a2.25 2.25 0 0 0 2.25 2.25 2.25 2.25 0 0 0 2.25-2.25V16.5a2.25 2.25 0 0 0-2.25-2.25z" fill="#5534FF"/>
                        </svg>
                      )}
                      {service.name === "Gemini" && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <path d="M12 2L2 7.37333V16.6267L12 22L22 16.6267V7.37333L12 2ZM9.33333 13.36V17.1867L6.66667 15.5467V11.72L9.33333 13.36ZM5.33333 10.3733L8 8.74533L10.6667 10.3733L8 12.0133L5.33333 10.3733ZM12 13.36L14.6667 11.72V15.5467L12 17.1867V13.36ZM15.33 10.3733L13.3333 9.08L16 7.40533L18 8.68667L15.33 10.3733ZM8.66667 9.08L6.66667 10.3733L4 8.68667L6 7.40533L8.66667 9.08Z" fill="#1F77FA"/>
                        </svg>
                      )}
                      {service.name === "Mistral" && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <path d="M12 1C5.92488 1 1 5.92488 1 12C1 18.0751 5.92488 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92488 18.0751 1 12 1ZM12 6.125L17.875 12L12 17.875L6.125 12L12 6.125Z" fill="#0042DA"/>
                        </svg>
                      )}
                      {service.name === "Llama" && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <path d="M12.5 2C8.35938 2 5 5.35938 5 9.5V14.5C5 18.6406 8.35938 22 12.5 22C16.6406 22 20 18.6406 20 14.5V9.5C20 5.35938 16.6406 2 12.5 2ZM12.5 18C10.5672 18 9 16.4328 9 14.5C9 12.5672 10.5672 11 12.5 11C14.4328 11 16 12.5672 16 14.5C16 16.4328 14.4328 18 12.5 18Z" fill="#0469D2"/>
                        </svg>
                      )}
                    </div>
                    <div className={`font-medium text-sm ${isHighestConfidence ? 'text-primary' : ''}`}>
                      {service.name}
                      {isHighestConfidence && <span className="text-xs ml-1 text-primary">★</span>}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={service.verdict === "TRUE" || service.verdict === "True" ? "text-true" : "text-false"}>
                      {service.verdict}
                    </span>
                    <span className={`${isHighestConfidence ? 'font-medium text-primary' : 'text-gray-500'}`}>
                      {contributionPercent.toFixed(0)}% confidence
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full ${service.verdict === "TRUE" || service.verdict === "True" ? "bg-true" : "bg-false"}`}
                      style={{ width: `${contributionPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Consensus and Reliability Metrics */}
          {(factualConsensus !== undefined || manipulationScore !== undefined || contradictionIndex !== undefined) && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {factualConsensus !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-gray-500">Consensus</div>
                  <div className="font-medium">{(factualConsensus * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${factualConsensus * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {manipulationScore !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-gray-500">Manipulation Risk</div>
                  <div className="font-medium">{(manipulationScore * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full" 
                      style={{ width: `${manipulationScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {contradictionIndex !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-gray-500">Contradiction</div>
                  <div className="font-medium">{(contradictionIndex * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      style={{ width: `${contradictionIndex * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {sources && sources.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Top Sources:</h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-5 list-disc">
            {sources.slice(0, 3).map((source, index) => (
              <li key={index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {source.name || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {historicalContext && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <h4 className="text-sm font-medium text-blue-700 mb-1 flex items-center">
            <span className="material-icons text-sm mr-1">history</span>
            Historical Context
          </h4>
          <div className="text-sm text-gray-700">
            {historicalContext}
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <span className="material-icons text-sm mr-1">fact_check</span>
            Fact Analysis
          </h4>
          {explanation?.length > 300 && (
            <button 
              onClick={() => setShowFullExplanation(!showFullExplanation)}
              className="text-xs text-primary hover:underline"
            >
              {showFullExplanation ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {showFullExplanation ? explanation : shortenedExplanation}
        </div>
      </div>

      {isAuthenticated && onDelete && (
        <div className="mt-4 flex justify-end">
          <button 
            className="text-gray-500 hover:text-red-500 flex items-center text-xs"
            onClick={() => {
              if (confirm("Are you sure you want to delete this fact check? This action cannot be undone.")) {
                onDelete(id);
              }
            }}
          >
            <span className="material-icons text-sm mr-1">delete_outline</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FactResult;
