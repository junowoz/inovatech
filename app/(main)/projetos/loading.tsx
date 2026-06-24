import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="hidden h-96 rounded-xl lg:block" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
