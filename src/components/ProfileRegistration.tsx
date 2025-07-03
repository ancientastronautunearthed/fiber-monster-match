import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { registrationOptions } from '@/data/registrationOptions';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface RegistrationFormData {
  trigger_foods: string[];
  safe_foods: string[];
  helpful_supplements: string[];
  unhelpful_supplements: string[];
  helpful_medications: string[];
  unhelpful_medications: string[];
  previous_diagnoses: string[];
  weather_triggers: string[];
  stress_triggers: string[];
  lifestyle_factors: string[];
  exercise_types: string[];
  sleep_patterns: string[];
  environmental_triggers: string[];
  treatment_approaches: string[];
  primary_symptoms: string[];
  secondary_symptoms: string[];
  symptom_severity: string;
  condition_duration: string;
}

const steps = [
  { id: 'symptoms', title: 'Symptoms', description: 'Tell us about your primary and secondary symptoms' },
  { id: 'foods', title: 'Foods & Diet', description: 'Foods that help or trigger your symptoms' },
  { id: 'treatments', title: 'Treatments', description: 'Supplements and medications you\'ve tried' },
  { id: 'triggers', title: 'Triggers', description: 'Environmental and lifestyle triggers' },
  { id: 'lifestyle', title: 'Lifestyle', description: 'Exercise, sleep, and daily patterns' },
  { id: 'medical', title: 'Medical History', description: 'Previous diagnoses and treatments' },
];

const CheckboxGroup = ({ 
  options, 
  selectedValues, 
  onChange, 
  label 
}: { 
  options: string[]; 
  selectedValues: string[]; 
  onChange: (values: string[]) => void;
  label: string;
}) => {
  const handleToggle = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <FormLabel className="text-sm font-medium">{label}</FormLabel>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={selectedValues.includes(option)}
              onCheckedChange={() => handleToggle(option)}
            />
            <label
              htmlFor={option}
              className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileRegistration = ({ onComplete }: { onComplete?: () => void }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<RegistrationFormData>({
    defaultValues: {
      trigger_foods: [],
      safe_foods: [],
      helpful_supplements: [],
      unhelpful_supplements: [],
      helpful_medications: [],
      unhelpful_medications: [],
      previous_diagnoses: [],
      weather_triggers: [],
      stress_triggers: [],
      lifestyle_factors: [],
      exercise_types: [],
      sleep_patterns: [],
      environmental_triggers: [],
      treatment_approaches: [],
      primary_symptoms: [],
      secondary_symptoms: [],
      symptom_severity: 'moderate',
      condition_duration: '',
    },
  });

  const { watch, setValue } = form;
  const formData = watch();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Completed",
        description: "Your detailed profile has been saved successfully.",
      });

      onComplete?.();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'symptoms':
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Primary Symptoms"
              options={registrationOptions.primarySymptoms}
              selectedValues={formData.primary_symptoms}
              onChange={(values) => setValue('primary_symptoms', values)}
            />
            <CheckboxGroup
              label="Secondary Symptoms"
              options={registrationOptions.secondarySymptoms}
              selectedValues={formData.secondary_symptoms}
              onChange={(values) => setValue('secondary_symptoms', values)}
            />
            <FormField
              control={form.control}
              name="symptom_severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptom Severity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {registrationOptions.severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
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
              name="condition_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How long have you been experiencing symptoms?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {registrationOptions.durationOptions.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'foods':
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Foods That Trigger Your Symptoms"
              options={registrationOptions.triggerFoods}
              selectedValues={formData.trigger_foods}
              onChange={(values) => setValue('trigger_foods', values)}
            />
            <CheckboxGroup
              label="Foods That Are Safe/Helpful"
              options={registrationOptions.safeFoods}
              selectedValues={formData.safe_foods}
              onChange={(values) => setValue('safe_foods', values)}
            />
          </div>
        );

      case 'treatments':
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Supplements That Have Helped"
              options={registrationOptions.supplements}
              selectedValues={formData.helpful_supplements}
              onChange={(values) => setValue('helpful_supplements', values)}
            />
            <CheckboxGroup
              label="Supplements That Didn't Help"
              options={registrationOptions.supplements}
              selectedValues={formData.unhelpful_supplements}
              onChange={(values) => setValue('unhelpful_supplements', values)}
            />
            <CheckboxGroup
              label="Medications That Have Helped"
              options={registrationOptions.medications}
              selectedValues={formData.helpful_medications}
              onChange={(values) => setValue('helpful_medications', values)}
            />
            <CheckboxGroup
              label="Medications That Didn't Help"
              options={registrationOptions.medications}
              selectedValues={formData.unhelpful_medications}
              onChange={(values) => setValue('unhelpful_medications', values)}
            />
          </div>
        );

      case 'triggers':
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Weather/Climate Triggers"
              options={registrationOptions.weatherTriggers}
              selectedValues={formData.weather_triggers}
              onChange={(values) => setValue('weather_triggers', values)}
            />
            <CheckboxGroup
              label="Stress Triggers"
              options={registrationOptions.stressTriggers}
              selectedValues={formData.stress_triggers}
              onChange={(values) => setValue('stress_triggers', values)}
            />
            <CheckboxGroup
              label="Environmental Triggers"
              options={registrationOptions.environmentalTriggers}
              selectedValues={formData.environmental_triggers}
              onChange={(values) => setValue('environmental_triggers', values)}
            />
          </div>
        );

      case 'lifestyle':
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Exercise Types You Do/Enjoy"
              options={registrationOptions.exerciseTypes}
              selectedValues={formData.exercise_types}
              onChange={(values) => setValue('exercise_types', values)}
            />
            <CheckboxGroup
              label="Sleep Patterns"
              options={registrationOptions.sleepPatterns}
              selectedValues={formData.sleep_patterns}
              onChange={(values) => setValue('sleep_patterns', values)}
            />
            <CheckboxGroup
              label="Lifestyle Factors That Affect You"
              options={registrationOptions.lifestyleFactors}
              selectedValues={formData.lifestyle_factors}
              onChange={(values) => setValue('lifestyle_factors', values)}
            />
          </div>
        );

      case 'medical':
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Previous Diagnoses (including misdiagnoses)"
              options={registrationOptions.diagnoses}
              selectedValues={formData.previous_diagnoses}
              onChange={(values) => setValue('previous_diagnoses', values)}
            />
            <CheckboxGroup
              label="Treatment Approaches You've Tried"
              options={registrationOptions.treatmentApproaches}
              selectedValues={formData.treatment_approaches}
              onChange={(values) => setValue('treatment_approaches', values)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Complete Your Health Profile</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
};