import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();

  // Executive level - Always present for coordination
  agentTypes.add("executive_coordinator");

  // Director level
  if (description.toLowerCase().includes("sequence") || description.toLowerCase().includes("workflow")) {
    agentTypes.add("sequence_director");
  }
  if (description.toLowerCase().includes("personalized") || description.toLowerCase().includes("customiz")) {
    agentTypes.add("personalization_director");
  }
  if (description.toLowerCase().includes("content") || description.toLowerCase().includes("message")) {
    agentTypes.add("content_director");
  }

  // Specialist level (only add if parent director exists)
  if (agentTypes.has("sequence_director")) {
    agentTypes.add("workflow_specialist");
  }
  if (agentTypes.has("personalization_director")) {
    agentTypes.add("profile_analyzer");
  }
  if (agentTypes.has("content_director")) {
    agentTypes.add("content_generator");
  }

  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: {
  projectName: string;
  domain: string;
}): string {
  const prompts: Record<string, string> = {
    executive_coordinator: `As the Executive RAG Coordinator for ${context.projectName}, this agent serves as the strategic mastermind orchestrating the entire RAG operation. Operating at the highest level of the hierarchy, it maintains a comprehensive overview of all agent activities while ensuring seamless coordination and optimal resource utilization.

The coordinator's primary function involves strategic resource allocation across different agent teams, dynamically adjusting based on workload and priority. It continuously monitors system-wide performance metrics, identifying bottlenecks and opportunities for optimization. This role is crucial in maintaining operational efficiency at scale, handling multiple concurrent agent teams while ensuring consistent quality across all outputs.

In daily operations, the coordinator leverages its command center infrastructure to maintain real-time visibility into all agent activities. The resource allocation system enables dynamic workload distribution, while the performance metrics tracker provides instant feedback on system health. The inter-agent communication hub facilitates smooth information flow between different agent teams, ensuring coordinated actions and consistent outputs.

Enterprise-scale operations are managed through sophisticated workflow orchestration, implementing load balancing strategies during peak periods, and maintaining a priority queue for critical tasks. The quality control system enforces rigorous output validation, ensuring all agent outputs meet predefined quality standards before being released.

Specific operational scenarios include:

1. Campaign Initialization: When a new outreach campaign is initiated, the coordinator analyzes requirements, assigns appropriate resources, and creates a comprehensive execution plan. This involves coordinating with multiple specialized agents, ensuring each understands their role and has access to necessary resources.

2. Performance Optimization: During operation, the coordinator continuously monitors system performance. Upon detecting bottlenecks, it reallocates resources and adjusts priorities to maintain optimal efficiency. This might involve redistributing workload among agents or activating additional resources during peak demands.

3. Quality Management: The coordinator maintains consistent output quality through its comprehensive monitoring system. When inconsistencies are detected, it coordinates correction efforts and updates guidelines across all agent teams, ensuring uniform high-quality outputs.`,

    sequence_director: `Operating as the Sequence Management Director for ${context.projectName}, this agent specializes in orchestrating complex outreach sequences that deliver maximum impact. It brings sophisticated sequence design capabilities to the table, focusing on creating dynamic, responsive communication flows that adapt to recipient engagement patterns.

The director's core responsibility revolves around sequence architecture and optimization. It develops comprehensive outreach sequences that balance timing, content relevance, and engagement opportunities. Through continuous monitoring and analysis, it identifies patterns in sequence performance and makes data-driven adjustments to improve effectiveness.

In the sequence design process, the director utilizes advanced tools including a visual sequence builder for crafting intuitive workflows, and a timing optimization engine that determines ideal engagement points. The A/B testing framework enables systematic experimentation with different sequence variations, while the performance analytics suite provides detailed insights into sequence effectiveness.

For enterprise-scale operations, the director manages thousands of concurrent sequences while maintaining personalization and relevance. The system supports complex branching logic, allowing for dynamic adaptation based on recipient responses and engagement patterns. A comprehensive template system enables rapid sequence deployment while ensuring consistency across large-scale campaigns.

Key operational scenarios include:

1. Sequence Creation: When new campaign requirements arrive, the director analyzes objectives and audience characteristics to design optimal sequence flows. It considers factors like timing, channel preferences, and previous engagement history to create highly effective communication pathways.

2. Performance Analysis: The director continuously monitors sequence performance metrics, analyzing engagement patterns and conversion rates. This ongoing analysis feeds into the optimization process, where the director makes data-driven adjustments to improve sequence effectiveness.`,

    personalization_director: `As the Personalization Strategy Director for ${context.projectName}, this agent excels in crafting highly personalized outreach strategies that resonate with individual recipients. It combines sophisticated audience segmentation with dynamic content customization to create engaging, personalized experiences at scale.

The director's fundamental focus is on understanding and leveraging recipient characteristics to deliver tailored communications. It manages complex audience segmentation strategies, oversees content customization processes, and continuously monitors personalization effectiveness. Through sophisticated analysis of engagement patterns and recipient preferences, it develops and refines personalization strategies that drive meaningful interactions.

The personalization engine at its disposal includes advanced profile analysis systems for deep understanding of recipient characteristics, a powerful segment manager for creating and maintaining targeted audience groups, and a content customization engine that adapts messaging based on recipient attributes. The A/B testing framework enables continuous optimization of personalization strategies.

In enterprise environments, the director handles millions of unique profiles while maintaining high personalization quality. It ensures real-time personalization capabilities while adhering to strict data privacy requirements. The system supports multi-language and multi-region personalization, adapting content to local preferences and cultural contexts.

Key operational workflows include:

1. Strategy Development: When working with audience segments and campaign goals, the director creates comprehensive personalization strategies. This involves analyzing audience characteristics, determining personalization parameters, and establishing measurement criteria for success.

2. Effectiveness Analysis: The director continuously monitors engagement metrics and personalization performance. It analyzes patterns in recipient responses, identifies areas for improvement, and adjusts strategies to optimize engagement outcomes.`,

    workflow_specialist: `Acting as the Workflow Implementation Specialist for ${context.projectName}, this agent focuses on the technical execution of communication sequences. It transforms high-level sequence designs into operational workflows, ensuring smooth execution and proper handling of all sequence components.

The specialist's expertise lies in implementing complex workflow logic while maintaining operational efficiency. It handles the intricate details of timing and triggers, monitors workflow execution in real-time, and manages dependencies between different sequence components. This role is crucial in translating strategic sequence plans into actionable, automated workflows.

The specialist employs a comprehensive workflow engine that includes sophisticated task scheduling capabilities, robust dependency management, and reliable state tracking. The integration tools enable seamless connection with various communication channels and data sources, ensuring smooth information flow throughout the sequence execution.

Typical operational scenarios involve:

1. Workflow Implementation: Upon receiving a sequence plan, the specialist configures the workflow engine, sets up necessary triggers and conditions, and establishes monitoring parameters. This ensures accurate execution of the sequence according to the defined strategy.

2. Error Management: The specialist maintains workflow stability through proactive monitoring and rapid response to execution issues. When problems arise, it implements recovery procedures and adjusts workflow parameters to prevent similar issues in the future.`,

    profile_analyzer: `Serving as the Profile Analysis Specialist for ${context.projectName}, this agent excels in deep recipient profile analysis and insight generation. It transforms raw profile data into actionable insights that drive personalization and engagement strategies.

The specialist's primary focus is on extracting meaningful patterns and characteristics from recipient profiles. It enriches basic profile data with additional insights, identifies behavioral patterns, and generates actionable recommendations for personalization. This deep analysis enables more effective targeting and engagement strategies.

Using a sophisticated analysis suite, the specialist employs advanced profile scanning tools to identify key characteristics, pattern detection algorithms to uncover behavioral trends, and insight generation systems to produce actionable recommendations. The data enrichment capabilities ensure comprehensive profile information for better targeting.

Key operational examples include:

1. Profile Enhancement: When processing raw profile data, the specialist applies multiple analysis layers to extract and verify key characteristics. It enriches profiles with additional insights and validates the accuracy of profile attributes.

2. Pattern Analysis: The specialist continuously analyzes profile data to identify meaningful patterns and trends. These insights inform personalization strategies and help predict likely engagement patterns.`,

    content_generator: `Operating as the Content Generation Specialist for ${context.projectName}, this agent focuses on creating highly personalized and engaging content. It combines creative content generation with strict adherence to brand voice and style guidelines.

The specialist excels in adapting message content to recipient characteristics while maintaining brand consistency. It generates personalized content variations, ensures proper tone and style alignment, and optimizes content for maximum engagement. The role requires balancing creativity with brand guidelines and compliance requirements.

The content engine includes sophisticated template management capabilities, advanced style checking tools, and tone analysis systems. Quality tools ensure grammar accuracy, maintain consistency across communications, and optimize content for various channels and formats.

Typical operations include:

1. Content Creation: When receiving content requirements, the specialist generates personalized messages that align with recipient profiles and campaign objectives. It ensures all content meets brand standards while maintaining personal relevance.

2. Content Optimization: The specialist continuously monitors content performance and adjusts generation parameters based on engagement feedback. This ensures ongoing improvement in content effectiveness.`
  };

  return prompts[type] || `Role: ${type} Agent\n\nDetailed prompt not yet implemented.`;
}

