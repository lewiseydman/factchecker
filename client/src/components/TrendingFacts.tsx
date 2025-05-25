import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useEffect, useState } from "react";

type TrendingFact = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  checkedAt: string;
  checksCount: number;
  tierName?: string;
  modelsUsed?: number;
};

const TrendingFacts = () => {
  // Setup for horizontal slider
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  
  // Check if we can scroll in either direction
  const checkScrollability = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  // Handle scroll button clicks
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // Update buttons after scroll animation completes
      setTimeout(checkScrollability, 400);
    }
  };
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

  // Set up scroll listeners
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      checkScrollability();
      slider.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        slider.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [trendingFacts]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Trending Fact Checks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
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
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Trending Fact Checks</h3>
      
      <div className="relative">
        {/* Left scroll button - only shown when we can scroll left */}
        {canScrollLeft && (
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-full shadow-md border border-gray-200 dark:border-gray-600"
            onClick={() => scroll('left')}
          >
            <span className="material-icons text-gray-600 dark:text-gray-300">chevron_left</span>
          </button>
        )}
        
        {/* Right scroll button - only shown when we can scroll right */}
        {canScrollRight && (
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-full shadow-md border border-gray-200 dark:border-gray-600"
            onClick={() => scroll('right')}
          >
            <span className="material-icons text-gray-600 dark:text-gray-300">chevron_right</span>
          </button>
        )}
        
        {/* Scrollable container */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto pb-6 gap-4 pt-2 px-1 scrollbar-hide mask-fade-edges"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            paddingLeft: '20px',
            paddingRight: '20px'
          }}
        >
          {Array.isArray(trendingFacts) && trendingFacts.length > 0 ? (
            trendingFacts.map((fact: TrendingFact) => (
              <div 
                key={fact.id} 
                className={`flex-shrink-0 w-full sm:w-[280px] md:w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200 border-l-4 ${fact.isTrue ? 'border-l-true' : 'border-l-false'}`}
              >
                <div className="p-5">
                  <p className="text-gray-800 dark:text-gray-200 font-medium mb-3 line-clamp-2">{fact.statement}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">{fact.explanation}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`flex items-center ${fact.isTrue ? 'text-true' : 'text-false'} text-sm font-medium`}>
                      <span className="material-icons text-sm mr-1">{fact.isTrue ? 'check_circle' : 'cancel'}</span>
                      {fact.isTrue ? 'TRUE' : 'FALSE'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(fact.checkedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {/* Trending info and tier badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      🔥 {fact.checksCount?.toLocaleString() || 0} checks
                    </span>
                    <span className={`text-xs py-0.5 px-2 rounded-full font-medium ${
                      fact.tierName === "Premium Tier" 
                        ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white" 
                      : fact.tierName === "Standard Tier" 
                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                      : fact.tierName === "Basic Tier"
                        ? "bg-gradient-to-r from-teal-500 to-teal-700 text-white"  
                      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                    }`}>
                      {fact.tierName ? fact.tierName.replace(" Tier", "") : "Free"} 
                      {fact.modelsUsed ? ` (${fact.modelsUsed} models)` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 p-8 text-center bg-white rounded-lg shadow-sm">
              <span className="material-icons text-gray-400 text-4xl mb-2">trending_up</span>
              <p className="text-gray-700 font-medium">No trending facts available</p>
              <p className="text-gray-500 mt-1">Check back later for popular fact checks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingFacts;
