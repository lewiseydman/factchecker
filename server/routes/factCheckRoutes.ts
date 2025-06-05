import { Router, Request, Response } from "express";
import { ultimateFactCheckService } from "../services/ultimateFactCheckService";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertFactCheckSchema } from "@shared/schema";
import { apiKeyManager } from "../services/apiKeyManager";
import { isAuthenticated } from "../replitAuth";

const router = Router();

// Set API keys route (protected)
router.post('/api-keys', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { claude, openai, perplexity } = req.body;
    
    if (claude) apiKeyManager.setApiKey('claude', claude);
    if (openai) apiKeyManager.setApiKey('openai', openai);
    if (perplexity) apiKeyManager.setApiKey('perplexity', perplexity);
    
    // Initialize all services with the new keys
    ultimateFactCheckService.initializeServices({
      claude: claude || apiKeyManager.getApiKey('claude'),
      openai: openai || apiKeyManager.getApiKey('openai'),
      perplexity: perplexity || apiKeyManager.getApiKey('perplexity')
    });
    
    res.json({ success: true, message: "API keys updated successfully" });
  } catch (error) {
    console.error("Error updating API keys:", error);
    res.status(500).json({ message: "Failed to update API keys" });
  }
});

// Check API keys status (protected)
router.get('/api-keys/status', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Just check if keys exist, don't return the actual keys
    const keys = apiKeyManager.getAllKeys();
    res.json({
      claude: !!keys.claude,
      openai: !!keys.openai,
      perplexity: !!keys.perplexity
    });
  } catch (error) {
    console.error("Error checking API keys:", error);
    res.status(500).json({ message: "Failed to check API keys status" });
  }
});

// Main fact-check endpoint
router.post('/fact-check', async (req: Request, res: Response) => {
  try {
    console.log("Received body:", req.body);
    
    // Accept either 'input' or 'statement' parameter for backward compatibility
    const userInput = req.body.input || req.body.statement;
    
    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({ 
        message: "Statement is required and must be a string", 
        received: req.body 
      });
    }
    
    // Variables for subscription-related functionality
    let modelCount = 2; // Default to 2 models (free tier)
    let userId = null;
    
    // Check subscription status if user is authenticated
    if (req.isAuthenticated() && (req as any).user) {
      userId = (req as any).user.claims.sub;
      const subscriptionStatus = await storage.checkUserSubscriptionStatus(userId);
      
      // If user has no more checks remaining
      if (!subscriptionStatus.canCheck) {
        return res.status(402).json({ 
          message: "You've reached your monthly fact check limit. Please upgrade your subscription.",
          subscriptionRequired: true,
          checksRemaining: 0,
          tierName: subscriptionStatus.tierName
        });
      }
      
      // Use models based on subscription level
      modelCount = subscriptionStatus.modelCount || 2;
      
      // Decrement remaining checks for paid users
      if (subscriptionStatus.tierName !== "Free Tier") {
        await storage.decrementRemainingChecks(userId);
      }
      
      console.log(`Processing fact check for user ${userId} using ${modelCount} models. Checks remaining: ${subscriptionStatus.checksRemaining - 1}`);
    }
    
    // Process the user input through the fact checking service
    // Note: We would need to modify the ultimateFactCheckService to accept modelCount
    // For now, we'll use the existing method and add a comment about future improvements
    const factResult = await ultimateFactCheckService.processInput(userInput);
    // TODO: Update service to use different number of models based on subscription:
    // const factResult = await ultimateFactCheckService.processInputWithModels(userInput, modelCount);
    
    // If user is authenticated, try to save the fact check
    let savedFactCheck = null;
    
    if (userId) {
      try {
        // Create the fact check data with required fields
        const factCheckData = {
          userId,
          statement: userInput,
          isTrue: factResult.isTrue,
          explanation: factResult.explanation || "No explanation provided",
          historicalContext: factResult.historicalContext || null,
          sources: factResult.sources || [],
          savedByUser: false,
          // Convert number to string for the database
          confidenceScore: String(factResult.confidenceScore || 0.5),
          serviceBreakdown: factResult.serviceBreakdown || []
        };
        
        // Save to database
        savedFactCheck = await storage.createFactCheck(factCheckData);
        
        // Add to trending facts
        if (savedFactCheck && savedFactCheck.id) {
          await storage.incrementChecksCount(savedFactCheck.id);
        }
      } catch (saveError) {
        console.error("Error saving fact check:", saveError);
        // Continue even if save fails
      }
    }
    
    // Return result to the client
    return res.status(200).json({
      ...(savedFactCheck || { id: 0 }),
      factualConsensus: factResult.factualConsensus,
      manipulationScore: factResult.manipulationScore,
      contradictionIndex: factResult.contradictionIndex,
      isQuestion: factResult.isQuestion,
      transformedStatement: factResult.transformedStatement,
      implicitClaims: factResult.implicitClaims,
      domainInfo: factResult.domainInfo
    });
    
  } catch (error) {
    console.error("Error checking fact:", error);
    return res.status(500).json({ 
      message: "Failed to check fact", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get recent fact checks route
router.get('/fact-checks/recent', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const recentFacts = await storage.getRecentFactChecks(limit);
    res.json(recentFacts);
  } catch (error) {
    console.error("Error fetching recent fact checks:", error);
    res.status(500).json({ message: "Failed to fetch recent fact checks" });
  }
});

// Get trending fact checks route
router.get('/fact-checks/trending', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const trendingFacts = await storage.getTrendingFacts(limit);
    res.json(trendingFacts);
  } catch (error) {
    console.error("Error fetching trending fact checks:", error);
    res.status(500).json({ message: "Failed to fetch trending fact checks" });
  }
});

// Get saved fact checks route (requires authentication)
router.get('/fact-checks/saved', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const savedFacts = await storage.getSavedFactChecksByUser(userId);
    res.json(savedFacts);
  } catch (error) {
    console.error("Error fetching saved fact checks:", error);
    res.status(500).json({ message: "Failed to fetch saved fact checks" });
  }
});

export default router;