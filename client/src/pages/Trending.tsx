import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TabNavigation } from "./SavedFacts"; // Reusing component

type TrendingFact = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  checkedAt: string;
  checksCount: number;
};

const Trending = () => {
  const { data: trendingFacts, isLoading } = useQuery({
    queryKey: ['/api/fact-checks/trending'],
    queryFn: async () => {
      const response = await fetch('/api/fact-checks/trending?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch trending facts');
      }
      return response.json();
    }
  });

  return (
    <div className="fade-in">
      <TabNavigation activeTab="trending" />
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Trending Fact Checks</h2>
        <p className="text-gray-600 mt-2">
          Discover the most frequently verified statements
        </p>
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4">
              <div className="flex">
                <Skeleton className="h-6 w-6 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-2" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-2 w-16 mr-2" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {Array.isArray(trendingFacts) && trendingFacts.length > 0 ? (
            trendingFacts.map((fact: TrendingFact) => (
              <div key={fact.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <span className={`material-icons ${fact.isTrue ? 'text-true' : 'text-false'}`}>
                      {fact.isTrue ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-800 font-medium">{fact.statement}</p>
                    <p className="text-gray-600 text-sm mt-1">{fact.explanation}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{fact.checksCount?.toLocaleString() || 0} checks</span>
                      <span className="mx-2">•</span>
                      <span>{formatDistanceToNow(new Date(fact.checkedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <span className="material-icons text-gray-400 text-4xl mb-2">trending_up</span>
              <p className="text-gray-700 font-medium">No trending facts available</p>
              <p className="text-gray-500 mt-1">Start fact-checking to see trending content</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trending;
