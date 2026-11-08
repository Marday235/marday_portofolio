import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-8xl font-bold">
        <span className="text-td-blue">4</span>
        <span className="text-td-yellow">0</span>
        <span className="text-td-red">4</span>
      </p>
      <p className="mt-4 text-lg text-muted">{t("notFound")}</p>
      <Button asChild className="mt-8">
        <Link to="/">{t("home")}</Link>
      </Button>
    </section>
  );
}
