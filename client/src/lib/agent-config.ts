import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineOptimalAgentCount(requirements: ProjectRequirements): number {
  const { queryRequirements, dataCharacteristics } = requirements;
  let baseCount = 1;

  // Increase count based on query complexity
  if (queryRequirements.complexity === "High") baseCount += 1;

  // Increase for high data volume
  if (dataCharacteristics.dataVolume === "Large") baseCount += 1;

  // Increase for multiple data types
  if (dataCharacteristics.dataTypes.length > 2) baseCount += 1;

  return Math.min(baseCount, 5); // Cap at 5 agents
}

function generatePromptTemplate(role: string, responsibilities: string[]): string {
  return `You are a specialized RAG agent focused on ${role}.

Key Responsibilities:
${responsibilities.map(r => `- ${r}`).join('\n')}

Guidelines:
1. Always provide source context for your responses
2. Maintain chain of thought reasoning
3. Indicate confidence levels for responses
4. Request clarification when context is ambiguous

Response Format:
{
  "reasoning": "Your step-by-step thought process",
  "response": "Your final answer or action",
  "sources": ["List of relevant sources"],
  "confidence": "Score between 0-1"
}`;
}

export function generateRagConfiguration(
  requirements: ProjectRequirements
): RagAgentConfiguration {
  const agentCount = determineOptimalAgentCount(requirements);
  const agents = [];

  // Always include a primary retrieval agent
  agents.push({
    type: "retriever",
    role: "Knowledge Base Query Specialist",
    responsibilities: [
      "Efficient document retrieval",
      "Context relevance ranking",
      "Source tracking"
    ],
    knowledgeBase: {
      sources: requirements.dataCharacteristics.dataTypes,
      indexingStrategy: "hybrid_embedding_keyword",
      retrievalMethod: "semantic_search_with_reranking"
    },
    promptTemplate: generatePromptTemplate("Knowledge Retrieval", [
      "Search and retrieve relevant documents",
      "Rank results by relevance",
      "Maintain source citations"
    ]),
    tooling: ["vector_store", "semantic_search", "reranking"]
  });

  // Add processors based on requirements
  if (agentCount >= 2) {
    agents.push({
      type: "processor",
      role: "Content Analysis & Synthesis",
      responsibilities: [
        "Deep content analysis",
        "Information extraction",
        "Insight generation"
      ],
      knowledgeBase: {
        sources: ["processed_retrieval_results"],
        indexingStrategy: "semantic_chunking",
        retrievalMethod: "contextual_analysis"
      },
      promptTemplate: generatePromptTemplate("Content Processing", [
        "Analyze retrieved content",
        "Extract key information",
        "Generate insights"
      ]),
      tooling: ["nlp_processor", "entity_extractor", "summarizer"]
    });
  }

  // Add orchestrator for complex scenarios
  if (agentCount >= 3) {
    agents.push({
      type: "orchestrator",
      role: "Query Planning & Coordination",
      responsibilities: [
        "Task decomposition",
        "Agent coordination",
        "Result aggregation"
      ],
      knowledgeBase: {
        sources: ["agent_capabilities", "task_patterns"],
        indexingStrategy: "task_decomposition",
        retrievalMethod: "capability_matching"
      },
      promptTemplate: generatePromptTemplate("Orchestration", [
        "Break down complex queries",
        "Coordinate agent tasks",
        "Aggregate results"
      ]),
      tooling: ["task_planner", "coordinator", "result_aggregator"]
    });
  }

  return {
    agents,
    interactionFlow: {
      pattern: agentCount > 1 ? "hierarchical" : "single",
      taskDistribution: {
        strategy: "capability_based",
        routing: "dynamic"
      },
      errorHandling: {
        strategy: "fallback_chain",
        fallbackBehavior: "graceful_degradation"
      }
    }
  };
}

export function getAgentRationale(requirements: ProjectRequirements): string {
  const agentCount = determineOptimalAgentCount(requirements);

  return `Based on your requirements:
- Data Volume: ${requirements.dataCharacteristics.dataVolume}
- Query Complexity: ${requirements.queryRequirements.complexity}
- Data Types: ${requirements.dataCharacteristics.dataTypes.join(", ")}

Recommended ${agentCount} RAG agent(s) because:
${agentCount >= 1 ? "- Need basic retrieval capabilities\n" : ""}
${agentCount >= 2 ? "- Complex data processing required\n" : ""}
${agentCount >= 3 ? "- Query complexity requires orchestration\n" : ""}

This configuration optimizes for:
- Query response time
- Processing accuracy
- Resource efficiency`;
}