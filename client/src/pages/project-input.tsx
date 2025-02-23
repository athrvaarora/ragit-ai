import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project, ProjectRequirements } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigWizard } from "@/components/config-wizard";

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
        <ConfigWizard 
          onSubmit={(data) => createProject.mutate(data)}
          isLoading={createProject.isPending}
        />
      </motion.div>
    </motion.div>
  );
}