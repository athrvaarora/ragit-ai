import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/project-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Project, ProjectRequirements } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ProjectInput() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const createProject = useMutation({
    mutationFn: async (data: ProjectRequirements) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json() as Promise<Project>;
    },
    onSuccess: (data) => {
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
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New RAG Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={(data) => createProject.mutate(data)}
            isLoading={createProject.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}