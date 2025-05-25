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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
        
        <div className="not-prose bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 my-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Support</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">lewiseydman@gmail.com</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Response Time:</strong> Within 24 hours</p>
                <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Best For:</strong> Account issues, technical questions, billing inquiries</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Support Hours</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monday - Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Emergency Support:</strong> Critical issues are addressed outside business hours</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3>Send Us a Message</h3>
        
        <div className="not-prose my-8">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Contact Form</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-gray-100">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-gray-100">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="What's this about?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your question or feedback..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <h2>Frequently Asked Questions</h2>
        
        <div className="not-prose">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="subscription">
              <AccordionTrigger className="text-left text-gray-900 dark:text-gray-100">Account and Subscription</AccordionTrigger>
              <AccordionContent className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">How do I upgrade my subscription?</h4>
                  <p>You can upgrade your subscription anytime through your account settings. Visit the Subscription page to see all available tiers and select the one that best fits your needs.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Can I cancel my subscription?</h4>
                  <p>Yes, you can cancel your subscription at any time. Your current benefits will remain active until the end of your billing period.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Do you offer refunds?</h4>
                  <p>Refund policies vary by subscription plan and are outlined in our Terms of Service. Contact us for specific refund requests.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fact-checking">
              <AccordionTrigger className="text-left text-gray-900 dark:text-gray-100">Fact-Checking Service</AccordionTrigger>
              <AccordionContent className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">How accurate is the fact-checking?</h4>
                  <p>Our multi-AI verification system provides high accuracy by combining results from multiple leading AI models. However, results should be used as informed guidance alongside your own research and critical thinking.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Which AI models do you use?</h4>
                  <p>We utilize six leading AI services: Claude (Anthropic), OpenAI, Perplexity, Google Gemini, Mistral, and Meta Llama. Higher subscription tiers access more models for comprehensive verification.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Can I fact-check questions or only statements?</h4>
                  <p>You can submit both questions and statements. Our system automatically converts questions into verifiable statements for analysis while maintaining the original context.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy">
              <AccordionTrigger className="text-left text-gray-900 dark:text-gray-100">Privacy and Security</AccordionTrigger>
              <AccordionContent className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Is my data secure?</h4>
                  <p>Absolutely. We use industry-standard encryption, secure data transmission, and never share your personal information with third parties for marketing purposes.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Do you store my voice recordings?</h4>
                  <p>No. Voice input is processed locally in your browser and converted to text. We do not store or transmit voice recordings.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Can I delete my account and data?</h4>
                  <p>Yes, you can request account deletion at any time. This will permanently remove all your data, including fact-check history and account information.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="technical">
              <AccordionTrigger className="text-left text-gray-900 dark:text-gray-100">Technical Support</AccordionTrigger>
              <AccordionContent className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Why isn't voice input working?</h4>
                  <p>Voice input requires microphone permissions in your browser. Make sure you've granted microphone access and are using a supported browser (Chrome, Firefox, Safari, Edge).</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">The fact-check is taking too long</h4>
                  <p>Fact-checking typically takes 10-30 seconds depending on statement complexity and subscription tier. If it takes longer, try refreshing the page or contact support.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">I can't see my saved fact-checks</h4>
                  <p>Make sure you're logged in to your account. Saved fact-checks are tied to your user account and won't appear when browsing anonymously.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="business">
              <AccordionTrigger className="text-left text-gray-900 dark:text-gray-100">Business and Partnership Inquiries</AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300">
                <p>For business partnerships, API access, or enterprise solutions, please contact us directly via email with "Business Inquiry" in the subject line. Include details about your organization and intended use case.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <h2>Feedback and Suggestions</h2>
        
        <p>We value your feedback! If you have suggestions for improving our service, found an issue with our fact-checking results, or have ideas for new features, please reach out. Your input helps us make the platform better for everyone.</p>
      </div>
    </div>
  );
};

export default Contact;