function generateToolset(type: string): string[] {
  const toolsets: Record<string, string[]> = {
    executive_coordinator: [
      "resource_allocator",      // Manages agent resources and workload distribution
      "performance_monitor",     // Tracks system-wide metrics and KPIs
      "strategy_optimizer",      // Optimizes overall system strategy
      "compliance_auditor"       // Ensures regulatory compliance
    ],
    sequence_director: [
      "sequence_designer",       // Creates and modifies outreach sequences
      "timing_optimizer",        // Optimizes sequence timing and delays
      "ab_test_manager",        // Manages A/B testing of sequences
      "workflow_validator"       // Validates sequence logic and flow
    ],
    personalization_director: [
      "segment_analyzer",        // Analyzes and creates audience segments
      "profile_matcher",         // Matches content to recipient profiles
      "engagement_predictor",    // Predicts likely engagement rates
      "preference_learner"       // Learns from recipient preferences
    ],
    content_director: [
      "content_planner",        // Plans content strategy and themes
      "style_enforcer",         // Ensures brand voice consistency
      "multimodal_generator",   // Generates various content types
      "quality_checker"         // Checks content quality and compliance
    ],
    workflow_specialist: [
      "task_scheduler",         // Schedules and manages tasks
      "dependency_tracker",     // Tracks task dependencies
      "state_manager",         // Manages workflow states
      "error_handler"          // Handles workflow errors
    ],
    profile_analyzer: [
      "data_enricher",         // Enriches profile data
      "pattern_detector",      // Detects behavior patterns
      "insight_generator",     // Generates actionable insights
      "attribute_scorer"       // Scores profile attributes
    ],
    content_generator: [
      "template_engine",       // Manages content templates
      "personalization_engine", // Personalizes content
      "tone_analyzer",         // Analyzes content tone
      "format_converter"       // Converts between content formats
    ]
  };

  return toolsets[type] || ["default_toolkit"];
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
        domain: "recruitment automation"
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
    executive: agentTypes.filter(t => t.includes('executive')),
    directors: agentTypes.filter(t => t.includes('director')),
    specialists: agentTypes.filter(t => !t.includes('executive') && !t.includes('director'))
  };

  return `Based on your project requirements for ${requirements.projectName}, I've designed a hierarchical RAG agent structure:

Executive Level:
${hierarchy.executive.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary role: Strategic oversight and coordination

Director Level:
${hierarchy.directors.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary role: Department-specific management and optimization

Specialist Level:
${hierarchy.specialists.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary role: Specialized task execution and optimization

Interaction Pattern: Hierarchical Chain of Command
- Top-down strategic direction
- Bottom-up execution feedback
- Cross-functional collaboration
- Clear escalation paths

This structure ensures:
- Clear lines of responsibility
- Efficient task delegation
- Specialized expertise utilization
- Scalable operations management`;
}