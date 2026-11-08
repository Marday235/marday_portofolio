import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";

export type HomeData = FunctionReturnType<typeof api.public.home>;
export type PublicProject = HomeData["mainProjects"][number];
export type Settings = HomeData["settings"];
