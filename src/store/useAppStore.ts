import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  savedPpaIds: string[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  toggleSavePPA: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      savedPpaIds: [],
      login: (email, name = "Bobby Keys") => {
        set({ user: { name, email } });
      },
      logout: () => {
        set({ user: null });
      },
      toggleSavePPA: (id) => {
        set((state) => {
          const isSaved = state.savedPpaIds.includes(id);
          const savedPpaIds = isSaved
            ? state.savedPpaIds.filter((ppaId) => ppaId !== id)
            : [...state.savedPpaIds, id];
          return { savedPpaIds };
        });
      },
    }),
    {
      name: "nysc-help-app-store",
    }
  )
);
