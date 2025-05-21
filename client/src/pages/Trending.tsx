import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TabNavigation } from "./SavedFacts"; // Reusing component
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  // Slider navigation state and refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
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
  
  // Set up scroll listeners
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      checkScrollability();
      slider.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        slider.removeEventListener('scroll', checkScrollability);
        window.addEventListener('resize', checkScrollability);
      };
    }
  }, [trendingFacts]);

  return (
    <div className="fade-in">
      <TabNavigation activeTab="trending" />
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Trending Fact Checks</h2>
        <p className="text-gray-600 mt-2">
          Discover the most frequently verified statements across all users
        </p>
      </div>
      
      {isLoading ? (
        // Loading skeleton for the slider
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex overflow-x-auto gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-full sm:w-[280px] md:w-[300px] bg-white rounded-lg border p-4">
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
      ) : (
        // Slider for trending facts
        <div className="relative">
          {/* Left scroll button - only shown when we can scroll left */}
          {canScrollLeft && (
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-md border-gray-200"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {/* Right scroll button - only shown when we can scroll right */}
          {canScrollRight && (
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-md border-gray-200"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
                <div key={fact.id} className="flex-shrink-0 w-full sm:w-[280px] md:w-[300px] bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
                  <div className="p-5">
                    <div className="flex items-start mb-3">
                      <div className="flex-shrink-0 mt-1">
                        <span className={`material-icons text-xl ${fact.isTrue ? 'text-true' : 'text-false'}`}>
                          {fact.isTrue ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium line-clamp-2">{fact.statement}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{fact.explanation}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="flex items-center">
                        <span className="material-icons text-gray-400 text-sm mr-1">trending_up</span>
                        {fact.checksCount?.toLocaleString() || 0} checks
                      </span>
                      <span>{formatDistanceToNow(new Date(fact.checkedAt), { addSuffix: true })}</span>
                    </div>
                    
                    {/* Subscription Tier Badge */}
                    <div className="flex justify-end">
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
                <p className="text-gray-500 mt-1">Start fact-checking to see trending content</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trending;
