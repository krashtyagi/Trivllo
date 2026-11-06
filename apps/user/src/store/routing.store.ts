import { create } from "zustand";

interface Routes {
  nextRoute: string;
  setNextRoute: (route: string) => void;
}
export const useRoutingStore = create<Routes>((set) => ({
  nextRoute: "/",
  setNextRoute: (route: string) => set({ nextRoute: route }),
}));