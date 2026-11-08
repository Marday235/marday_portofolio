import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { SKILL_ICONS, skillIcon } from "@/lib/skillIcons";
import { errorMessage } from "@/lib/utils";
import { useToken } from "./session";
import { ConfirmDelete, Empty, Loading, MoveButtons, PageHeader, stripMeta } from "./ui";

type Item = Omit<Doc<"skills">, "_id" | "_creationTime" | "order">;
const CATS = { front: "Front-end", back: "Back-end", tools: "Outils" } as const;

function Editor({ id, initial, onDone }: { id?: Id<"skills">; initial: Item; onDone: () => void }) {
  const token = useToken();
  const save = useMutation(api.admin.saveSkill);
  const [f, setF] = useState(initial);
  const { icon: Icon, color } = skillIcon(f.icon);
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
    <form onSubmit={submit} className="card grid gap-4 border-td-yellow/30 p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <Field label="Nom">
        <Input required autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </Field>
      <Field label="Catégorie">
        <Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Item["category"] })}>
          {Object.entries(CATS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Icône">
        <div className="flex items-center gap-2">
          <Icon className="size-5 shrink-0" style={{ color }} />
          <Select value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })}>
            {Object.entries(SKILL_ICONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
      </Field>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit">OK</Button>
      </div>
    </form>
  );
}

export default function SkillsPage() {
  const token = useToken();
  const items = useQuery(api.admin.listSkills, { token });
  const remove = useMutation(api.admin.removeSkill);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Compétences"
        description="Groupées en Front-end, Back-end et Outils. Ne gardez que ce que vous maîtrisez vraiment."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus /> Ajouter
          </Button>
        }
      />
      <div className="space-y-2">
        {editing === "new" && <Editor initial={{ name: "", category: "front", icon: "react" }} onDone={() => setEditing(null)} />}
        {items === undefined ? (
          <Loading />
        ) : items.length === 0 && editing !== "new" ? (
          <Empty>Aucune compétence. Ajoutez-en ou chargez le contenu de départ depuis la page Projets.</Empty>
        ) : (
          items.map((s, i) => {
            if (editing === s._id) return <Editor key={s._id} id={s._id} initial={stripMeta(s)} onDone={() => setEditing(null)} />;
            const { icon: Icon, color } = skillIcon(s.icon);
            return (
              <div key={s._id} className="card flex items-center gap-3 px-4 py-2.5">
                <MoveButtons table="skills" id={s._id} first={i === 0} last={i === items.length - 1} />
                <Icon className="size-5" style={{ color }} />
                <span className="flex-1 font-medium">{s.name}</span>
                <span className="text-sm text-muted">{CATS[s.category]}</span>
                <Button size="icon" variant="ghost" onClick={() => setEditing(s._id)} aria-label="Modifier">
                  <Pencil />
                </Button>
                <ConfirmDelete onConfirm={() => remove({ token, id: s._id })} />
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
