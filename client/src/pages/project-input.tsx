import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectForm } from "@/components/project-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project, ProjectRequirements } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Bot, Workflow, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ProjectInput() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const createProject = useMutation({
    mutationFn: async (data: ProjectRequirements) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json() as Promise<Project>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Redirecting to configuration..."
      });
      navigate(`/project/${data.id}/configuration`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  });

  return (
    <motion.div 
      className="container mx-auto py-12"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div 
        className="max-w-2xl mx-auto text-center mb-12"
        variants={item}
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          RagIT AI
        </h1>
        <p className="text-xl text-muted-foreground">
          Generate sophisticated RAG configurations with AI
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-card to-indigo-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" />
              Create New Configuration
            </CardTitle>
            <CardDescription>
              Describe your project and let AI generate an optimal RAG configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="p-4 rounded-lg bg-indigo-500/10">
                <Bot className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                <h3 className="font-medium">Smart Agents</h3>
                <p className="text-sm text-muted-foreground">Specialized RAG agents</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10">
                <Workflow className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <h3 className="font-medium">Workflows</h3>
                <p className="text-sm text-muted-foreground">Optimized interactions</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-500/10">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                <h3 className="font-medium">Intelligence</h3>
                <p className="text-sm text-muted-foreground">AI-driven config</p>
              </div>
            </div>
            <ProjectForm
              onSubmit={(data) => createProject.mutate(data)}
              isLoading={createProject.isPending}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}