import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();
  const desc = description.toLowerCase();

  // Function to identify required agents based on project needs
  function identifyAgentTypes(text: string) {
    const projectNeeds = {
      'sequence_manager': ['sequence', 'outreach', 'campaign'],
      'chat_interface': ['chat', 'interface', 'interaction'],
      'personalization_engine': ['personalized', 'customiz', 'adapt'],
      'security_manager': ['secure', 'auth', 'protect'],
      'deployment_orchestrator': ['deploy', 'container', 'architecture'],
      'real_time_processor': ['real-time', 'real time', 'dynamic']
    };

    // Check each need against the description
    Object.entries(projectNeeds).forEach(([agentType, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        agentTypes.add(agentType);
      }
    });
  }

  // Analyze project description
  identifyAgentTypes(desc);

  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: {
  projectName: string;
  description: string;
}): string {
  const roleDescriptions: Record<string, string> = {
    sequence_manager: `managing and orchestrating outreach sequences in ${context.projectName}. This agent specializes in creating, optimizing, and monitoring recruitment outreach sequences. It ensures proper timing, flow, and effectiveness of communication campaigns.

The agent maintains a sophisticated sequence management system that can handle multiple concurrent campaigns while ensuring personalization and relevance. It works closely with the Personalization Engine to tailor sequences to individual recipients and with the Real-time Processor to enable dynamic sequence adjustments.

Through its advanced sequence optimization capabilities, this agent continuously analyzes sequence performance and makes data-driven improvements to enhance engagement rates and campaign effectiveness.`,

    chat_interface: `managing the chat-driven interface of ${context.projectName}. This agent handles all aspects of the chat-based user interaction, ensuring intuitive and efficient sequence creation and management through natural language commands.

The agent processes user inputs, interprets intentions, and coordinates with other agents to execute requested actions. It maintains context across conversations and provides intelligent suggestions based on user behavior and system capabilities.

Using advanced natural language processing, this agent transforms user instructions into actionable sequence modifications while providing real-time feedback and suggestions.`,

    personalization_engine: `handling all aspects of message and sequence personalization in ${context.projectName}. This agent ensures that each outreach sequence is tailored to individual recipients while maintaining consistency in brand voice and recruitment standards.

The agent analyzes recipient data, determines optimal personalization points, and works with the Sequence Manager to implement personalized variations. It maintains a deep understanding of personalization effectiveness and continuously refines its approach based on engagement data.

Through sophisticated personalization algorithms, this agent ensures that each communication feels personal and relevant while maintaining scalability across large campaigns.`,

    security_manager: `ensuring secure operations and authentication in ${context.projectName}. This agent handles all security-related aspects, from user authentication to data protection and compliance enforcement.

The agent maintains robust authentication systems, manages access controls, and ensures secure data handling across all operations. It works with all other agents to enforce security policies while maintaining system usability.

Using industry-standard security practices, this agent protects sensitive information while enabling smooth system operation and user interaction.`,

    deployment_orchestrator: `managing the deployment and architectural aspects of ${context.projectName}. This agent handles system deployment, ensures proper containerization, and maintains the extensible architecture of the application.

The agent oversees system configuration, manages component interactions, and ensures smooth operation across different deployment environments. It coordinates with other agents to maintain system reliability and performance.

Through its infrastructure management capabilities, this agent ensures robust and scalable system operation while enabling easy extensions and modifications.`,

    real_time_processor: `handling real-time operations and dynamic adjustments in ${context.projectName}. This agent enables immediate sequence modifications, processes real-time feedback, and ensures responsive system behavior.

The agent maintains real-time state management, handles concurrent modifications, and ensures immediate updates across the system. It works closely with the Chat Interface and Sequence Manager to enable dynamic sequence adjustments and immediate user feedback.

Using advanced real-time processing capabilities, this agent ensures responsive system behavior while maintaining data consistency and operation reliability.`
  };

  return roleDescriptions[type] || `Role: ${type}\n\nThis agent handles specialized tasks within the ${context.projectName} system, focusing on efficient task execution and seamless integration with other system components.`;
}

function generateToolset(type: string): string[] {
  const toolsets: Record<string, string[]> = {
    sequence_manager: [
      "sequence_designer",      // Creates and modifies outreach sequences
      "flow_optimizer",         // Optimizes sequence flow and timing
      "campaign_monitor",       // Monitors campaign performance
      "sequence_validator"      // Validates sequence logic and structure
    ],
    chat_interface: [
      "intent_analyzer",        // Analyzes user chat intentions
      "context_manager",        // Manages conversation context
      "suggestion_generator",   // Generates intelligent suggestions
      "response_formatter"      // Formats system responses
    ],
    personalization_engine: [
      "profile_analyzer",       // Analyzes recipient profiles
      "content_customizer",     // Customizes message content
      "variable_manager",       // Manages personalization variables
      "effectiveness_tracker"   // Tracks personalization effectiveness
    ],
    security_manager: [
      "auth_handler",          // Handles authentication
      "permission_manager",     // Manages access permissions
      "security_validator",     // Validates security requirements
      "compliance_checker"      // Ensures security compliance
    ],
    deployment_orchestrator: [
      "container_manager",      // Manages containerized deployment
      "config_handler",         // Handles system configuration
      "scaling_optimizer",      // Optimizes system scaling
      "extension_manager"       // Manages system extensions
    ],
    real_time_processor: [
      "state_manager",         // Manages real-time state
      "update_processor",      // Processes real-time updates
      "concurrency_handler",   // Handles concurrent operations
      "sync_coordinator"       // Coordinates real-time synchronization
    ]
  };

  return toolsets[type] || [
    "task_processor",
    "integration_handler",
    "quality_validator",
    "performance_monitor"
  ];
}

function getAgentCollaborationOverview(): string {
  return `The recruitment outreach system operates through a coordinated network of specialized agents:

The system follows a layered architecture with clear responsibility delegation:
1. Interface Layer: Chat Interface agent handles user interactions
2. Processing Layer: Sequence Manager and Personalization Engine handle core business logic
3. Infrastructure Layer: Security Manager and Deployment Orchestrator ensure robust operation
4. Real-time Layer: Real-time Processor enables dynamic system behavior

Information flows both vertically and horizontally:
- Vertical: Commands flow down from interface to processing to infrastructure layers
- Horizontal: Agents within each layer coordinate for optimal operation

Key collaboration patterns:
- Synchronous Operations: Real-time updates and immediate feedback
- Asynchronous Processing: Background optimization and analysis
- Parallel Execution: Concurrent handling of multiple sequences
- Feedback Loops: Continuous improvement through performance monitoring

The system maintains flexibility to adapt to different recruitment needs while ensuring security, scalability, and user-friendly operation.`;
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