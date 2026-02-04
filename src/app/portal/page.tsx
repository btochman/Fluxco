"use client";

import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import { MarketplaceList } from "@/components/supplier/MarketplaceList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Zap, LogOut, Bell, BellOff, User } from "lucide-react";

export default function PortalPage() {
  const { supplier, signOut } = useSupplierAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl tracking-wide text-foreground">
                FLUXCO
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {supplier && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {supplier.company_name}
                    </span>
                  </div>
                  {supplier.notify_new_listings ? (
                    <Badge variant="secondary" className="gap-1">
                      <Bell className="w-3 h-3" />
                      Notifications on
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <BellOff className="w-3 h-3" />
                      Notifications off
                    </Badge>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transformer Marketplace</h1>
          <p className="text-muted-foreground">
            Browse available transformers and find opportunities for your business.
          </p>
        </div>

        <MarketplaceList />
      </main>
    </div>
  );
}
