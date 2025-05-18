import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type FactCheck = {
  id: number;
  statement: string;
  isTrue: boolean;
  checkedAt: string;
};

const RecentChecks = () => {
  const { isAuthenticated } = useAuth();
  
  const { data: factChecks, isLoading } = useQuery({
    queryKey: ['/api/fact-checks/recent'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      return fetch('/api/fact-checks/recent?limit=3')
        .then(res => res.json());
    },
    enabled: isAuthenticated
  });

  // Sample data for non-authenticated users
  const sampleChecks = [
    {
      id: 1,
      statement: "Lightning never strikes the same place twice.",
      isTrue: false,
      checkedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      statement: "Water expands when it freezes.",
      isTrue: true,
      checkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      statement: "Adult humans have 32 teeth including wisdom teeth.",
      isTrue: true,
      checkedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayChecks = isAuthenticated ? factChecks : sampleChecks;

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Your Recent Checks</h3>
          <Link to="/history" className="text-primary hover:text-blue-600 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {isAuthenticated ? 'Your Recent Checks' : 'Example Fact Checks'}
        </h3>
        {isAuthenticated && (
          <Link to="/history" className="text-primary hover:text-blue-600 text-sm font-medium">
            View All
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayChecks?.map((check: FactCheck) => (
          <div 
            key={check.id} 
            className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${check.isTrue ? 'border-true' : 'border-false'}`}
          >
            <p className="text-gray-800 font-medium mb-2 line-clamp-2">{check.statement}</p>
            <div className="flex items-center justify-between">
              <span className={`flex items-center ${check.isTrue ? 'text-true' : 'text-false'} text-sm font-medium`}>
                <span className="material-icons text-sm mr-1">{check.isTrue ? 'check_circle' : 'cancel'}</span>
                {check.isTrue ? 'TRUE' : 'FALSE'}
              </span>
              <span className="text-gray-500 text-xs">
                {formatDistanceToNow(new Date(check.checkedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentChecks;
