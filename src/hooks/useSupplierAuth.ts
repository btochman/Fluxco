"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface SupplierProfile {
  id: string;
  user_id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  certifications: string[];
  specialties: string[];
  is_verified: boolean;
  notify_new_listings: boolean;
  created_at: string;
  last_login: string | null;
}

interface UseSupplierAuthReturn {
  user: User | null;
  session: Session | null;
  supplier: SupplierProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    profile: {
      company_name: string;
      contact_name: string;
      phone?: string;
      notify_new_listings?: boolean;
    }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useSupplierAuth(): UseSupplierAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchSupplierProfile = useCallback(async (userId: string): Promise<SupplierProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching supplier profile:", error);
        return null;
      }
      return data as SupplierProfile;
    } catch (err) {
      console.error("Exception fetching supplier profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    // Check if supabase client is available
    if (!supabase) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const profile = await fetchSupplierProfile(session.user.id);
            if (isMounted) setSupplier(profile);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Exception during auth init:", err);
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await fetchSupplierProfile(session.user.id);
        if (isMounted) setSupplier(profile);
      } else {
        setSupplier(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSupplierProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    profile: {
      company_name: string;
      contact_name: string;
      phone?: string;
      notify_new_listings?: boolean;
    }
  ) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { error: authError as Error };
    }

    if (!authData.user) {
      return { error: new Error("Failed to create user") };
    }

    // Create supplier profile
    const { error: profileError } = await supabase.from("suppliers").insert({
      user_id: authData.user.id,
      email,
      company_name: profile.company_name,
      contact_name: profile.contact_name,
      phone: profile.phone || null,
      notify_new_listings: profile.notify_new_listings ?? false,
      country: "USA",
      certifications: [],
      specialties: [],
      is_verified: false,
    });

    if (profileError) {
      return { error: profileError as Error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSupplier(null);
  };

  return {
    user,
    session,
    supplier,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
