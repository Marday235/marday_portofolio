import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Eye, EyeOff, ImagePlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { compressImage, uploadToConvex } from "@/lib/upload";
import { cn, errorMessage } from "@/lib/utils";
import { useToken } from "./session";
import { ConfirmDelete, Empty, Loading, MoveButtons, PageHeader } from "./ui";

type Row = Doc<"gallery"> & { url: string | null };

function PhotoCard({ g, first, last }: { g: Row; first: boolean; last: boolean }) {
  const token = useToken();
  const update = useMutation(api.admin.updateGalleryPhoto);
  const remove = useMutation(api.admin.removeGalleryPhoto);
  const [caption, setCaption] = useState(g.caption);
  const dirty = caption.fr !== g.caption.fr || caption.en !== g.caption.en;

  const save = (published = g.published) =>
    update({ token, id: g._id, caption, published }).catch((e) => toast.error(errorMessage(e)));

  return (
    <li className={cn("card overflow-hidden", !g.published && "opacity-60")}>
      <div className="relative aspect-[4/5] bg-surface-2">
        {g.url && <img src={g.url} alt="" className="h-full w-full object-cover" loading="lazy" />}
        {!g.published && <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white">Masquée</span>}
      </div>
      <div className="space-y-2 p-3">
        <Input placeholder="Légende FR (facultatif)" value={caption.fr} onChange={(e) => setCaption({ ...caption, fr: e.target.value })} onBlur={() => dirty && save()} className="h-9" />
        <Input placeholder="Caption EN" value={caption.en} onChange={(e) => setCaption({ ...caption, en: e.target.value })} onBlur={() => dirty && save()} className="h-9" />
        <div className="flex items-center gap-1">
          <MoveButtons table="gallery" id={g._id} first={first} last={last} />
          <Button size="icon" variant="ghost" title={g.published ? "Masquer" : "Afficher"} onClick={() => save(!g.published)}>
            {g.published ? <Eye /> : <EyeOff />}
          </Button>
          <span className="flex-1" />
          <ConfirmDelete onConfirm={() => remove({ token, id: g._id })} label="" />
        </div>
      </div>
    </li>
  );
}

export default function GalleryPage() {
  const token = useToken();
  const photos = useQuery(api.admin.listGallery, { token });
  const uploadUrl = useMutation(api.admin.generateUploadUrl);
  const addPhotos = useMutation(api.admin.addGalleryPhotos);
  const seed = useMutation(api.admin.seed);
  const [uploading, setUploading] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(list.length);
    const ids: Id<"_storage">[] = [];
    for (const file of list) {
      try {
        ids.push(await uploadToConvex(await uploadUrl({ token }), await compressImage(file)));
      } catch (e) {
        toast.error(`${file.name} : ${errorMessage(e)}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (ids.length) {
      await addPhotos({ token, imageIds: ids });
      toast.success(`${ids.length} photo${ids.length > 1 ? "s" : ""} ajoutée${ids.length > 1 ? "s" : ""}`);
    }
  }

  return (
    <>
      <PageHeader
        title="Galerie"
        description="Vos moments et coulisses. Les 9 premières s'affichent sur l'accueil ; toutes sont visibles dans la visionneuse."
        action={
          <Button onClick={() => input.current?.click()} disabled={uploading > 0}>
            {uploading > 0 ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
            {uploading > 0 ? `Envoi (${uploading})…` : "Ajouter des photos"}
          </Button>
        }
      />
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => (onFiles(e.target.files), (e.target.value = ""))} />
      {photos === undefined ? (
        <Loading />
      ) : photos.length === 0 ? (
        <Empty
          action={
            <Button variant="outline" onClick={() => seed({ token })}>
              Charger les photos de départ
            </Button>
          }
        >
          Aucune photo. Ajoutez les vôtres (sélection multiple possible) : elles sont compressées automatiquement.
        </Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((g, i) => (
            <PhotoCard key={g._id} g={g} first={i === 0} last={i === photos.length - 1} />
          ))}
        </ul>
      )}
    </>
  );
}
