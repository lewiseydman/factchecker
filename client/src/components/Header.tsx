import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary text-3xl">fact_check</span>
          <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-800">
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
                <DropdownMenuItem className="cursor-pointer">
                  Settings
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
  );
};

export default Header;
