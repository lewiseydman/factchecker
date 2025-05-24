import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type TrendingFact = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  checkedAt: string;
  checksCount: number;
};

const TrendingFacts = () => {
  const { data: trendingFacts, isLoading } = useQuery({
    queryKey: ['/api/fact-checks/trending'],
    queryFn: async () => {
      return fetch('/api/fact-checks/trending')
        .then(res => res.json());
    },
    // Even if the API fails, show the sample data
    placeholderData: [
      {
        id: 1,
        statement: "A day on Venus is longer than a year on Venus.",
        isTrue: true,
        explanation: "Venus takes 243 Earth days to rotate once on its axis but only 225 Earth days to orbit the Sun.",
        checksCount: 1200,
        checkedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        statement: "Humans only use 10% of their brains.",
        isTrue: false,
        explanation: "This is a myth. Brain scans show activity throughout the entire brain, even during sleep.",
        checksCount: 985,
        checkedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        statement: "Chameleons change color to match their surroundings.",
        isTrue: false,
        explanation: "They primarily change color to regulate body temperature and communicate with other chameleons, not for camouflage.",
        checksCount: 754,
        checkedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Trending Fact Checks</h3>
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {[1, 2, 3].map(i => (
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
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Trending Fact Checks</h3>
      <div className="bg-white rounded-lg shadow-sm divide-y">
        {Array.isArray(trendingFacts) && trendingFacts.length > 0 ? (
          trendingFacts.map((fact: TrendingFact) => (
            <div key={fact.id} className="p-4 hover:bg-gray-50">
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
            <p className="text-gray-500 mt-1">Check back later for popular fact checks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingFacts;
