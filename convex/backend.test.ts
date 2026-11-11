/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, vi, beforeEach } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

beforeEach(() => {
  process.env.ADMIN_EMAIL = "Admin@Example.com";
  delete process.env.LUMAIL_API_KEY;
  delete process.env.LUMAIL_FROM;
  delete process.env.TURNSTILE_SECRET_KEY;
});

async function login(t: ReturnType<typeof convexTest>) {
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...a) => { logs.push(a.join(" ")); });
  await t.action(api.auth.requestCode, { email: " admin@example.com " });
  spy.mockRestore();
  const code = logs.join("\n").match(/\[CODE ADMIN\] (\d{6})/)![1];
  const res = await t.mutation(api.auth.verifyCode, { code });
  if (!res.ok) throw new Error(res.error);
  return res.token;
}

test("public home works on empty DB with defaults", async () => {
  const t = convexTest(schema, modules);
  const h = await t.query(api.public.home, {});
  expect(h.settings.email).toBe("marday235@gmail.com");
  expect(h.mainProjects).toEqual([]);
});

test("login flow: wrong email silent, wrong code counted, good code gives session", async () => {
  const t = convexTest(schema, modules);
  expect(await t.action(api.auth.requestCode, { email: "nope@x.com" })).toEqual({ ok: true });
  expect(await t.mutation(api.auth.verifyCode, { code: "000000" })).toMatchObject({ ok: false });
  const token = await login(t);
  expect(await t.query(api.auth.isValid, { token })).toBe(true);
  expect(await t.query(api.auth.isValid, { token: "bad" })).toBe(false);
  await expect(t.query(api.admin.listMessages, { token: "bad" })).rejects.toThrow();
  await t.mutation(api.auth.logout, { token });
  expect(await t.query(api.auth.isValid, { token })).toBe(false);
});

test("wrong attempts persist and lock after 5", async () => {
  const t = convexTest(schema, modules);
  vi.spyOn(console, "log").mockImplementation(() => {});
  await t.action(api.auth.requestCode, { email: "admin@example.com" });
  for (let i = 0; i < 5; i++) {
    expect(await t.mutation(api.auth.verifyCode, { code: "abc" })).toMatchObject({ error: "Code incorrect." });
  }
  expect(await t.mutation(api.auth.verifyCode, { code: "abc" })).toMatchObject({ ok: false, error: expect.stringContaining("Trop") });
  vi.restoreAllMocks();
});

test("seed, project CRUD, slug clash, ordering, drafts hidden", async () => {
  const t = convexTest(schema, modules);
  const token = await login(t);
  expect(await t.mutation(api.admin.seed, { token })).toBe(true);
  expect(await t.mutation(api.admin.seed, { token })).toBe(false);
  let h = await t.query(api.public.home, {});
  expect(h.mainProjects.map(p => p.slug)).toEqual(["aseest-d", "souk-tchad"]);
  expect(h.otherProjects).toHaveLength(3);
  expect(h.otherProjects[0].images).toEqual(["/projets/game-card.webp"]);

  const base = h.mainProjects[0];
  const { _id, _creationTime, order, images, ...data } = base;
  await expect(t.mutation(api.admin.saveProject, { token, data: { ...data, slug: "souk-tchad" } })).rejects.toThrow(/déjà utilisée/);
  const newId = await t.mutation(api.admin.saveProject, { token, data: { ...data, slug: "", title: { fr: "Mon Été Génial!", en: "" }, status: "draft" } });
  const all = await t.query(api.admin.listProjects, { token });
  const created = all.find(p => p._id === newId)!;
  expect(created.slug).toBe("mon-ete-genial");
  expect(created.order).toBe(5);
  h = await t.query(api.public.home, {});
  expect(h.mainProjects.find(p => p.slug === "mon-ete-genial")).toBeUndefined();
  expect(await t.query(api.public.project, { slug: "mon-ete-genial" })).toBeNull();

  await t.mutation(api.admin.move, { token, table: "projects", id: all[1]._id, direction: "up" });
  h = await t.query(api.public.home, {});
  expect(h.mainProjects.map(p => p.slug)).toEqual(["souk-tchad", "aseest-d"]);
  const pp = await t.query(api.public.project, { slug: "souk-tchad" });
  expect(pp!.next!.slug).toBe("aseest-d");

  await t.mutation(api.admin.removeProject, { token, id: newId });
  expect((await t.query(api.admin.listProjects, { token })).length).toBe(5);
});

