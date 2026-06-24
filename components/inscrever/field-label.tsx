import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Mais informações"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-pretty">
            {hint}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

export function RequiredFieldsHeading() {
  return (
    <div className="my-5">
      <h2 className="font-semibold">
        Todos os campos são obrigatórios{" "}
        <span className="text-brand-accent">*</span>
      </h2>
      <p className="text-sm text-muted-foreground">
        Em caso de dúvidas, passe o mouse sobre o ícone de informação ao lado do
        campo para obter dicas.
      </p>
    </div>
  );
}
