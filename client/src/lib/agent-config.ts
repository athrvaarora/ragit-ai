import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentTypes(description: string): string[] {
  const agentTypes = new Set<string>();

  // Data Retrieval Agents
  if (description.toLowerCase().includes("research") || description.toLowerCase().includes("retriev")) {
    agentTypes.add("research");
  }
  if (description.toLowerCase().includes("document") || description.toLowerCase().includes("file")) {
    agentTypes.add("document_processor");
  }

  // Analysis Agents
  if (description.toLowerCase().includes("analy") || description.toLowerCase().includes("assess")) {
    agentTypes.add("analysis");
  }
  if (description.toLowerCase().includes("summar") || description.toLowerCase().includes("extract")) {
    agentTypes.add("summarization");
  }

  // Generation Agents
  if (description.toLowerCase().includes("generat") || description.toLowerCase().includes("creat")) {
    agentTypes.add("content_generator");
  }
  if (description.toLowerCase().includes("draft") || description.toLowerCase().includes("writ")) {
    agentTypes.add("document_writer");
  }

  // Specialized Agents
  if (description.toLowerCase().includes("sentiment") || description.toLowerCase().includes("emotion")) {
    agentTypes.add("sentiment_analyzer");
  }
  if (description.toLowerCase().includes("strategy") || description.toLowerCase().includes("plan")) {
    agentTypes.add("strategy_planner");
  }

  // Always include orchestrator for multiple agents
  if (agentTypes.size > 2) {
    agentTypes.add("orchestrator");
  }

  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: {
  role: string;
  domain: string;
  collaborators: string[];
}): string {
  const prompts = {
    research: `Role: Primary Research and Information Retrieval Agent

Primary Responsibilities:
- Execute comprehensive searches across knowledge bases
- Filter and rank results by relevance
- Maintain source tracking and citations
- Handle real-time updates to knowledge bases

Required Tools:
- Vector Database Connection (e.g., Pinecone, Weaviate)
- Document Chunking Processor
- Semantic Search Engine
- Citation Management System
- Version Control for Knowledge Base

Interoperability:
- Receives search queries from Orchestrator
- Sends retrieved documents to Document Processor
- Coordinates with Analysis Agent for relevance feedback
- Updates Strategy Planner with new findings

Example Scenarios:
1. Legal Research:
   Input: "Find precedents for patent infringement in semiconductor industry"
   Action: Searches legal databases, ranks cases by relevance, extracts key rulings
   Output: Structured dataset of relevant cases with confidence scores

2. Medical Literature Review:
   Input: "Latest research on mRNA vaccine efficacy"
   Action: Retrieves papers, filters by date and impact, cross-references findings
   Output: Comprehensive research summary with citations

3. Market Analysis:
   Input: "Competitive landscape for EV manufacturers"
   Action: Gathers market reports, news articles, and financial data
   Output: Multi-source analysis with trend identification`,

    analysis: `Role: Deep Analysis and Pattern Recognition Agent

Primary Responsibilities:
- Analyze complex relationships in data
- Identify patterns and anomalies
- Generate insights and recommendations
- Validate findings against established criteria

Required Tools:
- Advanced Analytics Engine
- Pattern Recognition System
- Statistical Analysis Library
- Validation Framework
- Data Visualization Tools

Interoperability:
- Receives processed data from Document Processor
- Collaborates with Research Agent for additional context
- Feeds insights to Strategy Planner
- Reports findings to Orchestrator

Example Scenarios:
1. Financial Analysis:
   Input: Quarterly reports and market trends
   Action: Analyzes performance metrics, identifies patterns
   Output: Strategic insights and risk assessment

2. Scientific Data Analysis:
   Input: Experimental results and historical data
   Action: Performs statistical analysis, validates hypotheses
   Output: Validated findings with confidence levels

3. Security Threat Analysis:
   Input: System logs and threat indicators
   Action: Analyzes patterns, correlates events
   Output: Threat assessment with recommended actions`,

    orchestrator: `Role: Workflow Orchestration and Coordination Agent

Primary Responsibilities:
- Coordinate multiple agent activities
- Manage task distribution and priorities
- Ensure coherent workflow execution
- Handle error recovery and retries

Required Tools:
- Workflow Management System
- Task Scheduler
- State Machine Handler
- Error Recovery Framework
- Performance Monitoring System

Interoperability:
- Central coordinator for all agents
- Manages task queues and priorities
- Handles inter-agent communication
- Monitors overall system health

Example Scenarios:
1. Research Project Coordination:
   Input: Complex research query
   Action: Breaks down tasks, assigns to specialized agents
   Output: Coordinated execution plan with monitoring

2. Multi-Stage Analysis:
   Input: Large dataset requiring multiple processing steps
   Action: Orchestrates processing pipeline, handles dependencies
   Output: Managed workflow with error handling

3. Real-time Processing:
   Input: Streaming data requiring immediate analysis
   Action: Coordinates real-time processing across agents
   Output: Synchronized processing with feedback loops`,

    document_processor: `Role: Document Processing and Transformation Agent

Primary Responsibilities:
- Process and normalize documents
- Extract structured information
- Handle multiple document formats
- Maintain document integrity

Required Tools:
- Document Parser Suite
- OCR System
- Format Converter
- Metadata Extractor
- Content Validator

Interoperability:
- Receives raw documents from Research Agent
- Sends processed content to Analysis Agent
- Updates Document Writer with structured content
- Reports processing status to Orchestrator

Example Scenarios:
1. Contract Processing:
   Input: Legal contracts in various formats
   Action: Extracts key terms, standardizes format
   Output: Structured contract data

2. Technical Documentation:
   Input: Product specifications and manuals
   Action: Processes technical content, extracts specifications
   Output: Standardized technical documentation

3. Medical Records:
   Input: Patient records and test results
   Action: Extracts medical data, normalizes format
   Output: Structured medical information`,

    strategy_planner: `Role: Strategic Planning and Recommendation Agent

Primary Responsibilities:
- Develop strategic recommendations
- Evaluate alternative approaches
- Project outcomes and risks
- Create action plans

Required Tools:
- Strategy Modeling System
- Risk Assessment Framework
- Decision Support System
- Outcome Simulator
- Planning Optimizer

Interoperability:
- Receives insights from Analysis Agent
- Collaborates with Research Agent for validation
- Feeds strategies to Document Writer
- Updates Orchestrator on strategy development

Example Scenarios:
1. Business Strategy:
   Input: Market analysis and competitor data
   Action: Develops strategic options, evaluates risks
   Output: Recommended strategy with implementation plan

2. Legal Strategy:
   Input: Case analysis and precedent data
   Action: Develops legal strategy, identifies risks
   Output: Legal approach with supporting arguments

3. Research Planning:
   Input: Research objectives and constraints
   Action: Plans research approach, allocates resources
   Output: Research strategy with milestones`,

    document_writer: `Role: Document Creation and Formatting Agent

Primary Responsibilities:
- Generate professional documents
- Format content appropriately
- Maintain consistency
- Handle citations and references

Required Tools:
- Document Generation System
- Template Engine
- Style Guide Enforcer
- Citation Manager
- Format Validator

Interoperability:
- Receives content from Strategy Planner
- Gets formatting rules from Orchestrator
- Collaborates with Research Agent for citations
- Updates Analysis Agent with document metrics

Example Scenarios:
1. Legal Brief:
   Input: Case analysis and strategy
   Action: Generates legal document with proper citations
   Output: Formatted legal brief

2. Technical Report:
   Input: Analysis results and recommendations
   Action: Creates structured technical document
   Output: Professional technical report

3. Research Paper:
   Input: Research findings and analysis
   Action: Generates academic paper with citations
   Output: Formatted research paper`
  };

  return prompts[type as keyof typeof prompts] || "";
}

