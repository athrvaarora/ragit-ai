import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();

  // Strategy Level
  agentTypes.add("recruitment_strategist");

  // Orchestration Level
  agentTypes.add("outreach_orchestrator");

  // Specialist Level
  agentTypes.add("candidate_profiler");
  agentTypes.add("message_composer");
  agentTypes.add("engagement_specialist");
  agentTypes.add("pipeline_tracker");

  return Array.from(agentTypes);
}

function generateAgentPrompt(type: string, context: {
  projectName: string;
  domain: string;
}): string {
  const prompts: Record<string, string> = {
    recruitment_strategist: `Leading the recruitment automation initiative for ${context.projectName}, this agent operates as the strategic brain of the operation. It analyzes recruitment needs, develops comprehensive outreach strategies, and coordinates all other agents to ensure efficient candidate engagement.

The strategist maintains a high-level view of all recruitment campaigns, continuously analyzing performance metrics and adjusting strategies for optimal results. It works closely with the Outreach Orchestrator to implement strategic decisions and with specialist agents to ensure proper execution of recruitment initiatives.

This agent leverages sophisticated campaign planning tools to develop data-driven recruitment strategies. The resource optimizer ensures efficient allocation of resources across different campaigns, while the performance analyzer provides real-time insights into campaign effectiveness. The strategy adjuster enables dynamic optimization of recruitment approaches based on real-world results.

In enterprise operations, this agent handles multiple concurrent recruitment campaigns across different positions and departments. It ensures consistent quality while maintaining the flexibility to adapt to different recruitment needs and market conditions.`,

    outreach_orchestrator: `Serving as the tactical coordinator for ${context.projectName}, this agent expertly manages the execution of recruitment outreach campaigns. It transforms strategic directives into actionable outreach sequences, ensuring proper timing and coordination across all communication channels.

The orchestrator excels in designing and managing complex outreach sequences that maintain personalization at scale. It works directly with the Message Composer and Engagement Specialist to ensure proper message delivery and response handling, while coordinating with the Candidate Profiler for targeting optimization.

Using its advanced sequence design and timing optimization tools, this agent creates sophisticated outreach workflows that adapt to candidate responses and engagement patterns. The channel coordinator ensures proper use of multiple communication channels, while the response tracker maintains detailed engagement history.

For enterprise-scale operations, this agent manages thousands of concurrent outreach sequences while maintaining personalization and relevance. It supports complex branching logic based on candidate responses and ensures proper follow-up timing.`,

    candidate_profiler: `Operating as the candidate intelligence specialist for ${context.projectName}, this agent focuses on understanding and evaluating potential candidates. It analyzes candidate profiles, predicts engagement likelihood, and provides insights for personalized outreach.

The profiler uses advanced analysis tools to extract meaningful insights from candidate data. It works closely with the Message Composer to ensure outreach is properly tailored to each candidate's background and preferences, while providing valuable insights to the Outreach Orchestrator for sequence optimization.

Through its sophisticated profile analysis and skill matching tools, this agent ensures that outreach is targeted and relevant. The sentiment predictor helps anticipate candidate responses, while the engagement scorer prioritizes outreach efforts for maximum effectiveness.`,

    message_composer: `Specializing in creating compelling outreach messages for ${context.projectName}, this agent crafts personalized communications that resonate with candidates. It ensures each message is properly tailored while maintaining consistent brand voice and recruitment standards.

The composer works hand-in-hand with the Candidate Profiler to understand candidate backgrounds and with the Engagement Specialist to optimize message effectiveness. It ensures all communications are personalized yet professional, engaging yet compliant with recruitment guidelines.

Using advanced template customization and tone analysis tools, this agent creates messages that stand out while maintaining professionalism. The personalization engine adds relevant personal touches, while the compliance checker ensures all messages meet recruitment standards.`,

    engagement_specialist: `Managing ongoing candidate interactions for ${context.projectName}, this agent focuses on maintaining engaging and productive conversations with potential candidates. It analyzes responses, generates appropriate follow-ups, and manages the overall conversation flow.

The specialist coordinates closely with the Message Composer for content creation and the Pipeline Tracker for status updates. It ensures that all candidate interactions are meaningful and move the recruitment process forward effectively.

Through its response analysis and follow-up generation tools, this agent maintains engaging conversation threads. The interest gauge helps measure candidate engagement, while the conversation manager ensures proper timing and context for all interactions.`,

    pipeline_tracker: `Monitoring the recruitment pipeline for ${context.projectName}, this agent ensures smooth candidate progression through various stages. It tracks status updates, manages transitions, and provides visibility into the recruitment process.

The tracker maintains close communication with the Engagement Specialist for candidate progress updates and the Recruitment Strategist for pipeline optimization. It ensures all stakeholders have visibility into candidate status and recruitment progress.

Using comprehensive tracking and monitoring tools, this agent maintains accurate pipeline status. The milestone alerter ensures timely notifications, while the pipeline optimizer suggests improvements to the recruitment flow.`
  };

  return prompts[type] || `Role: ${type} Agent\n\nDetailed prompt not yet implemented.`;
}

