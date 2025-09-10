'use client'

import { useState } from 'react'
import Link from 'next/link'
import React from 'react'

// Icon components
const BookOpen = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const FileText = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const CheckCircle = ({ className = '' }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertTriangle = ({ className = '' }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const Scale = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
)

const Shield = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Download = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const ExternalLink = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const Clock = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Users = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
    destructive: 'bg-red-100 text-red-800'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }: { children: React.ReactNode; variant?: 'default' | 'outline' | 'ghost'; size?: 'default' | 'sm' | 'lg'; className?: string; [key: string]: any }) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100'
  }
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-3'
  }
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Tabs = ({ children, defaultValue, className = '' }: { children: React.ReactNode; defaultValue?: string; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || 'resources')
  
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab })
        }
        if (React.isValidElement(child) && child.type === TabsContent) {
          return React.cloneElement(child, { activeTab })
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ children, activeTab, setActiveTab, className = '' }: { children: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void; className?: string }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === TabsTrigger) {
        return React.cloneElement(child, { activeTab, setActiveTab })
      }
      return child
    })}
  </div>
)

const TabsTrigger = ({ children, value, activeTab, setActiveTab, className = '' }: { children: React.ReactNode; value: string; activeTab: string; setActiveTab: (tab: string) => void; className?: string }) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value
        ? 'bg-white text-gray-950 shadow-sm'
        : 'text-gray-500 hover:text-gray-950'
    } ${className}`}
  >
    {children}
  </button>
)

const TabsContent = ({ children, value, activeTab, className = '' }: { children: React.ReactNode; value: string; activeTab: string; className?: string }) => {
  if (activeTab !== value) return null
  return <div className={className}>{children}</div>
}

interface Resource {
  id: string
  title: string
  description: string
  type: 'framework' | 'guideline' | 'tool' | 'template' | 'report'
  category: 'compliance' | 'auditing' | 'standards' | 'enforcement'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  downloadUrl?: string
  externalUrl?: string
  tags: string[]
}

const resources: Resource[] = [
  {
    id: 'ai-act-compliance',
    title: 'EU AI Act Compliance Framework',
    description: 'Comprehensive guide to understanding and implementing requirements under the EU AI Act for high-risk AI systems.',
    type: 'framework',
    category: 'compliance',
    difficulty: 'advanced',
    estimatedTime: '4 hours',
    downloadUrl: '/downloads/eu-ai-act-framework.pdf',
    tags: ['EU AI Act', 'Compliance', 'High-Risk AI', 'Regulatory']
  },
  {
    id: 'algorithmic-audit-toolkit',
    title: 'Algorithmic Auditing Toolkit',
    description: 'Standardized procedures and tools for conducting algorithmic audits, including bias assessment and transparency evaluation.',
    type: 'tool',
    category: 'auditing',
    difficulty: 'intermediate',
    estimatedTime: '2 hours',
    downloadUrl: '/downloads/audit-toolkit.zip',
    tags: ['Auditing', 'Bias Assessment', 'Transparency', 'Methodology']
  },
  {
    id: 'fairness-guidelines',
    title: 'Algorithmic Fairness Guidelines',
    description: 'Regulatory guidance on defining, measuring, and ensuring algorithmic fairness in automated decision-making systems.',
    type: 'guideline',
    category: 'standards',
    difficulty: 'intermediate',
    estimatedTime: '1.5 hours',
    tags: ['Fairness', 'Guidelines', 'Decision-Making', 'Standards']
  },
  {
    id: 'bias-assessment-template',
    title: 'Bias Assessment Template',
    description: 'Standardized template for documenting and assessing bias in AI systems across different demographic groups.',
    type: 'template',
    category: 'auditing',
    difficulty: 'beginner',
    estimatedTime: '45 minutes',
    downloadUrl: '/downloads/bias-assessment-template.docx',
    tags: ['Bias', 'Assessment', 'Template', 'Documentation']
  },
  {
    id: 'transparency-reporting',
    title: 'Transparency Reporting Standards',
    description: 'Requirements and best practices for transparency reporting in AI systems, including model cards and datasheets.',
    type: 'framework',
    category: 'standards',
    difficulty: 'intermediate',
    estimatedTime: '2 hours',
    tags: ['Transparency', 'Reporting', 'Model Cards', 'Documentation']
  },
  {
    id: 'enforcement-procedures',
    title: 'Enforcement Procedures Manual',
    description: 'Step-by-step procedures for investigating and enforcing compliance with AI regulations and standards.',
    type: 'tool',
    category: 'enforcement',
    difficulty: 'advanced',
    estimatedTime: '3 hours',
    downloadUrl: '/downloads/enforcement-manual.pdf',
    tags: ['Enforcement', 'Procedures', 'Investigation', 'Compliance']
  }
]

const complianceFrameworks = [
  {
    name: 'EU AI Act',
    description: 'Comprehensive regulatory framework for AI systems in the European Union',
    status: 'Active',
    lastUpdated: '2024-01-15',
    keyRequirements: ['Risk classification', 'Conformity assessment', 'Post-market monitoring']
  },
  {
    name: 'NIST AI RMF',
    description: 'National Institute of Standards and Technology AI Risk Management Framework',
    status: 'Adopted',
    lastUpdated: '2023-12-01',
    keyRequirements: ['Govern', 'Map', 'Measure', 'Manage']
  },
  {
    name: 'Algorithmic Accountability Act',
    description: 'US legislative proposal for algorithmic impact assessments',
    status: 'Proposed',
    lastUpdated: '2024-02-20',
    keyRequirements: ['Impact assessments', 'Automated decision systems', 'Consumer protection']
  }
]

const upcomingDeadlines = [
  {
    title: 'EU AI Act Implementation',
    date: '2025-08-01',
    description: 'Deadline for compliance with EU AI Act requirements',
    priority: 'High'
  },
  {
    title: 'Annual Bias Reporting',
    date: '2024-12-31',
    description: 'Submit annual algorithmic bias assessment reports',
    priority: 'Medium'
  },
  {
    title: 'Transparency Framework Update',
    date: '2024-11-15',
    description: 'Update transparency documentation for regulated AI systems',
    priority: 'Medium'
  }
]

export default function RegulatorsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'all' || resource.category === selectedCategory
    const typeMatch = selectedType === 'all' || resource.type === selectedType
    return categoryMatch && typeMatch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'framework': return <Scale className="h-4 w-4" />
      case 'guideline': return <BookOpen className="h-4 w-4" />
      case 'tool': return <Shield className="h-4 w-4" />
      case 'template': return <FileText className="h-4 w-4" />
      case 'report': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Regulatory Resources</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive tools, frameworks, and guidelines for regulating AI systems and ensuring compliance with emerging standards.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full md:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="compliance">Compliance</option>
            <option value="auditing">Auditing</option>
            <option value="standards">Standards</option>
            <option value="enforcement">Enforcement</option>
          </select>
          
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full md:w-auto"
          >
            <option value="all">All Types</option>
            <option value="framework">Frameworks</option>
            <option value="guideline">Guidelines</option>
            <option value="tool">Tools</option>
            <option value="template">Templates</option>
            <option value="report">Reports</option>
          </select>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <Badge className={getDifficultyColor(resource.difficulty)}>
                        {resource.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{resource.estimatedTime}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      {resource.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {resource.externalUrl && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {complianceFrameworks.map((framework, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{framework.name}</CardTitle>
                      <Badge variant={framework.status === 'Active' ? 'default' : 'secondary'}>
                        {framework.status}
                      </Badge>
                    </div>
                    <CardDescription>{framework.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Key Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {framework.keyRequirements.map((req, reqIndex) => (
                            <Badge key={reqIndex} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Last updated: {framework.lastUpdated}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {upcomingDeadlines.map((deadline, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{deadline.title}</CardTitle>
                        <CardDescription>{deadline.description}</CardDescription>
                      </div>
                      <AlertTriangle className={`h-5 w-5 ${
                        deadline.priority === 'High' ? 'text-red-500' : 'text-yellow-500'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{deadline.date}</span>
                      </div>
                      <Badge variant={deadline.priority === 'High' ? 'destructive' : 'secondary'}>
                        {deadline.priority} Priority
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Compliance Checker
                  </CardTitle>
                  <CardDescription>
                    Quick assessment tool for checking AI system compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Assessment</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Risk Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate risk levels for AI systems based on regulatory criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Calculate Risk</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Report Generator
                  </CardTitle>
                  <CardDescription>
                    Generate standardized regulatory reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}