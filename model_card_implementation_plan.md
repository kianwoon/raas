# Model Card Implementation Plan

## Overview
This document outlines the comprehensive plan for implementing Model Card functionality with proper data persistence in PostgreSQL, replacing the sample data currently displayed on the landing page with real database-driven content.

## Model Card Data Model

### Core Model Card Entity
```sql
-- Main Model Card table
CREATE TABLE model_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL,
    risk_tier VARCHAR(20) NOT NULL CHECK (risk_tier IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'archived')),
    fairness_score DECIMAL(5,4) NOT NULL CHECK (fairness_score >= 0 AND fairness_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    last_audit_date DATE,
    next_audit_date DATE,
    documentation_url TEXT,
    contact_email VARCHAR(255),
    tags TEXT[],
    metadata JSONB
);

-- Model versions for tracking changes
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL REFERENCES model_cards(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_current BOOLEAN DEFAULT FALSE,
    UNIQUE(model_card_id, version)
);
```

### Fairness Metrics Schema
```sql
-- Fairness metrics for each model
CREATE TABLE fairness_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL REFERENCES model_cards(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(5,4) NOT NULL,
    threshold DECIMAL(5,4) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pass', 'fail', 'warning')),
    description TEXT,
    demographic_groups TEXT[],
    calculation_method VARCHAR(100),
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(model_card_id, metric_name)
);

-- Historical fairness metrics for tracking changes
CREATE TABLE fairness_metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fairness_metric_id UUID NOT NULL REFERENCES fairness_metrics(id) ON DELETE CASCADE,
    value DECIMAL(5,4) NOT NULL,
    status VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by UUID REFERENCES users(id),
    notes TEXT
);
```

### Compliance and Audit Schema
```sql
-- Compliance frameworks
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(name, version)
);

-- Model compliance with frameworks
CREATE TABLE model_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL REFERENCES model_cards(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'partial', 'assessment_pending')),
    last_assessed_date DATE,
    next_assessment_date DATE,
    assessor_id UUID REFERENCES users(id),
    notes TEXT,
    evidence_url TEXT,
    UNIQUE(model_card_id, framework_id)
);

-- Audit trail for model cards
CREATE TABLE model_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL REFERENCES model_cards(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB,
    previous_values JSONB,
    new_values JSONB
);
```

### Model Performance and Impact Schema
```sql
-- Model performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL REFERENCES model_cards(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20),
    test_dataset VARCHAR(255),
    measurement_date DATE,
    metadata JSONB,
    UNIQUE(model_card_id, metric_name, measurement_date)
);

-- Model impact assessment
CREATE TABLE impact_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL REFERENCES model_cards(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,
    impact_level VARCHAR(20) NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    affected_groups TEXT[],
    mitigation_measures TEXT[],
    assessment_date DATE,
    assessor_id UUID REFERENCES users(id),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active'
);
```

## Implementation Strategy

### Phase 1: Database Schema and Models (Week 1)
1. **Database Migration**
   - Create Alembic migration for all Model Card related tables
   - Set up proper relationships and constraints
   - Add indexes for performance optimization

2. **Backend Models**
   - Create SQLAlchemy models for all entities
   - Implement relationships and constraints
   - Add data validation methods

3. **Pydantic Schemas**
   - Create request/response schemas for API endpoints
   - Implement data validation and serialization
   - Add field descriptions for API documentation

### Phase 2: API Endpoints (Week 2)
1. **CRUD Operations**
   - Implement POST /api/v1/models - Create new Model Card
   - Implement GET /api/v1/models - List Model Cards with filtering
   - Implement GET /api/v1/models/{id} - Get specific Model Card
   - Implement PUT /api/v1/models/{id} - Update Model Card
   - Implement DELETE /api/v1/models/{id} - Delete Model Card

2. **Fairness Metrics Endpoints**
   - GET /api/v1/models/{id}/fairness - Get fairness metrics
   - POST /api/v1/models/{id}/fairness - Add/update fairness metrics
   - GET /api/v1/models/{id}/fairness/history - Get historical metrics

