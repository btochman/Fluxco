"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    productInterest: "",
    projectDetails: "",
    website: "", // Honeypot field - should remain empty
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.company || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Honeypot check - if filled, silently "succeed" without doing anything
    if (formData.website) {
      toast({
        title: "Message Sent",
        description: "Thank you! We'll get back to you within 24 hours.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email notification
      await supabase.functions.invoke("send-contact-email", {
        body: {
          to: "brian@fluxco.com",
          ...formData,
        },
      });

      toast({
        title: "Message Sent",
        description: "Thank you! We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        productInterest: "",
        projectDetails: "",
        website: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-background to-background" />
      <div className="absolute inset-0 circuit-pattern opacity-5" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Content */}
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              LET'S TALK
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Tell us what you need and we'll find the perfect solution from our global network. 24-hour response guaranteed.
            </p>
          </div>

          {/* Right Content - Form */}
          <div className="bg-card border border-border rounded-2xl p-8 lg:p-10">
            <h3 className="font-display text-2xl text-foreground mb-6">
              GET IN TOUCH
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Acme Energy Co."
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Product Interest
                </label>
                <select
                  name="productInterest"
                  value={formData.productInterest}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select a product category</option>
                  <option value="distribution">Distribution Transformers</option>
                  <option value="power">Power Transformers</option>
                  <option value="specialty">Specialty Transformers</option>
                  <option value="custom">Custom Solution</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  name="projectDetails"
                  value={formData.projectDetails}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={4}
                  placeholder="Tell us about your project requirements..."
                />
              </div>
              {/* Honeypot field - hidden from users, catches bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <Button variant="hero" size="xl" className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
