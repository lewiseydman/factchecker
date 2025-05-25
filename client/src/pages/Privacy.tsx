import { TabNavigation } from "./SavedFacts";

const Privacy = () => {
  return (
    <div className="fade-in">
      <TabNavigation activeTab="privacy" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Privacy Policy</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="prose prose-blue dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
        <h2>Information We Collect</h2>
        
        <h3>Account Information</h3>
        <p>When you log in through Replit, we collect your email address, name, and profile information to create and manage your account.</p>
        
        <h3>Fact Check Data</h3>
        <p>We store the statements you submit for fact-checking, along with verification results, sources, and historical context to provide our service and improve accuracy.</p>
        
        <h3>Usage Analytics</h3>
        <p>We collect information about how you use our service, including fact check frequency, subscription tier usage, and feature interactions to improve our platform.</p>
        
        <h3>Voice Input Data</h3>
        <p>When you use voice input, audio is processed locally in your browser and converted to text. We do not store or transmit your voice recordings.</p>
        
        <h2>How We Use Your Information</h2>
        
        <h3>Service Provision</h3>
        <p>We use your information to provide fact-checking services, maintain your account, and deliver verification results with supporting evidence and sources.</p>
        
        <h3>Platform Improvement</h3>
        <p>Usage data helps us enhance our AI models, improve accuracy, and develop new features that better serve our users' needs.</p>
        
        <h3>Communication</h3>
        <p>We may use your contact information to send important service updates, security notifications, and subscription-related communications.</p>
        
        <h2>Data Sharing and Disclosure</h2>
        
        <h3>Third-Party AI Services</h3>
        <p>Your statements are processed by external AI services (Claude, OpenAI, Perplexity, Gemini, Mistral, Llama) for fact verification. These services process data according to their respective privacy policies.</p>
        
        <h3>Legal Requirements</h3>
        <p>We may disclose information when required by law, legal process, or to protect the rights, property, or safety of our users or others.</p>
        
        <h3>No Sale of Personal Data</h3>
        <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
        
        <h2>Data Security</h2>
        
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h2>Data Retention</h2>
        
        <p>We retain your information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data at any time.</p>
        
        <h2>Your Rights</h2>
        
        <ul>
          <li>Access and review your personal information</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and data</li>
          <li>Export your fact-checking history</li>
          <li>Opt out of non-essential communications</li>
        </ul>
        
        <h2>Cookies and Tracking</h2>
        
        <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.</p>
        
        <h2>Contact Us</h2>
        
        <p>If you have questions about this Privacy Policy or our data practices, please contact us through the Contact page or at the email address provided in your account settings.</p>
      </div>
    </div>
  );
};

export default Privacy;