export function generateRagConfiguration(
  requirements: ProjectRequirements
): RagAgentConfiguration {
  const agentTypes = determineAgentTypes(requirements.projectDescription);
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
        role: type,
        domain: requirements.projectName,
        collaborators: agentTypes.filter(t => t !== type)
      }),
      tooling: ["base_tools", "specialized_tools"]
    };
    agents.push(agent);
  }

  return {
    agents,
    interactionFlow: {
      pattern: agents.length > 2 ? "orchestrated" : "sequential",
      taskDistribution: {
        strategy: "capability_based",
        routing: "dynamic"
      },
      errorHandling: {
        strategy: "graceful_degradation",
        fallbackBehavior: "retry_with_simplification"
      }
    }
  };
}

export function getAgentRationale(requirements: ProjectRequirements): string {
  const agentTypes = determineAgentTypes(requirements.projectDescription);

  return `Based on your project description, I've identified the need for ${agentTypes.length} specialized RAG agents:

${agentTypes.map((type, index) => `${index + 1}. ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Agent
   - Primary role: ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} operations
   - Collaborates with: ${agentTypes.filter(t => t !== type).map(t => t.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}`).join('\n\n')}

Interaction Pattern: ${agentTypes.length > 2 ? 'Orchestrated' : 'Sequential'}
- ${agentTypes.length > 2 ? 'Centrally coordinated by Orchestrator Agent' : 'Direct agent-to-agent communication'}
- Dynamic task routing based on agent capabilities
- Automated error handling and recovery

This configuration is designed to:
- Handle complex multi-step workflows
- Maintain context across agent interactions
- Provide detailed audit trails
- Scale with increasing complexity`;
}