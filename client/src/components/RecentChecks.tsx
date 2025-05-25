import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useEffect, useState } from "react";

type FactCheck = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation?: string;
  checkedAt: string;
  tierName?: string;
  modelsUsed?: number;
};

const RecentChecks = () => {
  const { isAuthenticated } = useAuth();
  
  // Setup for horizontal slider - moved before conditional return
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
  
  const { data: factChecks, isLoading } = useQuery({
    queryKey: ['/api/fact-checks/recent'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      return fetch('/api/fact-checks/recent?limit=5')
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
      explanation: "Lightning often strikes the same place repeatedly, especially tall, isolated objects like the Empire State Building.",
      checkedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      statement: "Water expands when it freezes.",
      isTrue: true,
      explanation: "Water is one of the few substances that expands when frozen, which is why ice floats on water.",
      checkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      statement: "Adult humans have 32 teeth including wisdom teeth.",
      isTrue: true,
      explanation: "A full set of adult teeth consists of 8 incisors, 4 canines, 8 premolars, and 12 molars, including wisdom teeth.",
      checkedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      statement: "You can see the Great Wall of China from space.",
      isTrue: false,
      explanation: "This is a common myth. The Great Wall is not visible from space with the naked eye, despite being a massive structure.",
      checkedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      statement: "Goldfish have a 3-second memory.",
      isTrue: false,
      explanation: "Goldfish actually have much longer memories, capable of remembering things for months, not seconds.",
      checkedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      statement: "Bananas are berries, but strawberries aren't.",
      isTrue: true,
      explanation: "Botanically speaking, bananas qualify as berries while strawberries are aggregate accessory fruits.",
      checkedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 7,
      statement: "Humans only use 10% of their brains.",
      isTrue: false,
      explanation: "Brain imaging shows that we use virtually every part of the brain, even during sleep. This 10% claim is a myth.",
      checkedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 8,
      statement: "Mount Everest is the tallest mountain on Earth.",
      isTrue: true,
      explanation: "At 29,032 feet (8,849 meters) above sea level, Mount Everest is indeed the highest peak on Earth.",
      checkedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 9,
      statement: "Chameleons change color to blend in with their environment.",
      isTrue: false,
      explanation: "Chameleons primarily change color to communicate, regulate temperature, and express emotions, not for camouflage.",
      checkedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 10,
      statement: "The Earth's core is hotter than the surface of the Sun.",
      isTrue: true,
      explanation: "Earth's inner core reaches temperatures of about 5,700°C, while the Sun's surface is around 5,500°C.",
      checkedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayChecks = isAuthenticated ? factChecks : sampleChecks;
  
  // Set up scroll listeners - moved after displayChecks definition
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
  }, [displayChecks]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-52" />
          {isAuthenticated && <Skeleton className="h-4 w-16" />}
        </div>
        
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {isAuthenticated ? 'Your Recent Checks' : 'Example Fact Checks'}
        </h3>
        {isAuthenticated && (
          <Link to="/history" className="text-primary hover:text-blue-600 text-sm font-medium">
            View All
          </Link>
        )}
      </div>
      
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
          {displayChecks?.map((check: FactCheck) => (
            <div 
              key={check.id} 
              className={`flex-shrink-0 w-full sm:w-[280px] md:w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200 border-l-4 ${check.isTrue ? 'border-l-true' : 'border-l-false'}`}
            >
              <div className="p-5">
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-3 line-clamp-2">{check.statement}</p>
                {check.explanation && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">{check.explanation}</p>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={`flex items-center ${check.isTrue ? 'text-true' : 'text-false'} text-sm font-medium`}>
                    <span className="material-icons text-sm mr-1">{check.isTrue ? 'check_circle' : 'cancel'}</span>
                    {check.isTrue ? 'TRUE' : 'FALSE'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(check.checkedAt), { addSuffix: true })}
                  </span>
                </div>
                
                {/* Subscription Tier Badge */}
                <div className="flex justify-end">
                  <span className={`text-xs py-0.5 px-2 rounded-full font-medium ${
                    check.tierName === "Premium Tier" 
                      ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white" 
                    : check.tierName === "Standard Tier" 
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                    : check.tierName === "Basic Tier"
                      ? "bg-gradient-to-r from-teal-500 to-teal-700 text-white"  
                    : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                  }`}>
                    {check.tierName ? check.tierName.replace(" Tier", "") : "Free"} 
                    {check.modelsUsed ? ` (${check.modelsUsed} models)` : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {(!displayChecks || displayChecks.length === 0) && (
            <div className="flex-1 p-8 text-center bg-white rounded-lg shadow-sm">
              <span className="material-icons text-gray-400 text-4xl mb-2">history</span>
              <p className="text-gray-700 font-medium">No fact checks available</p>
              <p className="text-gray-500 mt-1">Start fact-checking to see your history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentChecks;