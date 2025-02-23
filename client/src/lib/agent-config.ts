import { ProjectRequirements, RagAgentConfiguration } from "@shared/schema";

function determineAgentHierarchy(description: string): string[] {
  const agentTypes = new Set<string>();

  // Executive level
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
    executive_coordinator: `Role: Executive RAG Coordinator

Primary Responsibilities:
- Strategic oversight of all RAG operations
- Resource allocation between agent teams
- High-level decision making and coordination
- Performance monitoring and optimization

Required Tools & Infrastructure:
1. Command Center
   - Real-time agent monitoring dashboard
   - Resource allocation system
   - Performance metrics tracker
   - Inter-agent communication hub

2. Strategy Management
   - Workflow orchestration engine
   - Load balancing system
   - Priority queue manager
   - Decision optimization framework

3. Quality Control
   - Output validation system
   - Coherence checker
   - Compliance monitor
   - Error recovery coordinator

Enterprise Scale Operations:
- Manages multiple concurrent agent teams
- Handles cross-team dependencies
- Ensures system-wide consistency
- Maintains operational efficiency

Example Operations:
1. Campaign Initialization
   Input: New outreach campaign request
   Action: Analyzes requirements, assigns resources, coordinates teams
   Output: Orchestrated execution plan

2. Resource Optimization
   Input: Performance bottleneck detection
   Action: Reallocates resources, adjusts priorities
   Output: Optimized system performance

3. Quality Assurance
   Input: Inconsistent output detection
   Action: Coordinates correction, updates guidelines
   Output: Improved output quality`,

    sequence_director: `Role: Sequence Management Director

Primary Responsibilities:
- Design and oversee outreach sequences
- Manage sequence timing and dependencies
- Monitor sequence effectiveness
- Optimize sequence strategies

Required Tools & Infrastructure:
1. Sequence Designer
   - Visual sequence builder
   - Timing optimization engine
   - A/B testing framework
   - Performance analytics suite

2. Automation Tools
   - Trigger management system
   - Conditional logic handler
   - Dynamic timing adjuster
   - Integration manager

3. Analytics Platform
   - Sequence performance tracker
   - Engagement analyzer
   - ROI calculator
   - Optimization recommender

Enterprise Scale Capabilities:
- Handles thousands of concurrent sequences
- Supports complex branching logic
- Provides sequence templates
- Ensures scalability and reliability

Example Operations:
1. Sequence Creation
   Input: Campaign requirements
   Action: Designs optimal sequence flow
   Output: Executable sequence plan

2. Performance Analysis
   Input: Sequence metrics
   Action: Analyzes effectiveness, suggests improvements
   Output: Optimization recommendations`,

    personalization_director: `Role: Personalization Strategy Director

Primary Responsibilities:
- Define personalization strategies
- Manage audience segmentation
- Oversee content customization
- Monitor personalization effectiveness

Required Tools & Infrastructure:
1. Personalization Engine
   - Profile analysis system
   - Segment manager
   - Content customization engine
   - A/B testing framework

2. Data Management
   - Profile database connector
   - Attribute analyzer
   - Pattern recognition system
   - Preference tracker

3. Analytics Suite
   - Engagement tracker
   - Performance analyzer
   - ROI calculator
   - Trend analyzer

Enterprise Scale Operations:
- Handles millions of unique profiles
- Supports real-time personalization
- Ensures data privacy compliance
- Maintains personalization quality

Example Operations:
1. Strategy Development
   Input: Audience segments and goals
   Action: Creates personalization strategies
   Output: Targeted approach plans

2. Effectiveness Analysis
   Input: Engagement metrics
   Action: Analyzes performance, adjusts strategies
   Output: Strategy optimization plan`,

    workflow_specialist: `Role: Workflow Implementation Specialist

Primary Responsibilities:
- Implement sequence workflows
- Handle timing and triggers
- Monitor execution
- Manage dependencies

Tools:
1. Workflow Engine
   - Task scheduler
   - Dependency manager
   - State tracker
   - Error handler

2. Integration Tools
   - API connector
   - Event handler
   - Service orchestrator
   - Data transformer

Example Operations:
1. Workflow Execution
   Input: Sequence plan
   Action: Implements and monitors workflow
   Output: Executed sequence

2. Error Recovery
   Input: Execution failure
   Action: Implements recovery steps
   Output: Restored workflow`,

    profile_analyzer: `Role: Profile Analysis Specialist

Primary Responsibilities:
- Analyze recipient profiles
- Extract key characteristics
- Generate insights
- Update targeting data

Tools:
1. Analysis Suite
   - Profile scanner
   - Pattern detector
   - Insight generator
   - Data enricher

2. Data Tools
   - Database connector
   - Query optimizer
   - Cache manager
   - Update handler

Example Operations:
1. Profile Enhancement
   Input: Raw profile data
   Action: Analyzes and enriches profiles
   Output: Enhanced profile data

2. Insight Generation
   Input: Profile patterns
   Action: Generates targeting insights
   Output: Actionable recommendations`,

    content_generator: `Role: Content Generation Specialist

Primary Responsibilities:
- Generate personalized content
- Adapt messaging
- Ensure consistency
- Maintain brand voice

Tools:
1. Content Engine
   - Template manager
   - Style checker
   - Tone analyzer
   - Format converter

2. Quality Tools
   - Grammar checker
   - Consistency validator
   - Brand voice analyzer
   - Output optimizer

Example Operations:
1. Message Creation
   Input: Content requirements
   Action: Generates personalized content
   Output: Optimized messages

2. Content Adaptation
   Input: Engagement feedback
   Action: Adjusts content strategy
   Output: Improved messaging`
  };

  return prompts[type] || `Role: ${type} Agent\n\nDetailed prompt not yet implemented.`;
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
      tooling: ["base_tools", "specialized_tools"]
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