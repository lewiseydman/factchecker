import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

type FactCheck = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  sources?: Array<{ name: string; url: string }>;
  savedByUser: boolean;
  checkedAt: string;
};

interface TabNavigationProps {
  activeTab: string;
}

export const TabNavigation = ({ activeTab }: TabNavigationProps) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <Link 
          to="/"
          className={`${activeTab === "dashboard" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          Dashboard
        </Link>
        <Link 
          to="/history"
          className={`${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          My History
        </Link>
        <Link 
          to="/saved"
          className={`${activeTab === "saved" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          Saved Facts
        </Link>
        <Link 
          to="/trending"
          className={`${activeTab === "trending" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          Trending
        </Link>
      </nav>
    </div>
  );
};

const SavedFacts = () => {
  const { toast } = useToast();
  
  const { data: savedFactChecks, isLoading } = useQuery({
    queryKey: ['/api/fact-checks/saved'],
    queryFn: async () => {
      const response = await fetch('/api/fact-checks/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch saved facts');
      }
      return response.json();
    }
  });
  
  const unsaveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/fact-checks/${id}/save`, { saved: false });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/saved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/recent'] });
      toast({
        title: "Success",
        description: "Fact removed from saved items"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsave fact",
        variant: "destructive"
      });
    }
  });
  
  const handleUnsave = (id: number) => {
    unsaveMutation.mutate(id);
  };

  return (
    <div className="fade-in">
      <TabNavigation activeTab="saved" />
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Your Saved Facts</h2>
        <p className="text-gray-600 mt-2">
          Access your bookmarked fact checks for quick reference
        </p>
      </div>
      
      {isLoading ? (
        <div className="bg-white shadow-sm rounded-lg divide-y">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4">
              <div className="sm:flex sm:justify-between sm:items-start">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg divide-y">
          {savedFactChecks?.length > 0 ? (
            savedFactChecks.map((item: FactCheck) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="sm:flex sm:justify-between sm:items-start">
                  <div>
                    <p className="text-gray-800 font-medium mb-1">{item.statement}</p>
                    <div className="flex items-center mb-2">
                      <span className={`flex items-center ${item.isTrue ? 'text-true' : 'text-false'} text-sm font-medium`}>
                        <span className="material-icons text-sm mr-1">{item.isTrue ? 'check_circle' : 'cancel'}</span>
                        {item.isTrue ? 'TRUE' : 'FALSE'}
                      </span>
                      <span className="text-gray-500 text-xs ml-3">
                        {formatDistanceToNow(new Date(item.checkedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.explanation}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <button 
                      className="text-primary hover:text-blue-600"
                      onClick={() => handleUnsave(item.id)}
                      disabled={unsaveMutation.isPending}
                    >
                      <span className="material-icons">bookmark</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <span className="material-icons text-gray-400 text-4xl mb-2">bookmark_border</span>
              <p className="text-gray-700 font-medium">No saved facts yet</p>
              <p className="text-gray-500 mt-1">Save interesting fact checks to refer back to them later</p>
              <Link to="/" className="mt-4 inline-block text-primary hover:text-blue-600">
                Check some facts now
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedFacts;
