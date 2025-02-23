import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for project requirements
export const projectRequirementSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectGoal: z.string().min(10, "Please provide a detailed project goal"),
  dataTypes: z.array(z.string()).min(1, "Select at least one data type"),
  queryPatterns: z.array(z.string()).min(1, "Select at least one query pattern"),
  scaleRequirements: z.object({
    dataVolume: z.string(),
    queryFrequency: z.string(),
    responseTime: z.string()
  })
});

// Schema for agent configuration
export const agentConfigSchema = z.object({
  agents: z.array(z.object({
    type: z.string(),
    role: z.string(),
    knowledgeBases: z.array(z.string()),
    tooling: z.array(z.string()),
    memoryConfig: z.record(z.any())
  })),
  interactions: z.object({
    pattern: z.string(),
    dataFlow: z.record(z.any()),
    errorHandling: z.record(z.any())
  })
});

// Database tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  requirements: jsonb("requirements").notNull(),
  configuration: jsonb("configuration").notNull()
});

export const insertProjectSchema = createInsertSchema(projects);

export type ProjectRequirements = z.infer<typeof projectRequirementSchema>;
export type AgentConfiguration = z.infer<typeof agentConfigSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
