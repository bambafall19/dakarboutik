"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MarjiAssistant } from "./marji-assistant";

export function MarjiHelp({ productId }: { productId?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("dakarboutik:open-help", show);
    return () => window.removeEventListener("dakarboutik:open-help", show);
  }, []);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <button type="button" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-40 flex min-h-12 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border-2 border-white bg-emerald-900 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:bottom-6 md:right-6" aria-label="Une question à MARJI ? Ouvrir l’assistant">
        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> Une question à MARJI ?
      </button>
    </DialogTrigger>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-2xl p-4 sm:p-5">
      <DialogTitle className="pr-8 text-xl text-emerald-950">Votre assistant MARJI</DialogTitle>
      <DialogDescription>Choisissez une action. Le vendeur confirme les senteurs et les modalités de votre achat.</DialogDescription>
      <MarjiAssistant productId={productId} />
    </DialogContent>
    <div className="h-20" aria-hidden="true" />
  </Dialog>;
}
