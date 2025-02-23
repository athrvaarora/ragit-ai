import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();
  const desc = description.toLowerCase();

  // Function to identify agent types based on task descriptions
  function identifyAgentTypes(text: string) {
    const taskPatterns = {
      // Case Law and Research
      'case_research': ['case law', 'legal articles', 'precedents', 'research'],
      'statutory_analysis': ['statutory', 'regulations', 'laws', 'amendments'],
      'document_analysis': ['document', 'read', 'analyze', 'review'],
      'insight_generation': ['insights', 'analysis', 'assess', 'evaluate'],
      'strategy_development': ['strategy', 'plan', 'approach', 'recommend'],
      'content_generation': ['draft', 'write', 'generate', 'create']
    };

    // Check each pattern against the description
    Object.entries(taskPatterns).forEach(([agentType, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        agentTypes.add(agentType);
      }
    });
  }

  // Analyze main description
  identifyAgentTypes(desc);

  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: {
  projectName: string;
  description: string;
}): string {
  // Create dynamic prompts based on agent type and project context
  const basePrompt = `As a specialized agent in the ${context.projectName} system, this component focuses on `;

  const roleDescriptions: Record<string, string> = {
    case_research: `retrieving and organizing relevant case law and legal precedents. 

This agent specializes in searching through legal databases, identifying relevant cases, and extracting pertinent legal arguments and rulings. It uses sophisticated vector search capabilities to find cases based on legal concepts and fact patterns rather than just keyword matches.

The agent maintains a comprehensive understanding of legal citation formats and jurisdictional hierarchies, ensuring that retrieved materials are both relevant and authoritative. It works closely with other agents to ensure that discovered cases directly support the legal analysis being conducted.`,

    statutory_analysis: `analyzing and interpreting statutory laws and regulations. 

This agent focuses on understanding legislative intent, tracking amendments, and identifying relevant regulations that impact the current case. It maintains awareness of recent legal changes and their potential implications.

The agent excels at cross-referencing statutes with case law interpretations, ensuring a comprehensive understanding of how laws are applied in practice. It coordinates with other agents to provide a complete legal framework for analysis.`,

    document_analysis: `processing and analyzing legal documents and case materials. 

This agent specializes in extracting key information from complex legal documents, identifying crucial arguments, and understanding procedural history. It employs advanced document processing techniques to handle various document formats and structures.

The agent works systematically to break down complex legal documents into analyzable components, identifying key legal issues, factual backgrounds, and judicial reasoning.`,

    insight_generation: `generating analytical insights from legal research materials. 

This agent focuses on synthesizing information from multiple sources to produce meaningful legal insights. It identifies patterns in legal reasoning, tracks evolutionary changes in legal interpretation, and highlights potential arguments and counter-arguments.

The agent excels at connecting disparate pieces of legal information to form coherent legal theories and arguments.`,

    strategy_development: `developing legal strategies based on comprehensive research and analysis. 

This agent specializes in formulating legal approaches by combining insights from case law, statutory analysis, and document review. It evaluates the strength of legal positions and suggests optimal argumentative strategies.

The agent considers both legal precedent and practical implications when developing strategic recommendations.`,

    content_generation: `creating well-structured legal documents and summaries. 

This agent focuses on producing clear, concise, and legally sound documentation. It transforms complex legal analysis into readable and persuasive content, ensuring proper citation and professional formatting.

The agent maintains consistency in legal argumentation while adapting the writing style to the intended audience and purpose.`
  };

  return basePrompt + (roleDescriptions[type] || 'executing specialized tasks within the workflow.');
}

function generateToolset(type: string): string[] {
  const toolsets: Record<string, string[]> = {
    case_research: [
      "precedent_finder",      // Searches and retrieves relevant case law
      "citation_validator",    // Validates and formats legal citations
      "relevance_scorer",      // Scores cases by relevance to current matter
      "jurisdiction_filter"    // Filters cases by jurisdictional authority
    ],
    statutory_analysis: [
      "statute_tracker",       // Tracks statutory amendments and changes
      "regulation_mapper",     // Maps relationships between laws and regulations
      "compliance_checker",    // Checks regulatory compliance requirements
      "impact_analyzer"        // Analyzes impact of legal changes
    ],
    document_analysis: [
      "content_extractor",     // Extracts key information from documents
      "structure_analyzer",    // Analyzes document structure and organization
      "reference_linker",      // Links related documents and references
      "format_processor"       // Processes different document formats
    ],
    insight_generation: [
      "pattern_identifier",    // Identifies patterns in legal reasoning
      "argument_mapper",       // Maps legal arguments and counter-arguments
      "trend_analyzer",        // Analyzes legal trends and developments
      "insight_synthesizer"    // Synthesizes insights from multiple sources
    ],
    strategy_development: [
      "strategy_formulator",   // Formulates legal strategies
      "risk_assessor",        // Assesses legal risks and opportunities
      "approach_optimizer",    // Optimizes strategic approaches
      "outcome_predictor"      // Predicts potential outcomes
    ],
    content_generation: [
      "document_composer",     // Composes legal documents
      "citation_formatter",    // Formats legal citations
      "style_adapter",        // Adapts writing style for audience
      "quality_checker"       // Checks document quality and consistency
    ]
  };

  return toolsets[type] || [
    "task_processor",
    "quality_validator",
    "integration_handler",
    "output_optimizer"
  ];
}

function getAgentCollaborationOverview(): string {
  return `The multi-agent RAG system operates through a coordinated network of specialized agents, each focusing on specific aspects of the overall task. 

The agents work together in a hierarchical structure:
1. Strategic Level: Coordinates overall workflow and resource allocation
2. Processing Level: Handles specialized information processing tasks
3. Generation Level: Produces final outputs and deliverables

Information flows both vertically and horizontally:
- Vertical: Strategic direction flows down, results and feedback flow up
- Horizontal: Peer agents collaborate and share information at their respective levels

The system maintains flexibility to adapt to different project requirements while ensuring consistent quality and efficiency in output generation.

Key collaboration patterns:
- Parallel Processing: Multiple agents can work simultaneously on different aspects
- Sequential Processing: Results flow from one agent to another in a logical sequence
- Feedback Loops: Continuous improvement through performance monitoring and adjustment`;
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
        description: requirements.projectDescription
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

  const agentDescriptions = agentTypes.map(type => {
    const readableName = type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const tools = generateToolset(type);
    return `${readableName} Agent:
- Primary Focus: ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} operations
- Key Tools: ${tools.join(', ')}`;
  }).join('\n\n');

  return `Based on the project requirements for ${requirements.projectName}, I've identified the need for ${agentTypes.length} specialized RAG agents:

${agentDescriptions}

Interaction Pattern: Orchestrated
- Agents work together in a coordinated workflow
- Dynamic task routing based on agent capabilities
- Continuous feedback and adaptation
- Comprehensive error handling

This configuration ensures:
- Efficient task processing
- Clear responsibility delegation
- Specialized expertise utilization
- Scalable operations

${getAgentCollaborationOverview()}`;
}