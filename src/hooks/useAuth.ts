import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAdminAccess } from "@/lib/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-access"],
    queryFn: getAdminAccess,
    retry: false,
  });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ["admin-access"] });
    });

    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return query;
}
