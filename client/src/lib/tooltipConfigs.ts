// Comprehensive tooltip configurations for the fact-checking application

interface TooltipConfig {
  title: string;
  content: string;
  type: 'info' | 'help' | 'warning' | 'explanation';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  maxWidth?: number;
}

export const tooltipConfigs: Record<string, TooltipConfig> = {
  // Confidence Score Explanations
  confidenceScore: {
    title: "Confidence Score",
    content: "This score represents how certain our AI models are about their verdict. Higher scores indicate stronger agreement across multiple verification sources.",
    type: "explanation",
    maxWidth: 280
  },

  // AI Model Explanations
  aiModelWeights: {
    title: "AI Model Contributions",
    content: "Different AI models have varying expertise in different domains. We weight their contributions based on their strengths in the topic being fact-checked.",
    type: "explanation",
    maxWidth: 300
  },

  // Fact-checking Process
  factCheckProcess: {
    title: "Multi-Source Verification",
    content: "We use multiple AI models and cross-reference their findings to provide you with the most accurate verdict possible. This process helps reduce bias and improve reliability.",
    type: "info",
    maxWidth: 320
  },

  // Domain Detection
  domainDetection: {
    title: "Topic Analysis",
    content: "We automatically detect the subject domain of your statement (medical, scientific, historical, etc.) to assign the most qualified AI models for verification.",
    type: "explanation",
    maxWidth: 300
  },

  // Subscription Tiers
  subscriptionTier: {
    title: "Verification Tier",
    content: "This badge shows which subscription tier was used for this fact-check. Higher tiers use more AI models for increased accuracy and reliability.",
    type: "info",
    maxWidth: 280
  },

  // Voice Input
  voiceInput: {
    title: "Voice Input",
    content: "Click to start voice recognition. Speak clearly and we'll convert your speech to text for fact-checking. Works best in quiet environments.",
    type: "help",
    maxWidth: 260
  },

  // Historical Context
  historicalContext: {
    title: "Historical Context",
    content: "Additional background information that helps understand the statement within its proper historical, cultural, or scientific context.",
    type: "explanation",
    maxWidth: 300
  },

  // Sources
  sourcesExplanation: {
    title: "Trusted Sources",
    content: "These are the primary sources our AI models referenced when fact-checking your statement. Click any source to visit the original material.",
    type: "info",
    maxWidth: 280
  },

  // Manipulation Risk
  manipulationRisk: {
    title: "Manipulation Risk",
    content: "This metric indicates how likely the statement is to be designed to mislead or manipulate opinion, based on language patterns and content analysis.",
    type: "warning",
    maxWidth: 300
  },

  // Contradiction Index
  contradictionIndex: {
    title: "Contradiction Level",
    content: "Measures how much the statement contradicts established facts or contains internal logical inconsistencies.",
    type: "explanation",
    maxWidth: 280
  },

  // Factual Consensus
  factualConsensus: {
    title: "Factual Consensus",
    content: "Shows the level of agreement between our AI models about the factual accuracy of the statement. Higher consensus indicates stronger reliability.",
    type: "explanation",
    maxWidth: 300
  },

  // Question Transformation
  questionTransformation: {
    title: "Question Processing",
    content: "We automatically convert questions into verifiable statements while preserving the original intent, allowing for more accurate fact-checking.",
    type: "explanation",
    maxWidth: 320
  },

  // Implicit Claims
  implicitClaims: {
    title: "Implicit Claims",
    content: "These are additional factual assertions that are implied or suggested by your original statement, which we also verify for completeness.",
    type: "explanation",
    maxWidth: 300
  },

  // API Key Status
  apiKeyStatus: {
    title: "API Key Status",
    content: "Shows which AI services are currently active. More active services provide more comprehensive fact-checking coverage.",
    type: "info",
    maxWidth: 280
  },

  // Subscription Features
  subscriptionFeatures: {
    title: "Premium Features",
    content: "Upgrade your subscription to access more AI models, unlimited checks, priority processing, and advanced analytics features.",
    type: "info",
    maxWidth: 300
  },

  // Fact Check Frequency
  checkFrequency: {
    title: "Check Frequency",
    content: "Shows how often this particular statement has been fact-checked by users. Popular statements may indicate trending topics or widespread misinformation.",
    type: "info",
    maxWidth: 320
  },

  // Data Privacy
  dataPrivacy: {
    title: "Privacy & Security",
    content: "Your fact-check history is securely stored and only visible to you. We don't share individual queries with third parties.",
    type: "info",
    maxWidth: 280
  },

  // Model Performance
  modelPerformance: {
    title: "Model Performance",
    content: "Each AI model's contribution is weighted based on its historical accuracy in this topic domain and cross-validated against other models.",
    type: "explanation",
    maxWidth: 320
  },

  // Real-time Processing
  realTimeProcessing: {
    title: "Real-time Analysis",
    content: "Your statement is being processed in real-time using the latest AI models and most current information available.",
    type: "info",
    maxWidth: 280
  },

  // Verification Methodology
  verificationMethodology: {
    title: "Our Methodology",
    content: "We use a two-layer verification system: InFact for factual consensus and DEFAME for misinformation detection, ensuring comprehensive analysis.",
    type: "explanation",
    maxWidth: 340
  },

  // Statement Length
  statementLength: {
    title: "Statement Optimization",
    content: "For best results, keep statements clear and specific. Very long or complex statements may be broken down into smaller components for analysis.",
    type: "help",
    maxWidth: 300
  },

  // Trending Analysis
  trendingAnalysis: {
    title: "Trending Facts",
    content: "These are the most frequently checked statements across all users, helping identify current topics of interest and potential misinformation trends.",
    type: "info",
    maxWidth: 320
  },

  // Save Feature
  saveFeature: {
    title: "Save Fact Checks",
    content: "Save important fact checks to your personal collection for easy reference. Saved items appear in your history and can be organized with tags.",
    type: "help",
    maxWidth: 300
  },

  // Export Data
  exportData: {
    title: "Export Your Data",
    content: "Download all your fact-check history, saved items, and account data in a portable format. This ensures you always have access to your information.",
    type: "info",
    maxWidth: 300
  },

  // Theme Toggle
  themeToggle: {
    title: "Dark/Light Mode",
    content: "Switch between light and dark themes for optimal viewing comfort. Your preference is automatically saved for future visits.",
    type: "help",
    maxWidth: 260
  }
};