test("settings save, availability, contact messages and rate limit", async () => {
  const t = convexTest(schema, modules);
  const token = await login(t);
  const s = await t.query(api.admin.getSettings, { token });
  const { cvFr, cvEn, cvFrUrl, cvEnUrl, ...rest } = s as any;
  delete rest._id; delete rest._creationTime;
  await t.mutation(api.admin.saveSettings, { token, data: { ...rest, whatsapp: "+237600000000" } });
  await t.mutation(api.admin.setAvailable, { token, available: false });
  const h = await t.query(api.public.home, {});
  expect(h.settings.whatsapp).toBe("+237600000000");
  expect(h.settings.available).toBe(false);

  vi.spyOn(console, "log").mockImplementation(() => {});
  await expect(t.action(api.contact.send, { name: "A", email: "x@y.co", body: "hello world!", lang: "fr" })).rejects.toThrow(/invalid_name/);
  await expect(t.action(api.contact.send, { name: "Ali", email: "bad", body: "hello world!", lang: "fr" })).rejects.toThrow(/invalid_email/);
  for (let i = 0; i < 3; i++) {
    await t.action(api.contact.send, { name: "Ali", email: "Ali@Test.com", body: "Bonjour, j'ai un projet <b>", lang: "fr" });
  }
  await expect(t.action(api.contact.send, { name: "Ali", email: "ali@test.com", body: "Encore un message", lang: "fr" })).rejects.toThrow(/rate_limit/);
  vi.restoreAllMocks();
  const msgs = await t.query(api.admin.listMessages, { token });
  expect(msgs).toHaveLength(3);
  expect((await t.query(api.admin.overview, { token })).unread).toBe(3);
  await t.mutation(api.admin.setMessageRead, { token, id: msgs[0]._id, read: true });
  expect((await t.query(api.admin.overview, { token })).unread).toBe(2);
});

test("turnstile required when secret is set", async () => {
  const t = convexTest(schema, modules);
  process.env.TURNSTILE_SECRET_KEY = "secret";
  await expect(t.action(api.contact.send, { name: "Ali", email: "a@b.co", body: "hello there friend", lang: "fr" })).rejects.toThrow(/captcha/);
});

test("lumail called with right payload", async () => {
  const t = convexTest(schema, modules);
  process.env.LUMAIL_API_KEY = "lum_test"; process.env.LUMAIL_FROM = "Marday <c@marday235.com>";
  const calls: any[] = [];
  vi.stubGlobal("fetch", async (url: string, init: any) => { calls.push([url, JSON.parse(init.body)]); return new Response("{}", { status: 200 }); });
  await t.action(api.contact.send, { name: "Ali", email: "a@b.co", body: "hello there friend", lang: "en" });
  vi.unstubAllGlobals();
  expect(calls[0][0]).toBe("https://lumail.io/api/v2/emails");
  expect(calls[0][1]).toMatchObject({ to: "admin@example.com", from: "Marday <c@marday235.com>" });
  expect(calls[1]).toEqual(["https://lumail.io/api/v2/subscribers", { email: "a@b.co", name: "Ali", tags: ["portfolio-contact"] }]);
});

test("gallery: seed, add uploads on top, hide, delete", async () => {
  const t = convexTest(schema, modules);
  const token = await login(t);
  await t.mutation(api.admin.seed, { token });
  let h = await t.query(api.public.home, {});
  expect(h.gallery).toHaveLength(7);
  expect(h.gallery[0].url).toBe("/galerie/code-nuit.webp");
  const sid = await t.run(async (ctx) => ctx.storage.store(new Blob(["x"], { type: "image/webp" })));
  await t.mutation(api.admin.addGalleryPhotos, { token, imageIds: [sid] });
  const list = await t.query(api.admin.listGallery, { token });
  expect(list[0].imageId).toBe(sid);
  expect(list.map((g) => g.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  await t.mutation(api.admin.updateGalleryPhoto, { token, id: list[1]._id, caption: { fr: "x", en: "" }, published: false });
  h = await t.query(api.public.home, {});
  expect(h.gallery).toHaveLength(7);
  await t.mutation(api.admin.removeGalleryPhoto, { token, id: list[0]._id });
  expect(await t.query(api.admin.listGallery, { token })).toHaveLength(7);
  await t.mutation(api.admin.move, { token, table: "gallery", id: list[2]._id, direction: "up" });
});

test("seed fills gallery even when projects already exist", async () => {
  const t = convexTest(schema, modules);
  const token = await login(t);
  await t.mutation(api.admin.seed, { token });
  const g = await t.query(api.admin.listGallery, { token });
  for (const x of g) await t.mutation(api.admin.removeGalleryPhoto, { token, id: x._id });
  expect(await t.mutation(api.admin.seed, { token })).toBe(true);
  expect(await t.query(api.admin.listGallery, { token })).toHaveLength(7);
  expect((await t.query(api.admin.listProjects, { token })).length).toBe(5);
});

test("internal seed", async () => {
  const t = convexTest(schema, modules);
  expect(await t.mutation(internal.admin.seedInit, {})).toBe(true);
});

test("login with email + personal code, rate limited", async () => {
  const t = convexTest(schema, modules);
  const { sha256 } = await import("./lib");
  process.env.ADMIN_CODE_HASH = await sha256("secret-code");
  expect(await t.mutation(api.auth.loginWithCode, { email: "admin@example.com", code: "bad" })).toMatchObject({ ok: false, error: "Email ou code incorrect." });
  expect(await t.mutation(api.auth.loginWithCode, { email: "x@example.com", code: "secret-code" })).toMatchObject({ ok: false });
  const res = await t.mutation(api.auth.loginWithCode, { email: " Admin@Example.com ", code: "secret-code" });
  if (!res.ok) throw new Error(res.error);
  expect(await t.query(api.auth.isValid, { token: res.token })).toBe(true);
  for (let i = 0; i < 2; i++) await t.mutation(api.auth.loginWithCode, { email: "admin@example.com", code: "bad" });
  expect(await t.mutation(api.auth.loginWithCode, { email: "admin@example.com", code: "secret-code" })).toMatchObject({ ok: false, error: expect.stringContaining("Trop") });
  delete process.env.ADMIN_CODE_HASH;
});
