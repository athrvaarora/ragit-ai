import { pgTable, text, serial, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for project requirements
export const projectRequirementSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(50, "Please provide a detailed project description"),
});

// Schema for RAG agent configuration
export const ragAgentConfigSchema = z.object({
  agents: z.array(z.object({
    type: z.string(),
    role: z.string(),
    responsibilities: z.array(z.string()),
    knowledgeBase: z.object({
      sources: z.array(z.string()),
      indexingStrategy: z.string(),
      retrievalMethod: z.string()
    }),
    promptTemplate: z.string(),
    tooling: z.array(z.string())
  })),
  interactionFlow: z.object({
    pattern: z.string(),
    taskDistribution: z.record(z.any()),
    errorHandling: z.object({
      strategy: z.string(),
      fallbackBehavior: z.string()
    })
  })
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull().$default(() => new Date().toISOString())
});

// Database tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  requirements: jsonb("requirements").notNull(),
  configuration: jsonb("configuration").notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id)
});

export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const insertProjectSchema = createInsertSchema(projects);

export type ProjectRequirements = z.infer<typeof projectRequirementSchema>;
export type RagAgentConfiguration = z.infer<typeof ragAgentConfigSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;