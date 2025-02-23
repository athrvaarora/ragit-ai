import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectRequirementSchema, type ProjectRequirements } from "@shared/schema";

interface ProjectFormProps {
  onSubmit: (data: ProjectRequirements) => void;
  isLoading?: boolean;
}

export function ProjectForm({ onSubmit, isLoading }: ProjectFormProps) {
  const form = useForm<ProjectRequirements>({
    resolver: zodResolver(projectRequirementSchema),
    defaultValues: {
      projectName: "",
      projectDescription: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your RAG project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project in detail. Include information about:
- What kind of data needs to be processed
- Types of queries or analysis needed
- Expected output format and requirements
- Any special requirements or constraints"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Analyzing Requirements..." : "Generate RAG Configuration"}
        </Button>
      </form>
    </Form>
  );
}