"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change:", event, currentSession?.user?.email);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Use setTimeout to avoid Supabase deadlock issue
        setTimeout(async () => {
          const { data } = await supabase
            .from("suppliers")
            .select("*")
            .eq("user_id", currentSession.user.id)
            .single();
          setSupplier(data as SupplierProfile | null);
          setLoading(false);
        }, 0);
      } else {
        setSupplier(null);
        setLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!existingSession) {
        // No session, stop loading
        setLoading(false);
      }
      // If there is a session, onAuthStateChange will handle it
    });

    return () => subscription.unsubscribe();
  }, []);

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
