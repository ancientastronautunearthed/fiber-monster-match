import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  // Demographics
  age_range: string;
  sex: string;
  height_cm: number | undefined;
  weight_kg: number | undefined;
  location_country: string;
  location_region: string;
  climate_type: string;
  occupation_category: string;
  education_level: string;
  household_income_range: string;
  // Analytics consent
  analytics_consent: boolean;
  research_participation_consent: boolean;
  data_sharing_level: string;
}

const steps = [
  { id: 'symptoms', title: 'Symptoms', description: 'Tell us about your primary and secondary symptoms' },
  { id: 'foods', title: 'Foods & Diet', description: 'Foods that help or trigger your symptoms' },
  { id: 'treatments', title: 'Treatments', description: 'Supplements and medications you\'ve tried' },
  { id: 'triggers', title: 'Triggers', description: 'Environmental and lifestyle triggers' },
  { id: 'lifestyle', title: 'Lifestyle', description: 'Exercise, sleep, and daily patterns' },
  { id: 'medical', title: 'Medical History', description: 'Previous diagnoses and treatments' },
  { id: 'demographics', title: 'Demographics', description: 'Basic demographic information (optional)' },
  { id: 'analytics', title: 'Community Analytics', description: 'Help researchers find patterns to improve treatments' },
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
      // Demographics
      age_range: '',
      sex: '',
      height_cm: undefined,
      weight_kg: undefined,
      location_country: '',
      location_region: '',
      climate_type: '',
      occupation_category: '',
      education_level: '',
      household_income_range: '',
      // Analytics consent
      analytics_consent: false,
      research_participation_consent: false,
      data_sharing_level: 'none',
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
      const updateData = {
        ...data,
        onboarding_completed: true,
        // Add consent timestamp if analytics consent is given
        ...(data.analytics_consent && { consent_date: new Date().toISOString() }),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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

      case 'demographics':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Optional Demographics:</strong> This information helps researchers identify patterns 
                across different populations. All responses are optional and will be anonymized.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.ageRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
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
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.sexOptions.map((option) => (
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

              <FormField
                control={form.control}
                name="height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 170"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 70"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
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
                name="location_region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Region</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. California, NSW"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="climate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Climate Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select climate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.climateTypes.map((climate) => (
                          <SelectItem key={climate} value={climate}>
                            {climate}
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
                name="occupation_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.occupationCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select education" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
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
                name="household_income_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household Income Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registrationOptions.incomeRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Help Advance Research & Find Better Treatments
              </h3>
              <p className="text-sm text-green-700 mb-4">
                By sharing your anonymized data, you help researchers identify patterns that could lead to 
                breakthroughs in understanding causes, triggers, and effective treatments. Your individual 
                identity is never revealed.
              </p>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="analytics_consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Yes, include my anonymized data in community analytics
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Help identify patterns across symptoms, treatments, and demographics
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="research_participation_consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Yes, include my data in approved research studies
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Contribute to academic research (always anonymous, ethically approved studies only)
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {(formData.analytics_consent || formData.research_participation_consent) && (
              <FormField
                control={form.control}
                name="data_sharing_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Sharing Level</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {registrationOptions.dataSharingLevels.map((level) => (
                          <div key={level.value} className="flex items-start space-x-3">
                            <Checkbox
                              id={level.value}
                              checked={field.value === level.value}
                              onCheckedChange={() => field.onChange(level.value)}
                            />
                            <div className="space-y-1">
                              <label
                                htmlFor={level.value}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {level.label}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {level.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Privacy Protection</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• All data is anonymized before analysis</li>
                <li>• No personal identifying information is ever shared</li>
                <li>• You can change these preferences anytime in your profile</li>
                <li>• Data is only used for approved research and community insights</li>
                <li>• You maintain full control over your participation</li>
              </ul>
            </div>
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