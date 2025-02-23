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

// Placeholder function -  replace with actual implementation
const generateToolset = (agentType: string) => {
  // This is a placeholder, replace with your actual logic to fetch tool details.
  // For example, you might fetch from an API based on agentType.
  const toolData = {
    "specialist-1": [
      { name: "Tool A", description: "Description of Tool A" },
      { name: "Tool B", description: "Description of Tool B" }
    ],
    "specialist-2": [
      { name: "Tool C", description: "Description of Tool C" },
      { name: "Tool D", description: "Description of Tool D" }
    ],
    // Add more agent types and their tools here...
  };
  return toolData[agentType] || [];
};


// Updated AgentNode component
function AgentNode({ data }: NodeProps) {
  // Get the full tool details including descriptions
  const toolDetails = generateToolset(data.type);

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
              {toolDetails.map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">
                        {tool.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">{tool.description}</p>
                    </TooltipContent>
                  </Tooltip>
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
              <p className="font-medium mb-1">Tools:</p>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {toolDetails.map((tool, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="font-medium">{tool.name}:</span> {tool.description}
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

    // Position based on agent role in the hierarchy
    if (agent.type.includes('strategist')) {
      x = 350; // Center
      y = 50;  // Top
    } else if (agent.type.includes('orchestrator')) {
      x = 350; // Center
      y = 200; // Middle
    } else {
      // Calculate position for specialist agents in a semi-circle below
      const specialistCount = configuration.agents.filter(a => 
        !a.type.includes('strategist') && !a.type.includes('orchestrator')
      ).length;
      const specialistIndex = configuration.agents.filter(a => 
        !a.type.includes('strategist') && !a.type.includes('orchestrator')
      ).findIndex(a => a.type === agent.type);

      // Create a semi-circle arrangement
      const angle = (Math.PI / (specialistCount - 1)) * specialistIndex;
      const radius = 300;
      x = 350 + radius * Math.cos(angle); // Center + radius * cos(angle)
      y = 400 + radius * Math.sin(angle) * 0.5; // Lower + radius * sin(angle), compressed vertically
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

  // Create edges based on the collaboration model
  const edges: Edge[] = [];
  const strategist = nodes.find(n => n.data.type.includes('strategist'));
  const orchestrator = nodes.find(n => n.data.type.includes('orchestrator'));
  const specialists = nodes.filter(n => 
    !n.data.type.includes('strategist') && !n.data.type.includes('orchestrator')
  );

  if (strategist && orchestrator) {
    // Connect strategist to orchestrator
    edges.push({
      id: `${strategist.id}-${orchestrator.id}`,
      source: strategist.id,
      target: orchestrator.id,
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
    });

    // Connect orchestrator to all specialists
    specialists.forEach(specialist => {
      edges.push({
        id: `${orchestrator.id}-${specialist.id}`,
        source: orchestrator.id,
        target: specialist.id,
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
      });
    });

    // Add lateral connections between related specialists
    specialists.forEach((specialist, index) => {
      const nextSpecialist = specialists[index + 1];
      if (nextSpecialist) {
        edges.push({
          id: `${specialist.id}-${nextSpecialist.id}`,
          source: specialist.id,
          target: nextSpecialist.id,
          animated: true,
          style: { 
            stroke: 'hsl(var(--primary))', 
            strokeWidth: 1,
            strokeDasharray: '5,5' // Dashed line for peer connections
          }
        });
      }
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
                Multi-Agent Collaboration
              </h3>
              <p className="text-sm text-muted-foreground">
                Strategist → Orchestrator → Specialists
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Information Flow</h4>
              <p className="text-sm text-muted-foreground">
                Strategic direction and execution feedback
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Solid lines: Direct reporting • Dashed lines: Peer collaboration
              </p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}