import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TabNavigation } from "./SavedFacts";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="fade-in">
        <TabNavigation activeTab="contact" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Message Sent!</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Your message has been delivered successfully.
          </p>
        </div>
        
        <div className="prose prose-blue dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Thank You!</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            We've received your message and will get back to you within 24 hours. We appreciate you taking the time to reach out.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <TabNavigation activeTab="contact" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Contact Us</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Have questions about our fact-checking service? Need help with your account? We'd love to hear from you.
        </p>
      </div>
      
      <div className="prose prose-blue dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
        <h2>Get in Touch</h2>
        
        <p>We're here to help with any questions about our AI-powered fact-checking service, subscription plans, or technical support.</p>

        <h3>Contact Methods</h3>
        
        <h4>Email Support</h4>
        <p><strong>Email:</strong> lewiseydman@gmail.com</p>
        <p><strong>Response Time:</strong> Within 24 hours</p>
        <p><strong>Best For:</strong> Account issues, technical questions, billing inquiries</p>
        
        <h4>Support Hours</h4>
        <p><strong>Availability:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
        <p><strong>Emergency Support:</strong> Critical issues are addressed outside business hours</p>
        
        <h2>Frequently Asked Questions</h2>
        
        <h3>Account and Subscription</h3>
        
        <h4>How do I upgrade my subscription?</h4>
        <p>You can upgrade your subscription anytime through your account settings. Visit the Subscription page to see all available tiers and select the one that best fits your needs.</p>
        
        <h4>Can I cancel my subscription?</h4>
        <p>Yes, you can cancel your subscription at any time. Your current benefits will remain active until the end of your billing period.</p>
        
        <h4>Do you offer refunds?</h4>
        <p>Refund policies vary by subscription plan and are outlined in our Terms of Service. Contact us for specific refund requests.</p>
        
        <h3>Fact-Checking Service</h3>
        
        <h4>How accurate is the fact-checking?</h4>
        <p>Our multi-AI verification system provides high accuracy by combining results from multiple leading AI models. However, results should be used as informed guidance alongside your own research and critical thinking.</p>
        
        <h4>Which AI models do you use?</h4>
        <p>We utilize six leading AI services: Claude (Anthropic), OpenAI, Perplexity, Google Gemini, Mistral, and Meta Llama. Higher subscription tiers access more models for comprehensive verification.</p>
        
        <h4>Can I fact-check questions or only statements?</h4>
        <p>You can submit both questions and statements. Our system automatically converts questions into verifiable statements for analysis while maintaining the original context.</p>
        
        <h3>Privacy and Security</h3>
        
        <h4>Is my data secure?</h4>
        <p>Absolutely. We use industry-standard encryption, secure data transmission, and never share your personal information with third parties for marketing purposes.</p>
        
        <h4>Do you store my voice recordings?</h4>
        <p>No. Voice input is processed locally in your browser and converted to text. We do not store or transmit voice recordings.</p>
        
        <h4>Can I delete my account and data?</h4>
        <p>Yes, you can request account deletion at any time. This will permanently remove all your data, including fact-check history and account information.</p>
        
        <h2>Technical Support</h2>
        
        <h3>Common Issues</h3>
        
        <h4>Why isn't voice input working?</h4>
        <p>Voice input requires microphone permissions in your browser. Make sure you've granted microphone access and are using a supported browser (Chrome, Firefox, Safari, Edge).</p>
        
        <h4>The fact-check is taking too long</h4>
        <p>Fact-checking typically takes 10-30 seconds depending on statement complexity and subscription tier. If it takes longer, try refreshing the page or contact support.</p>
        
        <h4>I can't see my saved fact-checks</h4>
        <p>Make sure you're logged in to your account. Saved fact-checks are tied to your user account and won't appear when browsing anonymously.</p>
        
        <h2>Business and Partnership Inquiries</h2>
        
        <p>For business partnerships, API access, or enterprise solutions, please contact us directly via email with "Business Inquiry" in the subject line. Include details about your organization and intended use case.</p>
        
        <h2>Feedback and Suggestions</h2>
        
        <p>We value your feedback! If you have suggestions for improving our service, found an issue with our fact-checking results, or have ideas for new features, please reach out. Your input helps us make the platform better for everyone.</p>
      </div>
    </div>
  );
};

export default Contact;