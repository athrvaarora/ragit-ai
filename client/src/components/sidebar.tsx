import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Project } from "@shared/schema";

export function Sidebar() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  return (
    <div className="w-80 border-r bg-sidebar h-screen">
      <div className="p-4 border-b">
        <Link href="/project/new">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Configuration
          </Button>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="p-4 space-y-2">
          {projects?.map((project) => (
            <Link key={project.id} href={`/project/${project.id}/configuration`}>
              <div className="p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors">
                <div className="font-medium text-sidebar-foreground mb-1">{project.name}</div>
                <div className="text-sm text-sidebar-foreground/60 line-clamp-2">
                  {project.requirements.projectDescription}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs text-sidebar-foreground/40">
                    {project.configuration.agents.length} Agents
                  </div>
                  <div className="w-1 h-1 rounded-full bg-sidebar-foreground/20" />
                  <div className="text-xs text-sidebar-foreground/40">
                    {project.configuration.interactionFlow.pattern}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}