// Helper function to get tooltip config with fallback
export const getTooltipConfig = (key: string): TooltipConfig => {
  return tooltipConfigs[key] || {
    title: "Information",
    content: "Additional context and explanation for this feature.",
    type: "info",
    maxWidth: 280
  };
};

// Function to get contextual tooltip based on element type and context
export const getContextualTooltip = (
  elementType: string, 
  context?: Record<string, any>
): TooltipConfig => {
  const baseConfig = getTooltipConfig(elementType);
  
  // Customize content based on context
  if (context) {
    switch (elementType) {
      case 'confidenceScore':
        if (context.score) {
          const score = context.score;
          let interpretation = '';
          if (score >= 0.8) interpretation = 'Very high confidence';
          else if (score >= 0.6) interpretation = 'High confidence';
          else if (score >= 0.4) interpretation = 'Moderate confidence';
          else interpretation = 'Low confidence';
          
          return {
            ...baseConfig,
            content: `${baseConfig.content} Current score: ${(score * 100).toFixed(0)}% (${interpretation})`
          };
        }
        break;
        
      case 'subscriptionTier':
        if (context.tierName && context.modelsUsed) {
          return {
            ...baseConfig,
            content: `This fact-check used ${context.tierName} with ${context.modelsUsed} AI models. ${baseConfig.content}`
          };
        }
        break;
        
      case 'modelPerformance':
        if (context.modelWeights) {
          const topModel = Object.entries(context.modelWeights)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0];
          if (topModel) {
            return {
              ...baseConfig,
              content: `Primary model: ${topModel[0]} (${((topModel[1] as number) * 100).toFixed(0)}% weight). ${baseConfig.content}`
            };
          }
        }
        break;
    }
  }
  
  return baseConfig;
};