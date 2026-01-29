"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, EmployeeUser, Project as DBProject, QuoteRequest, MarketplaceListing as DBMarketplaceListing, Order as DBOrder } from "@/lib/supabase";

// TypeScript Types
interface Employee {
  id: string;
  email: string;
  name: string;
  role: "admin" | "engineer" | "sales" | "operations";
}



// Status Badge Variants
const getProjectStatusBadge = (status: DBProject["status"]) => {
  const variants: Record<DBProject["status"], { label: string; className: string }> = {
    design: { label: "Design", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    review: { label: "In Review", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    approved: { label: "Approved", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    manufacturing: { label: "Manufacturing", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    testing: { label: "Testing", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    shipped: { label: "Shipped", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    completed: { label: "Completed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  };
  return variants[status];
};

// Login Form Component
function LoginForm({ onLogin }: { onLogin: (employee: Employee) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Query Supabase for employee
      const { data, error: queryError } = await supabase
        .from('employee_users')
        .select('id, email, name, role')
        .eq('email', email.toLowerCase())
        .eq('password_hash', password)
        .single();

      if (queryError || !data) {
        setError("Invalid email or password");
      } else {
        // Update last login
        await supabase
          .from('employee_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        onLogin({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as Employee["role"],
        });
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-display">Fluxer Portal</CardTitle>
          <CardDescription>Sign in to access the FluxCo project management dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@fluxco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
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
                required
                className="bg-background/50"
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo credentials: any email ending in @fluxco.com with password &quot;fluxco123&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard Header Component
function DashboardHeader({ employee, onLogout }: { employee: Employee; onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-display text-foreground">Employee Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {employee.name} ({employee.role})
        </p>
      </div>
      <Button variant="outline" onClick={onLogout}>
        Sign Out
      </Button>
    </div>
  );
}

// Stats Cards Component
function StatsCards() {
  const [stats, setStats] = useState([
    { label: "Active Projects", value: 0, color: "text-primary" },
    { label: "New Quotes", value: 0, color: "text-yellow-400" },
    { label: "Pending Reviews", value: 0, color: "text-purple-400" },
    { label: "Orders In Progress", value: 0, color: "text-green-400" },
  ]);

  useEffect(() => {
    async function fetchStats() {
      const [projects, quotes, listings, orders] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).neq('status', 'completed'),
        supabase.from('quote_requests').select('id', { count: 'exact' }).eq('status', 'new'),
        supabase.from('marketplace_listings').select('id', { count: 'exact' }).eq('status', 'pending_review'),
        supabase.from('orders').select('id', { count: 'exact' }).not('status', 'in', '("delivered","shipped","cancelled")'),
      ]);

      setStats([
        { label: "Active Projects", value: projects.count || 0, color: "text-primary" },
        { label: "New Quotes", value: quotes.count || 0, color: "text-yellow-400" },
        { label: "Pending Reviews", value: listings.count || 0, color: "text-purple-400" },
        { label: "Orders In Progress", value: orders.count || 0, color: "text-green-400" },
      ]);
    }
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-display mt-2 ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Projects Tab Component
function ProjectsTab() {
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transformer Design Projects</CardTitle>
            <CardDescription>Manage and track all transformer design and manufacturing projects</CardDescription>
          </div>
          <Button>New Project</Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No projects yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target Delivery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const statusBadge = getProjectStatusBadge(project.status);
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono text-sm">{project.project_number}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{project.customer_name}</span>
                        {project.customer_company && (
                          <><br /><span className="text-sm text-muted-foreground">{project.customer_company}</span></>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {project.rated_power_kva.toLocaleString()} kVA
                        <br />
                        <span className="text-muted-foreground">{project.primary_voltage}V / {project.secondary_voltage}V</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{project.priority}</TableCell>
                    <TableCell>{project.target_delivery || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Quotes Tab Component
function QuotesTab() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setQuotes(data);
      }
      setLoading(false);
    }
    fetchQuotes();
  }, []);

  const getQuoteStatusBadgeFromDB = (status: QuoteRequest["status"]) => {
    const variants: Record<QuoteRequest["status"], { label: string; className: string }> = {
      new: { label: "New", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      contacted: { label: "Contacted", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      quoted: { label: "Quoted", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      won: { label: "Won", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      lost: { label: "Lost", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    return variants[status];
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading quotes...</div>;
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quote Requests</CardTitle>
            <CardDescription>Review and respond to customer quote requests</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No quote requests yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Product Interest</TableHead>
                <TableHead>Est. Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const statusBadge = getQuoteStatusBadgeFromDB(quote.status);
                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{quote.name}</span>
                        <br />
                        <span className="text-sm text-muted-foreground">{quote.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{quote.company || '-'}</TableCell>
                    <TableCell>{quote.product_interest || '-'}</TableCell>
                    <TableCell className="text-green-400">
                      {quote.estimated_value ? `$${quote.estimated_value.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                        {quote.status === "new" && (
                          <Button variant="default" size="sm">
                            Create Quote
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Marketplace Tab Component
function MarketplaceTab() {
  const [listings, setListings] = useState<DBMarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setListings(data);
      }
      setLoading(false);
    }
    fetchListings();
  }, []);

  const getListingStatusBadgeFromDB = (status: DBMarketplaceListing["status"]) => {
    const variants: Record<DBMarketplaceListing["status"], { label: string; className: string }> = {
      pending_review: { label: "Pending Review", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      approved: { label: "Approved", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      listed: { label: "Listed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      sold: { label: "Sold", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
      rejected: { label: "Rejected", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      expired: { label: "Expired", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    };
    return variants[status];
  };

  const handleApprove = async (id: string) => {
    await supabase
      .from('marketplace_listings')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id);
    setListings(listings.map(l => l.id === id ? { ...l, status: 'approved' as const } : l));
  };

  const handleReject = async (id: string) => {
    await supabase
      .from('marketplace_listings')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id);
    setListings(listings.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l));
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading listings...</div>;
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Marketplace Submissions</CardTitle>
            <CardDescription>Review and manage user-submitted transformer listings</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No marketplace listings yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Asking Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => {
                const statusBadge = getListingStatusBadgeFromDB(listing.status);
                return (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{listing.contact_name}</span>
                        <br />
                        <span className="text-sm text-muted-foreground">{listing.contact_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {listing.rated_power_kva.toLocaleString()} kVA
                        <br />
                        <span className="text-muted-foreground">{listing.primary_voltage}V / {listing.secondary_voltage}V</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      {listing.efficiency_percent ? `${listing.efficiency_percent}%` : '-'}
                    </TableCell>
                    <TableCell className="text-green-400">
                      {listing.asking_price ? `$${listing.asking_price.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {listing.status === "pending_review" && (
                          <>
                            <Button variant="default" size="sm" onClick={() => handleApprove(listing.id)}>
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleReject(listing.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {listing.status !== "pending_review" && (
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Orders Tab Component
function OrdersTab() {
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const getOrderStatusBadgeFromDB = (status: DBOrder["status"]) => {
    const variants: Record<DBOrder["status"], { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
      in_production: { label: "In Production", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      quality_check: { label: "Quality Check", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      ready_to_ship: { label: "Ready to Ship", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      shipped: { label: "Shipped", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
      delivered: { label: "Delivered", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      cancelled: { label: "Cancelled", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    return variants[status];
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading orders...</div>;
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Fulfillment</CardTitle>
            <CardDescription>Track manufacturing and shipping status of all orders</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Report</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Est. Ship Date</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusBadge = getOrderStatusBadgeFromDB(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{order.customer_name}</span>
                        {order.customer_company && (
                          <><br /><span className="text-sm text-muted-foreground">{order.customer_company}</span></>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="text-green-400">
                      {order.total_price ? `$${order.total_price.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell>{order.order_date}</TableCell>
                    <TableCell>{order.estimated_ship_date || '-'}</TableCell>
                    <TableCell>
                      {order.tracking_number ? (
                        <span className="font-mono text-xs text-primary">{order.tracking_number}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                        {order.status === "ready_to_ship" && (
                          <Button variant="default" size="sm">
                            Ship
                          </Button>
                        )}
                        {order.status === "quality_check" && (
                          <Button variant="default" size="sm">
                            Approve QC
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);

  const handleLogin = (emp: Employee) => {
    setEmployee(emp);
    // In production, would store in session/localStorage
  };

  const handleLogout = () => {
    setEmployee(null);
  };

  if (!employee) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader employee={employee} onLogout={handleLogout} />
      <StatsCards />

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="bg-card/50 backdrop-blur border border-border mb-6">
          <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Projects
          </TabsTrigger>
          <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Quotes
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>

        <TabsContent value="quotes">
          <QuotesTab />
        </TabsContent>

        <TabsContent value="marketplace">
          <MarketplaceTab />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
