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
  sources: Source[];
  savedByUser?: boolean;
  checkedAt: string;
};

const TabNavigation = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isAuthenticated } = useAuth();
  
  const handleTabClick = (tab: string, path: string) => {
    setActiveTab(tab);
    setLocation(path);
  };
  
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleTabClick("dashboard", "/");
          }}
          className={`${activeTab === "dashboard" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          Dashboard
        </a>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleTabClick("history", "/history");
          }}
          className={`${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          My History
        </a>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleTabClick("saved", "/saved");
          }}
          className={`${activeTab === "saved" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          Saved Facts
        </a>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleTabClick("trending", "/trending");
          }}
          className={`${activeTab === "trending" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} border-b-2 py-4 px-1 text-sm font-medium`}
        >
          Trending
        </a>
      </nav>
    </div>
  );
};

const Dashboard = () => {
  const [currentFactCheck, setCurrentFactCheck] = useState<FactCheckResult | null>(null);
  const { isAuthenticated } = useAuth();

  const handleFactChecked = (factCheck: FactCheckResult) => {
    setCurrentFactCheck(factCheck);
  };

  return (
    <div className="fade-in">
      <TabNavigation />
      
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
            sources={currentFactCheck.sources}
            savedByUser={currentFactCheck.savedByUser}
            checkedAt={currentFactCheck.checkedAt}
          />
        </div>
      )}
      
      <RecentChecks />
      
      <TrendingFacts />
    </div>
  );
};

export default Dashboard;
