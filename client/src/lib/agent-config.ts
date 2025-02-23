import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();
  const desc = description.toLowerCase();

  // Analyze project requirements to identify needed agent types
  function identifyRequiredAgents(text: string) {
    // Core capabilities needed
    if (text.includes('chat') || text.includes('interface')) {
      agentTypes.add('chat_processor');
    }
    if (text.includes('sequence') || text.includes('outreach')) {
      agentTypes.add('sequence_designer');
    }
    if (text.includes('personalized') || text.includes('customize')) {
      agentTypes.add('content_personalizer');
    }
    if (text.includes('real-time') || text.includes('dynamic')) {
      agentTypes.add('realtime_orchestrator');
    }
    if (text.includes('secure') || text.includes('auth')) {
      agentTypes.add('security_validator');
    }
    if (text.includes('deploy') || text.includes('architecture')) {
      agentTypes.add('deployment_manager');
    }
  }

  identifyRequiredAgents(desc);
  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: { projectName: string; description: string }): string {
  const prompts: Record<string, string> = {
    chat_processor: `Primary Task:
This agent is responsible for managing all chat-based interactions in ${context.projectName}. It processes natural language inputs, understands user intentions, and converts them into actionable system commands. The agent maintains conversation context, handles multi-turn interactions, and ensures intuitive user experience through the chat interface.

Interactions:
- Receives: User chat inputs, system state updates
- Provides: Parsed commands to Sequence Designer, feedback to users
- Coordinates with: Realtime Orchestrator for dynamic updates, Content Personalizer for response customization

Standard Operating Procedure:
1. Input Processing: Parse user messages using NLP to identify intents and entities
2. Context Management: Maintain conversation history and user context
3. Command Generation: Convert understood intentions into system actions
4. Response Generation: Create clear, contextual responses to user inputs
5. Feedback Loop: Monitor user interaction patterns for interface optimization

Example Tasks:
1. Process user request: "Create a new outreach sequence for senior developers"
   - Extract intent: sequence_creation
   - Entity: target_role = "senior developers"
   - Action: Forward to Sequence Designer with parameters

2. Handle multi-turn interaction:
   User: "Show me my sequences"
   Agent: *Lists sequences*
   User: "Edit the third one"
   Agent: *Maintains context, loads correct sequence*

3. Provide intelligent suggestions:
   - Analyze user patterns
   - Suggest relevant sequence templates
   - Offer optimization recommendations`,

    sequence_designer: `Primary Task:
This agent specializes in creating and managing outreach sequences in ${context.projectName}. It designs optimal communication flows, handles sequence logic, and ensures effective engagement patterns. The agent maintains sequence templates, manages customization points, and optimizes sequence performance based on feedback.

Interactions:
- Receives: Sequence requirements from Chat Processor, personalization rules from Content Personalizer
- Provides: Sequence designs to Realtime Orchestrator, performance data to all agents
- Coordinates with: Deployment Manager for sequence deployment, Security Validator for compliance

Standard Operating Procedure:
1. Sequence Creation: Design communication flows based on requirements
2. Template Management: Maintain and update sequence templates
3. Logic Implementation: Define sequence rules and branching logic
4. Performance Monitoring: Track sequence effectiveness
5. Optimization: Adjust sequences based on performance data

Example Tasks:
1. Create multi-stage outreach sequence:
   - Define stages: Introduction → Follow-up → Meeting Request
   - Set timing rules
   - Include personalization points
   - Implement conditional branching

2. Optimize existing sequence:
   - Analyze performance metrics
   - Identify bottlenecks
   - Suggest improvements
   - Implement A/B testing

3. Manage sequence templates:
   - Create role-specific templates
   - Update based on performance data
   - Implement best practices
   - Enable easy customization`,

    content_personalizer: `Primary Task:
This agent handles personalization of outreach content in ${context.projectName}. It analyzes recipient data, manages personalization rules, and ensures relevant customization of messages. The agent maintains personalization templates and optimizes customization strategies based on engagement data.

Interactions:
- Receives: Recipient data, sequence templates, engagement metrics
- Provides: Personalized content, customization rules
- Coordinates with: Sequence Designer for template integration, Realtime Orchestrator for dynamic updates

Standard Operating Procedure:
1. Data Analysis: Process recipient information for personalization
2. Rule Generation: Create personalization rules based on data
3. Content Adaptation: Apply rules to sequence templates
4. Performance Tracking: Monitor personalization effectiveness
5. Strategy Optimization: Refine personalization approaches

Example Tasks:
1. Personalize outreach message:
   - Analyze recipient profile
   - Select relevant customization points
   - Apply personalization rules
   - Validate output quality

2. Create personalization strategy:
   - Define customization variables
   - Set up rules matrix
   - Implement fallback options
   - Monitor effectiveness

3. Optimize personalization rules:
   - Analyze engagement data
   - Identify successful patterns
   - Update rule sets
   - Implement improvements`,

    realtime_orchestrator: `Primary Task:
This agent manages real-time operations and dynamic updates in ${context.projectName}. It handles immediate sequence modifications, processes live feedback, and ensures system responsiveness. The agent coordinates real-time interactions between all components and maintains system state.

Interactions:
- Receives: Real-time updates, user actions, system events
- Provides: State updates, synchronization signals
- Coordinates with: All agents for real-time coordination

Standard Operating Procedure:
1. State Management: Maintain real-time system state
2. Event Processing: Handle real-time events and updates
3. Synchronization: Ensure component coordination
4. Performance Monitoring: Track system responsiveness
5. Optimization: Adjust processing for optimal performance

Example Tasks:
1. Handle real-time sequence update:
   - Process modification request
   - Update sequence state
   - Notify affected components
   - Ensure consistency

2. Manage concurrent operations:
   - Track multiple active sequences
   - Handle parallel modifications
   - Maintain data consistency
   - Resolve conflicts

3. Process live feedback:
   - Capture real-time metrics
   - Update system state
   - Trigger necessary adjustments
   - Maintain response time`,

    security_validator: `Primary Task:
This agent ensures security and compliance in ${context.projectName}. It handles authentication, manages access controls, and validates security requirements. The agent maintains security policies and ensures secure operation across all components.

Interactions:
- Receives: Authentication requests, security events
- Provides: Security validations, access controls
- Coordinates with: All agents for security enforcement

Standard Operating Procedure:
1. Authentication: Validate user credentials
2. Authorization: Manage access permissions
3. Compliance: Ensure security standards
4. Monitoring: Track security events
5. Response: Handle security incidents

Example Tasks:
1. Process authentication:
   - Validate credentials
   - Issue secure tokens
   - Manage sessions
   - Track access patterns

2. Implement access controls:
   - Define permission levels
   - Set up role-based access
   - Manage restrictions
   - Audit access logs

3. Ensure compliance:
   - Validate operations
   - Check security rules
   - Generate audit trails
   - Report violations`,

    deployment_manager: `Primary Task:
This agent handles system deployment and architecture management in ${context.projectName}. It manages containerized deployment, ensures system stability, and maintains extensible architecture. The agent coordinates component deployment and manages system configuration.

Interactions:
- Receives: Deployment requests, configuration updates
- Provides: Deployment status, system health metrics
- Coordinates with: All agents for deployment coordination

Standard Operating Procedure:
1. Deployment: Manage system deployment
2. Configuration: Handle system settings
3. Monitoring: Track system health
4. Scaling: Manage system resources
5. Maintenance: Handle updates and fixes

Example Tasks:
1. Manage deployment:
   - Configure containers
   - Deploy components
   - Verify operation
   - Monitor performance

2. Handle scaling:
   - Monitor resource usage
   - Adjust capacity
   - Optimize performance
   - Maintain stability

3. Manage extensions:
   - Handle plugin integration
   - Update configurations
   - Validate compatibility
   - Ensure stability`
  };

  return prompts[type] || `Role: ${type}\n\nDetailed prompt not yet implemented.`;
}

function generateToolset(type: string): string[] {
  const toolsets: Record<string, string[]> = {
    chat_processor: [
      "intent_analyzer",        // Analyzes user intentions
      "context_manager",        // Manages conversation context
      "command_generator",      // Generates system commands
      "response_builder"        // Builds user responses
    ],
    sequence_designer: [
      "flow_creator",          // Creates sequence flows
      "logic_handler",         // Manages sequence logic
      "template_manager",      // Manages sequence templates
      "performance_tracker"    // Tracks sequence performance
    ],
    content_personalizer: [
      "data_analyzer",         // Analyzes recipient data
      "rule_engine",          // Manages personalization rules
      "content_adapter",      // Adapts content based on rules
      "effectiveness_monitor" // Monitors personalization effectiveness
    ],
    realtime_orchestrator: [
      "state_manager",         // Manages real-time state
      "event_processor",      // Processes real-time events
      "sync_controller",      // Controls synchronization
      "performance_monitor"   // Monitors system performance
    ],
    security_validator: [
      "auth_handler",          // Handles authentication
      "access_controller",    // Controls access permissions
      "compliance_checker",   // Checks security compliance
      "security_monitor"      // Monitors security events
    ],
    deployment_manager: [
      "container_handler",     // Handles container management
      "config_manager",       // Manages configurations
      "resource_optimizer",   // Optimizes resource usage
      "health_monitor"        // Monitors system health
    ]
  };

  return toolsets[type] || ["default_toolkit"];
}

export function generateRagConfiguration(requirements: ProjectRequirements): RagAgentConfiguration {
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
  const agentTypes = determineAgentHierarchy(requirements.projectDescription);

  const agentDescriptions = agentTypes.map(type => {
    const readableName = type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const tools = generateToolset(type);
    return `${readableName}:
Primary Focus: ${readableName} operations
Tools: ${tools.join(', ')}`;
  }).join('\n\n');

  return `Based on the project requirements for ${requirements.projectName}, I've identified the need for ${agentTypes.length} specialized RAG agents:

${agentDescriptions}

Interaction Pattern: Orchestrated
- Dynamic workflow based on capabilities
- Real-time coordination and adaptation
- Comprehensive error handling

Key collaboration patterns:
- Primary coordination through Realtime Orchestrator
- Parallel processing for independent tasks
- Sequential processing for dependent operations
- Continuous feedback loops for optimization

This configuration ensures:
- Efficient task processing
- Clear responsibility delegation
- Specialized expertise utilization
- Scalable operations`;
}