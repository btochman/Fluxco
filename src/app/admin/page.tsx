"use client";

import { useState } from "react";
import { Zap, Users, FileText, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Bid {
  id: string;
  listing_id: string;
  supplier_id: string;
  bid_price: number;
  lead_time_weeks: number;
  notes: string | null;
  status: string;
  created_at: string;
  listing?: {
    serial_number: string;
    rated_power_kva: number;
    primary_voltage: number;
    secondary_voltage: number;
  };
  supplier?: {
    company_name: string;
    contact_name: string;
    email: string;
  };
}

interface Listing {
  id: string;
  serial_number: string;
  rated_power_kva: number;
  primary_voltage: number;
  secondary_voltage: number;
  status: string;
  contact_name: string;
  contact_email: string;
  zipcode: string | null;
  created_at: string;
}

interface Supplier {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  notify_new_listings: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const [savedPassword, setSavedPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setBids(data.bids);
      setListings(data.listings);
      setSuppliers(data.suppliers);
      setSavedPassword(password);
      setAuthenticated(true);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to login");
    }
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: savedPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        setBids(data.bids);
        setListings(data.listings);
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl">FLUXCO Admin</span>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md bg-background mb-4"
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl">FLUXCO Admin</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              Bids
            </div>
            <div className="text-3xl font-bold">{bids.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              Listings
            </div>
            <div className="text-3xl font-bold">{listings.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              Suppliers
            </div>
            <div className="text-3xl font-bold">{suppliers.length}</div>
          </div>
        </div>

        <Tabs defaultValue="bids">
          <TabsList className="mb-6">
            <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bids">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Bid Price</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bids yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className="text-sm">{formatDate(bid.created_at)}</TableCell>
                        <TableCell>
                          <div className="font-mono text-primary">{bid.listing?.serial_number}</div>
                          <div className="text-xs text-muted-foreground">
                            {bid.listing?.rated_power_kva} kVA
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{bid.supplier?.company_name}</div>
                          <div className="text-xs text-muted-foreground">{bid.supplier?.email}</div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {bid.bid_price > 0 ? formatCurrency(bid.bid_price) : "-"}
                        </TableCell>
                        <TableCell>
                          {bid.lead_time_weeks > 0 ? `${bid.lead_time_weeks} weeks` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={bid.status === "submitted" ? "default" : "secondary"}>
                            {bid.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {bid.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FLUX#</TableHead>
                    <TableHead>Power</TableHead>
                    <TableHead>Voltage</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-mono text-primary">{listing.serial_number}</TableCell>
                      <TableCell className="font-semibold">{listing.rated_power_kva} kVA</TableCell>
                      <TableCell>
                        {listing.primary_voltage}V / {listing.secondary_voltage}V
                      </TableCell>
                      <TableCell>{listing.zipcode || "-"}</TableCell>
                      <TableCell>
                        <div>{listing.contact_name}</div>
                        <div className="text-xs text-muted-foreground">{listing.contact_email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={listing.status === "listed" ? "default" : "secondary"}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(listing.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No suppliers registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-semibold">{supplier.company_name}</TableCell>
                        <TableCell>{supplier.contact_name}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.notify_new_listings ? "default" : "outline"}>
                            {supplier.notify_new_listings ? "On" : "Off"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(supplier.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