3. **Compliance Endpoints**
   - GET /api/v1/models/{id}/compliance - Get compliance status
   - POST /api/v1/models/{id}/compliance - Update compliance
   - GET /api/v1/compliance/frameworks - List frameworks

4. **Search and Filtering**
   - Implement advanced filtering by domain, risk tier, status
   - Add search functionality across name and description
   - Implement pagination for large datasets

### Phase 3: Frontend Components (Week 3)
1. **Model Card List Page**
   - Create /models page with searchable, filterable list
   - Implement card-based layout with key information
   - Add sorting options and pagination

2. **Model Card Detail Page**
   - Create /models/{id} page with full Model Card information
   - Display fairness metrics with visualizations
   - Show compliance status and audit history
   - Add tabs for different sections (overview, metrics, compliance, versions)

3. **Model Card Creation/Edit Form**
   - Create multi-step form for Model Card creation
   - Implement form validation and error handling
   - Add file upload for documentation
   - Implement preview before submission

4. **Admin Dashboard**
   - Create admin interface for Model Card management
   - Add bulk operations and export functionality
   - Implement approval workflow for new submissions

### Phase 4: Integration and Testing (Week 4)
1. **Database Integration**
   - Replace sample data with real database queries
   - Implement proper error handling for database operations
   - Add connection pooling and optimization

2. **API Integration**
   - Connect frontend components to backend API
   - Implement proper state management with React Context or Redux
   - Add loading states and error boundaries

3. **Testing**
   - Write unit tests for all models and API endpoints
   - Create integration tests for frontend components
   - Implement end-to-end testing for key user flows
   - Performance test with large datasets

4. **Deployment and Monitoring**
   - Set up database backups and monitoring
   - Implement API rate limiting and security
   - Add logging and error tracking
   - Create health check endpoints

## Technical Implementation Details

### Backend Models (SQLAlchemy)
```python
# backend/app/models/model_card.py
from sqlalchemy import Column, String, Text, Numeric, Date, DateTime, Boolean, JSON, UUID, ForeignKey, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base
import uuid

# Association table for many-to-many relationship between models and compliance frameworks
model_compliance_frameworks = Table(
    'model_compliance_frameworks',
    Base.metadata,
    Column('model_id', UUID(as_uuid=True), ForeignKey('model_cards.id'), primary_key=True),
    Column('framework_id', UUID(as_uuid=True), ForeignKey('compliance_frameworks.id'), primary_key=True)
)

class ModelCard(Base):
    __tablename__ = "model_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    description = Column(Text)
    domain = Column(String(100), nullable=False)
    risk_tier = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default='active')
    fairness_score = Column(Numeric(5, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    last_audit_date = Column(Date)
    next_audit_date = Column(Date)
    documentation_url = Column(Text)
    contact_email = Column(String(255))
    tags = Column(ARRAY(String))
    metadata = Column(JSON)
    
    # Relationships
    versions = relationship("ModelVersion", back_populates="model_card")
    fairness_metrics = relationship("FairnessMetric", back_populates="model_card")
    compliance_frameworks = relationship("ComplianceFramework", secondary=model_compliance_frameworks)
    performance_metrics = relationship("PerformanceMetric", back_populates="model_card")
    impact_assessments = relationship("ImpactAssessment", back_populates="model_card")
    audit_logs = relationship("ModelAuditLog", back_populates="model_card")

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    version = Column(String(50), nullable=False)
    changelog = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_current = Column(Boolean, default=False)
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="versions")

class FairnessMetric(Base):
    __tablename__ = "fairness_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    value = Column(Numeric(5, 4), nullable=False)
    threshold = Column(Numeric(5, 4), nullable=False)
    status = Column(String(20), nullable=False)
    description = Column(Text)
    demographic_groups = Column(ARRAY(String))
    calculation_method = Column(String(100))
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())
    metadata = Column(JSON)
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="fairness_metrics")
    history = relationship("FairnessMetricHistory", back_populates="fairness_metric")

class FairnessMetricHistory(Base):
    __tablename__ = "fairness_metrics_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fairness_metric_id = Column(UUID(as_uuid=True), ForeignKey("fairness_metrics.id"), nullable=False)
    value = Column(Numeric(5, 4), nullable=False)
    status = Column(String(20), nullable=False)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    calculated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)
    
    # Relationships
    fairness_metric = relationship("FairnessMetric", back_populates="history")

class ComplianceFramework(Base):
    __tablename__ = "compliance_frameworks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    version = Column(String(50))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    model_cards = relationship("ModelCard", secondary=model_compliance_frameworks)

class ModelCompliance(Base):
    __tablename__ = "model_compliance"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    framework_id = Column(UUID(as_uuid=True), ForeignKey("compliance_frameworks.id"), nullable=False)
    status = Column(String(20), nullable=False)
    last_assessed_date = Column(Date)
    next_assessment_date = Column(Date)
    assessor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)
    evidence_url = Column(Text)
    
    # Relationships
    model_card = relationship("ModelCard")
    framework = relationship("ComplianceFramework")

class ModelAuditLog(Base):
    __tablename__ = "model_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    action = Column(String(50), nullable=False)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    performed_at = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON)
    previous_values = Column(JSON)
    new_values = Column(JSON)
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="audit_logs")

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    value = Column(Numeric(10, 4), nullable=False)
    unit = Column(String(20))
    test_dataset = Column(String(255))
    measurement_date = Column(Date)
    metadata = Column(JSON)
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="performance_metrics")

class ImpactAssessment(Base):
    __tablename__ = "impact_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    assessment_type = Column(String(50), nullable=False)
    impact_level = Column(String(20), nullable=False)
    affected_groups = Column(ARRAY(String))
    mitigation_measures = Column(ARRAY(String))
    assessment_date = Column(Date)
    assessor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)
    status = Column(String(20), default='active')
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="impact_assessments")
```

