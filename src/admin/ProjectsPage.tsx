import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { Eye, EyeOff, Pencil, Plus, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import ProjectCover from "@/components/site/ProjectCover";
import { errorMessage } from "@/lib/utils";
import { useToken } from "./session";
import { Badge, ConfirmDelete, Empty, Loading, MoveButtons, PageHeader } from "./ui";

export default function ProjectsPage() {
  const token = useToken();
  const projects = useQuery(api.admin.listProjects, { token });
  const save = useMutation(api.admin.saveProject);
  const remove = useMutation(api.admin.removeProject);
  const seed = useMutation(api.admin.seed);

  type Row = NonNullable<typeof projects>[number];
  async function patch(p: Row, changes: Partial<Row>) {
    const { _id, _creationTime, order, uploaded, ...data } = { ...p, ...changes };
    void _creationTime;
    void order;
    void uploaded;
    try {
      await save({ token, id: _id, data });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Projets"
        description="Les projets « principaux » s'affichent en grand ; les « autres » dans la grille du dessous."
        action={
          <Button asChild>
            <Link to="/admin/projets/nouveau">
              <Plus /> Ajouter un projet
            </Link>
          </Button>
        }
      />
      {projects === undefined ? (
        <Loading />
      ) : projects.length === 0 ? (
        <Empty
          action={
            <Button
              variant="outline"
              onClick={async () => {
                await seed({ token });
                toast.success("Contenu de départ chargé : projets, compétences et parcours.");
              }}
            >
              <Sparkles /> Charger le contenu de départ
            </Button>
          }
        >
          Aucun projet. Chargez le contenu de départ (ASEEST/D, SoukTchad, vos mini-jeux, vos compétences) ou ajoutez votre premier projet.
        </Empty>
      ) : (
        <ul className="space-y-2">
          {projects.map((p, i) => {
            const cover = p.uploaded.find((u) => u.url)?.url ?? p.staticImages[0];
            return (
              <li key={p._id} className="card flex items-center gap-3 p-3 sm:gap-4">
                <MoveButtons table="projects" id={p._id} first={i === 0} last={i === projects.length - 1} />
                <Link to={`/admin/projets/${p._id}`} className="group hidden w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                  <ProjectCover image={cover ?? undefined} title={p.title.fr} slug={p.slug} className="aspect-[16/10] [&_p]:text-xs" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/projets/${p._id}`} className="block truncate font-semibold hover:text-td-yellow">
                    {p.title.fr}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.status === "published" ? <Badge tone="green">Publié</Badge> : <Badge>Brouillon</Badge>}
                    <Badge tone={p.category === "main" ? "blue" : "default"}>{p.category === "main" ? "Principal" : "Autre"}</Badge>
                    {!p.title.en.trim() && <Badge tone="yellow">EN manquant</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    title={p.status === "published" ? "Masquer (brouillon)" : "Publier"}
                    onClick={() => patch(p, { status: p.status === "published" ? "draft" : "published" })}
                  >
                    {p.status === "published" ? <Eye /> : <EyeOff />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Passer en principal / autre"
                    onClick={() => patch(p, { category: p.category === "main" ? "other" : "main" })}
                  >
                    <Star className={p.category === "main" ? "fill-td-yellow text-td-yellow" : ""} />
                  </Button>
                  <Button asChild size="icon" variant="ghost" title="Modifier">
                    <Link to={`/admin/projets/${p._id}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <ConfirmDelete onConfirm={() => remove({ token, id: p._id })} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
