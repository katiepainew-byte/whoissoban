import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { blogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const blogRouter = createRouter({
  // Public: list all published blogs
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
          .from(blogs)
          .where(eq(blogs.published, true))
          .orderBy(desc(blogs.createdAt));
      }
      
      return db.select().from(blogs).orderBy(desc(blogs.createdAt));
    }),

  // Public: get single blog by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(blogs)
        .where(eq(blogs.slug, input.slug))
        .limit(1);
      return results[0] ?? null;
    }),

  // Admin: create blog
  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        excerpt: z.string().optional(),
        content: z.string().min(1),
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
        .from(blogs)
        .where(eq(blogs.slug, input.slug))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("A blog with this slug already exists");
      }

      const result = await db.insert(blogs).values({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        content: input.content,
        coverImage: input.coverImage ?? null,
        published: input.published,
        authorId,
      });

      return { success: true, id: Number(result[0].insertId) };
    }),

  // Admin: update blog
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      await db
        .update(blogs)
        .set(updateData)
        .where(eq(blogs.id, id));

      return { success: true };
    }),

  // Admin: delete blog
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(blogs).where(eq(blogs.id, input.id));
      return { success: true };
    }),

  // Admin: toggle publish status
  togglePublish: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(blogs)
        .where(eq(blogs.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Blog not found");
      }

      await db
        .update(blogs)
        .set({ published: !existing[0].published })
        .where(eq(blogs.id, input.id));

      return { success: true, published: !existing[0].published };
    }),
});
