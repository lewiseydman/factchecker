import { TabNavigation } from "./SavedFacts";

const Terms = () => {
  return (
    <div className="fade-in">
      <TabNavigation activeTab="terms" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using our AI-powered fact-checking service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Service Description</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our platform provides AI-powered fact-checking services that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Analyze statements and questions for factual accuracy</li>
                <li>Use multiple AI models (Claude, OpenAI, Perplexity, Gemini, Mistral, Llama) for verification</li>
                <li>Provide detailed explanations, historical context, and credible sources</li>
                <li>Offer subscription tiers with varying numbers of checks and AI models</li>
                <li>Support voice input for accessibility and convenience</li>
                <li>Allow users to save and organize their fact-checking history</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Responsibilities</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium mb-2">Acceptable Use</h3>
              <p>You agree to use our service responsibly and legally. You may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Submit content that is illegal, harmful, threatening, or violates others' rights</li>
                <li>Attempt to overwhelm our systems with excessive requests</li>
                <li>Use the service to spread misinformation or manipulate others</li>
                <li>Reverse engineer or attempt to access our AI models directly</li>
                <li>Share your account credentials with others</li>
                <li>Use automated tools to submit fact-checking requests</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Fact-Checking Limitations</h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-medium text-gray-800">Important Disclaimer:</p>
              <p>Our AI-powered fact-checking service is a tool to assist in information verification but has limitations:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>AI models may have knowledge cutoff dates and may not include the most recent information</li>
                <li>Results should be considered as guidance, not absolute truth</li>
                <li>Complex or nuanced topics may require human expert review</li>
                <li>Different AI models may provide varying perspectives on the same topic</li>
                <li>Users should verify important information through additional credible sources</li>
                <li>We aggregate multiple AI responses but cannot guarantee 100% accuracy</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Terms</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium mb-2">Subscription Tiers</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Free Tier:</strong> Limited fact checks per month using 2 AI models</li>
                <li><strong>Basic Tier:</strong> Additional checks with enhanced features</li>
                <li><strong>Standard Tier:</strong> Increased limits using 4 AI models with advanced analysis</li>
                <li><strong>Premium Tier:</strong> Maximum checks using all 6 AI models with comprehensive reports</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2 mt-6">Billing and Cancellation</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subscriptions are billed monthly in advance</li>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No refunds for partial months unless required by law</li>
                <li>We reserve the right to modify pricing with 30 days notice</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium mb-2">Your Content</h3>
              <p>You retain ownership of the statements and questions you submit. By using our service, you grant us a license to process your content through our AI models for fact-checking purposes.</p>
              
              <h3 className="text-lg font-medium mb-2 mt-4">Our Service</h3>
              <p>Our platform, including its design, functionality, and aggregated results, is protected by intellectual property laws. You may not copy, modify, or distribute our service without permission.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Privacy and Data</h2>
            <p className="text-gray-700">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using our service, you consent to the data practices described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Service Availability</h2>
            <div className="space-y-4 text-gray-700">
              <p>We strive to provide reliable service but cannot guarantee:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Uninterrupted access to our platform</li>
                <li>Immediate responses during high traffic periods</li>
                <li>Availability of all AI models at all times</li>
                <li>Immunity from technical issues or maintenance downtime</li>
              </ul>
              <p>We will make reasonable efforts to notify users of planned maintenance.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We provide our service "as is" without warranties of any kind</li>
                <li>We are not liable for decisions made based on our fact-checking results</li>
                <li>Our liability is limited to the amount you paid for the service</li>
                <li>We are not responsible for third-party AI model inaccuracies</li>
                <li>Users are responsible for verifying important information independently</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate these Terms of Service</li>
                <li>Use the service for harmful or illegal purposes</li>
                <li>Fail to pay subscription fees</li>
                <li>Engage in abusive behavior toward other users or our team</li>
              </ul>
              <p>You may delete your account at any time through your account settings.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by and construed in accordance with applicable laws. Any disputes will be resolved through binding arbitration or in courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Material changes will be communicated through email or platform notifications. Continued use of our service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service or to report violations, please contact us through your account settings or the support channels provided in our application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;