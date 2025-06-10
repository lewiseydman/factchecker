import { useState, useEffect } from "react";

export function useDevAuth() {
  const [isDevAuthenticated, setIsDevAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = sessionStorage.getItem("dev_authenticated");
    setIsDevAuthenticated(authStatus === "true");
    setIsLoading(false);
  }, []);

  const authenticate = () => {
    setIsDevAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("dev_authenticated");
    setIsDevAuthenticated(false);
  };

  return {
    isDevAuthenticated,
    isLoading,
    authenticate,
    logout,
  };
}