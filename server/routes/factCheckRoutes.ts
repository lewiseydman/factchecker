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
    
    // Use a consistent variable name for the rest of the function
    const input = userInput;
    
    // Use the ultimate fact checking service that processes both questions and statements
    const factResult = await ultimateFactCheckService.processInput(input);
    
    // Create fact check data
    const factCheckData = {
      // If user is authenticated, save with their userId, otherwise use null
      userId: req.isAuthenticated() && (req as any).user ? (req as any).user.claims.sub : null,
      statement: input, // Use the original input
      isTrue: factResult.isTrue,
      explanation: factResult.explanation,
      historicalContext: factResult.historicalContext,
      sources: factResult.sources,
      savedByUser: false,
      confidenceScore: factResult.confidenceScore,
      serviceBreakdown: factResult.serviceBreakdown
    };
    
    // Validate data before saving
    try {
      const validatedData = insertFactCheckSchema.parse(factCheckData);
      
      // Create fact check in database
      const factCheck = await storage.createFactCheck(validatedData);
      
      // Add to trending
      await storage.incrementChecksCount(factCheck.id);
      
      return res.status(201).json({
        ...factCheck,
        factualConsensus: factResult.factualConsensus,
        manipulationScore: factResult.manipulationScore,
        contradictionIndex: factResult.contradictionIndex,
        isQuestion: factResult.isQuestion,
        transformedStatement: factResult.transformedStatement,
        implicitClaims: factResult.implicitClaims,
        domainInfo: factResult.domainInfo
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const readableError = fromZodError(validationError);
        console.error("Validation error:", readableError.message);
      }
      // If validation fails, still return the API result but don't save it
    }
    
    // For unauthenticated users or if database save fails, return the API result directly
    res.json({
      id: 0, // Temporary ID for unauthenticated users
      statement: input, // Original user input
      isTrue: factResult.isTrue,
      explanation: factResult.explanation,
      historicalContext: factResult.historicalContext,
      sources: factResult.sources,
      savedByUser: false,
      checkedAt: new Date().toISOString(),
      confidenceScore: factResult.confidenceScore,
      serviceBreakdown: factResult.serviceBreakdown,
      factualConsensus: factResult.factualConsensus,
      manipulationScore: factResult.manipulationScore,
      contradictionIndex: factResult.contradictionIndex,
      // Include enhanced information
      isQuestion: factResult.isQuestion,
      transformedStatement: factResult.transformedStatement,
      implicitClaims: factResult.implicitClaims,
      domainInfo: factResult.domainInfo
    });
  } catch (error) {
    console.error("Error checking fact:", error);
    res.status(500).json({ 
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