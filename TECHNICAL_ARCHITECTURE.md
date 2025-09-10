
# Responsible AI Platform - Technical Architecture

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: React Context + SWR for data fetching
- **UI Components**: Headless UI + custom components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Authentication**: NextAuth.js with OIDC support

### Backend Architecture
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT with OAuth2/OIDC
- **File Storage**: MinIO (S3-compatible)
- **Task Queue**: Celery with Redis
- **Workflow Engine**: Temporal.io

### Data Storage
- **Primary Database**: PostgreSQL for transactional data
- **Object Storage**: MinIO for artifacts and documents
- **Search Engine**: Elasticsearch for policy and evidence search
- **Vector Database**: Milvus for embedding search
- **Immutable Store**: immudb for audit trails

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Security**: OWASP compliance, security scanning

## Core Data Models

### Primary Entities
```typescript
// Model entity
interface Model {
  id: string;
  name: string;
  version: string;
  description: string;
  useCaseId: string;
  ownerId: string;
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
}

// UseCase entity
interface UseCase {
  id: string;
  name: string;
  description: string;
  domain: string;
  jurisdiction: string;
  dataTypes: string[];
  decisionType: 'automated' | 'human_in_the_loop' | 'supporting';
  createdAt: Date;
}

// Assessment entity
interface Assessment {
  id: string;
  modelId: string;
  type: 'feat' | 'pdpa' | 'hkma' | 'eu_ai_act';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  checklist: ChecklistItem[];
  riskScore: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

// Evidence entity
interface Evidence {
  id: string;
  assessmentId: string;
  type: 'document' | 'metric' | 'artifact' | 'log';
  name: string;
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  hash: string;
  createdAt: Date;
}

// MetricRun entity
interface MetricRun {
  id: string;
  modelId: string;
  type: 'fairness' | 'explainability' | 'drift' | 'stability';
  metrics: Metric[];
  datasetId: string;
  status: 'running' | 'completed' | 'failed';
  results: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}
```

## API Design

### RESTful Endpoints
```
# Models
GET    /api/v1/models
POST   /api/v1/models
GET    /api/v1/models/{id}
PUT    /api/v1/models/{id}
DELETE /api/v1/models/{id}

# Assessments
GET    /api/v1/assessments
POST   /api/v1/assessments
GET    /api/v1/assessments/{id}
POST   /api/v1/assessments/{id}/evidence
POST   /api/v1/assessments/{id}/submit

# Diagnostics
POST   /api/v1/diagnostics/run
GET    /api/v1/diagnostics/runs/{id}
GET    /api/v1/diagnostics/runs/{id}/results

# Evidence Vault
GET    /api/v1/evidence
GET    /api/v1/evidence/{id}
GET    /api/v1/evidence/{id}/receipt
POST   /api/v1/evidence/export

# Disclosures
GET    /api/v1/dis