import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  UserIcon, 
  Settings, 
  CreditCard, 
  FileText, 
  Shield, 
  Scale, 
  MessageCircle,
  LogOut,
  LogIn,
  Brain,
  AlertTriangle
} from "lucide-react";

export const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    {
      icon: Brain,
      label: "Context-Aware",
      href: "/context-aware",
      description: "Track WHO said what, WHEN + misinformation alerts",
      featured: true
    },
    {
      icon: FileText,
      label: "Methodology",
      href: "/methodology",
      description: "How our fact-checking works"
    },
    {
      icon: CreditCard,
      label: "Subscription",
      href: "/subscription",
      description: "Upgrade your plan"
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      description: "Account preferences",
      authRequired: true
    },
    {
      icon: Shield,
      label: "Privacy Policy",
      href: "/privacy",
      description: "How we protect your data"
    },
    {
      icon: Scale,
      label: "Terms of Service",
      href: "/terms",
      description: "Our terms and conditions"
    },
    {
      icon: MessageCircle,
      label: "Contact Us",
      href: "/contact",
      description: "Get help and support"
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Menu</SheetTitle>
          <SheetDescription className="text-gray-600 dark:text-gray-400">
            Navigate and manage your account
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* User Profile Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImageUrl || ''} alt={user.email || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <UserIcon className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Sign in to access all features
              </p>
              <Button asChild size="sm" className="w-full" onClick={closeMenu}>
                <a href="/api/login" className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </a>
              </Button>
            </div>
          )}

          <Separator />

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              // Skip auth-required items if not authenticated
              if (item.authRequired && !isAuthenticated) {
                return null;
              }

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-3 py-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
                  >
                    <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          {isAuthenticated && (
            <>
              <Separator />
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={closeMenu}
                asChild
              >
                <a href="/api/logout" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </a>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};