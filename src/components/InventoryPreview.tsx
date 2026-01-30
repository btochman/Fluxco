"use client";

import { Package, ArrowRight, MapPin, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useInventory, useInventoryStats } from "@/hooks/useInventory";

// Format price with commas
const formatPrice = (price: string | null): string => {
  if (!price) return 'Contact';
  const numMatch = price.replace(/[$,]/g, '').match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return '$' + num.toLocaleString();
  }
  return price;
};

const InventoryPreview = () => {
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: stats, isLoading: statsLoading } = useInventoryStats();

  const displayData = inventory.slice(0, 6);

  const displayStats = stats ?? {
    totalProducts: 0,
    totalUnits: 0,
    newCount: 0,
    refurbishedCount: 0,
  };

  const isLoading = inventoryLoading || statsLoading;

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

        {/* Preview Table */}
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
                  <TableHead className="text-muted-foreground font-semibold">OEM</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Location</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">FEOC</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Qty</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : displayData.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="font-mono text-sm text-primary">
                        {item.sku?.substring(0, 12) || item.id.substring(0, 8)}
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
                        {item.feoc_compliant ? (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <ShieldX className="w-4 h-4 text-red-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{item.quantity || 1}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatPrice(item.price)}
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* View All CTA */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing 6 of {displayStats.totalProducts} available transformers
            </span>
            <Button asChild className="gap-2">
              <Link href="/inventory">
                View Full Inventory
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPreview;
