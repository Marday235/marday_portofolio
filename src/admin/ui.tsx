import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { cn, errorMessage } from "@/lib/utils";
import type { Localized } from "@/lib/i18n";
import { useToken } from "./session";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center text-muted">
      <p className="max-w-sm text-pretty">{children}</p>
      {action}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card h-16 animate-pulse" />
      ))}
    </div>
  );
}

/** Champ bilingue : onglets FR / EN. Le FR est obligatoire, l'EN facultatif. */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline,
  rows = 4,
  required,
  hint,
}: {
  label: string;
  value: Localized;
  onChange: (v: Localized) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  const [tab, setTab] = useState<"fr" | "en">("fr");
  const Comp = multiline ? Textarea : Input;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-fg/90">
          {label} {required && <span className="text-td-red">*</span>}
        </span>
        <div className="flex rounded-full border border-white/10 p-0.5 text-[11px] font-semibold">
          {(["fr", "en"] as const).map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setTab(l)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 uppercase cursor-pointer",
                tab === l ? "bg-white/10 text-fg" : "text-muted",
              )}
            >
              {l}
              {l === "en" && !value.en.trim() && value.fr.trim() && <span className="size-1.5 rounded-full bg-td-yellow" title="Pas encore traduit" />}
            </button>
          ))}
        </div>
      </div>
      <Comp
        value={value[tab]}
        rows={multiline ? rows : undefined}
        required={required && tab === "fr"}
        placeholder={tab === "en" ? value.fr || "English version (optional)" : undefined}
        onChange={(e) => onChange({ ...value, [tab]: e.target.value })}
      />
      <span className="block text-xs text-muted">
        {hint ?? (tab === "en" ? "Si vide, le site affiche le texte français." : "")}
      </span>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm cursor-pointer"
    >
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-emerald-500" : "bg-white/15")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

/** Bouton de suppression en deux temps : premier clic = confirmation. */
export function ConfirmDelete({ onConfirm, label = "Supprimer" }: { onConfirm: () => Promise<unknown> | void; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Button
      type="button"
      size="sm"
      variant={armed ? "danger" : "ghost"}
      onClick={async () => {
        if (!armed) return setArmed(true);
        try {
          await onConfirm();
          toast.success("Supprimé");
        } catch (e) {
          toast.error(errorMessage(e));
        }
      }}
      aria-label={label}
    >
      <Trash2 /> {armed ? "Confirmer ?" : <span className="sr-only sm:not-sr-only">{label}</span>}
    </Button>
  );
}

export function MoveButtons({
  table,
  id,
  first,
  last,
}: {
  table: "projects" | "timeline" | "skills" | "testimonials" | "gallery";
  id: string;
  first: boolean;
  last: boolean;
}) {
  const move = useMutation(api.admin.move);
  const token = useToken();
  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={first}
        onClick={() => move({ token, table, id, direction: "up" })}
        className="rounded p-0.5 text-muted hover:text-fg disabled:opacity-20 cursor-pointer"
        aria-label="Monter"
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        disabled={last}
        onClick={() => move({ token, table, id, direction: "down" })}
        className="rounded p-0.5 text-muted hover:text-fg disabled:opacity-20 cursor-pointer"
        aria-label="Descendre"
      >
        <ArrowDown className="size-4" />
      </button>
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "green" | "yellow" | "blue" }) {
  const tones = {
    default: "bg-white/5 text-muted border-white/10",
    green: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    yellow: "bg-td-yellow/10 text-td-yellow border-td-yellow/20",
    blue: "bg-td-blue/10 text-[#7ea3ff] border-td-blue/20",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone])}>{children}</span>;
}

export const emptyL = (): Localized => ({ fr: "", en: "" });

/** Retire les champs système avant d'envoyer un document à une mutation "save". */
export function stripMeta<T extends { _id: unknown; _creationTime: number; order: number }>(doc: T): Omit<T, "_id" | "_creationTime" | "order"> {
  const { _id, _creationTime, order, ...rest } = doc;
  void _id;
  void _creationTime;
  void order;
  return rest;
}
