import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { insertSubscriptionTierSchema, insertUserSubscriptionSchema } from '@shared/schema';

const router = Router();

// Get all subscription tiers
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    const tiers = await storage.getSubscriptionTiers();
    res.json(tiers);
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    res.status(500).json({ message: 'Failed to fetch subscription tiers' });
  }
});

// Get user's current subscription
router.get('/user-subscription', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription) {
      return res.json({
        active: false,
        tier: null,
        checksRemaining: 3, // Free tier default
        expiresAt: null
      });
    }
    
    const tier = await storage.getSubscriptionTier(subscription.tierId);
    
    res.json({
      active: subscription.isActive,
      tier,
      checksRemaining: subscription.checksRemaining,
      expiresAt: subscription.endDate
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription details' });
  }
});

// Get subscription status (for fact checking)
router.get('/status', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const status = await storage.checkUserSubscriptionStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ message: 'Failed to check subscription status' });
  }
});

// Demo subscribe to a tier (without real payment)
router.post('/subscribe', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { tierId } = req.body;
    
    if (!tierId) {
      return res.status(400).json({ message: 'Tier ID is required' });
    }
    
    // Get the selected tier
    const tier = await storage.getSubscriptionTier(tierId);
    if (!tier) {
      return res.status(404).json({ message: 'Subscription tier not found' });
    }
    
    // For demo purposes, we'll simulate payment success and directly activate the subscription
    console.log(`User ${userId} is subscribing to ${tier.name} (ID: ${tier.id})`);
    
    // Check if user already has an active subscription
    const existingSubscription = await storage.getUserSubscription(userId);
    
    // Set subscription end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    if (existingSubscription) {
      console.log(`Updating existing subscription (ID: ${existingSubscription.id})`);
      // Update existing subscription
      await storage.updateUserSubscription(existingSubscription.id, {
        tierId,
        checksRemaining: tier.checkerLimit,
        startDate: new Date(),
        endDate,
        isActive: true
      });
    } else {
      console.log(`Creating new subscription for user ${userId}`);
      // Create new subscription
      await storage.createUserSubscription({
        userId,
        tierId,
        checksRemaining: tier.checkerLimit,
        startDate: new Date(),
        endDate,
        isActive: true
      });
    }
    
    console.log(`Subscription activated successfully: ${tier.name} with ${tier.checkerLimit} checks`);
    
    // Demo: Return success response immediately without payment processing
    res.json({ 
      success: true, 
      message: `Successfully subscribed to ${tier.name}`,
      subscription: {
        tier: tier.name,
        monthlyPrice: `£${tier.monthlyPriceGBP}`,
        checksRemaining: tier.checkerLimit,
        expiresAt: endDate
      }
    });
  } catch (error) {
    console.error('Error subscribing to tier:', error);
    res.status(500).json({ message: 'Failed to process subscription' });
  }
});

// Create or update default tiers (admin only)
router.post('/default-tiers', async (req: Request, res: Response) => {
  try {
    // Only allow this in development for now
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Forbidden in production environment' });
    }
    
    // Basic tier
    const basicTier = {
      name: 'Basic Tier',
      description: 'Perfect for casual users who need occasional fact checks',
      monthlyPriceGBP: '7.99',
      checkerLimit: 15,
      modelCount: 2,
      features: JSON.parse(JSON.stringify([
        'Basic verification using 2 AI models (Perplexity + Llama)',
        'Limited historical context',
        'Basic source list',
        'Save up to 10 fact checks'
      ]))
    };
    
    // Standard tier
    const standardTier = {
      name: 'Standard Tier',
      description: 'For regular users who need more comprehensive fact checking',
      monthlyPriceGBP: '15.99',
      checkerLimit: 30,
      modelCount: 4,
      features: JSON.parse(JSON.stringify([
        'Enhanced verification using 4 AI models',
        'Detailed historical context',
        'Comprehensive source verification',
        'Save unlimited fact checks',
        'Domain detection',
        'Confidence scoring'
      ]))
    };
    
    // Premium tier
    const premiumTier = {
      name: 'Premium Tier',
      description: 'Our most comprehensive fact checking service',
      monthlyPriceGBP: '29.99',
      checkerLimit: 75,
      modelCount: 6,
      features: JSON.parse(JSON.stringify([
        'Complete verification using all 6 AI models',
        'In-depth historical analysis', 
        'Premium source credibility assessment',
        'Save unlimited fact checks',
        'Breakdown of AI model contributions',
        'Downloadable reports',
        'Priority processing'
      ]))
    };
    
    // Check if tiers already exist
    const existingTiers = await storage.getSubscriptionTiers();
    
    if (existingTiers.length === 0) {
      // Create tiers if none exist
      await storage.createSubscriptionTier(basicTier);
      await storage.createSubscriptionTier(standardTier);
      await storage.createSubscriptionTier(premiumTier);
      
      res.json({ message: 'Default subscription tiers created' });
    } else {
      res.json({ message: 'Subscription tiers already exist' });
    }
  } catch (error) {
    console.error('Error creating default tiers:', error);
    res.status(500).json({ message: 'Failed to create default tiers' });
  }
});

export default router;