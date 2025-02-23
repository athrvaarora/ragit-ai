import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { projectRequirementSchema, agentConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const requirements = projectRequirementSchema.parse(req.body);
      const project = await storage.createProject({
        name: requirements.projectName,
        requirements,
        configuration: { agents: [], interactions: { pattern: "", dataFlow: {}, errorHandling: {} } }
      });
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project requirements" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  // Get project by id
  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  });

  // Update project configuration
  app.patch("/api/projects/:id/configuration", async (req, res) => {
    try {
      const configuration = agentConfigSchema.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), {
        configuration
      });
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration" });
    }
  });

  return createServer(app);
}
