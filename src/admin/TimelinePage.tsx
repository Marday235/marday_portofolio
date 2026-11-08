import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Briefcase, GraduationCap, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { errorMessage } from "@/lib/utils";
import { useToken } from "./session";
import { ConfirmDelete, Empty, Loading, LocalizedField, MoveButtons, PageHeader, stripMeta, emptyL } from "./ui";

type Item = Omit<Doc<"timeline">, "_id" | "_creationTime" | "order">;
const blank = (): Item => ({ kind: "work", title: emptyL(), place: "", start: "", end: "", description: emptyL() });

function Editor({ id, initial, onDone }: { id?: Id<"timeline">; initial: Item; onDone: () => void }) {
  const token = useToken();
  const save = useMutation(api.admin.saveTimeline);
  const [f, setF] = useState(initial);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await save({ token, id, data: { ...f, end: f.end?.trim() || undefined } });
      toast.success("Enregistré");
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }
  return (
    <form onSubmit={submit} className="card space-y-4 border-td-yellow/30 p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type">
          <Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Item["kind"] })}>
            <option value="work">Expérience</option>
            <option value="education">Formation</option>
          </Select>
        </Field>
        <Field label="Début">
          <Input required placeholder="2022 ou sept. 2022" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
        </Field>
        <Field label="Fin" hint="Vide = « aujourd'hui »">
          <Input placeholder="2024" value={f.end ?? ""} onChange={(e) => setF({ ...f, end: e.target.value })} />
        </Field>
      </div>
      <LocalizedField label="Poste ou diplôme" required value={f.title} onChange={(v) => setF({ ...f, title: v })} />
      <Field label="Entreprise / école, ville">
        <Input value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} placeholder="Université de Douala" />
      </Field>
      <LocalizedField label="Description" value={f.description} onChange={(v) => setF({ ...f, description: v })} multiline rows={3} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
}

export default function TimelinePage() {
  const token = useToken();
  const items = useQuery(api.admin.listTimeline, { token });
  const remove = useMutation(api.admin.removeTimeline);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Parcours"
        description="Vos formations et expériences, affichées en frise sur le site."
        action={
          <Button onClick={() => setEditing("new")} disabled={editing === "new"}>
            <Plus /> Ajouter
          </Button>
        }
      />
      <div className="space-y-3">
        {editing === "new" && <Editor initial={blank()} onDone={() => setEditing(null)} />}
        {items === undefined ? (
          <Loading />
        ) : items.length === 0 && editing !== "new" ? (
          <Empty>Votre parcours est vide. Ajoutez vos études et vos expériences : c'est ce que les recruteurs regardent en premier.</Empty>
        ) : (
          items.map((it, i) =>
            editing === it._id ? (
              <Editor key={it._id} id={it._id} initial={stripMeta(it)} onDone={() => setEditing(null)} />
            ) : (
              <div key={it._id} className="card flex items-center gap-3 p-4">
                <MoveButtons table="timeline" id={it._id} first={i === 0} last={i === items.length - 1} />
                {it.kind === "work" ? <Briefcase className="size-4 text-td-blue" /> : <GraduationCap className="size-4 text-td-yellow" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{it.title.fr}</p>
                  <p className="truncate text-sm text-muted">
                    {it.start} — {it.end || "aujourd'hui"} {it.place && `· ${it.place}`}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setEditing(it._id)} aria-label="Modifier">
                  <Pencil />
                </Button>
                <ConfirmDelete onConfirm={() => remove({ token, id: it._id })} />
              </div>
            ),
          )
        )}
      </div>
    </>
  );
}
