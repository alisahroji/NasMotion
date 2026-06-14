import { useState, useEffect } from "react";

/**
 * useDebounce — delay update value hingga user berhenti mengetik
 * Dipakai di halaman search (Spareparts, Services, Users, VehicleHistory)
 */
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};