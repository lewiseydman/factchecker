import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { TabNavigation } from "./SavedFacts";

type SubscriptionTier = {
  id: number;
  name: string;
  description: string;
  monthlyPriceGBP: string;
  checkerLimit: number;
  modelCount: number;
  features: string[];
};

type UserSubscription = {
  active: boolean;
  tier: SubscriptionTier | null;
  checksRemaining: number;
  expiresAt: string | null;
};

const Subscription = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);

  // Fetch available subscription tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['/api/subscriptions/tiers'],
    enabled: true,
  });

  // Fetch user's current subscription
  const { data: userSubscription, isLoading: subLoading } = useQuery({
    queryKey: ['/api/subscriptions/user-subscription'],
    enabled: isAuthenticated,
  });

  // Subscribe to a tier
  const subscribeMutation = useMutation({
    mutationFn: async (tierId: number) => {
      return await apiRequest('POST', '/api/subscriptions/subscribe', {
        tierId
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful",
        description: "You've successfully subscribed to the selected plan.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/user-subscription'] });
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (tierId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to a plan.",
        variant: "default",
      });
      return;
    }
    setSelectedTierId(tierId);
    subscribeMutation.mutate(tierId);
  };

  // Format price with pound symbol
  const formatPrice = (price: string) => {
    return `£${price}`;
  };

  return (
    <div className="fade-in">
      <TabNavigation activeTab="subscription" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Subscription Plans</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Choose the plan that best suits your fact-checking needs
        </p>
      </div>

      {/* Current subscription info */}
      {isAuthenticated && userSubscription && userSubscription.tier && (
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-950/30">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Current Subscription</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{userSubscription.tier.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Checks Remaining</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{userSubscription.checksRemaining} of {userSubscription.tier.checkerLimit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Models</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{userSubscription.tier.modelCount} models</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expires</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {userSubscription.expiresAt 
                  ? new Date(userSubscription.expiresAt).toLocaleDateString() 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Free tier for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mb-8 p-4 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Free Plan</h2>
          <p>You're currently on the Free Plan (3 checks per month, limited to 2 AI models)</p>
          <p className="mt-2">Log in to upgrade to a premium subscription</p>
        </div>
      )}

      {/* Subscription tier options */}
      {tiersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-lg bg-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers?.map((tier: SubscriptionTier) => {
            const isCurrentTier = userSubscription?.tier?.id === tier.id;
            const isBasic = tier.name.includes('Basic');
            const isStandard = tier.name.includes('Standard');
            const isPremium = tier.name.includes('Premium');
            
            let cardClassName = "h-full flex flex-col border-2 bg-white dark:bg-gray-800";
            let headerClassName = "space-y-1 p-6";
            
            if (isBasic) {
              cardClassName += " border-blue-200 dark:border-blue-700";
              headerClassName += " bg-blue-50 dark:bg-blue-950/40";
            } else if (isStandard) {
              cardClassName += " border-indigo-300 dark:border-indigo-600";
              headerClassName += " bg-indigo-50 dark:bg-indigo-950/40";
            } else if (isPremium) {
              cardClassName += " border-purple-300 dark:border-purple-600";
              headerClassName += " bg-purple-50 dark:bg-purple-950/40";
            }
            
            return (
              <Card key={tier.id} className={cardClassName}>
                <CardHeader className={headerClassName}>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    {tier.name}
                    {isCurrentTier && (
                      <Badge className="ml-2 bg-green-500 dark:bg-green-600 text-white">Current Plan</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">{tier.description}</CardDescription>
                  <div className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                    {formatPrice(tier.monthlyPriceGBP)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{tier.checkerLimit} fact checks per month</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Uses {tier.modelCount} AI models</span>
                    </div>
                    {tier.features?.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isCurrentTier || subscribeMutation.isPending}
                    className={`w-full ${
                      isBasic ? "bg-blue-600 hover:bg-blue-700" :
                      isStandard ? "bg-indigo-600 hover:bg-indigo-700" :
                      isPremium ? "bg-purple-600 hover:bg-purple-700" :
                      ""
                    }`}
                  >
                    {isCurrentTier
                      ? "Current Plan"
                      : subscribeMutation.isPending && selectedTierId === tier.id
                      ? "Processing..."
                      : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Features comparison */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Features Comparison</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Free
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Standard
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Monthly fact checks
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">75</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI models used
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Historical context
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Detailed
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  In-depth
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Source credibility assessment
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Enhanced
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Premium
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Domain detection
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI models contribution breakdown
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Downloadable reports
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscription;