import { Link } from "react-router";

export default function Logo() {
  return (
    <Link to="/" className="font-display text-xl font-bold tracking-tight" aria-label="Accueil — Marday 235">
      AW<span className="ml-1 text-td-blue">2</span>
      <span className="text-td-yellow">3</span>
      <span className="text-td-red">5</span>
    </Link>
  );
}
