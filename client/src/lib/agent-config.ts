import { ProjectRequirements, AgentConfiguration } from "@shared/schema";

export function generateAgentConfiguration(
  requirements: ProjectRequirements
): AgentConfiguration {
  const configuration: AgentConfiguration = {
    agents: [],
    interactions: {
      pattern: "sequential",
      dataFlow: {},
      errorHandling: {
        retryLogic: "exponential",
        maxRetries: 3
      }
    }
  };

  // Add Research Agent if needed
  if (requirements.queryPatterns.includes("Information Extraction") || 
      requirements.queryPatterns.includes("Question Answering")) {
    configuration.agents.push({
      type: "research",
      role: "Information Retrieval and Research",
      knowledgeBases: requirements.dataTypes,
      tooling: ["vector_store", "document_processor"],
      memoryConfig: {
        type: "buffer",
        size: requirements.scaleRequirements.dataVolume === "Large (>1GB)" ? 1000 : 500
      }
    });
  }

  // Add Analysis Agent if needed
  if (requirements.queryPatterns.includes("Analysis") ||
      requirements.queryPatterns.includes("Summarization")) {
    configuration.agents.push({
      type: "analysis",
      role: "Data Analysis and Synthesis",
      knowledgeBases: requirements.dataTypes,
      tooling: ["analytics_engine", "nlp_processor"],
      memoryConfig: {
        type: "semantic",
        embeddings: true
      }
    });
  }

  // Add Synthesis Agent for combining outputs
  if (configuration.agents.length > 1) {
    configuration.agents.push({
      type: "synthesis",
      role: "Output Integration and Formatting",
      knowledgeBases: [],
      tooling: ["output_formatter", "consistency_checker"],
      memoryConfig: {
        type: "short_term",
        ttl: 3600
      }
    });
  }

  return configuration;
}

export function generatePromptTemplate(agent: AgentConfiguration["agents"][0]): string {
  const templates = {
    research: `You are a specialized research RAG agent focused on ${agent.role}.

Primary Responsibilities:
- Search through ${agent.knowledgeBases.join(", ")} for relevant information
- Extract key insights and evidence
- Maintain citation tracking

Knowledge Base Access:
- Primary sources: ${agent.knowledgeBases.join(", ")}
- Search strategy: Hybrid semantic + keyword
- Context window: ${agent.memoryConfig.size || "default"}

Tool Integration:
- Vector store: ${agent.tooling.includes("vector_store") ? "enabled" : "disabled"}
- Document processor: ${agent.tooling.includes("document_processor") ? "enabled" : "disabled"}
`,
    analysis: `You are an analytical RAG agent specializing in ${agent.role}.

Core Functions:
- Process inputs from knowledge bases
- Apply analytical methods
- Generate structured insights

Data Processing Protocol:
- Input validation: strict schema enforcement
- Analysis pipeline: multi-stage processing
- Quality checks: automated validation

Tool Usage:
- Analytics engine: ${agent.tooling.includes("analytics_engine") ? "enabled" : "disabled"}
- NLP processor: ${agent.tooling.includes("nlp_processor") ? "enabled" : "disabled"}
`,
    synthesis: `You are a synthesis RAG agent responsible for ${agent.role}.

Integration Responsibilities:
- Combine inputs from multiple agents
- Resolve conflicts using priority rules
- Generate unified outputs

Coordination Protocol:
- Input handling: strict validation
- Conflict resolution: hierarchical
- Output validation: schema-based

Quality Controls:
- Consistency checks: enabled
- Output formatter: ${agent.tooling.includes("output_formatter") ? "enabled" : "disabled"}
`
  };

  return templates[agent.type as keyof typeof templates] || "";
}
