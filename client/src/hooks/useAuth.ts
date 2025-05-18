import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Handle unauthorized responses gracefully
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading: false, // Disable loading state for better UX
    isAuthenticated: !!user,
  };
}
