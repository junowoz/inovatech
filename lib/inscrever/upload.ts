import { createClient } from "@/lib/supabase/client";
import type { InscreverFiles } from "@/lib/stores/inscrever-store";

export interface UploadedPaths {
  logo: string[];
  team: string[];
  product: string[];
}

/**
 * Uploads the project images directly to Supabase Storage from the browser
 * (efficient, avoids routing large files through the server) and returns the
 * resulting storage paths to be persisted by the submit action.
 */
export async function uploadProjectImages(
  projectUUID: string,
  files: InscreverFiles
): Promise<UploadedPaths> {
  const supabase = createClient();

  const uploadGroup = async (group: File[], kind: string) => {
    const paths: string[] = [];
    for (const file of group) {
      const path = `${kind}/${projectUUID}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("midia")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  };

  const [logo, team, product] = await Promise.all([
    uploadGroup(files.logo, "logo"),
    uploadGroup(files.team, "team"),
    uploadGroup(files.product, "product"),
  ]);

  return { logo, team, product };
}
