/** Fait disparaître en fondu l'écran de chargement défini dans index.html. */
export function hideSplash() {
  const el = document.getElementById("splash");
  if (!el || el.classList.contains("is-done")) return;
  el.classList.add("is-done");
  el.removeAttribute("role");
  setTimeout(() => el.remove(), 600);
}
