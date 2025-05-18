import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertFactCheckSchema, sourceSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { perplexityService } from "./services/perplexityService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Fact check routes
  app.post('/api/fact-check', async (req: Request, res: Response) => {
    try {
      const { statement } = req.body;
      
      if (!statement || typeof statement !== 'string') {
        return res.status(400).json({ message: "Statement is required and must be a string" });
      }
      
      // Use Perplexity API to check the fact
      const factResult = await perplexityService.checkFact(statement);
      
      // If user is authenticated, save the fact check
      if (req.isAuthenticated() && (req as any).user) {
        const userId = (req as any).user.claims.sub;
        
        const factCheckData = {
          userId,
          statement,
          isTrue: factResult.isTrue,
          explanation: factResult.explanation,
          sources: factResult.sources,
          savedByUser: false
        };
        
        // Validate data before saving
        try {
          const validatedData = insertFactCheckSchema.parse(factCheckData);
          
          // Create fact check in database
          const factCheck = await storage.createFactCheck(validatedData);
          
          // Add to trending
          await storage.incrementChecksCount(factCheck.id);
          
          return res.status(201).json(factCheck);
        } catch (validationError) {
          if (validationError instanceof ZodError) {
            const readableError = fromZodError(validationError);
            console.error("Validation error:", readableError.message);
          }
          // If validation fails, still return the API result but don't save it
        }
      }
      
      // For unauthenticated users or if database save fails, return the API result directly
      res.json({
        id: 0, // Temporary ID for unauthenticated users
        statement,
        isTrue: factResult.isTrue,
        explanation: factResult.explanation,
        sources: factResult.sources,
        savedByUser: false,
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error checking fact:", error);
      res.status(500).json({ 
        message: "Failed to check fact", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/fact-checks/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const factChecks = await storage.getFactChecksByUser(userId, limit);
      res.json(factChecks);
    } catch (error) {
      console.error("Error fetching recent fact checks:", error);
      res.status(500).json({ message: "Failed to fetch recent fact checks" });
    }
  });

  app.get('/api/fact-checks/saved', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedFactChecks = await storage.getSavedFactChecksByUser(userId);
      res.json(savedFactChecks);
    } catch (error) {
      console.error("Error fetching saved fact checks:", error);
      res.status(500).json({ message: "Failed to fetch saved fact checks" });
    }
  });

  app.get('/api/fact-checks/trending', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const trendingFacts = await storage.getTrendingFacts(limit);
      res.json(trendingFacts);
    } catch (error) {
      console.error("Error fetching trending facts:", error);
      res.status(500).json({ message: "Failed to fetch trending facts" });
    }
  });

  app.put('/api/fact-checks/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { saved } = req.body;
      
      if (typeof saved !== 'boolean') {
        return res.status(400).json({ message: "Saved status must be a boolean" });
      }
      
      const updated = await storage.updateFactCheck(id, saved);
      
      if (!updated) {
        return res.status(404).json({ message: "Fact check not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating fact check:", error);
      res.status(500).json({ message: "Failed to update fact check" });
    }
  });

  app.delete('/api/fact-checks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFactCheck(id);
      
      if (!success) {
        return res.status(404).json({ message: "Fact check not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fact check:", error);
      res.status(500).json({ message: "Failed to delete fact check" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