### Pydantic Schemas
```python
# backend/app/schemas/model_card.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

class FairnessMetricBase(BaseModel):
    metric_name: str = Field(..., description="Name of the fairness metric")
    value: float = Field(..., ge=0, le=1, description="Value of the metric (0-1)")
    threshold: float = Field(..., ge=0, le=1, description="Threshold for passing the metric")
    status: str = Field(..., description="Status of the metric (pass/fail/warning)")
    description: Optional[str] = Field(None, description="Description of the metric")
    demographic_groups: Optional[List[str]] = Field(None, description="Demographic groups evaluated")
    calculation_method: Optional[str] = Field(None, description="Method used for calculation")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class FairnessMetricCreate(FairnessMetricBase):
    pass

class FairnessMetricUpdate(FairnessMetricBase):
    metric_name: Optional[str] = None

class FairnessMetric(FairnessMetricBase):
    id: UUID
    model_card_id: UUID
    last_calculated: datetime
    
    class Config:
        orm_mode = True

class ModelCardBase(BaseModel):
    name: str = Field(..., description="Name of the AI model")
    version: str = Field(..., description="Version of the model")
    description: Optional[str] = Field(None, description="Description of the model")
    domain: str = Field(..., description="Domain of the model (e.g., Finance, Healthcare)")
    risk_tier: str = Field(..., description="Risk tier (low/medium/high/critical)")
    fairness_score: float = Field(..., ge=0, le=1, description="Overall fairness score")
    last_audit_date: Optional[date] = Field(None, description="Date of last audit")
    next_audit_date: Optional[date] = Field(None, description="Date of next scheduled audit")
    documentation_url: Optional[str] = Field(None, description="URL to model documentation")
    contact_email: Optional[str] = Field(None, description="Contact email for the model")
    tags: Optional[List[str]] = Field(None, description="Tags associated with the model")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class ModelCardCreate(ModelCardBase):
    fairness_metrics: Optional[List[FairnessMetricCreate]] = Field(None, description="Fairness metrics for the model")

class ModelCardUpdate(ModelCardBase):
    name: Optional[str] = None
    version: Optional[str] = None
    domain: Optional[str] = None
    risk_tier: Optional[str] = None
    fairness_score: Optional[float] = None

class ModelCard(ModelCardBase):
    id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[UUID]
    organization_id: Optional[UUID]
    fairness_metrics: List[FairnessMetric] = []
    
    class Config:
        orm_mode = True

class ModelCardList(BaseModel):
    models: List[ModelCard]
    total: int
    page: int
    size: int
```

