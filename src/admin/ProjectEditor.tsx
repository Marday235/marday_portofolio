import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ImagePlus, LoaderCircle, Save, Star, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { compressImage, uploadToConvex } from "@/lib/upload";
import { errorMessage } from "@/lib/utils";
import type { Localized } from "@/lib/i18n";
import { useToken } from "./session";
import { Loading, LocalizedField, PageHeader, emptyL } from "./ui";

type Img = { kind: "upload"; id: Id<"_storage">; url: string } | { kind: "static"; url: string };

type Form = {
  slug: string;
  title: Localized;
  summary: Localized;
  problem: Localized;
  solution: Localized;
  techs: string;
  liveUrl: string;
  githubUrl: string;
  year: number;
  category: "main" | "other";
  status: "draft" | "published";
};

const blank = (): Form => ({
  slug: "",
  title: emptyL(),
  summary: emptyL(),
  problem: emptyL(),
  solution: emptyL(),
  techs: "",
  liveUrl: "",
  githubUrl: "",
  year: new Date().getFullYear(),
  category: "main",
  status: "draft",
});

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const token = useToken();
  const navigate = useNavigate();
  const projects = useQuery(api.admin.listProjects, { token });
  const save = useMutation(api.admin.saveProject);
  const uploadUrl = useMutation(api.admin.generateUploadUrl);
  const deleteUpload = useMutation(api.admin.deleteUpload);

  const [form, setForm] = useState<Form | null>(isNew ? blank() : null);
  const [images, setImages] = useState<Img[]>([]);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const savedIds = useRef<Set<string>>(new Set());

  // Charge le projet existant une seule fois
  useEffect(() => {
    if (isNew || form || !projects) return;
    const p = projects.find((x) => x._id === id);
    if (!p) return;
    setForm({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      problem: p.problem,
      solution: p.solution,
      techs: p.techs.join(", "),
      liveUrl: p.liveUrl ?? "",
      githubUrl: p.githubUrl ?? "",
      year: p.year,
      category: p.category,
      status: p.status,
    });
    savedIds.current = new Set(p.imageIds);
    setImages([
      ...p.uploaded.filter((u) => u.url).map((u) => ({ kind: "upload" as const, id: u.id, url: u.url! })),
      ...p.staticImages.map((url) => ({ kind: "static" as const, url })),
    ]);
  }, [isNew, form, projects, id]);

  if (!isNew && projects && !projects.some((x) => x._id === id)) {
    return <p className="text-muted">Projet introuvable.</p>;
  }
  if (!form) return <Loading />;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const blob = await compressImage(file);
        const storageId = await uploadToConvex(await uploadUrl({ token }), blob);
        setImages((imgs) => [...imgs, { kind: "upload", id: storageId, url: URL.createObjectURL(blob) }]);
      } catch (e) {
        toast.error(`${file.name} : ${errorMessage(e)}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function removeImage(i: number) {
    const img = images[i];
    // Fichier envoyé mais jamais enregistré : on le supprime tout de suite
    if (img.kind === "upload" && !savedIds.current.has(img.id)) void deleteUpload({ token, storageId: img.id });
    setImages(images.filter((_, k) => k !== i));
  }

  function makeCover(i: number) {
    setImages([images[i], ...images.filter((_, k) => k !== i)]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await save({
        token,
        id: isNew ? undefined : (id as Id<"projects">),
        data: {
          slug: form.slug,
          title: form.title,
          summary: form.summary,
          problem: form.problem,
          solution: form.solution,
          techs: form.techs.split(",").map((s) => s.trim()).filter(Boolean),
          liveUrl: form.liveUrl.trim() || undefined,
          githubUrl: form.githubUrl.trim() || undefined,
          year: Number(form.year) || new Date().getFullYear(),
          featured: form.category === "main",
          category: form.category,
          status: form.status,
          imageIds: images.filter((i) => i.kind === "upload").map((i) => (i as { id: Id<"_storage"> }).id),
          staticImages: images.filter((i) => i.kind === "static").map((i) => i.url),
        },
      });
      toast.success(form.status === "published" ? "Projet enregistré et visible sur le site" : "Brouillon enregistré");
      navigate("/admin/projets");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pb-24">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
        <Link to="/admin/projets">
          <ArrowLeft /> Tous les projets
        </Link>
      </Button>
      <PageHeader title={isNew ? "Nouveau projet" : form.title.fr || "Projet"} />

      <div className="space-y-6">
        <section className="card space-y-5 p-5 sm:p-6">
          <LocalizedField label="Titre" required value={form.title} onChange={(v) => set("title", v)} />
          <LocalizedField label="Résumé (une phrase)" required value={form.summary} onChange={(v) => set("summary", v)} multiline rows={2} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Année">
              <Input type="number" min={2000} max={2100} value={form.year} onChange={(e) => set("year", Number(e.target.value))} />
            </Field>
            <Field label="Type">
              <Select value={form.category} onChange={(e) => set("category", e.target.value as Form["category"])}>
                <option value="main">Principal (en grand)</option>
                <option value="other">Autre (petite carte)</option>
              </Select>
            </Field>
            <Field label="Statut">
              <Select value={form.status} onChange={(e) => set("status", e.target.value as Form["status"])}>
                <option value="draft">Brouillon (caché)</option>
                <option value="published">Publié (visible)</option>
              </Select>
            </Field>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Captures d'écran</h2>
              <p className="text-xs text-muted">La première est l'image de couverture. Compressées automatiquement.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading > 0}>
              {uploading > 0 ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
              {uploading > 0 ? `Envoi (${uploading})…` : "Ajouter"}
            </Button>
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => (onFiles(e.target.files), (e.target.value = ""))} />
          </div>
          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 py-10 text-sm text-muted hover:border-white/30 hover:text-fg cursor-pointer"
            >
              <ImagePlus className="size-6" /> Ajoutez 3 à 5 captures de votre projet
            </button>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, i) => (
                <li key={img.url} className="group relative overflow-hidden rounded-xl border border-white/10">
                  <img src={img.url} alt="" className="aspect-[16/10] w-full object-cover object-top" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-td-yellow px-2 py-0.5 text-[10px] font-bold text-ink">COUVERTURE</span>}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    {i > 0 && (
                      <button type="button" onClick={() => makeCover(i)} className="grid size-7 place-items-center rounded-full bg-black/70 text-white cursor-pointer" title="Mettre en couverture">
                        <Star className="size-3.5" />
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(i)} className="grid size-7 place-items-center rounded-full bg-black/70 text-white cursor-pointer" title="Retirer">
                      <X className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card space-y-5 p-5 sm:p-6">
          <h2 className="font-semibold">Page détaillée</h2>
          <LocalizedField label="Le problème" value={form.problem} onChange={(v) => set("problem", v)} multiline hint="Quelle situation le client vivait-il avant ?" />
          <LocalizedField label="La solution" value={form.solution} onChange={(v) => set("solution", v)} multiline hint="Ce que vous avez construit et ce que ça a changé." />
          <Field label="Technologies" hint="Séparées par des virgules : React, Convex, Tailwind">
            <Input value={form.techs} onChange={(e) => set("techs", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lien du site en ligne">
              <Input type="url" placeholder="https://" value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
            </Field>
            <Field label="Lien GitHub">
              <Input type="url" placeholder="https://github.com/…" value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
            </Field>
          </div>
          <Field label="Adresse de la page" hint={`Laissez vide pour la générer depuis le titre. Page : /projets/${form.slug || "…"}`}>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="mon-projet" />
          </Field>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 backdrop-blur-xl lg:left-[240px]">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 py-3 sm:px-8">
          <Button asChild variant="ghost">
            <Link to="/admin/projets">Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving || uploading > 0}>
            {saving ? <LoaderCircle className="animate-spin" /> : <Save />} Enregistrer
          </Button>
        </div>
      </div>
    </form>
  );
}
