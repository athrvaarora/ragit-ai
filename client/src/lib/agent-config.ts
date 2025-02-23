import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineRequiredAgents(description: string): string[] {
  const agentTypes = new Set<string>();

  // Core functionality agents
  if (description.toLowerCase().includes("auth") || description.toLowerCase().includes("secure")) {
    agentTypes.add("security");
  }
  if (description.toLowerCase().includes("personalized") || description.toLowerCase().includes("customiz")) {
    agentTypes.add("personalization");
  }
  if (description.toLowerCase().includes("sequence") || description.toLowerCase().includes("workflow")) {
    agentTypes.add("workflow_manager");
  }

  // Data handling agents
  if (description.toLowerCase().includes("real-time") || description.toLowerCase().includes("live")) {
    agentTypes.add("realtime_processor");
  }
  if (description.toLowerCase().includes("database") || description.toLowerCase().includes("data")) {
    agentTypes.add("data_manager");
  }

  // Integration agents
  if (description.toLowerCase().includes("interface") || description.toLowerCase().includes("ui")) {
    agentTypes.add("interface_manager");
  }
  if (description.toLowerCase().includes("deploy") || description.toLowerCase().includes("architecture")) {
    agentTypes.add("system_architect");
  }

  // Always include orchestrator for coordination
  agentTypes.add("orchestrator");

  return Array.from(agentTypes);
}

