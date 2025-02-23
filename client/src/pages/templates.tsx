import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Project, AgentConfiguration } from "@shared/schema";
import { PromptPreview } from "@/components/prompt-preview";

export default function Templates() {
  const { id } = useParams();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`]
  });

  if (isLoading || !project) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Prompt Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(project.configuration as AgentConfiguration).agents.map((agent) => (
          <PromptPreview key={agent.type} agent={agent} />
        ))}
      </div>
    </div>
  );
}