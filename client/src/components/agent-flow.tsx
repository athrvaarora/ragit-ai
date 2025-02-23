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
import { motion } from "framer-motion";

interface AgentFlowProps {
  configuration: RagAgentConfiguration;
}

// Custom node component to show agent details
function AgentNode({ data }: NodeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card border rounded-lg p-4 min-w-[250px] max-w-[300px] hover:shadow-lg transition-shadow backdrop-blur-sm bg-opacity-95"
          >
            <Handle 
              type="target" 
              position={Position.Left} 
              className="!bg-primary !w-3 !h-3 !-translate-x-1.5" 
            />
            <div className="mb-3">
              <h3 className="font-medium text-lg mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {data.role}
              </h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                {data.type}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tools.map((tool: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">
                    {tool}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {data.description}
            </p>
            <Handle 
              type="source" 
              position={Position.Right} 
              className="!bg-primary !w-3 !h-3 !translate-x-1.5" 
            />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="space-y-2">
            <div>
              <p className="font-medium mb-1">Responsibilities:</p>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {data.responsibilities.map((resp: string, i: number) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {resp}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Knowledge Base:</p>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {data.knowledgeBase.sources.map((source: string, i: number) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {source}
                  </motion.li>
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
    <div className="h-[700px] border rounded-lg bg-gradient-to-br from-background to-primary/5">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        className="bg-background/50"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="bg-card border rounded-lg p-4 backdrop-blur-sm bg-opacity-95">
          <div className="space-y-3">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Interaction Pattern
              </h3>
              <p className="text-sm text-muted-foreground">
                {configuration.interactionFlow.pattern}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Task Distribution</h4>
              <p className="text-sm text-muted-foreground">
                {configuration.interactionFlow.taskDistribution.strategy}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Drag agents to rearrange • Scroll to zoom
              </p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}