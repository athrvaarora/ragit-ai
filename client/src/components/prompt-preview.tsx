import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RagAgentConfiguration } from "@shared/schema";

interface PromptPreviewProps {
  agent: RagAgentConfiguration["agents"][0];
}

export function PromptPreview({ agent }: PromptPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{agent.role}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
          {agent.promptTemplate}
        </pre>
      </CardContent>
    </Card>
  );
}