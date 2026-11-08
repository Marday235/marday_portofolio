import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { FileText, LoaderCircle, Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { uploadToConvex } from "@/lib/upload";
import { errorMessage, whatsappLink } from "@/lib/utils";
import type { Localized } from "@/lib/i18n";
import { useToken } from "./session";
import { Loading, LocalizedField, PageHeader } from "./ui";

type Stat = { value: number; suffix: string; label: Localized };
type Form = {
  tagline: Localized;
  available: boolean;
  stats: Stat[];
  whatsapp: string;
  email: string;
  github: string;
  x: string;
  facebook: string;
  linkedin: string;
};

function CvSlot({ lang, url }: { lang: "fr" | "en"; url: string | null }) {
  const token = useToken();
  const uploadUrl = useMutation(api.admin.generateUploadUrl);
  const setCv = useMutation(api.admin.setCv);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf") return toast.error("Le CV doit être un fichier PDF.");
    if (file.size > 10 * 1024 * 1024) return toast.error("PDF trop lourd (10 Mo max).");
    setBusy(true);
    try {
      const id = await uploadToConvex(await uploadUrl({ token }), file);
      await setCv({ token, lang, storageId: id });
      toast.success(`CV ${lang.toUpperCase()} mis à jour`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
      <FileText className="size-5 text-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">CV {lang === "fr" ? "français" : "anglais"}</p>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-td-yellow hover:underline">
            Voir le PDF actuel
          </a>
        ) : (
          <p className="text-xs text-muted">Aucun fichier</p>
        )}
      </div>
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ""))} />
      <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? <LoaderCircle className="animate-spin" /> : <Upload />} {url ? "Remplacer" : "Déposer"}
      </Button>
      {url && (
        <Button type="button" size="icon" variant="ghost" aria-label="Retirer" onClick={() => setCv({ token, lang })}>
          <Trash2 />
        </Button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const token = useToken();
  const settings = useQuery(api.admin.getSettings, { token });
  const save = useMutation(api.admin.saveSettings);
  const [f, setF] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && !f) {
      const { tagline, available, stats, whatsapp, email, github, x, facebook, linkedin } = settings;
      setF({ tagline, available, stats, whatsapp, email, github, x, facebook, linkedin });
    }
  }, [settings, f]);

  if (!settings || !f) return <Loading />;
  const setStat = (i: number, s: Partial<Stat>) => setF({ ...f, stats: f.stats.map((x, k) => (k === i ? { ...x, ...s } : x)) });
  const wa = whatsappLink(f.whatsapp);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f) return;
    setSaving(true);
    try {
      await save({ token, data: { ...f, available: settings!.available, stats: f.stats.map((s) => ({ ...s, value: Number(s.value) || 0 })) } });
      toast.success("Réglages enregistrés");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-10">
      <PageHeader
        title="Réglages"
        description="Texte d'accroche, chiffres, coordonnées et CV."
        action={
          <Button type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="animate-spin" /> : <Save />} Enregistrer
          </Button>
        }
      />

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-semibold">Accueil</h2>
        <LocalizedField label="Phrase d'accroche" required value={f.tagline} onChange={(v) => setF({ ...f, tagline: v })} multiline rows={2} />
        <p className="text-xs text-muted">Le badge « Disponible pour missions » se règle avec l'interrupteur du menu.</p>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Chiffres</h2>
          <p className="text-xs text-muted">Uniquement des chiffres vrais. 3 chiffres, c'est l'idéal.</p>
        </div>
        {f.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px] gap-3 rounded-xl border border-white/10 p-3 sm:grid-cols-[90px_70px_1fr_1fr_auto] sm:items-end">
            <Field label="Nombre">
              <Input type="number" min={0} value={s.value} onChange={(e) => setStat(i, { value: Number(e.target.value) })} />
            </Field>
            <Field label="Suffixe">
              <Input value={s.suffix} placeholder="+" maxLength={3} onChange={(e) => setStat(i, { suffix: e.target.value })} />
            </Field>
            <Field label="Texte FR" className="col-span-2 sm:col-span-1">
              <Input value={s.label.fr} onChange={(e) => setStat(i, { label: { ...s.label, fr: e.target.value } })} />
            </Field>
            <Field label="Texte EN" className="col-span-2 sm:col-span-1">
              <Input value={s.label.en} onChange={(e) => setStat(i, { label: { ...s.label, en: e.target.value } })} />
            </Field>
            <Button type="button" size="icon" variant="ghost" className="col-span-2 justify-self-end sm:col-span-1" aria-label="Retirer" onClick={() => setF({ ...f, stats: f.stats.filter((_, k) => k !== i) })}>
              <Trash2 />
            </Button>
          </div>
        ))}
        {f.stats.length < 4 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setF({ ...f, stats: [...f.stats, { value: 0, suffix: "", label: { fr: "", en: "" } }] })}>
            <Plus /> Ajouter un chiffre
          </Button>
        )}
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-semibold">Coordonnées</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Numéro WhatsApp"
            hint={
              wa ? (
                <a href={wa} target="_blank" rel="noreferrer" className="text-td-yellow hover:underline">
                  Tester le lien
                </a>
              ) : (
                "Avec l'indicatif : +237 6XX XX XX XX. Vide = bouton masqué."
              )
            }
          >
            <Input type="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} placeholder="+237 6…" />
          </Field>
          <Field label="Email affiché sur le site">
            <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="GitHub">
            <Input type="url" value={f.github} onChange={(e) => setF({ ...f, github: e.target.value })} />
          </Field>
          <Field label="LinkedIn" hint="Vide = icône masquée">
            <Input type="url" value={f.linkedin} onChange={(e) => setF({ ...f, linkedin: e.target.value })} />
          </Field>
          <Field label="X (Twitter)">
            <Input type="url" value={f.x} onChange={(e) => setF({ ...f, x: e.target.value })} />
          </Field>
          <Field label="Facebook">
            <Input type="url" value={f.facebook} onChange={(e) => setF({ ...f, facebook: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="card space-y-3 p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">CV</h2>
          <p className="text-xs text-muted">Le bouton « CV » du site télécharge la version de la langue choisie (ou l'autre si elle manque). Enregistré immédiatement.</p>
        </div>
        <CvSlot lang="fr" url={settings.cvFrUrl} />
        <CvSlot lang="en" url={settings.cvEnUrl} />
      </section>
    </form>
  );
}
