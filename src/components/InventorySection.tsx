"use client";
import { useState, useMemo } from "react";
import { Search, Package, MapPin, ShieldCheck, ShieldX, RefreshCw, Clock, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inventoryData, Transformer } from "@/data/inventoryData";
import { useInventory, useInventoryStats, useLastScrapedTime, useRefreshInventory, type InventoryFilters } from "@/hooks/useInventory";
import { formatDistanceToNow } from "date-fns";

// Format price with commas
const formatPrice = (price: string | null): string => {
  if (!price) return 'Contact';
  // Extract numeric value from price string
  const numMatch = price.replace(/[$,]/g, '').match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return '$' + num.toLocaleString();
  }
  return price;
};

const InventorySection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");

  // Fetch from database
  const filters: InventoryFilters = {
    type: typeFilter,
    category: categoryFilter,
    capacityRange: capacityFilter,
    search: searchQuery,
  };
  
  const { data: scrapedInventory, isLoading, error } = useInventory(filters);
  const { data: stats } = useInventoryStats();
  const { data: lastScraped } = useLastScrapedTime();
  const refreshMutation = useRefreshInventory();

  // Use scraped data if available, otherwise fall back to mock data
  const hasScrapedData = scrapedInventory && scrapedInventory.length > 0;

  // Filter mock data when using fallback
  const filteredMockInventory = useMemo(() => {
    if (hasScrapedData) return [];
    
    return inventoryData.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.voltage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      let matchesCapacity = true;
      if (capacityFilter === "small" || capacityFilter === "0-500") matchesCapacity = item.capacityKVA <= 500;
      else if (capacityFilter === "medium" || capacityFilter === "500-1000") matchesCapacity = item.capacityKVA > 500 && item.capacityKVA <= 1000;
      else if (capacityFilter === "1000-2500") matchesCapacity = item.capacityKVA > 1000 && item.capacityKVA <= 2500;
      else if (capacityFilter === "large" || capacityFilter === "2500-5000") matchesCapacity = item.capacityKVA > 2000 && item.capacityKVA <= 5000;
      else if (capacityFilter === "5000-10000") matchesCapacity = item.capacityKVA > 5000 && item.capacityKVA <= 10000;
      else if (capacityFilter === "10000+") matchesCapacity = item.capacityKVA > 10000;

      return matchesSearch && matchesType && matchesCategory && matchesCapacity;
    });
  }, [searchQuery, typeFilter, categoryFilter, capacityFilter, hasScrapedData]);

  const displayData = hasScrapedData ? scrapedInventory : filteredMockInventory;
  const totalUnits = displayData.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const displayStats = stats || {
    totalProducts: inventoryData.length,
    totalUnits: inventoryData.reduce((sum, item) => sum + item.quantity, 0),
    newCount: inventoryData.filter(i => i.type === 'new').length,
    refurbishedCount: inventoryData.filter(i => i.type === 'refurbished').length,
  };

  return (
    <section id="inventory" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 ranch-pattern opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <Package className="w-3 h-3 mr-1" />
            Global Inventory
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            In-Stock Transformers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our real-time inventory of new and certified refurbished transformers ready for immediate shipment worldwide.
          </p>
          
          {/* Last Updated & Refresh */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {lastScraped && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Updated {formatDistanceToNow(lastScraped, { addSuffix: true })}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{displayStats.totalProducts.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Product Lines</div>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent">{displayStats.totalUnits.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Units Available</div>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{displayStats.newCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">New Products</div>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{displayStats.refurbishedCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Refurbished</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, manufacturer, location, or voltage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-background border-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-background border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                  <SelectItem value="Power">Power</SelectItem>
                  <SelectItem value="Specialty">Specialty</SelectItem>
                </SelectContent>
              </Select>

              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger className="w-[160px] bg-background border-border">
                  <SelectValue placeholder="Capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capacities</SelectItem>
                  <SelectItem value="0-500">≤ 500 kVA</SelectItem>
                  <SelectItem value="500-1000">500 - 1,000 kVA</SelectItem>
                  <SelectItem value="1000-2500">1 - 2.5 MVA</SelectItem>
                  <SelectItem value="2500-5000">2.5 - 5 MVA</SelectItem>
                  <SelectItem value="5000-10000">5 - 10 MVA</SelectItem>
                  <SelectItem value="10000+">10+ MVA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold">ID</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Category</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Capacity</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Voltage</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Manufacturer</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Location</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">FEOC</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Qty</TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-right">Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                        No transformers match your search criteria. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayData.slice(0, 100).map((item) => {
                      // Handle both scraped and mock data structures
                      const isScraped = 'source_url' in item;
                      const id = isScraped ? (item.external_id || item.id) : (item as Transformer).id;
                      const feocCompliant = isScraped ? item.feoc_compliant : (item as Transformer).feocCompliant;
                      const sourceUrl = isScraped ? item.source_url : null;

                      return (
                        <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                          <TableCell className="font-mono text-sm text-primary">
                            {String(id).substring(0, 12)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.type === "new" ? "default" : "secondary"}
                              className={item.type === "new" 
                                ? "bg-primary/20 text-primary border-primary/30" 
                                : "bg-accent/20 text-accent border-accent/30"
                              }
                            >
                              {item.type === "new" ? "New" : "Refurb"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{item.category}</TableCell>
                          <TableCell className="font-medium text-foreground">{item.capacity}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{item.voltage || '-'}</TableCell>
                          <TableCell className="text-foreground">{item.manufacturer || '-'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {feocCompliant ? (
                              <span className="flex items-center gap-1 text-green-500">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-medium">Yes</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400">
                                <ShieldX className="w-4 h-4" />
                                <span className="text-xs font-medium">No</span>
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.quantity || 1}</TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {sourceUrl && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  asChild
                                >
                                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                                onClick={() => {
                                  const contactSection = document.getElementById("contact");
                                  if (contactSection) {
                                    contactSection.scrollIntoView({ behavior: "smooth" });
                                  }
                                }}
                              >
                                Quote
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Results Count */}
            {displayData.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
                Showing {Math.min(100, displayData.length)} of {displayData.length} results
                {displayData.length > 100 && (
                  <span className="ml-2">
                    • <button 
                        onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} 
                        className="text-primary hover:underline"
                      >
                        Contact us
                      </button> for full inventory access
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Prices shown are estimates. Final pricing depends on configuration, delivery location, and current availability.
          <br />
          Contact us for custom specifications or bulk orders.
        </p>
      </div>
    </section>
  );
};

export default InventorySection;
