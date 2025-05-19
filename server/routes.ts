import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertFactCheckSchema, sourceSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { perplexityService } from "./services/perplexityService";
import { aggregatedFactCheckService } from "./services/aggregatedFactCheckService";

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
      
      // Use the aggregated fact checking service that combines multiple sources
      const factResult = await aggregatedFactCheckService.checkFact(statement);
      
      // If user is authenticated, save the fact check
      if (req.isAuthenticated() && (req as any).user) {
        const userId = (req as any).user.claims.sub;
        
        const factCheckData = {
          userId,
          statement,
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
        historicalContext: factResult.historicalContext,
        sources: factResult.sources,
        savedByUser: false,
        checkedAt: new Date().toISOString(),
        confidenceScore: factResult.confidenceScore,
        serviceBreakdown: factResult.serviceBreakdown
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
  
  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.get('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      const category = await storage.createCategory({ name, description });
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      const updatedCategory = await storage.updateCategory(id, { name, description });
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  app.get('/api/categories/:id/fact-checks', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const factChecks = await storage.getFactChecksByCategory(categoryId, limit);
      res.json(factChecks);
    } catch (error) {
      console.error("Error fetching fact checks by category:", error);
      res.status(500).json({ message: "Failed to fetch fact checks" });
    }
  });
  
  // Tag routes
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });
  
  app.get('/api/tags/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tag = await storage.getTag(id);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(tag);
    } catch (error) {
      console.error("Error fetching tag:", error);
      res.status(500).json({ message: "Failed to fetch tag" });
    }
  });
  
  app.post('/api/tags', isAuthenticated, async (req: any, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Tag name is required" });
      }
      
      const tag = await storage.createTag({ name });
      res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "Failed to create tag" });
    }
  });
  
  app.put('/api/tags/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Tag name is required" });
      }
      
      const updatedTag = await storage.updateTag(id, { name });
      
      if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(updatedTag);
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({ message: "Failed to update tag" });
    }
  });
  
  app.delete('/api/tags/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTag(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });
  
  app.get('/api/tags/:id/fact-checks', async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const factChecks = await storage.getFactChecksByTag(tagId, limit);
      res.json(factChecks);
    } catch (error) {
      console.error("Error fetching fact checks by tag:", error);
      res.status(500).json({ message: "Failed to fetch fact checks" });
    }
  });
  
  app.post('/api/fact-checks/:factCheckId/tags/:tagId', isAuthenticated, async (req: any, res) => {
    try {
      const factCheckId = parseInt(req.params.factCheckId);
      const tagId = parseInt(req.params.tagId);
      
      const factCheckTag = await storage.addTagToFactCheck(factCheckId, tagId);
      res.status(201).json(factCheckTag);
    } catch (error) {
      console.error("Error adding tag to fact check:", error);
      res.status(500).json({ message: "Failed to add tag to fact check" });
    }
  });
  
  app.delete('/api/fact-checks/:factCheckId/tags/:tagId', isAuthenticated, async (req: any, res) => {
    try {
      const factCheckId = parseInt(req.params.factCheckId);
      const tagId = parseInt(req.params.tagId);
      
      const success = await storage.removeTagFromFactCheck(factCheckId, tagId);
      
      if (!success) {
        return res.status(404).json({ message: "Tag not found for this fact check" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing tag from fact check:", error);
      res.status(500).json({ message: "Failed to remove tag from fact check" });
    }
  });
  
  app.get('/api/fact-checks/:id/tags', async (req, res) => {
    try {
      const factCheckId = parseInt(req.params.id);
      const tags = await storage.getTagsByFactCheck(factCheckId);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags for fact check:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
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
