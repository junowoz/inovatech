import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InscreverData {
  // Step 1 — basic info
  name: string;
  slogan: string;
  projectDescription: string;
  targetAudience: string;
  productDescription: string;
  projectViability: string;
  link: string;
  // Step 2 — specifics (lookup ids as strings)
  year: string;
  semester: string;
  course: string;
  tech: string;
  industry: string;
}

export interface LeaderInput {
  id: string;
  name: string;
  contact: string;
  isFounder: boolean;
}

export interface InscreverFiles {
  logo: File[];
  team: File[];
  product: File[];
}

interface InscreverState {
  data: Partial<InscreverData>;
  files: InscreverFiles;
  leaders: LeaderInput[];
  commonMembers: string[];
  setData: (patch: Partial<InscreverData>) => void;
  setFiles: (patch: Partial<InscreverFiles>) => void;
  setLeaders: (leaders: LeaderInput[]) => void;
  setCommonMembers: (members: string[]) => void;
  reset: () => void;
}

const emptyFiles = (): InscreverFiles => ({ logo: [], team: [], product: [] });

export const useInscreverStore = create<InscreverState>()(
  persist(
    (set) => ({
      data: {},
      files: emptyFiles(),
      leaders: [],
      commonMembers: [],
      setData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      setFiles: (patch) => set((s) => ({ files: { ...s.files, ...patch } })),
      setLeaders: (leaders) => set({ leaders }),
      setCommonMembers: (commonMembers) => set({ commonMembers }),
      reset: () =>
        set({ data: {}, files: emptyFiles(), leaders: [], commonMembers: [] }),
    }),
    {
      name: "inovatech-inscrever",
      // File objects cannot be serialized — only persist the text fields and
      // members. Images must be re-selected after a full page reload.
      partialize: (state) => ({
        data: state.data,
        leaders: state.leaders,
        commonMembers: state.commonMembers,
      }),
    }
  )
);

export function hasStep1(data: Partial<InscreverData>): boolean {
  return Boolean(
    data.name &&
      data.slogan &&
      data.projectDescription &&
      data.targetAudience &&
      data.productDescription &&
      data.projectViability
  );
}

export function hasStep2(data: Partial<InscreverData>): boolean {
  return Boolean(
    data.year && data.semester && data.course && data.tech && data.industry
  );
}

export function hasFiles(files: InscreverFiles): boolean {
  return (
    files.logo.length > 0 && files.team.length > 0 && files.product.length > 0
  );
}
