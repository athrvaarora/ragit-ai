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
  // Initialize nodes with a hierarchical layout
  const initialNodes: Node[] = configuration.agents.map((agent, index) => {
    let x = 0;
    let y = 0;

    // Position based on agent type
    if (agent.type.includes('executive')) {
      x = 350; // Center
      y = 50;  // Top
    } else if (agent.type.includes('director')) {
      const directorCount = configuration.agents.filter(a => a.type.includes('director')).length;
      const directorIndex = configuration.agents.filter(a => a.type.includes('director')).findIndex(a => a.type === agent.type);
      x = (700 / (directorCount + 1)) * (directorIndex + 1); // Spread directors evenly
      y = 250; // Middle
    } else {
      const specialistCount = configuration.agents.filter(a => !a.type.includes('executive') && !a.type.includes('director')).length;
      const specialistIndex = configuration.agents.filter(a => !a.type.includes('executive') && !a.type.includes('director')).findIndex(a => a.type === agent.type);
      x = (700 / (specialistCount + 1)) * (specialistIndex + 1); // Spread specialists evenly
      y = 450; // Bottom
    }

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

  // Create edges based on hierarchy
  const edges: Edge[] = [];
  const executive = nodes.find(n => n.data.type.includes('executive'));
  const directors = nodes.filter(n => n.data.type.includes('director'));
  const specialists = nodes.filter(n => !n.data.type.includes('executive') && !n.data.type.includes('director'));

  if (executive) {
    // Connect executive to directors
    directors.forEach(director => {
      edges.push({
        id: `${executive.id}-${director.id}`,
        source: executive.id,
        target: director.id,
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
      });
    });

    // Connect directors to their specialists
    directors.forEach(director => {
      const directorArea = director.data.type.split('_')[0]; // e.g., 'sequence' from 'sequence_director'
      const relatedSpecialists = specialists.filter(s => s.data.type.includes(directorArea));

      relatedSpecialists.forEach(specialist => {
        edges.push({
          id: `${director.id}-${specialist.id}`,
          source: director.id,
          target: specialist.id,
          animated: true,
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
        });
      });
    });
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
                Hierarchical Structure
              </h3>
              <p className="text-sm text-muted-foreground">
                Executive → Directors → Specialists
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Command Flow</h4>
              <p className="text-sm text-muted-foreground">
                Top-down direction, bottom-up feedback
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