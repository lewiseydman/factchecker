import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import FactCheckForm from "@/components/FactCheckForm";
import FactResult from "@/components/FactResult";
import RecentChecks from "@/components/RecentChecks";
import TrendingFacts from "@/components/TrendingFacts";

type Source = {
  name: string;
  url: string;
};

type FactCheckResult = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  historicalContext?: string;
  sources: Source[];
  savedByUser?: boolean;
  checkedAt: string;
  confidenceScore?: number;
  serviceBreakdown?: Array<{
    name: string;
    verdict: string;
    confidence: number;
  }>;
};

// Import TabNavigation component properly
import { TabNavigation } from "./SavedFacts";
import { useEffect } from "react";

const Dashboard = () => {
  const [currentFactCheck, setCurrentFactCheck] = useState<FactCheckResult | null>(null);
  const { isAuthenticated } = useAuth();

  const handleFactChecked = (factCheck: FactCheckResult) => {
    setCurrentFactCheck(factCheck);
  };

  return (
    <div className="fade-in">
      <TabNavigation activeTab="dashboard" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Fact Check</h2>
        <p className="text-gray-600">Enter a statement to verify its accuracy</p>
      </div>
      
      <FactCheckForm onFactChecked={handleFactChecked} />
      
      {currentFactCheck && (
        <div id="result-area" className="mb-8">
          <FactResult
            id={currentFactCheck.id}
            statement={currentFactCheck.statement}
            isTrue={currentFactCheck.isTrue}
            explanation={currentFactCheck.explanation}
            historicalContext={currentFactCheck.historicalContext}
            sources={currentFactCheck.sources}
            savedByUser={currentFactCheck.savedByUser}
            checkedAt={currentFactCheck.checkedAt}
            confidenceScore={currentFactCheck.confidenceScore}
            serviceBreakdown={currentFactCheck.serviceBreakdown}
          />
        </div>
      )}
      
      <RecentChecks />
      
      <TrendingFacts />
    </div>
  );
};

export default Dashboard;