### API Endpoints
```python
# backend/app/api/v1/model_cards.py
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from backend.app.core.database import get_db
from backend.app.core.security import get_current_active_user
from backend.app import crud, schemas
from backend.app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.ModelCard)
def create_model_card(
    *,
    db: Session = Depends(get_db),
    model_card_in: schemas.ModelCardCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new Model Card.
    """
    return crud.model_card.create_with_owner(
        db=db, obj_in=model_card_in, owner_id=current_user.id
    )

@router.get("/", response_model=schemas.ModelCardList)
def read_model_cards(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    domain: Optional[str] = Query(None, description="Filter by domain"),
    risk_tier: Optional[str] = Query(None, description="Filter by risk tier"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name and description")
):
    """
    Retrieve Model Cards with optional filtering.
    """
    filters = {}
    if domain:
        filters["domain"] = domain
    if risk_tier:
        filters["risk_tier"] = risk_tier
    if status:
        filters["status"] = status
    
    model_cards = crud.model_card.get_multi(
        db=db, skip=skip, limit=limit, filters=filters, search=search
    )
    total = crud.model_card.count(db=db, filters=filters, search=search)
    
    return schemas.ModelCardList(
        models=model_cards,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/{model_id}", response_model=schemas.ModelCard)
def read_model_card(
    *,
    db: Session = Depends(get_db),
    model_id: UUID
):
    """
    Get a specific Model Card by ID.
    """
    model_card = crud.model_card.get(db=db, id=model_id)
    if not model_card:
        raise HTTPException(status_code=404, detail="Model Card not found")
    return model_card

@router.put("/{model_id}", response_model=schemas.ModelCard)
def update_model_card(
    *,
    db: Session = Depends(get_db),
    model_id: UUID,
    model_card_in: schemas.ModelCardUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a Model Card.
    """
    model_card = crud.model_card.get(db=db, id=model_id)
    if not model_card:
        raise HTTPException(status_code=404, detail="Model Card not found")
    
    return crud.model_card.update(
        db=db, db_obj=model_card, obj_in=model_card_in
    )

@router.delete("/{model_id}", response_model=schemas.ModelCard)
def delete_model_card(
    *,
    db: Session = Depends(get_db),
    model_id: UUID,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a Model Card.
    """
    model_card = crud.model_card.get(db=db, id=model_id)
    if not model_card:
        raise HTTPException(status_code=404, detail="Model Card not found")
    
    return crud.model_card.remove(db=db, id=model_id)

@router.get("/{model_id}/fairness", response_model=List[schemas.FairnessMetric])
def read_fairness_metrics(
    *,
    db: Session = Depends(get_db),
    model_id: UUID
):
    """
    Get all fairness metrics for a Model Card.
    """
    model_card = crud.model_card.get(db=db, id=model_id)
    if not model_card:
        raise HTTPException(status_code=404, detail="Model Card not found")
    
    return crud.fairness_metric.get_multi_by_model(db=db, model_id=model_id)

@router.post("/{model_id}/fairness", response_model=schemas.FairnessMetric)
def create_fairness_metric(
    *,
    db: Session = Depends(get_db),
    model_id: UUID,
    fairness_metric_in: schemas.FairnessMetricCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a new fairness metric to a Model Card.
    """
    model_card = crud.model_card.get(db=db, id=model_id)
    if not model_card:
        raise HTTPException(status_code=404, detail="Model Card not found")
    
    return crud.fairness_metric.create_with_model(
        db=db, obj_in=fairness_metric_in, model_id=model_id
    )
```

