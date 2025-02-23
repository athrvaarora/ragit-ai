import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Project } from "@shared/schema";

export function Sidebar() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 0 // Always refetch to ensure we have latest data
  });

  return (
    <div className="w-80 border-r h-screen">
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
              <div className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <div className="font-medium mb-1">{project.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {project.requirements.projectDescription}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs text-muted-foreground">
                    {(project.configuration?.agents || []).length} Agents
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                  <div className="text-xs text-muted-foreground">
                    {project.configuration?.interactionFlow?.pattern || "Sequential"}
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