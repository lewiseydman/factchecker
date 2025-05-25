import { TabNavigation } from "./SavedFacts";

const Terms = () => {
  return (
    <div className="fade-in">
      <TabNavigation activeTab="terms" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Terms of Service</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="prose prose-blue dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
        <h2>Acceptance of Terms</h2>
        
        <p>By accessing and using our AI-powered fact-checking service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        
        <h2>Service Description</h2>
        
        <p>Our platform provides AI-powered fact-checking services that:</p>
        
        <ul>
          <li>Analyze statements and questions for factual accuracy</li>
          <li>Use multiple AI models (Claude, OpenAI, Perplexity, Gemini, Mistral, Llama) for verification</li>
          <li>Provide detailed explanations, historical context, and credible sources</li>
          <li>Offer subscription tiers with varying numbers of checks and AI models</li>
          <li>Support both text and voice input for accessibility</li>
        </ul>
        
        <h2>User Responsibilities</h2>
        
        <h3>Account Security</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        
        <h3>Appropriate Use</h3>
        <p>You agree to use our service only for legitimate fact-checking purposes and not to:</p>
        
        <ul>
          <li>Submit false, misleading, or malicious content</li>
          <li>Attempt to overwhelm or abuse our AI verification systems</li>
          <li>Use the service for any illegal or harmful purposes</li>
          <li>Share or redistribute our verification results without proper attribution</li>
        </ul>
        
        <h2>Service Limitations</h2>
        
        <h3>AI Model Accuracy</h3>
        <p>While we use advanced AI models and verification techniques, our fact-checking results should be considered as informed analysis rather than absolute truth. We encourage users to verify important information through additional sources.</p>
        
        <h3>Service Availability</h3>
        <p>We strive to maintain high service availability but cannot guarantee uninterrupted access. Maintenance, updates, or technical issues may temporarily affect service access.</p>
        
        <h2>Subscription and Billing</h2>
        
        <h3>Subscription Tiers</h3>
        <p>We offer multiple subscription levels with different fact-checking quotas and AI model access. Subscription details and pricing are available on our subscription page.</p>
        
        <h3>Payment Terms</h3>
        <p>Subscriptions are billed according to the selected plan. All payments are processed securely through our payment partners.</p>
        
        <h3>Refunds</h3>
        <p>Refund policies are outlined in your subscription agreement and may vary by plan and jurisdiction.</p>
        
        <h2>Intellectual Property</h2>
        
        <p>The platform, including its design, functionality, and content, is owned by us and protected by intellectual property laws. Users retain ownership of content they submit but grant us permission to process it for fact-checking purposes.</p>
        
        <h2>Privacy and Data Protection</h2>
        
        <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>
        
        <h2>Limitation of Liability</h2>
        
        <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.</p>
        
        <h2>Changes to Terms</h2>
        
        <p>We may update these terms from time to time. We will notify users of significant changes through our platform or via email. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        
        <h2>Contact Information</h2>
        
        <p>If you have questions about these Terms of Service, please contact us through our Contact page or the support channels provided in your account.</p>
      </div>
    </div>
  );
};

export default Terms;