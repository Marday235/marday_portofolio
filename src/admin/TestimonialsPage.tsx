import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { errorMessage } from "@/lib/utils";
import { useToken } from "./session";
import { Badge, ConfirmDelete, Empty, Loading, LocalizedField, MoveButtons, PageHeader, stripMeta, Toggle, emptyL } from "./ui";

type Item = Omit<Doc<"testimonials">, "_id" | "_creationTime" | "order">;

function Editor({ id, initial, onDone }: { id?: Id<"testimonials">; initial: Item; onDone: () => void }) {
  const token = useToken();
  const save = useMutation(api.admin.saveTestimonial);
  const [f, setF] = useState(initial);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await save({ token, id, data: f });
      toast.success("Enregistré");
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }
  return (
    <form onSubmit={submit} className="card space-y-4 border-td-yellow/30 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom du client">
          <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Rôle, entreprise">
          <Input value={f.role} placeholder="Président, ASEEST/D" onChange={(e) => setF({ ...f, role: e.target.value })} />
        </Field>
      </div>
      <LocalizedField label="Témoignage" required value={f.quote} onChange={(v) => setF({ ...f, quote: v })} multiline rows={3} hint="Ses vrais mots, avec son accord." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Toggle checked={f.published} onChange={(v) => setF({ ...f, published: v })} label="Visible sur le site" />
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Annuler
          </Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </div>
    </form>
  );
}

export default function TestimonialsPage() {
  const token = useToken();
  const items = useQuery(api.admin.listTestimonials, { token });
  const remove = useMutation(api.admin.removeTestimonial);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Témoignages"
        description="La section n'apparaît sur le site qu'à partir d'un témoignage visible."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus /> Ajouter
          </Button>
        }
      />
      <div className="space-y-3">
        {editing === "new" && <Editor initial={{ name: "", role: "", quote: emptyL(), published: true }} onDone={() => setEditing(null)} />}
        {items === undefined ? (
          <Loading />
        ) : items.length === 0 && editing !== "new" ? (
          <Empty>Pas encore de témoignage. Demandez quelques mots à vos clients satisfaits : c'est ce qui convainc le plus.</Empty>
        ) : (
          items.map((t, i) =>
            editing === t._id ? (
              <Editor key={t._id} id={t._id} initial={stripMeta(t)} onDone={() => setEditing(null)} />
            ) : (
              <div key={t._id} className="card flex items-center gap-3 p-4">
                <MoveButtons table="testimonials" id={t._id} first={i === 0} last={i === items.length - 1} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {t.name} {t.published ? <Badge tone="green">Visible</Badge> : <Badge>Caché</Badge>}
                  </p>
                  <p className="truncate text-sm text-muted">« {t.quote.fr} »</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setEditing(t._id)} aria-label="Modifier">
                  <Pencil />
                </Button>
                <ConfirmDelete onConfirm={() => remove({ token, id: t._id })} />
              </div>
            ),
          )
        )}
      </div>
    </>
  );
}
