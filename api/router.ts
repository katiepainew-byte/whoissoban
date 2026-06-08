import { authRouter } from "./auth-router";
import { blogRouter } from "./blog-router";
import { researchRouter } from "./research-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  blog: blogRouter,
  research: researchRouter,
});

export type AppRouter = typeof appRouter;
