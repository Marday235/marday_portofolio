import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Hero, Journey, Projects, Skills, Stats, Testimonials } from "@/components/site/Sections";
import Contact from "@/components/site/Contact";
import Gallery from "@/components/site/Gallery";
import { useLang } from "@/lib/i18n";

export default function HomePage() {
  const data = useQuery(api.public.home);
  const { t } = useLang();

  useEffect(() => {
    document.title = `Abdoulaye Wardougou — ${t("role")} · Marday 235`;
  }, [t]);

  return (
    <>
      <Hero settings={data?.settings} />
      <Stats settings={data?.settings} />
      <Projects data={data} />
      <Journey items={data?.timeline} />
      <Skills items={data?.skills} />
      <Gallery photos={data?.gallery} />
      <Testimonials items={data?.testimonials} />
      <Contact settings={data?.settings} />
    </>
  );
}