### Frontend Components
```typescript
// frontend/src/components/models/ModelCardList.tsx
import React, { useState, useEffect } from 'react';
import { ModelCard, ModelCardList } from '@/types/model';
import { getModelCards } from '@/services/modelService';
import ModelCardItem from './ModelCardItem';
import FilterBar from './FilterBar';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ModelCardListProps {
  className?: string;
}

const ModelCardList: React.FC<ModelCardListProps> = ({ className }) => {
  const [modelCards, setModelCards] = useState<ModelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 12,
    total: 0,
  });
  
  const [filters, setFilters] = useState({
    domain: '',
    riskTier: '',
    status: '',
    search: '',
  });

  const fetchModelCards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        skip: (pagination.page - 1) * pagination.size,
        limit: pagination.size,
        ...filters,
      };
      
      const response: ModelCardList = await getModelCards(params);
      setModelCards(response.models);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (err) {
      setError('Failed to load model cards. Please try again.');
      console.error('Error fetching model cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelCards();
  }, [pagination.page, pagination.size, filters]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  if (loading && modelCards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchModelCards}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Model Cards</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Create New Model Card
        </button>
      </div>
      
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {modelCards.length === 0 ? (
        <div className="bg-white border border-neutral-light rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Model Cards Found</h3>
          <p className="text-neutral-dark mb-4">
            {filters.search || filters.domain || filters.riskTier || filters.status
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first Model Card.'}
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Create Model Card
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelCards.map((modelCard) => (
              <ModelCardItem
                key={modelCard.id}
                modelCard={modelCard}
                onClick={() => window.location.href = `/models/${modelCard.id}`}
              />
            ))}
          </div>
          
          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(pagination.total / pagination.size)}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ModelCardList;
```

