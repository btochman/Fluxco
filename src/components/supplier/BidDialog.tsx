"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, DollarSign, Clock, Send, CheckCircle, MapPin, HelpCircle } from "lucide-react";
import { MarketplaceListing, Supplier } from "@/lib/supabase";

interface BidDialogProps {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

const formatVoltage = (voltage: number): string => {
  if (voltage >= 1000) {
    return `${(voltage / 1000).toFixed(voltage % 1000 === 0 ? 0 : 1)} kV`;
  }
  return `${voltage} V`;
};

export function BidDialog({ listing, open, onOpenChange, supplier }: BidDialogProps) {
  const [bidPrice, setBidPrice] = useState("");
  const [leadTimeWeeks, setLeadTimeWeeks] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<"bid" | "info" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !supplier) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/supplier/express-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          serialNumber: listing.serial_number,
          supplierId: supplier.id,
          supplierEmail: supplier.email,
          supplierCompany: supplier.company_name,
          contactName: supplier.contact_name,
          bidPrice: parseFloat(bidPrice.replace(/[^0-9.]/g, "")),
          leadTimeWeeks: parseInt(leadTimeWeeks, 10),
          notes: notes || null,
          type: "bid",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit bid");
      }

      setSubmitType("bid");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNeedMoreInfo = async () => {
    if (!listing || !supplier) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/supplier/express-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          serialNumber: listing.serial_number,
          supplierId: supplier.id,
          supplierEmail: supplier.email,
          supplierCompany: supplier.company_name,
          contactName: supplier.contact_name,
          type: "info_request",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send request");
      }

      setSubmitType("info");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setBidPrice("");
      setLeadTimeWeeks("");
      setNotes("");
      setSubmitType(null);
      setError(null);
    }, 200);
  };

  if (!listing) return null;

  // Success states
  if (submitType === "bid") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bid Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Your bid has been received. FluxCo will review and contact you soon.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (submitType === "info") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
            <p className="text-muted-foreground mb-6">
              FluxCo has been notified. We&apos;ll reach out with more information about this project.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Place Bid
          </DialogTitle>
          <DialogDescription>
            Submit your pricing and lead time, or request more information
          </DialogDescription>
        </DialogHeader>

        {/* Listing Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg text-primary">
              {listing.rated_power_kva.toLocaleString()} kVA
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {listing.serial_number}
              </Badge>
              <Badge variant="secondary">{listing.phases}-Phase</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">
              Primary: <span className="text-foreground">{formatVoltage(listing.primary_voltage)}</span>
            </div>
            <div className="text-muted-foreground">
              Secondary: <span className="text-foreground">{formatVoltage(listing.secondary_voltage)}</span>
            </div>
            {listing.vector_group && (
              <div className="text-muted-foreground">
                Vector: <span className="text-foreground">{listing.vector_group}</span>
              </div>
            )}
            {listing.cooling_class && (
              <div className="text-muted-foreground">
                Cooling: <span className="text-foreground">{listing.cooling_class}</span>
              </div>
            )}
          </div>
          {listing.zipcode && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2 border-t border-border">
              <MapPin className="w-3 h-3" />
              Project Location: {listing.zipcode}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Bid Form */}
        <form onSubmit={handleSubmitBid} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidPrice" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Your Bid Price (USD)
            </Label>
            <Input
              id="bidPrice"
              type="text"
              placeholder="e.g., 125,000"
              value={bidPrice}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                if (value) {
                  setBidPrice(parseInt(value, 10).toLocaleString());
                } else {
                  setBidPrice("");
                }
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Lead Time (weeks)
            </Label>
            <Input
              id="leadTime"
              type="number"
              min="1"
              max="104"
              placeholder="e.g., 12"
              value={leadTimeWeeks}
              onChange={(e) => setLeadTimeWeeks(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your bid..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Bid"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleNeedMoreInfo}
              disabled={isSubmitting}
              className="w-full"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              I Need More Info
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
