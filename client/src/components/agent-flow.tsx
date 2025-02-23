import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Panel,
  NodeProps,
  Handle,
  Position,
  NodeDragHandler,
  OnNodesChange,
  applyNodeChanges
} from "reactflow";
import { useState } from "react";
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
          <div className="bg-card border rounded-lg p-4 min-w-[250px] max-w-[300px]">
            <Handle type="target" position={Position.Left} className="!bg-primary" />
            <div className="mb-3">
              <h3 className="font-medium text-lg mb-1">{data.role}</h3>
              <Badge variant="secondary">
                {data.type}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tools.map((tool: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {data.description}
            </p>
            <Handle type="source" position={Position.Right} className="!bg-primary" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="space-y-2">
            <div>
              <p className="font-medium mb-1">Responsibilities:</p>
              <ul className="list-disc pl-4 text-sm">
                {data.responsibilities.map((resp: string, i: number) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Knowledge Base:</p>
              <ul className="list-disc pl-4 text-sm">
                {data.knowledgeBase.sources.map((source: string, i: number) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>
            </div>
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
  // Initialize nodes with a more spread out circular layout
  const initialNodes: Node[] = configuration.agents.map((agent, index) => {
    const angle = (2 * Math.PI * index) / configuration.agents.length;
    const radius = 350; // Increased radius for more spacing
    const x = radius * Math.cos(angle) + radius;
    const y = radius * Math.sin(angle) + radius;

    return {
      id: agent.type,
      data: {
        role: agent.role,
        type: agent.type,
        tools: agent.tooling,
        responsibilities: agent.responsibilities,
        description: agent.promptTemplate.split('\n')[0], // First line as description
        knowledgeBase: agent.knowledgeBase
      },
      position: { x, y },
      type: "agent",
      draggable: true
    };
  });

  const [nodes, setNodes] = useState<Node[]>(initialNodes);

  // Handle node position changes (dragging)
  const onNodesChange: OnNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

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
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
      });
    }
  } else if (configuration.interactionFlow.pattern === "orchestrated") {
    // Orchestrator connections
    const orchestrator = configuration.agents.find(a => a.type === "orchestrator");
    if (orchestrator) {
      configuration.agents.forEach(agent => {
        if (agent.type !== "orchestrator") {
          edges.push({
            id: `orchestrator-${agent.type}`,
            source: "orchestrator",
            target: agent.type,
            animated: true,
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
          });
        }
      });
    }
  }

  return (
    <div className="h-[700px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        className="bg-background"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="bg-background border rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Interaction Pattern</h3>
              <p className="text-sm text-muted-foreground">{configuration.interactionFlow.pattern}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Task Distribution</h4>
              <p className="text-sm text-muted-foreground">{configuration.interactionFlow.taskDistribution.strategy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Drag agents to rearrange • Scroll to zoom</p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}