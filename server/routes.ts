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
  app.post('/api/fact-check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const factCheckData = insertFactCheckSchema.parse({
        ...req.body,
        userId
      });
      
      // Validate sources if provided
      if (factCheckData.sources) {
        const sourcesArray = z.array(sourceSchema).parse(factCheckData.sources);
        factCheckData.sources = sourcesArray;
      }
      
      // Create fact check
      const factCheck = await storage.createFactCheck(factCheckData);
      
      // Add to trending
      await storage.incrementChecksCount(factCheck.id);
      
      res.status(201).json(factCheck);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating fact check:", error);
      res.status(500).json({ message: "Failed to create fact check" });
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
