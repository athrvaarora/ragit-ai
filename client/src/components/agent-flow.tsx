import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Panel,
  NodeProps,
  Handle,
  Position
} from "reactflow";
import "reactflow/dist/style.css";
import { RagAgentConfiguration } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentFlowProps {
  configuration: RagAgentConfiguration;
}

// Custom node component to show agent details
function AgentNode({ data }: NodeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-card border rounded-lg p-4 min-w-[200px]">
            <Handle type="target" position={Position.Left} />
            <div className="mb-2">
              <h3 className="font-medium">{data.role}</h3>
              <Badge variant="secondary" className="mt-1">
                {data.type}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.tools.map((tool: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
            <Handle type="source" position={Position.Right} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-medium">Responsibilities:</p>
            <ul className="list-disc pl-4 text-sm">
              {data.responsibilities.map((resp: string, i: number) => (
                <li key={i}>{resp}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const nodeTypes = {
  agent: AgentNode
};

export function AgentFlow({ configuration }: AgentFlowProps) {
  // Calculate node positions in a circular layout
  const nodes: Node[] = configuration.agents.map((agent, index) => {
    const angle = (2 * Math.PI * index) / configuration.agents.length;
    const radius = 250;
    const x = radius * Math.cos(angle) + radius;
    const y = radius * Math.sin(angle) + radius;

    return {
      id: agent.type,
      data: {
        role: agent.role,
        type: agent.type,
        tools: agent.tooling,
        responsibilities: agent.responsibilities
      },
      position: { x, y },
      type: "agent"
    };
  });

  // Create edges between agents based on their interaction pattern
  const edges: Edge[] = [];
  if (configuration.interactionFlow.pattern === "sequential") {
    // Sequential connections
    for (let i = 0; i < configuration.agents.length - 1; i++) {
      edges.push({
        id: `${configuration.agents[i].type}-${configuration.agents[i + 1].type}`,
        source: configuration.agents[i].type,
        target: configuration.agents[i + 1].type,
        animated: true,
        style: { stroke: 'hsl(var(--primary))' }
      });
    }
  } else if (configuration.interactionFlow.pattern === "orchestrated") {
    // Orchestrator connections (if present)
    const orchestrator = configuration.agents.find(a => a.type === "orchestrator");
    if (orchestrator) {
      configuration.agents.forEach(agent => {
        if (agent.type !== "orchestrator") {
          edges.push({
            id: `orchestrator-${agent.type}`,
            source: "orchestrator",
            target: agent.type,
            animated: true,
            style: { stroke: 'hsl(var(--primary))' }
          });
        }
      });
    }
  }

  return (
    <div className="h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="bg-background border rounded-lg p-3">
          <div className="space-y-2">
            <h3 className="font-medium">Interaction Pattern: <span className="text-muted-foreground">{configuration.interactionFlow.pattern}</span></h3>
            <div>
              <p className="text-sm font-medium">Task Distribution:</p>
              <p className="text-sm text-muted-foreground">{configuration.interactionFlow.taskDistribution.strategy}</p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}