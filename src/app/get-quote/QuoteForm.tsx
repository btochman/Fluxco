"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const inputClass =
  "w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

export default function QuoteForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    productInterest: "",
    quantity: "",
    timeline: "",
    projectDetails: "",
    interestedInLeasing: false,
    website: "", // Honeypot
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Honeypot check
    if (formData.website) {
      toast({
        title: "Quote Request Submitted",
        description:
          "Thank you! Our team will review your requirements and respond within 24 hours.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectDetails: `[RFQ FROM /get-quote]\nQuantity: ${formData.quantity || "Not specified"}\nTimeline: ${formData.timeline || "Not specified"}${formData.interestedInLeasing ? "\n** INTERESTED IN LEASING **" : ""}\n\n${formData.projectDetails}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit quote request");
      }

      toast({
        title: "Quote Request Submitted",
        description:
          "Thank you! Our team will review your requirements and respond within 24 hours.",
      });

      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        productInterest: "",
        quantity: "",
        timeline: "",
        projectDetails: "",
        interestedInLeasing: false,
        website: "",
      });
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit. Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 lg:p-10">
      <h3 className="font-display text-2xl text-foreground mb-2">
        Tell Us What You Need
      </h3>
      <p className="text-muted-foreground text-sm mb-6">
        Fill out the details below and we&apos;ll match you with the best
        options from our network. Response within 24 hours.
      </p>

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
              className={inputClass}
              placeholder="John Smith"
              required
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
              className={inputClass}
              placeholder="Acme Energy Co."
              required
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
              className={inputClass}
              placeholder="john@company.com"
              required
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
              className={inputClass}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Transformer Type *
          </label>
          <select
            name="productInterest"
            value={formData.productInterest}
            onChange={handleInputChange}
            className={inputClass}
            required
          >
            <option value="">Select transformer type</option>
            <option value="padmount">Padmount Transformer</option>
            <option value="substation">Substation / Power Transformer</option>
            <option value="distribution">Distribution Transformer</option>
            <option value="dry-type">Dry-Type Transformer</option>
            <option value="mobile">Mobile Substation</option>
            <option value="specialty">Specialty / Other</option>
            <option value="not-sure">Not Sure — Need Guidance</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Quantity
            </label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="e.g., 3 units"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Timeline
            </label>
            <select
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              className={inputClass}
            >
              <option value="">When do you need it?</option>
              <option value="asap">ASAP / Emergency</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6-12-months">6-12 months</option>
              <option value="12-plus-months">12+ months (planning ahead)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Project Details
          </label>
          <textarea
            name="projectDetails"
            value={formData.projectDetails}
            onChange={handleInputChange}
            className={`${inputClass} resize-none`}
            rows={4}
            placeholder="Voltage, kVA/MVA rating, application (data center, solar farm, utility, etc.), any special requirements (FEOC compliance, domestic content, etc.)..."
          />
        </div>

        {/* Leasing Interest */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.interestedInLeasing}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                interestedInLeasing: e.target.checked,
              }))
            }
            className="mt-1 h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            I&apos;m interested in learning about FluxCo leasing options
          </span>
        </label>

        {/* Honeypot */}
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

        <Button
          variant="hero"
          size="xl"
          className="w-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit RFQ"}
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-muted-foreground text-xs text-center">
          We respond to all quote requests within 24 hours. No spam, ever.
        </p>
      </form>
    </div>
  );
}
