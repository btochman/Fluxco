"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  DollarSign,
  Trophy,
  LogOut,
  Building2,
  Clock,
  Zap,
  Calendar,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { supabase, Supplier as DBSupplier, RFQ as DBRFQ, Bid as DBBid, Contract as DBContract } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ==================== Types ====================

interface Supplier {
  id: string;
  companyName: string;
  email: string;
  contactName: string;
  phone: string;
  location: string;
  certifications: string[];
}

interface RFQ {
  id: string;
  title: string;
  description: string;
  capacityKVA: number;
  primaryVoltage: string;
  secondaryVoltage: string;
  phase: "single" | "three";
  cooling: string;
  application: string;
  quantity: number;
  deliveryDeadline: string;
  bidDeadline: string;
  status: "open" | "closed" | "awarded";
  specialRequirements?: string;
}

interface Bid {
  id: string;
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  notes: string;
  submittedAt: string;
  status: "pending" | "under_review" | "accepted" | "rejected";
}

interface Contract {
  id: string;
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  deliveryDate: string;
  awardedAt: string;
  status: "active" | "in_production" | "shipped" | "completed";
}


// ==================== Component ====================

const SupplierPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supplier, setSupplier] = useState<DBSupplier | null>(null);
  const [rfqs, setRfqs] = useState<DBRFQ[]>([]);
  const [bids, setBids] = useState<DBBid[]>([]);
  const [contracts, setContracts] = useState<DBContract[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Bid form state
  const [bidPrice, setBidPrice] = useState("");
  const [bidLeadTime, setBidLeadTime] = useState("");
  const [bidNotes, setBidNotes] = useState("");

  // Fetch data when logged in
  useEffect(() => {
    if (!isLoggedIn || !supplier) return;

    const supplierId = supplier.id;

    async function fetchData() {
      // Fetch open RFQs
      const { data: rfqData } = await supabase
        .from('rfqs')
        .select('*')
        .in('status', ['open', 'closed'])
        .order('bid_deadline', { ascending: true });
      if (rfqData) setRfqs(rfqData);

      // Fetch supplier's bids
      const { data: bidData } = await supabase
        .from('bids')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('submitted_at', { ascending: false });
      if (bidData) setBids(bidData);

      // Fetch supplier's contracts
      const { data: contractData } = await supabase
        .from('contracts')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
      if (contractData) setContracts(contractData);
    }
    fetchData();
  }, [isLoggedIn, supplier]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      // Query Supabase for supplier
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        setLoginError("Invalid email or password");
      } else {
        // Update last login
        await supabase
          .from('suppliers')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        setSupplier(data);
        setIsLoggedIn(true);
      }
    } catch {
      setLoginError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ || !bidPrice || !bidLeadTime || !supplier) return;

    const unitPrice = parseFloat(bidPrice);
    const quantity = selectedRFQ.quantity;
    const totalPrice = unitPrice * quantity;

    const { data, error } = await supabase
      .from('bids')
      .insert({
        rfq_id: selectedRFQ.id,
        supplier_id: supplier.id,
        unit_price: unitPrice,
        total_price: totalPrice,
        lead_time_weeks: Math.ceil(parseInt(bidLeadTime) / 7),
        notes: bidNotes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      setBids([data, ...bids]);
    }
    setBidDialogOpen(false);
    resetBidForm();
  };

  const resetBidForm = () => {
    setBidPrice("");
    setBidLeadTime("");
    setBidNotes("");
    setSelectedRFQ(null);
  };

  const openBidDialog = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setBidDialogOpen(true);
  };

  const openViewDialog = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setViewDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBidStatusBadge = (status: Bid["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="outline" className="border-primary/50 text-primary">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const getContractStatusBadge = (status: Contract["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="border-primary/50 text-primary">
            Active
          </Badge>
        );
      case "in_production":
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
            In Production
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant="outline" className="border-accent/50 text-accent">
            Shipped
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-500">
            Completed
          </Badge>
        );
    }
  };

  const getRFQStatusBadge = (status: RFQ["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            Open for Bids
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Closed
          </Badge>
        );
      case "awarded":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Awarded
          </Badge>
        );
    }
  };

  const openRFQs = rfqs.filter((rfq) => rfq.status === "open");
  const hasAlreadyBid = (rfqId: string) => bids.some((bid) => bid.rfq_id === rfqId);

  // ==================== Login View ====================

  if (!isLoggedIn) {
    return (
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden min-h-[80vh]">
        <div className="absolute inset-0 ranch-pattern opacity-30" />

        <div className="max-w-md mx-auto relative z-10">
          <Card className="border-border bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Supplier Portal</CardTitle>
              <CardDescription>
                Sign in to view RFQs, submit bids, and manage your contracts with FluxCo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supplier@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-red-500">{loginError}</p>
                )}
                <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                Not a registered supplier?{" "}
                <a href="#contact" className="text-primary hover:underline">
                  Contact us
                </a>{" "}
                to join our network.
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>
    );
  }

  // ==================== Dashboard View ====================

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 ranch-pattern opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/50 text-primary">
              <Building2 className="w-3 h-3 mr-1" />
              Supplier Portal
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Welcome, {supplier?.company_name}
            </h1>
            <p className="text-muted-foreground mt-1">{supplier?.city}, {supplier?.country}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{openRFQs.length}</div>
              <div className="text-sm text-muted-foreground">Open RFQs</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-accent">{bids.length}</div>
              <div className="text-sm text-muted-foreground">Active Bids</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-500">{contracts.length}</div>
              <div className="text-sm text-muted-foreground">Won Contracts</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(contracts.reduce((sum, c) => sum + c.total_value, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rfqs" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="rfqs" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              Available RFQs
            </TabsTrigger>
            <TabsTrigger value="bids" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4" />
              My Bids
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="w-4 h-4" />
              Won Contracts
            </TabsTrigger>
          </TabsList>

          {/* ==================== RFQs Tab ==================== */}
          <TabsContent value="rfqs">
            {rfqs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No RFQs available at this time.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {rfqs.map((rfq) => (
                  <Card key={rfq.id} className="bg-card/80 border-border hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-lg">{rfq.rfq_number}</CardTitle>
                          <CardDescription className="mt-1">{rfq.rated_power_kva} kVA Transformer</CardDescription>
                        </div>
                        {getRFQStatusBadge(rfq.status as RFQ["status"])}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Capacity:</span>
                          <span className="font-medium text-foreground">
                            {rfq.rated_power_kva >= 1000
                              ? `${(rfq.rated_power_kva / 1000).toFixed(1)} MVA`
                              : `${rfq.rated_power_kva} kVA`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Phase:</span>
                          <span className="font-medium text-foreground capitalize">
                            {rfq.phases === 3 ? "3-Phase" : "Single"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Voltage:</span>
                          <span className="ml-2 font-medium text-foreground">
                            {rfq.primary_voltage}V / {rfq.secondary_voltage}V
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="ml-2 font-medium text-foreground">{rfq.quantity} units</span>
                        </div>
                        {rfq.cooling_class && (
                          <div>
                            <span className="text-muted-foreground">Cooling:</span>
                            <span className="ml-2 font-medium text-foreground">{rfq.cooling_class}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Bid Deadline:</span>
                          <span className="font-medium text-foreground">{formatDate(rfq.bid_deadline)}</span>
                        </div>
                        {rfq.delivery_deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Delivery Needed:</span>
                            <span className="font-medium text-foreground">{formatDate(rfq.delivery_deadline)}</span>
                          </div>
                        )}
                      </div>

                      {rfq.special_requirements && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-200">{rfq.special_requirements}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="gap-2">
                      {rfq.status === "open" && !hasAlreadyBid(rfq.id) && (
                        <Button
                          variant="hero"
                          className="flex-1"
                          onClick={() => openBidDialog(rfq as unknown as RFQ)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Bid
                        </Button>
                      )}
                      {hasAlreadyBid(rfq.id) && (
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          Bid Submitted
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ==================== Bids Tab ==================== */}
          <TabsContent value="bids">
            <Card className="bg-card/80 border-border">
              <CardHeader>
                <CardTitle>My Bids</CardTitle>
                <CardDescription>
                  Track the status of your submitted bids
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>You have not submitted any bids yet.</p>
                    <p className="text-sm mt-2">
                      Browse available RFQs and submit your first bid.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">RFQ</TableHead>
                        <TableHead className="text-muted-foreground">Unit Price</TableHead>
                        <TableHead className="text-muted-foreground">Total Price</TableHead>
                        <TableHead className="text-muted-foreground">Lead Time</TableHead>
                        <TableHead className="text-muted-foreground">Submitted</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.map((bid) => (
                        <TableRow key={bid.id} className="border-border hover:bg-secondary/50">
                          <TableCell>
                            <p className="text-sm text-muted-foreground">{bid.rfq_id}</p>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {formatCurrency(bid.unit_price)}
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {formatCurrency(bid.total_price)}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {bid.lead_time_weeks} weeks
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(bid.submitted_at)}
                          </TableCell>
                          <TableCell>{getBidStatusBadge(bid.status as Bid["status"])}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== Contracts Tab ==================== */}
          <TabsContent value="contracts">
            <Card className="bg-card/80 border-border">
              <CardHeader>
                <CardTitle>Won Contracts</CardTitle>
                <CardDescription>
                  View and track your awarded contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No contracts awarded yet.</p>
                    <p className="text-sm mt-2">
                      Submit competitive bids to win contracts.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Contract #</TableHead>
                        <TableHead className="text-muted-foreground">Quantity</TableHead>
                        <TableHead className="text-muted-foreground">Unit Price</TableHead>
                        <TableHead className="text-muted-foreground">Total Value</TableHead>
                        <TableHead className="text-muted-foreground">Delivery Date</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id} className="border-border hover:bg-secondary/50">
                          <TableCell>
                            <p className="font-medium text-foreground">{contract.contract_number}</p>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {contract.quantity} units
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {formatCurrency(contract.unit_price)}
                          </TableCell>
                          <TableCell className="font-medium text-green-500">
                            {formatCurrency(contract.total_value)}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {contract.delivery_date ? formatDate(contract.delivery_date) : '-'}
                          </TableCell>
                          <TableCell>{getContractStatusBadge(contract.status as Contract["status"])}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ==================== Bid Submission Dialog ==================== */}
        <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>Submit Bid</DialogTitle>
              <DialogDescription>
                {selectedRFQ && (
                  <>
                    Bidding on: <span className="text-foreground">{selectedRFQ.title}</span>
                    <br />
                    Quantity: {selectedRFQ.quantity} units
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (USD)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  placeholder="e.g., 15000"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                {bidPrice && selectedRFQ && (
                  <p className="text-sm text-muted-foreground">
                    Total bid value:{" "}
                    <span className="text-primary font-medium">
                      {formatCurrency(parseFloat(bidPrice) * selectedRFQ.quantity)}
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  placeholder="e.g., 90"
                  value={bidLeadTime}
                  onChange={(e) => setBidLeadTime(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Include warranty terms, payment terms, or other details..."
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  className="bg-background border-border min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBidDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="hero">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Bid
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </section>
  );
};

export default SupplierPortal;
