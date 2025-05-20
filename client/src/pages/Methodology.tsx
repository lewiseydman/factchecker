import { TabNavigation } from "./SavedFacts";

const Methodology = () => {
  return (
    <div className="fade-in">
      <TabNavigation activeTab="methodology" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Methodology</h1>
        <p className="text-gray-600">
          A detailed explanation of how our fact-checking platform works
        </p>
      </div>
      
      <div className="prose prose-blue max-w-none">
        <h2>Multi-AI Verification System: How It Works</h2>
        
        <p>
          Our fact-checking platform uses an advanced system that combines the strengths of multiple
          artificial intelligence (AI) services to provide comprehensive, accurate verification of statements.
          Here's how it works in simple terms:
        </p>
        
        <h3>The Problem with Single-AI Fact Checking</h3>
        
        <p>
          Most fact-checking systems rely on a single AI model, which has several limitations:
        </p>
        
        <ul>
          <li>Each AI model has its own biases and blind spots</li>
          <li>Models have different strengths in various domains of knowledge</li>
          <li>Single sources can miss important context or alternative perspectives</li>
          <li>Relying on one source creates a single point of failure</li>
        </ul>
        
        <h3>Our Solution: Multi-Model Verification</h3>
        
        <p>
          We use six different AI models from leading providers to analyze each statement:
        </p>
        
        <ol>
          <li><strong>Claude</strong> (Anthropic) - Specialized in reasoning and thoughtful analysis</li>
          <li><strong>GPT</strong> (OpenAI) - Excellent general knowledge and contextual understanding</li>
          <li><strong>Perplexity</strong> - Strong real-time search capabilities for current events</li>
          <li><strong>Gemini</strong> (Google) - Particularly strong in scientific and technical domains</li>
          <li><strong>Mistral</strong> - Powerful mathematical and analytical reasoning</li>
          <li><strong>Llama</strong> (Meta) - Well-rounded with strong general capabilities</li>
        </ol>
        
        <h3>The Four-Step Verification Process</h3>
        
        <h4>Step 1: Statement Analysis and Domain Detection</h4>
        
        <p>
          When you submit a statement, our system first determines what domains of knowledge are involved.
          For example, a statement could involve history, science, current events, politics, or multiple domains.
        </p>
        
        <p>
          If you submit a question rather than a statement, our system automatically converts it to a verifiable statement.
          For example, "Is the Earth flat?" becomes "The Earth is flat" for verification purposes.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg my-6">
          <h5 className="font-semibold text-blue-800">Domain Detection Example</h5>
          <p className="text-sm text-blue-700 mt-2">
            Statement: "COVID-19 vaccines contain microchips to track people"<br />
            Detected domains: Medical, Scientific, Current Events
          </p>
        </div>
        
        <h4>Step 2: AI Model Weighting</h4>
        
        <p>
          Based on the detected domains, our system assigns appropriate weights to each AI model according to their strengths.
          For example, for medical questions, Claude and Gemini might receive higher weights, while for current events, 
          Perplexity might receive more weight.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg my-6">
          <h5 className="font-semibold text-blue-800">Model Weighting Example</h5>
          <p className="text-sm text-blue-700 mt-2">
            For a historical statement about World War II:<br />
            Claude: 25%, GPT: 20%, Perplexity: 15%, Gemini: 15%, Mistral: 10%, Llama: 15%
          </p>
        </div>
        
        <h4>Step 3: Multi-Layer Aggregation</h4>
        
        <p>
          The weighted responses from all AI services are processed through two specialized aggregation layers:
        </p>
        
        <ol>
          <li>
            <strong>InFact Layer</strong> - This first layer consolidates factual information from all services,
            identifies consensus, combines explanations, and selects the most detailed historical context.
          </li>
          <li>
            <strong>DEFAME Layer</strong> - The second layer (Digital Evidence Forensics and Media Evaluation)
            analyzes for potential misinformation patterns, manipulative language, reliability of sources, and
            inconsistencies across AI responses.
          </li>
        </ol>
        
        <div className="bg-blue-50 p-4 rounded-lg my-6">
          <h5 className="font-semibold text-blue-800">Aggregation Example</h5>
          <p className="text-sm text-blue-700 mt-2">
            If 5 out of 6 AI services determine a statement is false with high confidence, but one service is unsure, 
            the system will likely conclude the statement is false while noting the inconsistency.
          </p>
        </div>
        
        <h4>Step 4: Comprehensive Result Generation</h4>
        
        <p>
          The final result includes:
        </p>
        
        <ul>
          <li>A clear TRUE/FALSE verdict with confidence level</li>
          <li>A detailed explanation combining insights from all models</li>
          <li>Historical context to understand the statement's background</li>
          <li>Credible sources for verification</li>
          <li>Transparency about which AI models contributed most to the verdict</li>
          <li>Visual breakdown of each model's influence on the final result</li>
        </ul>
        
        <h3>Why This Approach Is Better</h3>
        
        <p>
          Our multi-model approach offers several advantages over traditional fact-checking:
        </p>
        
        <ul>
          <li><strong>Reduced Bias</strong> - By combining multiple AI systems, individual biases are minimized</li>
          <li><strong>Domain Expertise</strong> - Different models excel in different areas, providing better coverage</li>
          <li><strong>Transparency</strong> - You can see which AI systems influenced the verdict and by how much</li>
          <li><strong>Comprehensiveness</strong> - Multiple sources provide richer context and explanation</li>
          <li><strong>Misinformation Detection</strong> - Specialized analysis specifically targeting manipulative content</li>
          <li><strong>Higher Confidence</strong> - Consensus across multiple systems increases reliability</li>
        </ul>
        
        <h3>Technical Implementation</h3>
        
        <p>
          Behind the scenes, our platform uses:
        </p>
        
        <ul>
          <li>A React-based frontend for user interactions and result visualization</li>
          <li>A Node.js backend that orchestrates the multi-model verification process</li>
          <li>Secure API integrations with all six AI services</li>
          <li>A PostgreSQL database to store fact-check history and user preferences</li>
          <li>Domain-specific algorithms to detect subject areas and weight model contributions</li>
          <li>Two-layer aggregation system for combining results from all AI services</li>
        </ul>
        
        <h3>Privacy and Data Security</h3>
        
        <p>
          We prioritize user privacy and data security:
        </p>
        
        <ul>
          <li>All API keys are stored securely on the server side, never exposed to the client</li>
          <li>User data is protected with industry-standard encryption</li>
          <li>Fact checks are associated with user accounts but not shared without permission</li>
          <li>Only anonymized trending data is shared across users</li>
        </ul>
        
        <h3>Continuous Improvement</h3>
        
        <p>
          Our system continually improves through:
        </p>
        
        <ul>
          <li>Regular updates to domain-detection algorithms</li>
          <li>Refinement of model weighting based on performance</li>
          <li>Integration of new AI models as they become available</li>
          <li>Analysis of fact-checking patterns to improve accuracy</li>
        </ul>
        
        <h3>Limitations and Transparency</h3>
        
        <p>
          Like all fact-checking systems, ours has limitations:
        </p>
        
        <ul>
          <li>AI models have knowledge cutoff dates and may not have the very latest information</li>
          <li>Some topics may be too nuanced or complex for definitive TRUE/FALSE verdicts</li>
          <li>The system depends on the quality of its underlying AI models</li>
          <li>Statements requiring deep domain expertise may need human expert verification</li>
        </ul>
        
        <p>
          We maintain transparency about these limitations and continuously work to improve our system.
        </p>
        
        <h3>Conclusion</h3>
        
        <p>
          Our multi-AI fact-checking platform represents a significant advancement in automated verification technology.
          By combining the strengths of multiple AI systems, applying domain-specific weighting, and using a two-layer
          aggregation system, we provide more accurate, comprehensive, and trustworthy fact-checking than any single
          AI service could achieve.
        </p>
        
        <p>
          This approach empowers users to quickly verify information, combat misinformation, and make more informed
          decisions in an increasingly complex information landscape.
        </p>
      </div>
    </div>
  );
};

export default Methodology;