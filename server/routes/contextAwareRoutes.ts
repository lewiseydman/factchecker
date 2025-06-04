import { Router, type Request, type Response } from 'express';
import { contextAwareFactCheckService } from '../services/contextAwareFactCheckService';
import { misinformationTrackingService } from '../services/misinformationTrackingService';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Context-aware fact-checking routes

/**
 * Analyze statement with context
 */
router.post('/analyze-context', async (req: Request, res: Response) => {
  try {
    const { 
      statement, 
      speakerName, 
      sourceName, 
      contextData 
    } = req.body;

    if (!statement) {
      return res.status(400).json({ error: 'Statement is required' });
    }

    const analysis = await contextAwareFactCheckService.analyzeStatementWithContext(
      statement,
      speakerName,
      sourceName,
      contextData
    );

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing context:', error);
    res.status(500).json({ 
      error: 'Failed to analyze statement context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get credibility report for a public figure
 */
router.get('/credibility-report/:speakerName', async (req: Request, res: Response) => {
  try {
    const { speakerName } = req.params;
    
    if (!speakerName) {
      return res.status(400).json({ error: 'Speaker name is required' });
    }

    const report = await contextAwareFactCheckService.getCredibilityReport(
      decodeURIComponent(speakerName)
    );

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error getting credibility report:', error);
    res.status(500).json({ 
      error: 'Failed to get credibility report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Misinformation tracking routes

/**
 * Get active misinformation alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const alerts = await misinformationTrackingService.getActiveAlerts(limit);

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ 
      error: 'Failed to get misinformation alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get trending viral claims
 */
router.get('/trending-claims', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 15;
    
    const trending = await misinformationTrackingService.getTrendingClaims(limit);

    res.json({
      success: true,
      trending
    });
  } catch (error) {
    console.error('Error getting trending claims:', error);
    res.status(500).json({ 
      error: 'Failed to get trending claims',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Track a new claim for misinformation monitoring
 */
router.post('/track-claim', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { 
      claimText, 
      platformData, 
      urgencyLevel 
    } = req.body;

    if (!claimText) {
      return res.status(400).json({ error: 'Claim text is required' });
    }

    const trackedClaim = await misinformationTrackingService.trackClaim(
      claimText,
      platformData,
      urgencyLevel
    );

    res.json({
      success: true,
      trackedClaim
    });
  } catch (error) {
    console.error('Error tracking claim:', error);
    res.status(500).json({ 
      error: 'Failed to track claim',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create a misinformation alert
 */
router.post('/create-alert', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { 
      statementHash, 
      description, 
      alertLevel, 
      platformsDetected 
    } = req.body;

    if (!statementHash || !description) {
      return res.status(400).json({ 
        error: 'Statement hash and description are required' 
      });
    }

    const alert = await misinformationTrackingService.createAlert(
      statementHash,
      description,
      alertLevel,
      platformsDetected
    );

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ 
      error: 'Failed to create alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get comprehensive misinformation report
 */
router.get('/misinformation-report', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const report = await misinformationTrackingService.generateMisinformationReport(days);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating misinformation report:', error);
    res.status(500).json({ 
      error: 'Failed to generate misinformation report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Link a fact check to a misinformation alert
 */
router.post('/link-fact-check/:alertId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { factCheckId } = req.body;

    if (!alertId || !factCheckId) {
      return res.status(400).json({ 
        error: 'Alert ID and fact check ID are required' 
      });
    }

    await misinformationTrackingService.linkFactCheckToAlert(
      parseInt(factCheckId),
      parseInt(alertId)
    );

    res.json({
      success: true,
      message: 'Fact check linked to alert successfully'
    });
  } catch (error) {
    console.error('Error linking fact check to alert:', error);
    res.status(500).json({ 
      error: 'Failed to link fact check to alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;