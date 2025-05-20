import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, AlertTriangle } from "lucide-react";

const apiKeySchema = z.object({
  claude: z.string().optional(),
  openai: z.string().optional(),
  perplexity: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

export function ApiKeyManager() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const { data: keyStatus = { claude: false, openai: false, perplexity: false, gemini: false, mistral: false, llama: false } } = useQuery({
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
      setOpen(false);
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
    
    saveApiKeysMutation.mutate(keysToUpdate);
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Key size={16} />
        API Keys
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={18} /> API Key Management
            </DialogTitle>
            <DialogDescription>
              Add your API keys to enable multiple AI services for more accurate fact-checking.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="claude">Anthropic Claude API Key</Label>
                {keyStatus?.claude && (
                  <span className="text-xs text-green-600">✓ Active</span>
                )}
              </div>
              <Input
                id="claude"
                type="password"
                placeholder="sk-ant-..."
                {...form.register("claude")}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="openai">OpenAI API Key</Label>
                {keyStatus?.openai && (
                  <span className="text-xs text-green-600">✓ Active</span>
                )}
              </div>
              <Input
                id="openai"
                type="password"
                placeholder="sk-..."
                {...form.register("openai")}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="perplexity">Perplexity API Key</Label>
                {keyStatus?.perplexity && (
                  <span className="text-xs text-green-600">✓ Active</span>
                )}
              </div>
              <Input
                id="perplexity"
                type="password"
                placeholder="pplx-..."
                {...form.register("perplexity")}
              />
            </div>
            
            {(!keyStatus?.claude || !keyStatus?.openai || !keyStatus?.perplexity) && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                <AlertTriangle size={18} className="mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Missing API Keys</p>
                  <p className="text-xs mt-1">
                    For the best fact-checking results, we recommend adding all three API keys. Without all keys, some services will use simulated responses.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saveApiKeysMutation.isPending}
              >
                {saveApiKeysMutation.isPending ? 'Saving...' : 'Save API Keys'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}