'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { dataIngestionApi } from '@/lib/api/data-ingestion';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: (result: any) => void;
  acceptedFileTypes?: string[];
  maxSize?: number; // in MB
  multiple?: boolean;
  description?: string;
}

export default function FileUpload({
  onUploadComplete,
  acceptedFileTypes = ['.csv', '.json', '.xlsx', '.parquet'],
  maxSize = 100,
  multiple = false,
  description = 'Upload data files for analysis'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const progress = ((i + 1) / acceptedFiles.length) * 100;
        setUploadProgress(progress);

        const result = await dataIngestionApi.uploadFile(file, {
          description: `Uploaded file: ${file.name}`,
          protectedAttributes: [],
          sampleSize: 100
        });

        setUploadedFiles(prev => [...prev, {
          file,
          result,
          status: 'completed'
        }]);

        if (onUploadComplete) {
          onUploadComplete(result);
        }
      }

      toast.success('Files uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/parquet': ['.parquet']
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            File Upload
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Uploading files...</p>
                  <Progress value={uploadProgress} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress.toFixed(0)}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: {acceptedFileTypes.join(', ')} (Max {maxSize}MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Rejections */}
          {fileRejections.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">File upload errors:</p>
                  <ul className="mt-1 text-red-700">
                    {fileRejections.map((rejection, index) => (
                      <li key={index} className="text-xs">
                        {rejection.file.name} - {rejection.errors[0].message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{item.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.file.size)} • {item.result.upload_status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.result.upload_status === 'success' ? 'default' : 'destructive'}>
                      {item.result.upload_status === 'success' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}