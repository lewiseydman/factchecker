import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { TabNavigation } from "./SavedFacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, AlertTriangle, CheckCircle2, BadgeInfo } from "lucide-react";

// Define API key schema with all six services
const apiKeySchema = z.object({
  claude: z.string().optional(),
  openai: z.string().optional(),
  perplexity: z.string().optional(),
  gemini: z.string().optional(),
  mistral: z.string().optional(),
  llama: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const Settings = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("api-keys");
  
  // Get current status of API keys
  const { data: keyStatus = { 
    claude: false, 
    openai: false, 
    perplexity: false, 
    gemini: false, 
    mistral: false, 
    llama: false 
  }} = useQuery({
    queryKey: ['/api/api-keys/status'],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });
  
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      claude: "",
      openai: "",
      perplexity: "",
      gemini: "",
      mistral: "",
      llama: "",
    },
  });
  
  const saveApiKeysMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const response = await apiRequest("POST", "/api/api-keys", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys/status'] });
      toast({
        title: "API Keys Updated",
        description: "Your API keys have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save API keys",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ApiKeyFormValues) => {
    // Only send keys that are provided (not empty)
    const keysToUpdate: Partial<ApiKeyFormValues> = {};
    if (data.claude) keysToUpdate.claude = data.claude;
    if (data.openai) keysToUpdate.openai = data.openai;
    if (data.perplexity) keysToUpdate.perplexity = data.perplexity;
    if (data.gemini) keysToUpdate.gemini = data.gemini;
    if (data.mistral) keysToUpdate.mistral = data.mistral;
    if (data.llama) keysToUpdate.llama = data.llama;
    
    saveApiKeysMutation.mutate(keysToUpdate);
  };

  return (
    <div className="fade-in">
      <TabNavigation activeTab="settings" />
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and API keys
        </p>
      </div>
      
      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key size={16} />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield size={16} />
            Account
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} className="text-primary" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Add your API keys to enable multiple AI services for more accurate fact-checking.
                Without these keys, simulated responses will be used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="claude" className="flex items-center gap-1">
                        Anthropic Claude
                        <a 
                          href="https://console.anthropic.com/settings/keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-1"
                        >
                          <BadgeInfo size={12} />
                        </a>
                      </Label>
                      {keyStatus?.claude && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>
                    <Input
                      id="claude"
                      type="password"
                      placeholder="sk-ant-..."
                      {...form.register("claude")}
                    />
                    <p className="text-xs text-gray-500">Specialized in reasoning and comprehension</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="openai" className="flex items-center gap-1">
                        OpenAI GPT
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-1"
                        >
                          <BadgeInfo size={12} />
                        </a>
                      </Label>
                      {keyStatus?.openai && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>
                    <Input
                      id="openai"
                      type="password"
                      placeholder="sk-..."
                      {...form.register("openai")}
                    />
                    <p className="text-xs text-gray-500">Strong general knowledge and analysis</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="perplexity" className="flex items-center gap-1">
                        Perplexity API
                        <a 
                          href="https://www.perplexity.ai/settings/api" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-1"
                        >
                          <BadgeInfo size={12} />
                        </a>
                      </Label>
                      {keyStatus?.perplexity && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>
                    <Input
                      id="perplexity"
                      type="password"
                      placeholder="pplx-..."
                      {...form.register("perplexity")}
                    />
                    <p className="text-xs text-gray-500">Real-time internet search capabilities</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="gemini" className="flex items-center gap-1">
                        Google Gemini
                        <a 
                          href="https://ai.google.dev/tutorials/setup" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-1"
                        >
                          <BadgeInfo size={12} />
                        </a>
                      </Label>
                      {keyStatus?.gemini && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>
                    <Input
                      id="gemini"
                      type="password"
                      placeholder="AIza..."
                      {...form.register("gemini")}
                    />
                    <p className="text-xs text-gray-500">Strong in science and technical domains</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="mistral" className="flex items-center gap-1">
                        Mistral AI
                        <a 
                          href="https://console.mistral.ai/api-keys/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-1"
                        >
                          <BadgeInfo size={12} />
                        </a>
                      </Label>
                      {keyStatus?.mistral && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>
                    <Input
                      id="mistral"
                      type="password"
                      placeholder="..."
                      {...form.register("mistral")}
                    />
                    <p className="text-xs text-gray-500">Excellent mathematical and reasoning capabilities</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="llama" className="flex items-center gap-1">
                        Meta Llama
                        <a 
                          href="https://ai.meta.com/resources/models-and-libraries/llama-downloads/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-1"
                        >
                          <BadgeInfo size={12} />
                        </a>
                      </Label>
                      {keyStatus?.llama && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>
                    <Input
                      id="llama"
                      type="password"
                      placeholder="..."
                      {...form.register("llama")}
                    />
                    <p className="text-xs text-gray-500">Well-rounded with strong general capabilities</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  {(!keyStatus?.claude || !keyStatus?.openai || !keyStatus?.perplexity || 
                    !keyStatus?.gemini || !keyStatus?.mistral || !keyStatus?.llama) && (
                    <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700 mb-6">
                      <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Incomplete AI Coverage</p>
                        <p className="text-xs mt-1">
                          For the best fact-checking results, we recommend adding all six API keys. Each AI model has different 
                          strengths in specific knowledge domains. Without all keys, some services will use simulated responses.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={saveApiKeysMutation.isPending}
                  >
                    {saveApiKeysMutation.isPending ? 'Saving...' : 'Save API Keys'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                View and manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="p-2 border border-gray-200 rounded-md bg-gray-50 mt-1">
                    {user?.email || 'Not available'}
                  </div>
                </div>
                <div>
                  <Label>Account ID</Label>
                  <div className="p-2 border border-gray-200 rounded-md bg-gray-50 mt-1">
                    {user?.id || 'Not available'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-gray-500">
                Account managed through Replit authentication.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;