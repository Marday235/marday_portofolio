import { useMutation, useQuery } from "convex/react";
import { Mail, MailOpen, Reply } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToken } from "./session";
import { Badge, ConfirmDelete, Empty, Loading, PageHeader } from "./ui";

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export default function MessagesPage() {
  const token = useToken();
  const messages = useQuery(api.admin.listMessages, { token });
  const setRead = useMutation(api.admin.setMessageRead);
  const remove = useMutation(api.admin.removeMessage);

  return (
    <>
      <PageHeader title="Messages reçus" description="Les messages envoyés depuis le formulaire de contact du site." />
      {messages === undefined ? (
        <Loading />
      ) : messages.length === 0 ? (
        <Empty>Aucun message pour l'instant. Ils apparaîtront ici dès qu'un visiteur vous écrira.</Empty>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m._id} className={cn("card p-5", !m.read && "border-td-yellow/30 bg-td-yellow/[0.03]")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    {!m.read && <span className="size-2 shrink-0 rounded-full bg-td-yellow" />}
                    {m.name}
                    <Badge>{m.lang.toUpperCase()}</Badge>
                  </p>
                  <a href={`mailto:${m.email}`} className="text-sm text-muted hover:text-fg">
                    {m.email}
                  </a>
                </div>
                <time className="text-xs text-muted">{fmt.format(m._creationTime)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-pretty text-fg/90">{m.body}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: votre message")}`}
                    onClick={() => !m.read && setRead({ token, id: m._id, read: true })}
                  >
                    <Reply /> Répondre
                  </a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRead({ token, id: m._id, read: !m.read })}>
                  {m.read ? <Mail /> : <MailOpen />} {m.read ? "Marquer non lu" : "Marquer lu"}
                </Button>
                <span className="flex-1" />
                <ConfirmDelete onConfirm={() => remove({ token, id: m._id })} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 flex items-center gap-2 text-xs text-muted">
        <FaWhatsapp /> Astuce : les contacts arrivent aussi dans Lumail avec le tag « portfolio-contact ».
      </p>
    </>
  );
}
