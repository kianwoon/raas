'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Target, 
  BarChart3, 
  Settings,
  FileText,
  Download,
  Play,
  RefreshCw
} from 'lucide-react';
import { assessmentApi } from '@/lib/api/assessments';
import { dataIngestionApi } from '@/lib/api/data-ingestion';
import { FairnessAssessmentConfiguration, FairnessAssessmentStatus } from '@/types/assessment';
import { toast } from 'react-hot-toast';

interface FairnessAssessmentWizardProps {
  onComplete?: (assessmentId: string) => void;
}

export default function FairnessAssessmentWizard({ onComplete }: FairnessAssessmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, watch, control } = useForm({
    defaultValues: {
      name: '',
      description: '',
      model_name: '',
      model_version: '',
      data_source_id: '',
      protected_attributes: [''],
      fairness_metrics: [''],
      thresholds: {},
      sensitive_groups: {}
    }
  });

  const { fields: protectedAttributeFields, append: appendProtectedAttribute, remove: removeProtectedAttribute } = useFieldArray({
    control,
    name: 'protected_attributes'
  });

  const { fields: metricFields, append: appendMetric, remove: removeMetric } = useFieldArray({
    control,
    name: 'fairness_metrics'
  });

  const watchedValues = watch();

  useEffect(() => {
    loadDataSources();
    loadAvailableMetrics();
  }, []);

  const loadDataSources = async () => {
    try {
      const sources = await dataIngestionApi.getDataSources();
      setDataSources(sources);
    } catch (error) {
      toast.error('Failed to load data sources');
    }
  };

  const loadAvailableMetrics = async () => {
    try {
      const definitions = await assessmentApi.getFairnessMetricDefinitions();
      setAvailableMetrics(definitions.metrics);
    } catch (error) {
      toast.error('Failed to load fairness metrics');
    }
  };

  const validateStep = (step: number) => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!watchedValues.name) errors.push('Assessment name is required');
        if (!watchedValues.model_name) errors.push('Model name is required');
        if (!watchedValues.data_source_id) errors.push('Data source is required');
        break;
      case 2:
        if (!watchedValues.protected_attributes?.filter(attr => attr).length) {
          errors.push('At least one protected attribute is required');
        }
        break;
      case 3:
        if (!watchedValues.fairness_metrics?.filter(metric => metric).length) {
          errors.push('At least one fairness metric is required');
        }
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Create or update assessment
      const assessmentData = {
        name: data.name,
        description: data.description,
        model_name: data.model_name,
        model_version: data.model_version,
        data_source_id: data.data_source_id,
        configuration: {
          protected_attributes: data.protected_attributes.filter(attr => attr),
          fairness_metrics: data.fairness_metrics.filter(metric => metric),
          thresholds: data.thresholds,
          sensitive_groups: data.sensitive_groups,
          visualization_config: {
            charts: ['demographic_parity', 'equal_opportunity', 'disparate_impact'],
            interactive_features: true
          }
        }
      };

      let createdAssessment;
      if (assessmentId) {
        createdAssessment = await assessmentApi.updateFairnessAssessment(assessmentId, assessmentData);
      } else {
        createdAssessment = await assessmentApi.createFairnessAssessment(assessmentData);
        setAssessmentId(createdAssessment.id);
      }

      // If we're at the final step, execute the assessment
      if (currentStep === 4) {
        const jobResponse = await assessmentApi.executeFairnessAssessment({
          assessment_id: createdAssessment.id,
          execution_parameters: {},
          priority: 0
        });

        toast.success('Fairness assessment started successfully!');
        onComplete?.(createdAssessment.id);
      } else {
        nextStep();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Assessment Name *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="e.g., Customer Churn Model Fairness Assessment"
            />
            {errors.name && <p className="text-sm text-red-500">Assessment name is required</p>}
          </div>
          
          <div>
            <Label htmlFor="model_name">Model Name *</Label>
            <Input
              id="model_name"
              {...register('model_name', { required: true })}
              placeholder="e.g., customer_churn_predictor"
            />
            {errors.model_name && <p className="text-sm text-red-500">Model name is required</p>}
          </div>
          
          <div>
            <Label htmlFor="model_version">Model Version</Label>
            <Input
              id="model_version"
              {...register('model_version')}
              placeholder="e.g., v1.0.0"
            />
          </div>
          
          <div>
            <Label htmlFor="data_source_id">Data Source *</Label>
            <Select onValueChange={(value) => {
              // Update form value
              const event = { target: { name: 'data_source_id', value } };
              register('data_source_id').onChange(event);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.data_source_id && <p className="text-sm text-red-500">Data source is required</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Describe the purpose and scope of this fairness assessment..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Protected Attributes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Define the protected attributes (e.g., gender, race, age) that should be evaluated for fairness.
        </p>
        
        <div className="space-y-3">
          {protectedAttributeFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <Input
                {...register(`protected_attributes.${index}`)}
                placeholder={`e.g., gender, race, age_group`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeProtectedAttribute(index)}
                disabled={protectedAttributeFields.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => appendProtectedAttribute('')}
          >
            Add Protected Attribute
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Fairness Metrics</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the fairness metrics to evaluate. Each metric measures different aspects of fairness.
        </p>
        
        <div className="space-y-3">
          {metricFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <Select onValueChange={(value) => {
                const event = { target: { name: `fairness_metrics.${index}`, value } };
                register(`fairness_metrics.${index}`).onChange(event);
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric.name} value={metric.name}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                {...register(`thresholds.${watchedValues.fairness_metrics[index]}`)}
                placeholder="Threshold"
                type="number"
                step="0.1"
                className="w-24"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeMetric(index)}
                disabled={metricFields.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => appendMetric('')}
          >
            Add Metric
          </Button>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Metric Descriptions</h4>
          <div className="space-y-2 text-sm">
            {availableMetrics.slice(0, 3).map((metric) => (
              <div key={metric.name} className="p-2 bg-gray-50 rounded">
                <strong>{metric.name}:</strong> {metric.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Review and Execute</h3>
        <p className="text-sm text-gray-600 mb-4">
          Review your fairness assessment configuration and execute when ready.
        </p>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {watchedValues.name}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {watchedValues.model_name}
                </div>
                <div>
                  <span className="font-medium">Version:</span> {watchedValues.model_version || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Data Source:</span> {dataSources.find(s => s.id === watchedValues.data_source_id)?.name || 'Not selected'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Protected Attributes:</span>
                <div className="mt-1">
                  {watchedValues.protected_attributes?.filter(attr => attr).map((attr, index) => (
                    <Badge key={index} className="mr-1 mb-1">
                      {attr}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Fairness Metrics:</span>
                <div className="mt-1">
                  {watchedValues.fairness_metrics?.filter(metric => metric).map((metric, index) => (
                    <Badge key={index} className="mr-1 mb-1">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const getStepIcon = (step: number) => {
    const icons = [Target, Users, BarChart3, Settings];
    const Icon = icons[step - 1];
    return <Icon className="h-5 w-5" />;
  };

  const getStepTitle = (step: number) => {
    const titles = ['Basic Info', 'Protected Attributes', 'Fairness Metrics', 'Review & Execute'];
    return titles[step - 1];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Fairness Assessment Wizard</h1>
        <p className="text-gray-600 mt-2">Configure and run a comprehensive fairness assessment for your model</p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {getStepIcon(step)}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step ? 'font-medium' : 'text-gray-500'}`}>
                  {getStepTitle(step)}
                </span>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 ${currentStep > step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating Assessment...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Assessment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}