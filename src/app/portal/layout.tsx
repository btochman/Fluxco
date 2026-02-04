"use client";

import { useEffect, useState } from "react";
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
  const [timedOut, setTimedOut] = useState(false);

  const isAuthPage =
    pathname === "/portal/login" || pathname === "/portal/register";

  // Timeout after 5 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timed out");
        setTimedOut(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    // Handle redirects when auth state is determined
    if (!loading || timedOut) {
      if (user && isAuthPage) {
        router.push("/portal");
      } else if (!user && !isAuthPage) {
        router.push("/portal/login");
      }
    }
  }, [user, loading, timedOut, isAuthPage, router]);

  // Show loading while checking auth (with timeout protection)
  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If timed out and not on auth page, redirect to login
  if (timedOut && !user && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
