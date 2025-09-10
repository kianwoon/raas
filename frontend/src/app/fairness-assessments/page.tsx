'use client'

import { useState } from 'react'

export default function FairnessAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  const handleCreateAssessment = async (assessmentData: any) => {
    try {
      console.log('Creating assessment:', assessmentData)
      // Placeholder for API call
      setShowForm(false)
      // You would typically update the assessments list here
    } catch (error) {
      console.error('Error creating assessment:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fairness Assessments</h1>
              <p className="text-gray-600">
                Create and manage fairness assessments for your AI models to ensure they meet ethical standards and regulatory requirements.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              New Assessment
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Create New Fairness Assessment</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const data = {
                  name: formData.get('name'),
                  model_id: formData.get('model_id'),
                  dataset_id: formData.get('dataset_id'),
                  assessment_type: formData.get('assessment_type'),
                  protected_attributes: formData.get('protected_attributes'),
                  description: formData.get('description')
                }
                handleCreateAssessment(data)
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Name</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter assessment name"
                      required
                    />
                  </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dataset ID</label>
                    <input
                      type="text"
                      name="dataset_id"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter dataset ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                    <select
                      name="assessment_type"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="demographic_parity">Demographic Parity</option>
                      <option value="equal_opportunity">Equal Opportunity</option>
                      <option value="equalized_odds">Equalized Odds</option>
                      <option value="disparate_impact">Disparate Impact</option>
                      <option value="comprehensive">Comprehensive Assessment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Protected Attributes</label>
                    <input
                      type="text"
                      name="protected_attributes"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., gender, race, age"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Describe the purpose and scope of this assessment"
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
                    Create Assessment
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assessments.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments created</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first fairness assessment.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Assessment
                    </button>
                  </div>
                </li>
              ) : (
                assessments.map((assessment) => (
                  <li key={assessment.id}>
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {assessment.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Type: {assessment.assessment_type} | Model: {assessment.model_id}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Status: {assessment.status}</span>
                            <span>Created: {new Date(assessment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Results
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Download Report
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