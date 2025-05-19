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
  serviceBreakdown
}: FactResultProps) => {
  const [isSaved, setIsSaved] = useState(savedByUser);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const formattedDate = formatDistanceToNow(new Date(checkedAt), { addSuffix: true });

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

  return (
    <div className={`bg-white border-l-4 ${isTrue ? 'border-true' : 'border-false'} rounded-lg shadow-sm p-6 mb-4`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-800 font-medium mb-2">{statement}</p>
          <div className="flex items-center gap-3">
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
      
      {serviceBreakdown && serviceBreakdown.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="material-icons text-sm mr-1">analytics</span>
            Fact-checking Services
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {serviceBreakdown.map((service, index) => (
              <div key={index} className="p-2 border rounded bg-white">
                <div className="font-medium text-sm">{service.name}</div>
                <div className="flex justify-between text-sm">
                  <span className={service.verdict === "True" ? "text-true" : "text-false"}>
                    {service.verdict}
                  </span>
                  <span className="text-gray-500">
                    {(service.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {sources && sources.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Sources:</h4>
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
      
      <div className="mt-4 text-sm text-gray-700">
        {explanation}
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
