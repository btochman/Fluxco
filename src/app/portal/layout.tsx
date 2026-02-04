"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import { Loader2 } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupplierAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/portal/login" || pathname === "/portal/register";

  useEffect(() => {
    if (!loading) {
      // If user is logged in and on auth page, redirect to portal
      if (user && isAuthPage) {
        router.push("/portal");
      }
      // If user is not logged in and not on auth page, redirect to login
      if (!user && !isAuthPage) {
        router.push("/portal/login");
      }
    }
  }, [user, loading, isAuthPage, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!user && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
