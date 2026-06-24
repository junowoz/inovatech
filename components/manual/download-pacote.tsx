"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const FILES_URL = process.env.NEXT_PUBLIC_FILES_URL;
const FILE_NAME = "pacote-inovatech.zip";

export function DownloadPacote() {
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    if (!FILES_URL) {
      toast.error("Download indisponível no momento.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${FILES_URL}pacote-inovatec.zip`);
      if (!response.ok) throw new Error("Falha ao baixar");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = FILE_NAME;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Falha no download. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Download do Pacote Inovatech
    </Button>
  );
}
