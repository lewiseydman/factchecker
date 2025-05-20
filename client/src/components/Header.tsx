import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showApiKeys, setShowApiKeys] = useState(false);
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      {/* Simple API Keys Dialog */}
      <Dialog open={showApiKeys} onOpenChange={setShowApiKeys}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>API Key Management</DialogTitle>
            <DialogDescription>
              Add your API keys to enable multiple AI services for more accurate fact-checking.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              For optimal fact-checking, we recommend adding keys for Claude, OpenAI, Perplexity, 
              Gemini, Mistral, and Llama. Without all keys, some services will use simulated responses.
            </p>
            <p className="text-sm text-gray-600">
              Please use the Settings page to manage your API keys.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowApiKeys(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-primary text-3xl">fact_check</span>
            <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-800">
              FactCheck
            </Link>
          </div>
          
          {!isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleLogin}
                className="px-4 py-2 rounded-md text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
              >
                Log In
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
                  <Avatar>
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback>{(user?.firstName?.[0] || "U")}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.firstName || "User"}
                  </span>
                  <span className="material-icons text-gray-500 text-sm">arrow_drop_down</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    Your Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowApiKeys(true);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Key size={16} />
                      <span>API Keys</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;