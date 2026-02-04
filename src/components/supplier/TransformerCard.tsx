"use client";

import { MarketplaceListing } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Gauge, DollarSign, Weight, Percent } from "lucide-react";

interface TransformerCardProps {
  listing: MarketplaceListing;
}

export function TransformerCard({ listing }: TransformerCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "Contact for pricing";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | null, suffix = "") => {
    if (!value) return "N/A";
    return `${value.toLocaleString()}${suffix}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">
            {listing.rated_power_kva} kVA Transformer
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {listing.phases}-Phase
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {listing.primary_voltage}V / {listing.secondary_voltage}V
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Frequency:</span>
            <span className="font-medium">{listing.frequency} Hz</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Impedance:</span>
            <span className="font-medium">
              {formatNumber(listing.impedance_percent, "%")}
            </span>
          </div>
          {listing.efficiency_percent && (
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Efficiency:</span>
              <span className="font-medium">
                {listing.efficiency_percent.toFixed(1)}%
              </span>
            </div>
          )}
          {listing.total_weight_kg && (
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">
                {formatNumber(listing.total_weight_kg, " kg")}
              </span>
            </div>
          )}
        </div>

        {(listing.vector_group || listing.cooling_class) && (
          <div className="flex gap-2 flex-wrap">
            {listing.vector_group && (
              <Badge variant="outline" className="text-xs">
                {listing.vector_group}
              </Badge>
            )}
            {listing.cooling_class && (
              <Badge variant="outline" className="text-xs">
                {listing.cooling_class}
              </Badge>
            )}
          </div>
        )}

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <DollarSign className="w-5 h-5" />
              {formatCurrency(listing.asking_price)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
