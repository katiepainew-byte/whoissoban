import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { researchPapers } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const researchRouter = createRouter({
  // Public: list all published research papers
  list: publicQuery
    .input(
      z
        .object({
          publishedOnly: z.boolean().optional().default(true),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const publishedOnly = input?.publishedOnly ?? true;

      if (publishedOnly) {
        return db
          .select()
          .from(researchPapers)
          .where(eq(researchPapers.published, true))
          .orderBy(desc(researchPapers.createdAt));
      }

      return db.select().from(researchPapers).orderBy(desc(researchPapers.createdAt));
    }),

  // Public: get single research paper by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(researchPapers)
        .where(eq(researchPapers.slug, input.slug))
        .limit(1);
      return results[0] ?? null;
    }),

  // Admin: create research paper
  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        abstract: z.string().min(1),
        content: z.string().min(1),
        pdfUrl: z.string().optional(),
        coverImage: z.string().optional(),
        published: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const authorId = ctx.user.unionId;

      // Check if slug already exists
      const existing = await db
        .select()
        .from(researchPapers)
        .where(eq(researchPapers.slug, input.slug))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("A research paper with this slug already exists");
      }

      const result = await db.insert(researchPapers).values({
        title: input.title,
        slug: input.slug,
        abstract: input.abstract,
        content: input.content,
        pdfUrl: input.pdfUrl ?? null,
        coverImage: input.coverImage ?? null,
        published: input.published,
        authorId,
      });

      return { success: true, id: Number(result[0].insertId) };
    }),

  // Admin: update research paper
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        abstract: z.string().optional(),
        content: z.string().optional(),
        pdfUrl: z.string().optional(),
        coverImage: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      await db
        .update(researchPapers)
        .set(updateData)
        .where(eq(researchPapers.id, id));

      return { success: true };
    }),

  // Admin: delete research paper
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(researchPapers).where(eq(researchPapers.id, input.id));
      return { success: true };
    }),

  // Admin: toggle publish status
  togglePublish: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(researchPapers)
        .where(eq(researchPapers.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Research paper not found");
      }

      await db
        .update(researchPapers)
        .set({ published: !existing[0].published })
        .where(eq(researchPapers.id, input.id));

      return { success: true, published: !existing[0].published };
    }),
});
