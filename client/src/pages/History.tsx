import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabNavigation } from "./SavedFacts"; // Reusing component

type FactCheck = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  historicalContext?: string;
  sources?: Array<{ name: string; url: string }>;
  savedByUser: boolean;
  checkedAt: string;
};

const History = () => {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  
  const { data: factChecks, isLoading } = useQuery({
    queryKey: ['/api/fact-checks/recent', 100], // Get more results for history page
    queryFn: async () => {
      const response = await fetch('/api/fact-checks/recent?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      return response.json();
    }
  });
  
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ id, saved }: { id: number; saved: boolean }) => {
      const response = await apiRequest("PUT", `/api/fact-checks/${id}/save`, { saved });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/saved'] });
      toast({
        title: "Success",
        description: "Fact check updated"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update fact check",
        variant: "destructive"
      });
    }
  });
  
  const deleteFactCheckMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/fact-checks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/saved'] });
      toast({
        title: "Success",
        description: "Fact check deleted"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete fact check",
        variant: "destructive"
      });
    }
  });

  const clearAllHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/fact-checks/clear-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks/saved'] });
      toast({
        title: "Success",
        description: "All history cleared successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear history",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveToggle = (id: number, currentStatus: boolean) => {
    toggleSaveMutation.mutate({ id, saved: !currentStatus });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this fact check? This action cannot be undone.")) {
      deleteFactCheckMutation.mutate(id);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear ALL your history? This action cannot be undone and will delete all your fact checks permanently.")) {
      clearAllHistoryMutation.mutate();
    }
  };
  
  const filteredFactChecks = factChecks?.filter((check: FactCheck) => {
    // Apply search filter
    const matchesSearch = searchTerm === "" || 
      check.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    if (filter === "all") return matchesSearch;
    if (filter === "true") return check.isTrue && matchesSearch;
    if (filter === "false") return !check.isTrue && matchesSearch;
    if (filter === "saved") return check.savedByUser && matchesSearch;
    
    return matchesSearch;
  });

  return (
    <div className="fade-in">
      <TabNavigation activeTab="history" />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Your Fact Check History</h2>
          {factChecks && factChecks.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleClearAllHistory}
              disabled={clearAllHistoryMutation.isPending}
            >
              {clearAllHistoryMutation.isPending ? "Clearing..." : "Clear All History"}
            </Button>
          )}
        </div>
        
        <div className="w-full sm:w-64">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search your history..."
              className="pl-10 pr-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400 text-sm">search</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={filter === "true" ? "default" : "outline"} 
          onClick={() => setFilter("true")}
        >
          True
        </Button>
        <Button 
          variant={filter === "false" ? "default" : "outline"} 
          onClick={() => setFilter("false")}
        >
          False
        </Button>
        <Button 
          variant={filter === "saved" ? "default" : "outline"} 
          onClick={() => setFilter("saved")}
        >
          Saved
        </Button>
      </div>
      
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4">
              <div className="sm:flex sm:justify-between sm:items-start">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFactChecks?.length > 0 ? (
              filteredFactChecks.map((item: FactCheck) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="sm:flex sm:justify-between sm:items-start">
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">{item.statement}</p>
                      <div className="flex items-center mb-2">
                        <span className={`flex items-center ${item.isTrue ? 'text-true' : 'text-false'} text-sm font-medium`}>
                          <span className="material-icons text-sm mr-1">{item.isTrue ? 'check_circle' : 'cancel'}</span>
                          {item.isTrue ? 'TRUE' : 'FALSE'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-3">
                          {formatDistanceToNow(new Date(item.checkedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.explanation}</p>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-2">
                      <button 
                        className={`${item.savedByUser ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} hover:${item.savedByUser ? 'text-blue-600' : 'text-primary'} transition-colors`}
                        onClick={() => handleSaveToggle(item.id, item.savedByUser)}
                        disabled={toggleSaveMutation.isPending}
                      >
                        <span className="material-icons">{item.savedByUser ? 'bookmark' : 'bookmark_border'}</span>
                      </button>
                      <button className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <span className="material-icons" onClick={() => handleDelete(item.id)}>delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No fact checks match your filters.</p>
              </div>
            )}
          </div>
          
          {/* Pagination - simple version */}
          {factChecks?.length > 10 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <span className="material-icons text-sm">chevron_left</span>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary text-sm font-medium text-white">2</a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <span className="material-icons text-sm">chevron_right</span>
                </a>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;
