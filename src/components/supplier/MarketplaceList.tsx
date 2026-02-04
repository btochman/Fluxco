"use client";

import { useState } from "react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, PackageSearch, Zap, MapPin, CheckCircle, Clock, Info } from "lucide-react";
import { MarketplaceListing } from "@/lib/supabase";
import { BidDialog } from "./BidDialog";

const formatVoltage = (voltage: number): string => {
  if (voltage >= 1000) {
    return `${(voltage / 1000).toFixed(voltage % 1000 === 0 ? 0 : 1)} kV`;
  }
  return `${voltage} V`;
};

const formatCurrency = (value: number | null): string => {
  if (!value) return "Contact";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatWeight = (kg: number | null): string => {
  if (!kg) return "-";
  const lbs = Math.round(kg * 2.205);
  return `${lbs.toLocaleString()} lbs`;
};

export function MarketplaceList() {
  const { data, isLoading, error } = useMarketplace();
  const { supplier } = useSupplierAuth();
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);

  const handleBidClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setBidDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load marketplace listings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const activeListings = data?.active || [];
  const completedListings = data?.completed || [];

  const renderTable = (listings: MarketplaceListing[], isCompleted: boolean) => {
    if (listings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {isCompleted ? "No completed bids yet" : "No active listings"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {isCompleted
              ? "Completed bid opportunities will appear here."
              : "New transformer opportunities will appear here. Check back soon!"}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Serial #</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Power</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Primary</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Secondary</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Phase</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Vector</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Cooling</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Weight</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Location</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono text-sm text-primary">
                    {listing.serial_number || "-"}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {listing.rated_power_kva.toLocaleString()} kVA
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {formatVoltage(listing.primary_voltage)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {formatVoltage(listing.secondary_voltage)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {listing.phases}-Ph
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {listing.vector_group || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {listing.cooling_class || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatWeight(listing.total_weight_kg)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {listing.zipcode ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.zipcode}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {isCompleted ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Awarded
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleBidClick(listing)}
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Learn More
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Results Count */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
          {listings.length} {isCompleted ? "completed" : "active"} listing{listings.length !== 1 ? "s" : ""}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <Clock className="w-6 h-6" />
            {activeListings.length}
          </div>
          <div className="text-sm text-muted-foreground">Active Opportunities</div>
        </div>
        <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-500">
            <CheckCircle className="w-6 h-6" />
            {completedListings.length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="gap-2">
            <Clock className="w-4 h-4" />
            Active ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {renderTable(activeListings, false)}
        </TabsContent>

        <TabsContent value="completed">
          {renderTable(completedListings, true)}
        </TabsContent>
      </Tabs>

      {/* Bid Dialog */}
      <BidDialog
        listing={selectedListing}
        open={bidDialogOpen}
        onOpenChange={setBidDialogOpen}
        supplier={supplier}
      />
    </>
  );
}
