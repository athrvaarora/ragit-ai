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

function generatePromptTemplate(agentType: string, context: {
  role: string;
  responsibilities: string[];
  dataTypes?: string[];
  previousAgent?: string;
  nextAgent?: string;
}): string {
  const basePrompt = `You are a specialized RAG (Retrieval Augmented Generation) agent focused on ${context.role}.

Key Responsibilities:
${context.responsibilities.map(r => `- ${r}`).join('\n')}

Interaction Context:
${context.previousAgent ? `- Receives input from: ${context.previousAgent}` : '- Primary input handler'}
${context.nextAgent ? `- Sends output to: ${context.nextAgent}` : '- Final output generator'}

Execution Guidelines:
1. Context Management:
   - Always maintain relevant context from knowledge base
   - Track context window limitations
   - Handle context overflow gracefully

2. Source Attribution:
   - Cite specific sources for retrieved information
   - Track confidence levels for retrieved content
   - Maintain source metadata

3. Chain of Thought:
   - Document reasoning process
   - Explain retrieval decisions
   - Note any ambiguities or uncertainties

Output Format:
{
  "reasoning": {
    "contextAnalysis": "How you interpreted the input",
    "retrievalStrategy": "How you searched the knowledge base",
    "processingSteps": ["List of steps taken"]
  },
  "response": {
    "content": "Your processed response",
    "format": "specified_format"
  },
  "metadata": {
    "sources": ["List of sources used"],
    "confidence": 0.95,
    "contextCoverage": "Complete/Partial"
  }
}`;

  const agentSpecificPrompts = {
    retriever: `
Knowledge Base Interaction:
- Sources: ${context.dataTypes?.join(', ')}
- Primary search strategy: Semantic + keyword hybrid
- Reranking approach: Relevance + recency

Retrieval Guidelines:
1. Start with broad semantic search
2. Refine with keyword matching
3. Rerank based on relevance scores
4. Chunk and format for next agent`,

    processor: `
Processing Guidelines:
1. Extract key information from retrieved chunks
2. Synthesize across multiple sources
3. Handle conflicting information
4. Format for final synthesis

Analysis Parameters:
- Contradiction detection
- Information synthesis
- Cross-reference validation
- Confidence scoring`,

    synthesizer: `
Synthesis Guidelines:
1. Combine multiple agent outputs
2. Resolve conflicts
3. Ensure coherence
4. Format final response

Quality Checks:
- Consistency verification
- Source alignment
- Response completeness
- Format compliance`
  };

  return `${basePrompt}\n\n${agentSpecificPrompts[agentType as keyof typeof agentSpecificPrompts] || ''}`;
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
      "Execute semantic and keyword searches",
      "Rank and filter results",
      "Chunk content appropriately",
      "Track source metadata"
    ],
    knowledgeBase: {
      sources: requirements.dataCharacteristics.dataTypes,
      indexingStrategy: "hybrid_embedding_keyword",
      retrievalMethod: "semantic_search_with_reranking"
    },
    promptTemplate: generatePromptTemplate("retriever", {
      role: "Knowledge Base Query Specialist",
      responsibilities: [
        "Execute semantic and keyword searches",
        "Rank and filter results",
        "Chunk content appropriately",
        "Track source metadata"
      ],
      dataTypes: requirements.dataCharacteristics.dataTypes,
      nextAgent: "Content Processor"
    }),
    tooling: ["vector_store", "semantic_search", "reranking"]
  });

  // Add processors based on requirements
  if (agentCount >= 2) {
    agents.push({
      type: "processor",
      role: "Content Analysis & Synthesis",
      responsibilities: [
        "Extract key information",
        "Analyze relationships",
        "Identify patterns",
        "Generate insights"
      ],
      knowledgeBase: {
        sources: ["processed_retrieval_results"],
        indexingStrategy: "semantic_chunking",
        retrievalMethod: "contextual_analysis"
      },
      promptTemplate: generatePromptTemplate("processor", {
        role: "Content Analysis & Synthesis",
        responsibilities: [
          "Extract key information",
          "Analyze relationships",
          "Identify patterns",
          "Generate insights"
        ],
        previousAgent: "Knowledge Base Query Specialist",
        nextAgent: "Response Synthesizer"
      }),
      tooling: ["nlp_processor", "entity_extractor", "summarizer"]
    });
  }

  // Add synthesizer for complex scenarios
  if (agentCount >= 3) {
    agents.push({
      type: "synthesizer",
      role: "Response Integration & Formatting",
      responsibilities: [
        "Combine multiple inputs",
        "Resolve conflicts",
        "Ensure coherence",
        "Format final output"
      ],
      knowledgeBase: {
        sources: ["processed_analysis_results"],
        indexingStrategy: "response_templates",
        retrievalMethod: "template_matching"
      },
      promptTemplate: generatePromptTemplate("synthesizer", {
        role: "Response Integration & Formatting",
        responsibilities: [
          "Combine multiple inputs",
          "Resolve conflicts",
          "Ensure coherence",
          "Format final output"
        ],
        previousAgent: "Content Analysis & Synthesis"
      }),
      tooling: ["response_formatter", "consistency_checker", "template_engine"]
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
  const complexityFactors = [];

  if (requirements.queryRequirements.complexity === "High") {
    complexityFactors.push("High query complexity requiring sophisticated processing");
  }
  if (requirements.dataCharacteristics.dataVolume === "Large") {
    complexityFactors.push("Large data volume requiring distributed processing");
  }
  if (requirements.dataCharacteristics.dataTypes.length > 2) {
    complexityFactors.push("Multiple data types requiring specialized handling");
  }

  return `Based on your requirements:
- Data Types: ${requirements.dataCharacteristics.dataTypes.join(", ")}
- Data Volume: ${requirements.dataCharacteristics.dataVolume}
- Query Complexity: ${requirements.queryRequirements.complexity}
- Update Frequency: ${requirements.dataCharacteristics.updateFrequency}

Recommended ${agentCount} RAG agent(s) due to:
${complexityFactors.map(factor => `- ${factor}`).join('\n')}

Agent Roles and Interaction Pattern:
${agentCount >= 1 ? "1. Knowledge Base Query Specialist (Primary Retriever)\n   - Handles initial data retrieval and chunking\n   - Implements hybrid search strategy" : ""}
${agentCount >= 2 ? "\n2. Content Analyzer\n   - Processes retrieved content\n   - Extracts key information and patterns" : ""}
${agentCount >= 3 ? "\n3. Response Synthesizer\n   - Combines outputs from other agents\n   - Ensures coherent final responses" : ""}

Task Delegation Strategy:
- Sequential processing with feedback loops
- Dynamic routing based on query complexity
- Automatic fallback mechanisms
- Source attribution tracking

This configuration optimizes for:
- Query response accuracy
- Processing efficiency
- Source traceability
- Result consistency`;
}