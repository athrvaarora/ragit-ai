import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { projectRequirementSchema, ragAgentConfigSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  // Create new project
  app.post("/api/projects", ensureAuthenticated, async (req, res) => {
    try {
      const requirements = projectRequirementSchema.parse(req.body);
      const project = await storage.createProject({
        name: requirements.projectName,
        requirements,
        configuration: { agents: [], interactionFlow: { pattern: "", taskDistribution: {}, errorHandling: { strategy: "", fallbackBehavior: "" } } },
        ownerId: req.user!.id
      });
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project requirements" });
    }
  });

  // Get all projects
  app.get("/api/projects", ensureAuthenticated, async (req, res) => {
    const projects = await storage.getAllProjects(req.user!.id);
    res.json(projects);
  });

  // Get project by id
  app.get("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure user owns this project
    if (project.ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(project);
  });

  // Update project configuration
  app.patch("/api/projects/:id/configuration", ensureAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(Number(req.params.id));
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Ensure user owns this project
      if (project.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const configuration = ragAgentConfigSchema.parse(req.body);
      const updated = await storage.updateProject(Number(req.params.id), {
        configuration
      });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration" });
    }
  });

  return createServer(app);
}