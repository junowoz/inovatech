import "server-only";

import { putObject, removeObjects } from "@/lib/storage";
import {
  FILE_SIZE_LIMIT,
  FILE_NAME_REGEX,
  SUPPORTED_IMAGE_TYPES,
} from "@/lib/validations/inscrever";

export type ImageGroup = "logo" | "team" | "product";
export type UploadedPaths = Record<ImageGroup, string[]>;

const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const GROUP_LIMITS: Record<ImageGroup, number> = {
  logo: 1,
  team: 1,
  product: 3,
};
const EXTENSION_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function detectedImageType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return "image/png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "image/jpeg";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}

export function filesFromForm(form: FormData): Record<ImageGroup, File[]> {
  const groups = { logo: [], team: [], product: [] } as Record<
    ImageGroup,
    File[]
  >;
  let totalBytes = 0;

  for (const kind of ["logo", "team", "product"] as const) {
    const entries = form.getAll(kind);
    if (entries.length < 1 || entries.length > GROUP_LIMITS[kind]) {
      throw new Error("Quantidade de imagens inválida.");
    }
    for (const entry of entries) {
      if (!(entry instanceof File)) throw new Error("Imagem inválida.");
      const extension = entry.name.split(".").pop()?.toLowerCase() ?? "";
      if (
        entry.size === 0 ||
        entry.size > FILE_SIZE_LIMIT ||
        !SUPPORTED_IMAGE_TYPES.includes(entry.type) ||
        EXTENSION_TYPE[extension] !== entry.type ||
        !FILE_NAME_REGEX.test(entry.name)
      ) {
        throw new Error("Formato, nome ou tamanho de imagem inválido.");
      }
      totalBytes += entry.size;
      groups[kind].push(entry);
    }
  }

  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("As imagens somadas devem ter até 25 MB.");
  }
  return groups;
}

/** The only caller is the registration action; paths never come from the client. */
export async function uploadProjectImages(
  projectUUID: string,
  files: Record<ImageGroup, File[]>
): Promise<UploadedPaths> {
  const uploaded: UploadedPaths = { logo: [], team: [], product: [] };
  const created: string[] = [];
  try {
    for (const kind of ["logo", "team", "product"] as const) {
      for (const file of files[kind]) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (detectedImageType(bytes) !== file.type) {
          throw new Error(
            "O conteúdo da imagem não corresponde ao formato informado."
          );
        }
        const path = `${kind}/${projectUUID}/${crypto.randomUUID()}-${file.name}`;
        await putObject(path, bytes, file.type);
        created.push(path);
        uploaded[kind].push(path);
      }
    }
    return uploaded;
  } catch (error) {
    if (created.length > 0) await removeObjects(created);
    throw error;
  }
}
