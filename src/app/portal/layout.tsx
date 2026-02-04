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
    if (loading) return;

    if (user && isAuthPage) {
      router.replace("/portal");
    } else if (!user && !isAuthPage) {
      router.replace("/portal/login");
    }
  }, [user, loading, isAuthPage, router]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Waiting for redirect
  if ((user && isAuthPage) || (!user && !isAuthPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