function generateDetailedPrompt(type: string, context: {
  projectName: string;
  domain: string;
  scale: "startup" | "enterprise";
}): string {
  const prompts: Record<string, string> = {
    orchestrator: `Role: System Orchestration and Workflow Coordinator

Primary Responsibilities:
- Coordinate communication between all specialized agents
- Manage workflow state and task distribution
- Handle error recovery and system resilience
- Monitor system performance and resource utilization

Required Tools & Infrastructure:
1. Workflow Management System
   - Apache Airflow or similar for task orchestration
   - Redis for real-time state management
   - Prometheus/Grafana for monitoring

2. Message Queue System
   - RabbitMQ/Kafka for inter-agent communication
   - Dead letter queues for error handling
   - Message persistence and replay capabilities

3. State Management
   - Distributed state store (etcd/Consul)
   - Transaction management
   - State recovery mechanisms

Enterprise Scale Considerations:
- Handles 10,000+ concurrent workflows
- Supports multi-region deployment
- Implements circuit breakers and fallbacks
- Provides audit trails and compliance logging

Interoperability:
- Central coordinator for all agent interactions
- Maintains global system state
- Handles cross-agent transaction management
- Provides monitoring and alerting

Example Scenarios:
1. Multi-Agent Task Coordination
   Input: New recruitment campaign initiation
   Action: Coordinates personalization, workflow, and interface agents
   Output: Orchestrated campaign execution plan

2. Error Recovery
   Input: Failed personalization request
   Action: Initiates fallback strategy, retries with degraded service
   Output: Graceful degradation with minimal user impact

3. Resource Optimization
   Input: High system load during peak hours
   Action: Implements load balancing and request throttling
   Output: Maintained system stability under load`,

    personalization: `Role: Personalization and Content Adaptation Agent

Primary Responsibilities:
- Generate personalized outreach sequences
- Adapt content based on recipient profiles
- Learn from engagement metrics
- Optimize messaging effectiveness

Required Tools & Infrastructure:
1. Machine Learning Pipeline
   - TensorFlow/PyTorch for model training
   - Feature store for profile attributes
   - A/B testing framework
   - Model versioning system

2. Content Management
   - Template management system
   - Content optimization engine
   - Multilingual support
   - Version control for content

3. Analytics Engine
   - Real-time analytics processing
   - Engagement tracking
   - Performance metrics dashboard
   - A/B test analysis

Enterprise Scale Considerations:
- Handles millions of personalization requests daily
- Supports multiple content languages and regions
- Implements content safety checks
- Maintains compliance with privacy regulations

Interoperability:
- Receives campaign parameters from workflow manager
- Coordinates with data manager for profile access
- Updates interface manager with personalized content
- Reports metrics to orchestrator

Example Scenarios:
1. Sequence Generation
   Input: New candidate profile and job requirements
   Action: Generates personalized outreach sequence
   Output: Multi-step messaging campaign

2. Content Optimization
   Input: Engagement metrics from previous campaigns
   Action: Analyzes patterns and adapts templates
   Output: Optimized messaging templates

3. Profile-based Customization
   Input: Detailed candidate profile
   Action: Extracts relevant attributes and matches content
   Output: Tailored communication strategy`,

    workflow_manager: `Role: Workflow and Sequence Management Agent

Primary Responsibilities:
- Define and manage outreach sequences
- Handle sequence timing and triggers
- Track sequence progress
- Manage sequence variations

Required Tools & Infrastructure:
1. Workflow Engine
   - Custom workflow definition system
   - Timing and trigger management
   - Progress tracking database
   - State machine implementation

2. Integration Framework
   - API gateway for external services
   - Webhook management
   - Event bus integration
   - Service mesh compatibility

3. Monitoring System
   - Sequence progress tracking
   - Performance metrics
   - Error detection
   - SLA monitoring

Enterprise Scale Considerations:
- Supports 100,000+ active sequences
- Handles complex branching workflows
- Provides sequence templating
- Implements workflow versioning

Interoperability:
- Receives sequence definitions from interface
- Coordinates with personalization agent
- Updates data manager with progress
- Reports status to orchestrator

Example Scenarios:
1. Sequence Execution
   Input: New outreach campaign request
   Action: Creates and schedules sequence steps
   Output: Managed workflow execution

2. Dynamic Adaptation
   Input: Recipient response
   Action: Adjusts sequence timing and steps
   Output: Modified workflow path

3. Bulk Campaign Management
   Input: Multi-target campaign request
   Action: Coordinates parallel sequences
   Output: Synchronized campaign execution`,

    system_architect: `Role: System Architecture and Integration Agent

Primary Responsibilities:
- Manage system architecture and scaling
- Handle service integration
- Ensure system resilience
- Maintain deployment configurations

Required Tools & Infrastructure:
1. Infrastructure Management
   - Kubernetes orchestration
   - Service mesh (Istio)
   - CI/CD pipeline
   - Infrastructure as Code

2. Monitoring Stack
   - Distributed tracing
   - Log aggregation
   - Metrics collection
   - Alert management

3. Security Framework
   - Identity management
   - Access control
   - Encryption services
   - Security scanning

Enterprise Scale Considerations:
- Supports global multi-region deployment
- Implements zero-downtime updates
- Provides disaster recovery
- Ensures regulatory compliance

Interoperability:
- Coordinates with all system agents
- Manages service discovery
- Handles system configuration
- Monitors system health

Example Scenarios:
1. System Scaling
   Input: Increased load detection
   Action: Initiates auto-scaling
   Output: Scaled infrastructure

2. Service Integration
   Input: New service deployment
   Action: Updates service mesh
   Output: Integrated service

3. Disaster Recovery
   Input: Region failure
   Action: Initiates failover
   Output: Maintained system availability`
  };

  return prompts[type] || `Role: ${type} Agent\n\nDetailed prompt not yet implemented.`;
}

export function generateRagConfiguration(
  requirements: ProjectRequirements
): RagAgentConfiguration {
  const agentTypes = determineRequiredAgents(requirements.projectDescription);
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
      promptTemplate: generateDetailedPrompt(type, {
        projectName: requirements.projectName,
        domain: "recruitment automation",
        scale: "enterprise"
      }),
      tooling: ["base_tools", "specialized_tools"]
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
  const agentTypes = determineRequiredAgents(requirements.projectDescription);

  return `Based on your project description for ${requirements.projectName}, I've identified the need for ${agentTypes.length} specialized RAG agents:

${agentTypes.map((type, index) => `${index + 1}. ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Agent
   - Primary role: ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} operations
   - Collaborates with: ${agentTypes.filter(t => t !== type).map(t => t.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}`).join('\n\n')}

Enterprise Scale Considerations:
- Distributed system architecture
- High availability and fault tolerance
- Multi-region deployment support
- Comprehensive monitoring and logging
- Regulatory compliance and security

Interaction Pattern: Orchestrated
- Centrally coordinated through Orchestrator Agent
- Dynamic task routing based on agent capabilities
- Real-time monitoring and adaptation
- Comprehensive error handling and recovery

This configuration is designed to:
- Handle enterprise-scale workloads
- Maintain system reliability
- Support future extensibility
- Ensure secure operations`;
}