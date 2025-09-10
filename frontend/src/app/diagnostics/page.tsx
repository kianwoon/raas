'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DiagnosticRun {
  id: string
  name: string
  diagnosis_type: string
  status: string
  model_name: string
  created_at: string
  completed_at?: string
}

export default function DiagnosticsPage() {
  const [runs, setRuns] = useState<DiagnosticRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await fetch('/api/v1/diagnostics/runs')
      if (response.ok) {
        const data = await response.json()
        setRuns(data.runs || [])
      }
    } catch (error) {
      console.error('Error fetching diagnostic runs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunDiagnostic = async (diagnosticData: any) => {
    try {
      const response = await fetch('/api/v1/diagnostics/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosticData),
      })

      if (response.ok) {
        setShowForm(false)
        fetchRuns()
      }
    } catch (error) {
      console.error('Error running diagnostic:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diagnostics & Explainability</h1>
              <p className="mt-2 text-gray-600">
                Run diagnosis tools to detect drift and explain model predictions
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Run Diagnosis
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Configure Diagnosis</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const data = {
                  model_id: formData.get('model_id'),
                  diagnosis_type: formData.get('diagnosis_type'),
                  test_data_path: formData.get('test_data_path'),
                  baseline_data_path: formData.get('baseline_data_path'),
                  config: {
                    significance_level: parseFloat(formData.get('significance_level') as string),
                    min_drift_score: parseFloat(formData.get('min_drift_score') as string)
                  }
                }
                handleRunDiagnostic(data)
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model ID</label>
                    <input
                      type="text"
                      name="model_id"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter model ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis Type</label>
                    <select
                      name="diagnosis_type"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="drift_detection">Drift Detection</option>
                      <option value="feature_importance">Feature Importance</option>
                      <option value="prediction_explanation">Prediction Explanation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Data Path</label>
                    <input
                      type="text"
                      name="test_data_path"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="/path/to/test/data.csv"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Baseline Data Path</label>
                    <input
                      type="text"
                      name="baseline_data_path"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="/path/to/baseline/data.csv"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Significance Level</label>
                    <input
                      type="number"
                      name="significance_level"
                      step="0.01"
                      min="0"
                      max="1"
                      defaultValue="0.05"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Drift Score</label>
                    <input
                      type="number"
                      name="min_drift_score"
                      step="0.01"
                      min="0"
                      max="1"
                      defaultValue="0.1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Run Diagnosis
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {runs.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500">
                  No diagnostic runs found. Run your first diagnosis to get started.
                </li>
              ) : (
                runs.map((run) => (
                  <li key={run.id}>
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {run.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Type: {run.diagnosis_type} | Model: {run.model_name}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Status: {run.status}</span>
                            <span>Created: {new Date(run.created_at).toLocaleDateString()}</span>
                            {run.completed_at && (
                              <span>Completed: {new Date(run.completed_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/diagnostics/${run.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Results
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