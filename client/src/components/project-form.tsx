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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { projectRequirementSchema, type ProjectRequirements } from "@shared/schema";

const dataTypes = [
  "Documents",
  "Code",
  "Structured Data",
  "Images",
  "Audio"
];

const queryPatterns = [
  "Question Answering",
  "Information Extraction",
  "Summarization",
  "Analysis"
];

const scaleOptions = {
  dataVolume: ["Small (<100MB)", "Medium (100MB-1GB)", "Large (>1GB)"],
  queryFrequency: ["Low (<10/hour)", "Medium (10-100/hour)", "High (>100/hour)"],
  responseTime: ["Fast (<1s)", "Medium (1-5s)", "Relaxed (>5s)"]
};

interface ProjectFormProps {
  onSubmit: (data: ProjectRequirements) => void;
  isLoading?: boolean;
}

export function ProjectForm({ onSubmit, isLoading }: ProjectFormProps) {
  const form = useForm<ProjectRequirements>({
    resolver: zodResolver(projectRequirementSchema),
    defaultValues: {
      projectName: "",
      projectGoal: "",
      dataTypes: [],
      queryPatterns: [],
      scaleRequirements: {
        dataVolume: "",
        queryFrequency: "",
        responseTime: ""
      }
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
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Goal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project's main objective..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Types</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange([...field.value, value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data types" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((type) => (
                  <Button
                    key={type}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      field.onChange(field.value.filter((t) => t !== type));
                    }}
                  >
                    {type} ×
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="queryPatterns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Query Patterns</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange([...field.value, value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select query patterns" />
                  </SelectTrigger>
                  <SelectContent>
                    {queryPatterns.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>
                        {pattern}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((pattern) => (
                  <Button
                    key={pattern}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      field.onChange(field.value.filter((p) => p !== pattern));
                    }}
                  >
                    {pattern} ×
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(scaleOptions).map(([key, options]) => (
            <FormField
              key={key}
              control={form.control}
              name={`scaleRequirements.${key as keyof ProjectRequirements["scaleRequirements"]}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${key}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Project..." : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}
