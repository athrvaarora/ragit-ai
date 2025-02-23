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
    if (agent.type.includes('chat_processor')) {
      x = 350; // Center
      y = 50;  // Top
    } else if (agent.type.includes('sequence_designer')) {
      x = 350; // Center
      y = 200; // Middle
    } else {
      // Calculate position for specialist agents in a semi-circle below
      const specialistCount = configuration.agents.filter(a => 
        !a.type.includes('chat_processor') && !a.type.includes('sequence_designer')
      ).length;
      const specialistIndex = configuration.agents.filter(a => 
        !a.type.includes('chat_processor') && !a.type.includes('sequence_designer')
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

  // Create edges based on agent interactions
  const edges: Edge[] = [];

  // Helper to create an edge
  const createEdge = (source: string, target: string, style: 'command' | 'data' | 'feedback') => {
    const edgeStyles = {
      command: { 
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
        animated: true 
      },
      data: { 
        stroke: 'hsl(var(--primary))', 
        strokeWidth: 1,
        animated: true,
        strokeDasharray: '5,5'
      },
      feedback: { 
        stroke: 'hsl(var(--primary))',
        strokeWidth: 1,
        animated: true,
        strokeDasharray: '3,3'
      }
    };

    return {
      id: `${source}-${target}`,
      source,
      target,
      style: edgeStyles[style]
    };
  };

  // Connect chat processor to sequence designer
  const chatProcessor = nodes.find(n => n.data.type.includes('chat_processor'));
  const sequenceDesigner = nodes.find(n => n.data.type.includes('sequence_designer'));
  const specialists = nodes.filter(n => 
    !n.data.type.includes('chat_processor') && !n.data.type.includes('sequence_designer')
  );

  if (chatProcessor && sequenceDesigner) {
    // Command flow: Chat processor -> Sequence designer
    edges.push(createEdge(chatProcessor.id, sequenceDesigner.id, 'command'));

    // Feedback flow: Sequence designer -> Chat processor
    edges.push(createEdge(sequenceDesigner.id, chatProcessor.id, 'feedback'));

    // Connect sequence designer to specialists
    specialists.forEach(specialist => {
      // Data flow: Sequence designer -> Specialists
      edges.push(createEdge(sequenceDesigner.id, specialist.id, 'data'));

      // Feedback flow: Specialists -> Sequence designer
      edges.push(createEdge(specialist.id, sequenceDesigner.id, 'feedback'));
    });

    // Connect specialists in a ring for peer collaboration
    specialists.forEach((specialist, index) => {
      const nextSpecialist = specialists[(index + 1) % specialists.length];
      edges.push(createEdge(specialist.id, nextSpecialist.id, 'data'));
    });
  }

  return (
    <div className="h-[700px] border rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        className="bg-white"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <Panel position="top-left" className="bg-white border rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Agent Interaction Flow
              </h3>
              <p className="text-sm text-muted-foreground">
                Command → Data → Feedback flows
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Edge Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Solid: Command flow</li>
                <li>Dashed: Data exchange</li>
                <li>Dotted: Feedback loop</li>
              </ul>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}