'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Database, Cloud, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { dataIngestionApi } from '@/lib/api/data-ingestion';
import { DataSourceType } from '@/types/common';
import { toast } from 'react-hot-toast';

interface ConnectorConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  connection_string?: string;
  api_key?: string;
  api_url?: string;
  access_key?: string;
  secret_key?: string;
  bucket_name?: string;
  region?: string;
}

interface ConnectorSetupProps {
  onConnectorCreated?: (dataSource: any) => void;
}

export default function ConnectorSetup({ onConnectorCreated }: ConnectorSetupProps) {
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [configSchema, setConfigSchema] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ConnectorConfig>();

  const connectorTypes = [
    {
      type: DataSourceType.DATABASE,
      name: 'Database',
      description: 'Connect to SQL databases',
      icon: Database,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: DataSourceType.API,
      name: 'API',
      description: 'Connect to REST APIs',
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      type: DataSourceType.CLOUD_STORAGE,
      name: 'Cloud Storage',
      description: 'Connect to cloud storage services',
      icon: Cloud,
      color: 'bg-green-100 text-green-800'
    }
  ];

  useEffect(() => {
    if (selectedType) {
      loadConfigSchema();
    }
  }, [selectedType]);

  const loadConfigSchema = async () => {
    if (!selectedType) return;
    
    try {
      const schema = await dataIngestionApi.getConnectorConfigSchema(selectedType);
      setConfigSchema(schema.schema);
      reset();
    } catch (error) {
      toast.error('Failed to load connector configuration schema');
    }
  };

  const testConnection = async (config: ConnectorConfig) => {
    if (!selectedType) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await dataIngestionApi.testConnector(selectedType, config);
      setTestResult(result);
      
      if (result.success) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed: ' + result.message);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection'
      });
      toast.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const createDataSource = async (config: ConnectorConfig) => {
    if (!selectedType || !testResult?.success) return;

    setCreating(true);

    try {
      const dataSource = await dataIngestionApi.createDataSource({
        name: `${selectedType} Connector`,
        description: `Connected to ${selectedType} data source`,
        source_type: selectedType,
        connection_config: config
      });

      toast.success('Data source created successfully!');
      onConnectorCreated?.(dataSource);
      
      // Reset form
      setSelectedType(null);
      setTestResult(null);
      reset();
    } catch (error) {
      toast.error('Failed to create data source');
    } finally {
      setCreating(false);
    }
  };

  const renderConfigForm = () => {
    if (!selectedType || !configSchema) return null;

    const configFields = getConfigFields(selectedType);

    return (
      <div className="space-y-4">
        {configFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name as keyof ConnectorConfig, { required: field.required })}
            />
            {errors[field.name as keyof ConnectorConfig] && (
              <p className="text-sm text-red-500">{field.label} is required</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getConfigFields = (type: DataSourceType) => {
    switch (type) {
      case DataSourceType.DATABASE:
        return [
          { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
          { name: 'port', label: 'Port', type: 'number', placeholder: '5432', required: true },
          { name: 'database', label: 'Database', type: 'text', placeholder: 'mydatabase', required: true },
          { name: 'username', label: 'Username', type: 'text', placeholder: 'username', required: true },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'password', required: true },
          { name: 'schema', label: 'Schema', type: 'text', placeholder: 'public', required: false }
        ];
      case DataSourceType.API:
        return [
          { name: 'api_url', label: 'API URL', type: 'text', placeholder: 'https://api.example.com', required: true },
          { name: 'api_key', label: 'API Key', type: 'text', placeholder: 'your-api-key', required: true }
        ];
      case DataSourceType.CLOUD_STORAGE:
        return [
          { name: 'access_key', label: 'Access Key', type: 'text', placeholder: 'your-access-key', required: true },
          { name: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'your-secret-key', required: true },
          { name: 'bucket_name', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
          { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Connector Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Connector Type</CardTitle>
          <CardDescription>Choose the type of data source you want to connect to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connectorTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.type}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${selectedType === type.type 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedType(type.type as DataSourceType)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                      <Badge className={type.color + ' mt-2'}>
                        {type.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Configure {selectedType.replace(/_/g, ' ')} Connection</CardTitle>
            <CardDescription>Enter the connection details for your data source</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(testConnection)} className="space-y-6">
              {renderConfigForm()}

              {/* Test Connection Button */}
              <div className="flex items-center space-x-4">
                <Button type="submit" disabled={testing}>
                  {testing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Create Data Source */}
            {testResult?.success && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSubmit(createDataSource)}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Data Source'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}