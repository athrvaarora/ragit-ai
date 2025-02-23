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
import { Checkbox } from "@/components/ui/checkbox";
import { projectRequirementSchema, type ProjectRequirements } from "@shared/schema";

const dataTypes = [
  "Documents (PDF/Text)",
  "Structured Data (JSON/CSV)",
  "Code Repositories",
  "Web Content",
  "Database Records"
];

const queryTypes = [
  "Question Answering",
  "Information Extraction",
  "Summarization",
  "Analysis & Insights",
  "Code Understanding",
  "Data Transformation"
];

const complexityLevels = {
  dataVolume: ["Small (<100MB)", "Medium (1-10GB)", "Large (>10GB)"],
  queryComplexity: ["Simple", "Moderate", "High"],
  updateFrequency: ["Static", "Daily Updates", "Real-time"],
  responseTime: ["Real-time (<1s)", "Near Real-time (<5s)", "Batch (>5s)"]
};

const outputFormats = [
  "Structured JSON",
  "Natural Language",
  "Markdown",
  "HTML",
  "Custom Format"
];

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
      dataCharacteristics: {
        dataTypes: [],
        dataVolume: "",
        updateFrequency: "",
        structureType: ""
      },
      queryRequirements: {
        queryTypes: [],
        complexity: "",
        expectedVolume: "",
        responseTimeNeeded: ""
      },
      specialRequirements: [],
      outputFormat: {
        type: "",
        structure: "",
        citations: true
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
                <Input placeholder="Enter your RAG project name" {...field} />
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
                  placeholder="Describe what you want to achieve with RAG agents..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dataCharacteristics.dataTypes"
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
            name="queryRequirements.queryTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Query Types</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange([...field.value, value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select query types" />
                    </SelectTrigger>
                    <SelectContent>
                      {queryTypes.map((type) => (
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(complexityLevels).map(([key, options]) => (
            <FormField
              key={key}
              control={form.control}
              name={`queryRequirements.${key}`}
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

        <FormField
          control={form.control}
          name="outputFormat.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Format</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select output format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {outputFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outputFormat.citations"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Require source citations
                </FormLabel>
              </div>
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