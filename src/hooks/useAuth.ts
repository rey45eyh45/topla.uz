"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "vendor" | "customer";
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
}

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAdmin: false,
    isVendor: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, is_verified")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile | null;
  }, [supabase]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          isLoading: false,
          isAdmin: profile?.role === "admin",
          isVendor: profile?.role === "vendor",
        });
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAdmin: false,
          isVendor: false,
        });
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            isLoading: false,
            isAdmin: profile?.role === "admin",
            isVendor: profile?.role === "vendor",
          });
        } else {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            isAdmin: false,
            isVendor: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [supabase, router]);

  return {
    ...state,
    signOut,
  };
}