function generateToolset(type: string): string[] {
  const toolsets: Record<string, string[]> = {
    recruitment_strategist: [
      "campaign_planner",         // Plans and coordinates recruitment campaigns, sets goals and KPIs
      "resource_optimizer",       // Optimizes resource allocation across recruitment efforts
      "performance_analyzer",     // Analyzes overall campaign performance and success metrics
      "strategy_adjuster"         // Makes real-time adjustments to recruitment strategies
    ],
    outreach_orchestrator: [
      "sequence_designer",        // Designs multi-channel outreach sequences
      "timing_optimizer",         // Determines optimal timing for each outreach step
      "channel_coordinator",      // Manages and coordinates different outreach channels
      "response_tracker"          // Tracks and analyzes candidate responses
    ],
    candidate_profiler: [
      "profile_analyzer",         // Analyzes candidate profiles and experience
      "skill_matcher",           // Matches candidate skills with job requirements
      "sentiment_predictor",      // Predicts candidate response likelihood
      "engagement_scorer"         // Scores potential candidate engagement
    ],
    message_composer: [
      "template_customizer",      // Customizes message templates for each candidate
      "tone_analyzer",           // Ensures appropriate tone and style
      "personalization_engine",   // Adds personal touches to messages
      "compliance_checker"        // Ensures messages meet recruitment guidelines
    ],
    engagement_specialist: [
      "response_analyzer",        // Analyzes candidate responses
      "follow_up_generator",      // Generates appropriate follow-up messages
      "interest_gauge",          // Measures candidate interest levels
      "conversation_manager"      // Manages ongoing conversations
    ],
    pipeline_tracker: [
      "status_monitor",          // Monitors candidate pipeline status
      "progress_tracker",        // Tracks candidates through recruitment stages
      "milestone_alerter",       // Alerts on important recruitment milestones
      "pipeline_optimizer"        // Optimizes recruitment pipeline flow
    ]
  };

  return toolsets[type] || ["default_toolkit"];
}

// Agent Collaboration Overview
function getAgentCollaborationOverview(): string {
  return `The recruitment automation system operates through a carefully orchestrated hierarchy of specialized agents:

The Recruitment Strategist sits at the top of the hierarchy, providing strategic direction and coordinating overall recruitment efforts. It analyzes campaign performance and adjusts strategies based on real-time feedback from other agents.

At the orchestration level, the Outreach Orchestrator translates strategic directives into executable plans. It coordinates with specialist agents to ensure proper execution of recruitment campaigns while maintaining personalization at scale.

At the specialist level:
- The Candidate Profiler analyzes potential candidates and feeds insights to the Message Composer and Engagement Specialist
- The Message Composer crafts personalized outreach content based on profiler insights and orchestrator requirements
- The Engagement Specialist manages ongoing interactions, working closely with both the Message Composer and Pipeline Tracker
- The Pipeline Tracker monitors overall progress and provides status updates to the Recruitment Strategist

This hierarchical structure ensures efficient information flow and clear responsibility delegation while maintaining the flexibility to handle complex recruitment scenarios at enterprise scale.`;
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
    strategy: agentTypes.filter(t => t.includes('strategist')),
    orchestration: agentTypes.filter(t => t.includes('orchestrator')),
    specialists: agentTypes.filter(t => !t.includes('strategist') && !t.includes('orchestrator'))
  };

  return `Based on your project requirements for ${requirements.projectName}, I've designed a hierarchical RAG agent structure:

Strategy Level:
${hierarchy.strategy.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary role: Overall strategic planning and coordination

Orchestration Level:
${hierarchy.orchestration.map(type => `- ${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`).join('\n')}
Primary role: Tactical execution and coordination of outreach

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
- Scalable operations management

${getAgentCollaborationOverview()}`;
}