import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentFlow } from "@/components/agent-flow";
import { Project, ProjectRequirements, RagAgentConfiguration } from "@shared/schema";
import { generateRagConfiguration, getAgentRationale } from "@/lib/agent-config";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Configuration() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`]
  });

  const generateConfig = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const config = generateRagConfiguration(project.requirements as ProjectRequirements);
      const res = await apiRequest(
        "PATCH",
        `/api/projects/${id}/configuration`,
        config
      );
      return res.json() as Promise<Project>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Configuration generated",
        description: "Your RAG agent configuration has been updated"
      });
    }
  });

  if (isLoading || !project) {
    return (
      <div className="container mx-auto py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const configuration = project.configuration as RagAgentConfiguration;
  const rationale = getAgentRationale(project.requirements as ProjectRequirements);

  return (
    <motion.div 
      className="container mx-auto py-8 space-y-6"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <Card>
        <CardHeader>
          <motion.div 
            className="flex items-center justify-between"
            variants={item}
          >
            <div>
              <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                RAG Agent Configuration
              </CardTitle>
              <CardDescription>{project.name}</CardDescription>
            </div>
            <Button
              onClick={() => generateConfig.mutate()}
              disabled={generateConfig.isPending}
              className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60"
            >
              {generateConfig.isPending ? "Generating..." : "Generate Configuration"}
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div variants={item}>
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Configuration Rationale
              </h3>
              <pre className="whitespace-pre-wrap bg-muted/50 backdrop-blur-sm p-4 rounded-lg text-sm text-foreground">
                {rationale}
              </pre>
            </div>
          </motion.div>

          {configuration.agents.length > 0 ? (
            <>
              <motion.div variants={item} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Agent Interaction Flow
                </h3>
                <Card className="mb-4 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <h4 className="font-medium">Collaboration Pattern:</h4>
                      <p className="text-muted-foreground">{configuration.interactionFlow.pattern}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium">Information Flow:</h4>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        <li>Top-down: Strategic directives and objectives</li>
                        <li>Bottom-up: Execution feedback and insights</li>
                        <li>Lateral: Peer-to-peer collaboration</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Error Handling:</h4>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        <li>Strategy: {configuration.interactionFlow.errorHandling.strategy}</li>
                        <li>Fallback: {configuration.interactionFlow.errorHandling.fallbackBehavior}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <AgentFlow configuration={configuration} />
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Agent Details
                </h3>
                {configuration.agents.map((agent, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden bg-gradient-to-br from-card to-primary/5">
                      <CardHeader className="bg-muted/50 backdrop-blur-sm">
                        <CardTitle>{agent.role}</CardTitle>
                        <CardDescription>{agent.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Responsibilities:</h4>
                            <ul className="list-disc pl-5 text-muted-foreground">
                              {agent.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Knowledge Base Configuration:</h4>
                            <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg space-y-2">
                              <p><span className="font-medium">Sources:</span> {agent.knowledgeBase.sources.join(", ")}</p>
                              <p><span className="font-medium">Indexing Strategy:</span> {agent.knowledgeBase.indexingStrategy}</p>
                              <p><span className="font-medium">Retrieval Method:</span> {agent.knowledgeBase.retrievalMethod}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Tools:</h4>
                            <div className="flex flex-wrap gap-2">
                              {agent.tooling.map((tool, i) => (
                                <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Prompt Template:</h4>
                            <pre className="whitespace-pre-wrap bg-muted/50 backdrop-blur-sm p-4 rounded-lg text-sm overflow-auto max-h-96">
                              {agent.promptTemplate}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div 
              variants={item}
              className="text-center py-8 text-muted-foreground"
            >
              No configuration generated yet. Click the button above to generate one.
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}