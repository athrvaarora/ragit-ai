import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Panel
} from "reactflow";
import "reactflow/dist/style.css";
import { RagAgentConfiguration } from "@shared/schema";

interface AgentFlowProps {
  configuration: RagAgentConfiguration;
}

export function AgentFlow({ configuration }: AgentFlowProps) {
  const nodes: Node[] = configuration.agents.map((agent, index) => ({
    id: agent.type,
    data: { label: agent.role },
    position: { x: 250 * index, y: 100 },
    type: "default"
  }));

  const edges: Edge[] = [];
  for (let i = 0; i < configuration.agents.length - 1; i++) {
    edges.push({
      id: `${configuration.agents[i].type}-${configuration.agents[i + 1].type}`,
      source: configuration.agents[i].type,
      target: configuration.agents[i + 1].type,
      animated: true
    });
  }

  return (
    <div className="h-[400px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <div className="bg-background p-2 rounded shadow-sm">
            <h3 className="font-medium">Agent Interaction Flow</h3>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}