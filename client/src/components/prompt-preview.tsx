import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentConfiguration } from "@shared/schema";
import { generatePromptTemplate } from "@/lib/agent-config";

interface PromptPreviewProps {
  agent: AgentConfiguration["agents"][0];
}

export function PromptPreview({ agent }: PromptPreviewProps) {
  const prompt = generatePromptTemplate(agent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{agent.role}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
          {prompt}
        </pre>
      </CardContent>
    </Card>
  );
}
