import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProjectRequirements } from "@shared/schema";
import { 
  ChevronRight, 
  ChevronLeft,
  CheckCircle
} from "lucide-react";

interface ConfigWizardProps {
  onSubmit: (data: ProjectRequirements) => void;
  isLoading: boolean;
}

const steps = [
  {
    id: 'project',
    title: 'Project Details',
    description: 'Start with the basics of your project'
  },
  {
    id: 'requirements',
    title: 'Project Requirements',
    description: 'Describe what your project needs to accomplish'
  },
  {
    id: 'review',
    title: 'Review Configuration',
    description: 'Review your configuration before generating'
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export function ConfigWizard({ onSubmit, isLoading }: ConfigWizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<ProjectRequirements>({
    projectName: '',
    projectDescription: ''
  });

  const navigate = (delta: number) => {
    setDirection(delta);
    setStep(prev => prev + delta);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const updateField = (field: keyof ProjectRequirements, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicators */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={
                `w-8 h-8 rounded-full flex items-center justify-center
                ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                transition-colors duration-200`
              }>
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={
                  `h-1 w-24 mx-2
                  ${i < step ? 'bg-primary' : 'bg-muted'}
                  transition-colors duration-200`
                } />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((s) => (
            <div key={s.id} className="text-sm text-muted-foreground w-24 text-center">
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="bg-gradient-to-br from-card to-primary/5">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="p-6"
          >
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Project Details</h2>
                  <p className="text-muted-foreground">Let's start with the basics of your project.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Name</label>
                    <Input
                      placeholder="Enter project name"
                      value={formData.projectName}
                      onChange={(e) => updateField('projectName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Project Requirements</h2>
                  <p className="text-muted-foreground">Describe what your project needs to accomplish.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Description</label>
                  <Textarea
                    placeholder="Describe your project requirements in detail..."
                    value={formData.projectDescription}
                    onChange={(e) => updateField('projectDescription', e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Review Configuration</h2>
                  <p className="text-muted-foreground">Review your configuration before generating.</p>
                </div>
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Project Name</h3>
                    <p>{formData.projectName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Project Description</h3>
                    <p className="whitespace-pre-wrap">{formData.projectDescription}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {step === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.projectName || !formData.projectDescription}
            className="bg-gradient-to-r from-primary to-primary/70"
          >
            {isLoading ? "Generating..." : "Generate Configuration"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => navigate(1)}
            disabled={step === 0 && !formData.projectName}
            className="bg-gradient-to-r from-primary to-primary/70"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}