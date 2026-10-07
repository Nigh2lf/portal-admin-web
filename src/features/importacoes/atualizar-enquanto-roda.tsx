"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Recarrega a lista a cada 10 s enquanto alguma importação está em andamento. */
export function AtualizarEnquantoRoda({ ativo }: { ativo: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!ativo) return;
    const timer = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(timer);
  }, [ativo, router]);
  return null;
}
