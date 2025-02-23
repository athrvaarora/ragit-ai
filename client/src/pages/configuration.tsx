import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentFlow } from "@/components/agent-flow";
import { Project, ProjectRequirements, RagAgentConfiguration } from "@shared/schema";
import { generateRagConfiguration, getAgentRationale } from "@/lib/agent-config";
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
      const config = generateRagConfiguration(project.requirements as ProjectRequirements);
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
        description: "Your RAG agent configuration has been updated"
      });
    }
  });

  if (isLoading || !project) {
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

  const configuration = project.configuration as RagAgentConfiguration;
  const rationale = getAgentRationale(project.requirements as ProjectRequirements);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>RAG Agent Configuration</CardDescription>
            </div>
            <Button
              onClick={() => generateConfig.mutate()}
              disabled={generateConfig.isPending}
            >
              {generateConfig.isPending ? "Generating..." : "Generate Configuration"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none mb-6">
            <h3>Configuration Rationale</h3>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
              {rationale}
            </pre>
          </div>

          {configuration.agents.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Agent Interaction Flow</h3>
              <AgentFlow configuration={configuration} />

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Agent Details</h3>
                {configuration.agents.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{agent.role}</CardTitle>
                      <CardDescription>{agent.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">Responsibilities:</h4>
                        <ul className="list-disc pl-5">
                          {agent.responsibilities.map((resp, i) => (
                            <li key={i}>{resp}</li>
                          ))}
                        </ul>

                        <h4 className="font-medium mt-4">Knowledge Base:</h4>
                        <div className="bg-muted p-3 rounded">
                          <p>Sources: {agent.knowledgeBase.sources.join(", ")}</p>
                          <p>Indexing: {agent.knowledgeBase.indexingStrategy}</p>
                          <p>Retrieval: {agent.knowledgeBase.retrievalMethod}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
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