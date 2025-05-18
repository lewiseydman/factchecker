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
  sources: Source[];
  savedByUser?: boolean;
  checkedAt: string;
}

const FactResult = ({
  id,
  statement,
  isTrue,
  explanation,
  sources,
  savedByUser = false,
  checkedAt
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
          <div className="flex items-center">
            <span className={`flex items-center ${isTrue ? 'text-true' : 'text-false'} font-bold`}>
              <span className="material-icons mr-1">{isTrue ? 'check_circle' : 'cancel'}</span>
              {isTrue ? 'TRUE' : 'FALSE'}
            </span>
            <span className="text-gray-500 text-sm ml-4">Verified {formattedDate}</span>
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
      
      {sources && sources.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Sources:</h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-5 list-disc">
            {sources.map((source, index) => (
              <li key={index}>
                {source.name}: <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{new URL(source.url).hostname}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-700">
        {explanation}
      </div>
    </div>
  );
};

export default FactResult;
