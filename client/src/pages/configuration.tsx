import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentFlow } from "@/components/agent-flow";
import { Project, ProjectRequirements, AgentConfiguration } from "@shared/schema";
import { generateAgentConfiguration } from "@/lib/agent-config";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Configuration() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`]
  });

  const generateConfig = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const config = generateAgentConfiguration(project.requirements as ProjectRequirements);
      const res = await apiRequest(
        "PATCH",
        `/api/projects/${id}/configuration`,
        config
      );
      return res.json() as Promise<Project>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Configuration generated",
        description: "Your agent configuration has been updated"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{project.name} Configuration</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generateConfig.mutate()}
              disabled={generateConfig.isPending}
            >
              {generateConfig.isPending ? "Generating..." : "Generate Configuration"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(project.configuration as AgentConfiguration).agents.length > 0 ? (
            <AgentFlow configuration={project.configuration as AgentConfiguration} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No configuration generated yet. Click the button above to generate one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}