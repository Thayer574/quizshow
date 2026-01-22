import { useState, useEffect } from "react";
import type { UserRole } from "@shared/gameConstants";

/**
 * Hook to manage user's game role (owner, player, or solo)
 * Persists role selection in localStorage
 */
export function useGameRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load role from localStorage on mount
    const savedRole = localStorage.getItem("gameRole") as UserRole | null;
    setRole(savedRole);
    setIsLoading(false);
  }, []);

  const selectRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("gameRole", newRole);
  };

  const clearRole = () => {
    setRole(null);
    localStorage.removeItem("gameRole");
  };

  return { role, selectRole, clearRole, isLoading };
}
