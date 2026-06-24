import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full max-w-sm rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
