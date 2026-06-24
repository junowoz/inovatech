import { Progress } from "@/components/ui/progress";

const VALUES = [25, 50, 75, 100] as const;

export function InscreverProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  const value = VALUES[step - 1];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Passo {step} de 4</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
