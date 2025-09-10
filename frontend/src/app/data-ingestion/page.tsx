'use client'

import { useState } from 'react'

export default function DataIngestionPage() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [showUploadForm, setShowUploadForm] = useState(false)

  const handleUpload = async (data: any) => {
    // Placeholder for upload functionality
    console.log('Uploading dataset:', data)
    setShowUploadForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Ingestion</h1>
              <p className="mt-2 text-gray-600">
                Upload and manage datasets for fairness assessment and model training
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload Dataset
            </button>
          </div>

          {showUploadForm && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Upload New Dataset</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const data = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  dataset_type: formData.get('dataset_type'),
                  file: formData.get('file')
                }
                handleUpload(data)
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dataset Name</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter dataset name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dataset Type</label>
                    <select
                      name="dataset_type"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="training">Training</option>
                      <option value="testing">Testing</option>
                      <option value="validation">Validation</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Describe the dataset and its intended use"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dataset File</label>
                    <input
                      type="file"
                      name="file"
                      accept=".csv,.json,.parquet"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Upload Dataset
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {datasets.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets uploaded</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading your first dataset for fairness assessment.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Upload Dataset
                    </button>
                  </div>
                </li>
              ) : (
                datasets.map((dataset) => (
                  <li key={dataset.id}>
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {dataset.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Type: {dataset.dataset_type} | Size: {dataset.size}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Status: {dataset.status}</span>
                            <span>Uploaded: {new Date(dataset.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Use in Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}