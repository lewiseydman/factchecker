import { TabNavigation } from "./SavedFacts";

const Privacy = () => {
  return (
    <div className="fade-in">
      <TabNavigation activeTab="privacy" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Information We Collect</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Account Information</h3>
                <p>When you log in through Replit, we collect your email address, name, and profile information to create and manage your account.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Fact Check Data</h3>
                <p>We store the statements you submit for fact-checking, along with verification results, sources, and historical context to provide our service and improve accuracy.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Usage Analytics</h3>
                <p>We collect information about how you use our service, including fact check frequency, subscription tier usage, and feature interactions to improve our platform.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Voice Input Data</h3>
                <p>When you use voice input, audio is processed locally in your browser and converted to text. We do not store or transmit your voice recordings.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
            <ul className="space-y-2 text-gray-700 list-disc pl-6">
              <li>Provide fact-checking services using multiple AI models</li>
              <li>Maintain your account and subscription preferences</li>
              <li>Store your fact check history and saved results</li>
              <li>Process payments for subscription services</li>
              <li>Improve our AI model accuracy and service quality</li>
              <li>Send important service updates and notifications</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Model Processing</h2>
            <div className="space-y-4 text-gray-700">
              <p>Your fact-checking requests are processed by multiple AI services including Claude, OpenAI, Perplexity, Gemini, Mistral, and Llama. Each service may have its own data handling practices:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Statements are sent to AI services for analysis and verification</li>
                <li>We use domain detection to optimize which models process your requests</li>
                <li>AI responses are aggregated to provide comprehensive fact-checking results</li>
                <li>No personal information is sent to AI services, only the statements for verification</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Sharing</h2>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell or rent your personal information. We may share data in these limited circumstances:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With AI service providers to process fact-checking requests</li>
                <li>With payment processors for subscription billing</li>
                <li>When required by law or to protect our rights and users' safety</li>
                <li>In anonymized, aggregated form for research and service improvement</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
            <div className="space-y-4 text-gray-700">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encrypted data transmission using HTTPS</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited employee access on a need-to-know basis</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access: Request a copy of your personal data</li>
                <li>Correction: Update or correct inaccurate information</li>
                <li>Deletion: Request deletion of your account and associated data</li>
                <li>Portability: Export your fact check history</li>
                <li>Opt-out: Unsubscribe from non-essential communications</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Retention</h2>
            <div className="space-y-4 text-gray-700">
              <p>We retain your information for as long as necessary to provide our services:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account information: Until you delete your account</li>
                <li>Fact check history: As long as your account is active</li>
                <li>Subscription data: For billing and legal compliance purposes</li>
                <li>Usage analytics: Anonymized data may be retained for service improvement</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">International Users</h2>
            <p className="text-gray-700">
              Our services are hosted globally. By using our platform, you consent to the transfer and processing of your information in countries where our servers and AI service providers operate, which may have different data protection laws than your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us through your account settings or via the support channels provided in our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;