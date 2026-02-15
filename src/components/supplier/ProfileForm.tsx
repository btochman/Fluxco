"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Save } from "lucide-react";

interface SupplierProfile {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  certifications: string[];
  website?: string | null;
  kva_range_min?: number | null;
  kva_range_max?: number | null;
}

interface ProfileFormProps {
  supplier: SupplierProfile;
  onSaved?: () => void;
}

const CERTIFICATION_OPTIONS = [
  "ISO 9001",
  "ISO 14001",
  "IEEE",
  "UL Listed",
  "CSA",
  "DOE Compliant",
  "NEMA",
  "ANSI",
  "IEC",
];

export function ProfileForm({ supplier, onSaved }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    company_name: supplier.company_name || "",
    contact_name: supplier.contact_name || "",
    phone: supplier.phone || "",
    address: supplier.address || "",
    city: supplier.city || "",
    state: supplier.state || "",
    country: supplier.country || "USA",
    website: (supplier as any).website || "",
    kva_range_min: (supplier as any).kva_range_min || "",
    kva_range_max: (supplier as any).kva_range_max || "",
    certifications: supplier.certifications || [],
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCertification = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/supplier/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplier.id,
          ...formData,
          kva_range_min: formData.kva_range_min
            ? parseInt(String(formData.kva_range_min), 10)
            : null,
          kva_range_max: formData.kva_range_max
            ? parseInt(String(formData.kva_range_max), 10)
            : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Company Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.yourcompany.com"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Industrial Blvd"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="TX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manufacturing Capacity */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Manufacturing Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kva_range_min">Min kVA Rating</Label>
            <Input
              id="kva_range_min"
              name="kva_range_min"
              type="number"
              value={formData.kva_range_min}
              onChange={handleChange}
              placeholder="e.g., 25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kva_range_max">Max kVA Rating</Label>
            <Input
              id="kva_range_max"
              name="kva_range_max"
              type="number"
              value={formData.kva_range_max}
              onChange={handleChange}
              placeholder="e.g., 100000"
            />
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Certifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CERTIFICATION_OPTIONS.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={`cert-${cert}`}
                checked={formData.certifications.includes(cert)}
                onCheckedChange={() => toggleCertification(cert)}
              />
              <Label
                htmlFor={`cert-${cert}`}
                className="text-sm font-normal cursor-pointer"
              >
                {cert}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 bg-card border-t border-border -mx-6 px-6 py-4 -mb-6 rounded-b-lg">
        <Button type="submit" disabled={saving} size="lg" className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  );
}
