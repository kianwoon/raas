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

const Video = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const Users = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const Lightbulb = ({ className = '' }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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

const Play = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FileText = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ChevronRight = ({ className = '' }: { className?: string }) => (
  <svg className={`w-3 h-3 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
  type: 'guide' | 'video' | 'article' | 'tool' | 'infographic'
  category: 'basics' | 'impact' | 'rights' | 'safety'
  difficulty: 'beginner' | 'intermediate'
  estimatedTime: string
  downloadUrl?: string
  externalUrl?: string
  tags: string[]
}

const resources: Resource[] = [
  {
    id: 'ai-basics-guide',
    title: 'Understanding AI Basics',
    description: 'A beginner-friendly guide to understanding artificial intelligence, how it works, and its impact on society.',
    type: 'guide',
    category: 'basics',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    downloadUrl: '/downloads/ai-basics-guide.pdf',
    tags: ['AI Basics', 'Beginner', 'Education']
  },
  {
    id: 'algorithmic-bias-explained',
    title: 'Algorithmic Bias Explained',
    description: 'Learn what algorithmic bias is, how it affects people, and what we can do about it.',
    type: 'video',
    category: 'impact',
    difficulty: 'beginner',
    estimatedTime: '8 minutes',
    externalUrl: 'https://example.com/bias-video',
    tags: ['Bias', 'Video', 'Fairness']
  },
  {
    id: 'digital-rights-guide',
    title: 'Your Digital Rights',
    description: 'Understanding your rights when interacting with AI systems and automated decision-making.',
    type: 'guide',
    category: 'rights',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    tags: ['Rights', 'Privacy', 'Protection']
  },
  {
    id: 'ai-safety-checklist',
    title: 'AI Safety Checklist',
    description: 'A practical checklist for evaluating the safety and reliability of AI tools you use.',
    type: 'tool',
    category: 'safety',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    downloadUrl: '/downloads/safety-checklist.pdf',
    tags: ['Safety', 'Checklist', 'Practical']
  },
  {
    id: 'ai-in-healthcare',
    title: 'AI in Healthcare: What You Need to Know',
    description: 'How AI is being used in healthcare and what it means for patients and medical decisions.',
    type: 'article',
    category: 'impact',
    difficulty: 'intermediate',
    estimatedTime: '12 minutes',
    tags: ['Healthcare', 'Impact', 'Applications']
  },
  {
    id: 'transparency-infographic',
    title: 'AI Transparency Visual Guide',
    description: 'Visual guide to understanding how AI systems make decisions and why transparency matters.',
    type: 'infographic',
    category: 'basics',
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    downloadUrl: '/downloads/transparency-infographic.pdf',
    tags: ['Transparency', 'Visual', 'Guide']
  }
]

const learningPaths = [
  {
    id: 'ai-literacy',
    title: 'AI Literacy Path',
    description: 'Start from zero and build a solid understanding of AI fundamentals',
    duration: '2 hours',
    modules: [
      'What is AI?',
      'How AI Learns',
      'AI in Everyday Life',
      'Common Misconceptions'
    ]
  },
  {
    id: 'rights-awareness',
    title: 'Digital Rights Awareness',
    description: 'Learn about your rights in the digital age and AI era',
    duration: '1.5 hours',
    modules: [
      'Understanding Data Rights',
      'Automated Decisions',
      'Privacy Protection',
      'Seeking Redress'
    ]
  }
]

const interactiveTools = [
  {
    name: 'AI Impact Simulator',
    description: 'See how AI decisions might affect different scenarios',
    category: 'Interactive'
  },
  {
    name: 'Bias Detector',
    description: 'Learn to spot potential bias in AI systems',
    category: 'Educational'
  },
  {
    name: 'Rights Checker',
    description: 'Check your rights in AI-related situations',
    category: 'Practical'
  }
]

export default function PublicPage() {
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <BookOpen className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      case 'tool': return <Lightbulb className="h-4 w-4" />
      case 'infographic': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Public Resources</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Accessible information and tools to help everyone understand AI, its impacts, and your rights in the age of artificial intelligence.
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
            <option value="all">All Topics</option>
            <option value="basics">AI Basics</option>
            <option value="impact">Impact & Society</option>
            <option value="rights">Your Rights</option>
            <option value="safety">Safety & Security</option>
          </select>
          
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full md:w-auto"
          >
            <option value="all">All Formats</option>
            <option value="guide">Guides</option>
            <option value="video">Videos</option>
            <option value="article">Articles</option>
            <option value="tool">Tools</option>
            <option value="infographic">Infographics</option>
          </select>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="tools">Interactive Tools</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
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
                          {resource.type === 'video' ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Watch
                            </>
                          ) : 'View'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {learningPaths.map((path) => (
                <Card key={path.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{path.duration}</span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Modules:</p>
                        <div className="space-y-2">
                          {path.modules.map((module, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <span>{module}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button className="w-full">Start Learning Path</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interactiveTools.map((tool, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      {tool.name}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-3">{tool.category}</Badge>
                    <Button className="w-full">Try Tool</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>What is AI and how does it affect me?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Artificial Intelligence (AI) refers to computer systems that can perform tasks that typically require human intelligence. 
                    AI affects many aspects of daily life, from recommendations on streaming services to medical diagnoses and loan applications.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>What are my rights when AI makes decisions about me?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    You have the right to know when AI is used to make significant decisions about you, to understand how those decisions are made, 
                    and to request human review or appeal automated decisions in many cases.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>How can I protect myself from AI bias?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Stay informed about how AI systems work, question automated decisions that seem unfair, report concerns to appropriate authorities, 
                    and support organizations working on AI fairness and accountability.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Where can I report problems with AI systems?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    You can report AI-related issues to regulatory agencies, consumer protection organizations, 
                    or directly to the organizations using the AI systems. Many countries have specific channels for AI-related complaints.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}