import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();

  // Core RAG Agents based on functionality
  if (description.toLowerCase().includes("retriev") || description.toLowerCase().includes("search")) {
    agentTypes.add("retrieval_agent");
  }
  if (description.toLowerCase().includes("analy") || description.toLowerCase().includes("process")) {
    agentTypes.add("analysis_agent");
  }
  if (description.toLowerCase().includes("generat") || description.toLowerCase().includes("create")) {
    agentTypes.add("generation_agent");
  }
  if (description.toLowerCase().includes("summar") || description.toLowerCase().includes("extract")) {
    agentTypes.add("summarization_agent");
  }

  // Always include strategy agent for coordination
  agentTypes.add("strategy_agent");

  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: {
  projectName: string;
  domain: string;
}): string {
  const prompts: Record<string, string> = {
    strategy_agent: `As the Strategic Coordinator for ${context.projectName}, this agent orchestrates the overall RAG system operation. It analyzes incoming queries, determines the optimal sequence of agent interactions, and ensures coherent output generation.

The agent maintains a high-level view of all operations, coordinating the retrieval, analysis, and generation processes. It dynamically adjusts the workflow based on query complexity and required output format, ensuring optimal resource utilization and result quality.

Through its strategic planning tools, this agent optimizes the interaction between specialized agents. The performance analyzer provides insights into system effectiveness, while the workflow optimizer enables dynamic adjustment of processing pipelines based on real-time feedback.`,

    retrieval_agent: `Operating as the Information Retrieval Specialist for ${context.projectName}, this agent excels at efficient and accurate information retrieval from various knowledge sources. It handles query preprocessing, source selection, and relevance ranking.

The agent employs sophisticated retrieval algorithms to ensure comprehensive yet focused information gathering. It works closely with other agents to refine search parameters and improve result relevance based on context and requirements.

Using advanced search optimization tools, this agent ensures efficient information retrieval while maintaining result quality. The source validator ensures information accuracy, while the context analyzer helps maintain relevance to the current query.`,

    analysis_agent: `Serving as the Analysis Expert for ${context.projectName}, this agent specializes in processing and analyzing retrieved information. It identifies patterns, extracts key insights, and provides structured analysis of complex data.

The agent applies various analytical techniques to transform raw information into actionable insights. It coordinates with other agents to ensure analysis aligns with query requirements and supports final output generation.

Through its analytical toolkit, this agent performs deep analysis of retrieved content. The pattern detector identifies key trends, while the insight generator produces meaningful conclusions from analyzed data.`,

    summarization_agent: `Acting as the Summarization Specialist for ${context.projectName}, this agent focuses on condensing and clarifying complex information. It creates concise, coherent summaries while preserving key information and context.

The agent excels at identifying core concepts and critical details, producing summaries that match user requirements. It works with other agents to ensure summaries reflect the most relevant insights and maintain proper context.

Using advanced summarization tools, this agent produces clear and focused content. The relevance analyzer ensures key points are preserved, while the clarity checker maintains readability and coherence.`,

    generation_agent: `Operating as the Content Generation Expert for ${context.projectName}, this agent specializes in producing coherent and contextually appropriate outputs. It transforms analyzed information into well-structured, relevant content.

The agent focuses on generating content that effectively communicates insights and answers. It coordinates with other agents to ensure generated content accurately reflects retrieved information and analysis results.

Through its generation toolkit, this agent creates high-quality outputs. The content structurer ensures logical organization, while the quality validator maintains output standards.`
  };

  return prompts[type] || `Role: ${type} Agent\n\nDetailed prompt not yet implemented.`;
}

function generateToolset(type: string): string[] {
  const toolsets: Record<string, string[]> = {
    strategy_agent: [
      "query_analyzer",        // Analyzes and breaks down complex queries
      "workflow_planner",      // Plans agent interaction sequences
      "resource_allocator",    // Optimizes resource distribution
      "performance_monitor"    // Tracks system performance
    ],
    retrieval_agent: [
      "query_optimizer",       // Optimizes search queries
      "source_selector",       // Selects appropriate knowledge sources
      "relevance_ranker",      // Ranks results by relevance
      "context_preserver"      // Maintains search context
    ],
    analysis_agent: [
      "pattern_detector",      // Identifies patterns in data
      "relationship_mapper",   // Maps relationships between concepts
      "insight_extractor",     // Extracts key insights
      "validation_checker"     // Validates analysis results
    ],
    summarization_agent: [
      "key_point_extractor",   // Identifies key information
      "context_maintainer",    // Preserves essential context
      "clarity_enhancer",      // Improves readability
      "consistency_checker"    // Ensures summary consistency
    ],
    generation_agent: [
      "content_structurer",    // Structures output content
      "coherence_checker",     // Ensures output coherence
      "style_adapter",         // Adapts output style
      "quality_validator"      // Validates output quality
    ]
  };

  return toolsets[type] || ["default_toolkit"];
}

// Agent Collaboration Overview
function getAgentCollaborationOverview(): string {
  return `The RAG system operates through a coordinated network of specialized agents:

The Strategy Agent serves as the system coordinator, managing query processing and agent interactions. It analyzes requirements and orchestrates the optimal workflow for each query.

The specialized agents work together in a coordinated pipeline:
- The Retrieval Agent fetches relevant information from knowledge sources
- The Analysis Agent processes and extracts insights from retrieved information
- The Summarization Agent condenses complex information while preserving key points
- The Generation Agent produces final outputs based on processed information

This agent network ensures:
- Efficient information processing
- Comprehensive analysis
- Clear and relevant outputs
- Adaptable workflows

Each agent maintains constant communication with the Strategy Agent, providing feedback and receiving guidance for optimal system performance.`;
}

export function generateRagConfiguration(
  requirements: ProjectRequirements
): RagAgentConfiguration {
  const agentTypes = determineAgentHierarchy(requirements.projectDescription);
  const agents = [];

  for (const type of agentTypes) {
    const agent = {
      type,
      role: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      responsibilities: [],
      knowledgeBase: {
        sources: ["domain_specific_data", "general_knowledge"],
        indexingStrategy: "hybrid_semantic_keyword",
        retrievalMethod: "context_aware_retrieval"
      },
      promptTemplate: generateAgentPrompt(type, {
        projectName: requirements.projectName,
        domain: "general"
      }),
      tooling: generateToolset(type)
    };
    agents.push(agent);
  }

  return {
    agents,
    interactionFlow: {
      pattern: "orchestrated",
      taskDistribution: {
        strategy: "hierarchical",
        routing: "chain_of_command"
      },
      errorHandling: {
        strategy: "graceful_degradation",
        fallbackBehavior: "escalate_to_supervisor"
      }
    }
  };
}

export function getAgentRationale(requirements: ProjectRequirements): string {
  const agentTypes = determineAgentHierarchy(requirements.projectDescription);

  const hierarchy = {
    strategy: agentTypes.filter(t => t.includes('strategy')),
    core: agentTypes.filter(t => !t.includes('strategy'))
  };

  return `Based on your project requirements for ${requirements.projectName}, I've designed a RAG agent structure:

Strategy Level:
${hierarchy.strategy.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary role: System coordination and workflow optimization

Specialized Agents:
${hierarchy.core.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary roles: Specialized information processing and generation

Interaction Pattern: Orchestrated
- Centrally coordinated through Strategy Agent
- Dynamic task routing based on query requirements
- Continuous feedback and adaptation
- Comprehensive error handling

This structure ensures:
- Efficient query processing
- Specialized task handling
- Clear responsibility delegation
- Scalable operations

${getAgentCollaborationOverview()}`;
}