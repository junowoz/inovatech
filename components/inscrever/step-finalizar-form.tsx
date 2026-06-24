"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { submitProjectAction } from "@/app/actions/inscrever";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { uploadProjectImages } from "@/lib/inscrever/upload";
import {
  hasFiles,
  hasStep1,
  hasStep2,
  useInscreverStore,
  type LeaderInput,
} from "@/lib/stores/inscrever-store";
import { leaderSchema } from "@/lib/validations/inscrever";
import { cn } from "@/lib/utils";
import { FieldError } from "./field-label";
import { InscreverProgress } from "./inscrever-progress";
import { InscreverSucesso } from "./inscrever-sucesso";
import { MembrosMensagem } from "./membros-mensagem";
import { TagsInput } from "./tags-input";

const newLeader = (isFounder: boolean): LeaderInput => ({
  id: crypto.randomUUID(),
  name: "",
  contact: "",
  isFounder,
});

type LeaderErrors = Record<string, { name?: string; contact?: string }>;

export function StepFinalizarForm() {
  const router = useRouter();
  const reset = useInscreverStore((s) => s.reset);
  const persistLeaders = useInscreverStore((s) => s.setLeaders);
  const persistCommon = useInscreverStore((s) => s.setCommonMembers);

  const hydrated = useHydrated();
  const [leaders, setLeaders] = useState<LeaderInput[]>(() => {
    const stored = useInscreverStore.getState().leaders;
    return stored.length > 0 ? stored : [newLeader(true)];
  });
  const [commonMembers, setCommonMembers] = useState<string[]>(
    () => useInscreverStore.getState().commonMembers
  );
  const [leaderErrors, setLeaderErrors] = useState<LeaderErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const state = useInscreverStore.getState();
    if (!hasStep1(state.data) || !hasStep2(state.data)) {
      router.replace("/inscrever/um");
      return;
    }
    if (!hasFiles(state.files)) {
      toast.info("Selecione novamente as imagens do projeto.");
      router.replace("/inscrever/tres");
    }
  }, [router]);

  useEffect(() => {
    if (!hydrated) return;
    persistLeaders(leaders);
    persistCommon(commonMembers);
  }, [leaders, commonMembers, hydrated, persistLeaders, persistCommon]);

  const isValid = useMemo(
    () => leaders.some((l) => l.name.trim() !== "" && l.contact.trim() !== ""),
    [leaders]
  );

  const updateLeader = (id: string, patch: Partial<LeaderInput>) =>
    setLeaders((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const addLeader = () =>
    setLeaders((prev) =>
      prev.length < 10 ? [...prev, newLeader(false)] : prev
    );

  const removeLeader = (id: string) =>
    setLeaders((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));

  const handleBack = () => {
    persistLeaders(leaders);
    persistCommon(commonMembers);
    router.push("/inscrever/tres");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const parsed = z
      .array(leaderSchema)
      .min(1)
      .safeParse(
        leaders.map((l) => ({
          name: l.name,
          contact: l.contact,
          isFounder: l.isFounder,
        }))
      );

    if (!parsed.success) {
      const errs: LeaderErrors = {};
      for (const issue of parsed.error.issues) {
        const idx = issue.path[0];
        const field = issue.path[1];
        if (
          typeof idx === "number" &&
          (field === "name" || field === "contact")
        ) {
          const id = leaders[idx]?.id;
          if (id) errs[id] = { ...errs[id], [field]: issue.message };
        }
      }
      setLeaderErrors(errs);
      toast.error("Verifique os dados dos fundadores.");
      return;
    }

    setLeaderErrors({});
    setSubmitting(true);

    try {
      const state = useInscreverStore.getState();
      const d = state.data;
      const projectUUID = crypto.randomUUID();
      const images = await uploadProjectImages(projectUUID, state.files);

      const result = await submitProjectAction({
        projectUUID,
        name: d.name ?? "",
        slogan: d.slogan ?? "",
        projectDescription: d.projectDescription ?? "",
        targetAudience: d.targetAudience ?? "",
        productDescription: d.productDescription ?? "",
        projectViability: d.projectViability ?? "",
        link: d.link ?? "",
        year: Number(d.year),
        semester: Number(d.semester),
        course: Number(d.course),
        tech: Number(d.tech),
        industry: Number(d.industry),
        images,
        leaders: leaders.map((l) => ({
          name: l.name.trim(),
          contact: l.contact.trim(),
          isFounder: l.isFounder,
        })),
        commonMembers,
      });

      if (result.error) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }

      reset();
      setSuccess(true);
    } catch (error) {
      console.error("[inscrever] submit:", error);
      toast.error("Erro ao enviar a inscrição. Tente novamente.");
      setSubmitting(false);
    }
  };

  if (!hydrated) return null;
  if (success) return <InscreverSucesso />;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <InscreverProgress step={4} />
      <MembrosMensagem />

      <div>
        <h2 className="mb-2 font-semibold text-secondary-foreground">Membros</h2>
        <Card>
          <CardContent>
            <TagsInput
              value={commonMembers}
              onChange={setCommonMembers}
              placeholder="Nomes dos membros (separados por vírgula ou Enter)"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-secondary-foreground">Fundadores</h2>
        {leaders.map((leader, index) => (
          <Card key={leader.id}>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <Label htmlFor={`name-${leader.id}`} className="sr-only">
                    Nome do fundador
                  </Label>
                  <Input
                    id={`name-${leader.id}`}
                    placeholder="Nome"
                    value={leader.name}
                    onChange={(e) =>
                      updateLeader(leader.id, { name: e.target.value })
                    }
                    aria-invalid={Boolean(leaderErrors[leader.id]?.name)}
                  />
                  <FieldError message={leaderErrors[leader.id]?.name} />
                </div>

                <div className="flex w-full sm:w-auto sm:shrink-0">
                  <Button
                    type="button"
                    variant={leader.isFounder ? "default" : "outline"}
                    className="flex-1 rounded-r-none sm:flex-initial"
                    onClick={() => updateLeader(leader.id, { isFounder: true })}
                  >
                    Fundador
                  </Button>
                  <Button
                    type="button"
                    variant={!leader.isFounder ? "default" : "outline"}
                    className="flex-1 rounded-l-none sm:flex-initial"
                    onClick={() => updateLeader(leader.id, { isFounder: false })}
                  >
                    Cofundador
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover fundador"
                  onClick={() => removeLeader(leader.id)}
                  disabled={index === 0 || leaders.length === 1}
                  className={cn(leaders.length === 1 && "opacity-50")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor={`contact-${leader.id}`} className="sr-only">
                  LinkedIn ou Email
                </Label>
                <Input
                  id={`contact-${leader.id}`}
                  placeholder="LinkedIn ou Email"
                  value={leader.contact}
                  onChange={(e) =>
                    updateLeader(leader.id, { contact: e.target.value })
                  }
                  aria-invalid={Boolean(leaderErrors[leader.id]?.contact)}
                />
                <FieldError message={leaderErrors[leader.id]?.contact} />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={addLeader}
            disabled={leaders.length >= 10}
          >
            <UserPlus className="size-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ChevronLeft className="size-4" />
          Voltar
        </Button>
        <Button type="submit" variant="brand" disabled={!isValid || submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Finalizar Inscrição
        </Button>
      </div>
      {!isValid && (
        <p className="text-right text-sm text-muted-foreground">
          Preencha ao menos um fundador com nome e contato.
        </p>
      )}
    </form>
  );
}
