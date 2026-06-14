import { useState, useCallback } from "react";

/**
 * useLocalQueue — simpan filter & sort preference di memory (bukan localStorage)
 * Dipakai di QueueLive untuk remember filter pilihan user selama session
 */
export const useLocalQueue = (initial = "all") => {
  const [filter, setFilter] = useState(initial);
  const [sort,   setSort]   = useState("asc"); // asc = nomor kecil dulu

  const changeFilter = useCallback((f) => setFilter(f), []);
  const changeSort   = useCallback((s) => setSort(s),   []);

  return { filter, sort, changeFilter, changeSort };
};