```typescript
// frontend/src/components/models/ModelCardItem.tsx
import React from 'react';
import { ModelCard } from '@/types/model';
import { getRiskTierColor } from '@/utils/modelUtils';

interface ModelCardItemProps {
  modelCard: ModelCard;
  onClick?: () => void;
  className?: string;
}

const ModelCardItem: React.FC<ModelCardItemProps> = ({ modelCard, onClick, className }) => {
  const riskTierColor = getRiskTierColor(modelCard.riskTier);
  
  return (
    <div
      className={`bg-white rounded-xl shadow-md card-hover p-6 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{modelCard.name}</h3>
          <p className="text-sm text-neutral">v{modelCard.version} • {modelCard.domain}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${riskTierColor}`}>
          {modelCard.riskTier.toUpperCase()}
        </span>
      </div>
      
      <p className="text-neutral-dark mb-4 line-clamp-2">{modelCard.description}</p>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral">Fairness Score</span>
          <span className="font-semibold">{(modelCard.fairness_score * 100).toFixed(0)}%</span>
        </div>
        
        <div className="w-full bg-neutral-light rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              modelCard.fairness_score >= 0.8 ? 'bg-secondary' : 
              modelCard.fairness_score >= 0.6 ? 'bg-warning' : 'bg-danger'
            }`}
            style={{ width: `${modelCard.fairness_score * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral">Last Audit</span>
          <span>
            {modelCard.last_audit_date 
              ? new Date(modelCard.last_audit_date).toLocaleDateString() 
              : 'Not audited'}
          </span>
        </div>
      </div>
      
      <button className="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors">
        View Full Model Card
      </button>
    </div>
  );
};

export default ModelCardItem;
```

## Sample Data for Testing

```sql
-- Sample Model Card data
INSERT INTO model_cards (id, name, version, description, domain, risk_tier, fairness_score, last_audit_date, next_audit_date, documentation_url, contact_email, tags, metadata) VALUES
('00000000-0000-0000-0000-000000000001', 'Credit Risk Assessment', '2.1.0', 'AI model for evaluating creditworthiness of loan applicants using machine learning algorithms', 'Finance', 'medium', 0.85, '2024-01-15', '2024-07-15', 'https://docs.example.com/credit-risk-model', 'risk-team@example.com', ARRAY['credit', 'risk', 'finance'], '{"training_data_size": 100000, "model_type": "XGBoost"}'),
('00000000-0000-0000-0000-000000000002', 'Fraud Detection System', '1.5.2', 'Machine learning model for identifying fraudulent transactions in real-time', 'Security', 'high', 0.92, '2024-01-10', '2024-04-10', 'https://docs.example.com/fraud-detection', 'security-team@example.com', ARRAY['fraud', 'security', 'transactions'], '{"training_data_size": 5000000, "model_type": "Neural Network"}'),
('00000000-0000-0000-0000-000000000003', 'Customer Churn Prediction', '3.0.1', 'Predictive model for identifying customers at risk of churn based on behavior patterns', 'Retail', 'low', 0.78, '2024-01-20', '2024-07-20', 'https://docs.example.com/churn-prediction', 'analytics-team@example.com', ARRAY['churn', 'retention', 'retail'], '{"training_data_size": 250000, "model_type": "Random Forest"}');

-- Sample fairness metrics
INSERT INTO fairness_metrics (id, model_card_id, metric_name, value, threshold, status, description, demographic_groups, calculation_method, metadata) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Demographic Parity', 0.92, 0.80, 'pass', 'Measures if outcomes are equally distributed across demographic groups', ARRAY['gender', 'age_group', 'ethnicity'], 'Disparate Impact Ratio', '{"sample_size": 10000, "confidence_interval": [0.90, 0.94]}'),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Equal Opportunity', 0.88, 0.85, 'pass', 'Ensures equal true positive rates across different groups', ARRAY['gender', 'age_group'], 'TPR Comparison', '{"sample_size": 10000, "confidence_interval": [0.86, 0.90]}'),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Disparate Impact', 0.85, 0.80, 'pass', 'Ratio of favorable outcomes between protected and non-protected groups', ARRAY['gender', 'ethnicity'], 'Impact Ratio', '{"sample_size": 10000, "confidence_interval": [0.83, 0.87]}');

-- Sample compliance frameworks
INSERT INTO compliance_frameworks (id, name, description, version) VALUES
('00000000-0000-0000-0000-000000000101', 'FEAT', 'Fairness, Explainability, Accountability, and Transparency framework for AI systems', '1.0'),
('00000000-0000-0000-0000-000000000102', 'PDPA', 'Personal Data Protection Act requirements for AI systems', '2021'),
('00000000-0000-0000-0000-000000000103', 'HKMA', 'Hong Kong Monetary Authority AI principles', '1.0');

-- Sample model compliance
INSERT INTO model_compliance (id, model_card_id, framework_id, status, last_assessed_date, next_assessed_date, notes) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'compliant', '2024-01-15', '2024-07-15', 'All FEAT requirements met with minor recommendations'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'partial', '2024-01-10', '2024-04-10', 'Data retention policy needs updating'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', 'compliant', '2024-01-10', '2024-04-10', 'Full compliance achieved'),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000103', 'compliant', '2024-01-05', '2024-07-05', 'All HKMA principles satisfied');
```

## Success Metrics

### Database Performance
- Query response time < 100ms for standard operations
- Support for 10,000+ Model Cards without performance degradation
- Efficient indexing for filtering and search operations

### API Performance
- API response time < 200ms for standard operations
- Support for 100+ concurrent requests
- Proper error handling and status codes

### Frontend Performance
- Page load time < 3 seconds
- Interactive elements respond within 100ms
- Mobile usability score > 90

### User Experience
- Intuitive navigation and filtering
- Clear visualization of fairness metrics
- Comprehensive Model Card information display

This implementation plan provides a comprehensive approach to creating a robust Model Card system with proper data persistence, enabling the platform to store, manage, and display AI model transparency information effectively.