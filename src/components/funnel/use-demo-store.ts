// Single hook every screen uses to read the demo store, so the landing page,
// the registration flow and the dashboard never disagree about seats or price.

import { useCallback, useEffect, useState } from "react";

import { type Cohort } from "@/lib/course";
import {
  STORE_EVENT,
  emptyStore,
  readStore,
  resolveCohorts,
  resolvePrice,
  type DemoStore,
} from "@/lib/registration";

export function useDemoStore(): {
  store: DemoStore;
  cohorts: Cohort[];
  priceSar: number;
  refresh: () => void;
  hydrated: boolean;
} {
  // Start from the seed so SSR and the first client render agree, then swap in
  // localStorage after mount.
  const [store, setStore] = useState<DemoStore>(() => emptyStore());
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setStore(readStore());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const onChange = () => refresh();
    window.addEventListener(STORE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(STORE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return {
    store,
    cohorts: resolveCohorts(store),
    priceSar: resolvePrice(store),
    refresh,
    hydrated,
  };
}
