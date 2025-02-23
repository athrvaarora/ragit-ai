import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function analyzeProjectDescription(description: string): {
  dataTypes: string[];
  queryTypes: string[];
  complexity: string;
} {
  // This is a simple analysis, in a real system this would use NLP
  const dataTypes = [];
  if (description.toLowerCase().includes("document")) dataTypes.push("Documents");
  if (description.toLowerCase().includes("database")) dataTypes.push("Structured Data");
  if (description.toLowerCase().includes("code")) dataTypes.push("Code");
  if (description.toLowerCase().includes("web")) dataTypes.push("Web Content");

  const queryTypes = [];
  if (description.toLowerCase().includes("question")) queryTypes.push("Question Answering");
  if (description.toLowerCase().includes("extract")) queryTypes.push("Information Extraction");
  if (description.toLowerCase().includes("summariz")) queryTypes.push("Summarization");
  if (description.toLowerCase().includes("analys")) queryTypes.push("Analysis");

  const complexity = queryTypes.length > 2 ? "High" : 
                    queryTypes.length > 1 ? "Medium" : "Low";

  return {
    dataTypes: dataTypes.length > 0 ? dataTypes : ["Documents"],
    queryTypes: queryTypes.length > 0 ? queryTypes : ["Question Answering"],
    complexity
  };
}

function generateResearchPrompt(context: {
  sources: string[];
  domain: string;
}): string {
  return `You are a specialized research RAG agent focused on ${context.domain}.

Primary Responsibilities:
- Search through ${context.sources.join(", ")} for relevant information
- Analyze and extract key insights from diverse data sources
- Synthesize findings into structured outputs

Knowledge Base Access:
- Primary sources: ${context.sources.join(", ")}
- Search strategy: Hybrid semantic + keyword search with relevance ranking
- Context handling: Dynamic window with overlap

Tool Integration:
- Vector store: Optimized for semantic similarity search
- Document processor: Chunking with metadata preservation
- Citation tracker: Inline source attribution with confidence scores

Output Requirements:
- Format: JSON structured response with reasoning
- Citation style: Inline with source metadata
- Confidence indicators: Numeric scores with explanation`;
}

function generateAnalysisPrompt(analysisType: string): string {
  return `You are an analytical RAG agent specializing in ${analysisType}.

Core Functions:
- Process multi-modal inputs from research agent
- Apply comprehensive analysis methods
- Generate structured analytical insights

Data Processing Protocol:
1. Input validation: Schema-based validation with type checking
2. Analysis steps: Multi-stage pipeline with intermediate validation
3. Output formatting: Standardized JSON with metadata

Tool Usage:
- Analytics tools: NLP processor, pattern analyzer, insight generator
- Processing pipeline: Sequential with parallel processing where possible
- Quality checks: Automated validation at each step

Special Instructions:
- Maintain analysis chain-of-thought
- Track confidence levels for each insight
- Flag potential inconsistencies`;
}

function generateSynthesisPrompt(agentList: string[]): string {
  return `You are a synthesis RAG agent responsible for combining outputs.

Integration Responsibilities:
- Combine inputs from ${agentList.join(", ")}
- Resolve conflicts using hierarchical priority system
- Generate unified coherent responses

Coordination Protocol:
- Input handling: Validate and normalize all inputs
- Conflict resolution: Use confidence scores and source reliability
- Output validation: Schema compliance and consistency checks

Quality Controls:
- Consistency checks: Cross-reference validation
- Verification steps: Source alignment verification
- Error handling: Graceful degradation with fallbacks

Specific Requirements:
- Track all source attributions
- Maintain confidence scores
- Provide reasoning chain`;
}

export function generateRagConfiguration(
  requirements: ProjectRequirements
): RagAgentConfiguration {
  const analysis = analyzeProjectDescription(requirements.projectDescription);

  const agents = [];

  // Research Agent (Always included)
  agents.push({
    type: "research",
    role: "Information Retrieval and Research",
    responsibilities: [
      "Search and retrieve relevant information",
      "Extract key insights",
      "Track sources and citations"
    ],
    knowledgeBase: {
      sources: analysis.dataTypes,
      indexingStrategy: "hybrid_semantic_keyword",
      retrievalMethod: "relevance_ranked_retrieval"
    },
    promptTemplate: generateResearchPrompt({
      sources: analysis.dataTypes,
      domain: requirements.projectName
    }),
    tooling: ["vector_store", "document_processor", "citation_tracker"]
  });

  // Analysis Agent (for medium/high complexity)
  if (analysis.complexity !== "Low") {
    agents.push({
      type: "analysis",
      role: "Content Analysis and Insight Generation",
      responsibilities: [
        "Process retrieved content",
        "Generate insights",
        "Identify patterns"
      ],
      knowledgeBase: {
        sources: ["research_output"],
        indexingStrategy: "semantic_chunking",
        retrievalMethod: "context_aware_analysis"
      },
      promptTemplate: generateAnalysisPrompt(analysis.queryTypes.join(" and ")),
      tooling: ["nlp_processor", "insight_generator", "pattern_analyzer"]
    });
  }

  // Synthesis Agent (for high complexity)
  if (analysis.complexity === "High") {
    agents.push({
      type: "synthesis",
      role: "Response Integration and Formatting",
      responsibilities: [
        "Combine agent outputs",
        "Resolve conflicts",
        "Format final response"
      ],
      knowledgeBase: {
        sources: ["agent_outputs"],
        indexingStrategy: "template_based",
        retrievalMethod: "priority_based_synthesis"
      },
      promptTemplate: generateSynthesisPrompt(agents.map(a => a.role)),
      tooling: ["response_formatter", "conflict_resolver", "consistency_checker"]
    });
  }

  return {
    agents,
    interactionFlow: {
      pattern: agents.length > 1 ? "hierarchical" : "single",
      taskDistribution: {
        strategy: "sequential",
        routing: "confidence_based"
      },
      errorHandling: {
        strategy: "fallback_chain",
        fallbackBehavior: "graceful_degradation"
      }
    }
  };
}

export function getAgentRationale(requirements: ProjectRequirements): string {
  const analysis = analyzeProjectDescription(requirements.projectDescription);

  return `Based on your project description, I recommend the following RAG agent configuration:

Project Analysis:
- Detected Data Types: ${analysis.dataTypes.join(", ")}
- Query Types: ${analysis.queryTypes.join(", ")}
- Complexity Level: ${analysis.complexity}

Recommended Agent Structure:
${analysis.complexity === "High" ? `1. Research Agent (Primary Information Retrieval)
   - Handles initial data retrieval and source tracking
   - Implements comprehensive search strategy

2. Analysis Agent (Content Processing)
   - Processes retrieved content
   - Generates insights and patterns

3. Synthesis Agent (Integration)
   - Combines outputs from other agents
   - Ensures coherent final responses` :
analysis.complexity === "Medium" ? `1. Research Agent (Primary Information Retrieval)
   - Handles data retrieval and initial processing
   - Maintains source tracking

2. Analysis Agent (Content Processing)
   - Processes content and generates insights
   - Formats final responses` :
`1. Research Agent (All-in-One)
   - Handles complete information pipeline
   - Generates direct responses`}

This configuration is optimized for:
- Comprehensive information retrieval
- ${analysis.complexity !== "Low" ? "Deep content analysis" : "Basic content processing"}
- Clear source attribution
- ${analysis.complexity === "High" ? "Complex query handling" : "Straightforward response generation"}`;
}