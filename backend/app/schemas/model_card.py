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

    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['pass', 'fail', 'warning']
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return v

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

class ComplianceFrameworkBase(BaseModel):
    name: str = Field(..., description="Name of the compliance framework")
    description: Optional[str] = Field(None, description="Description of the framework")
    version: Optional[str] = Field(None, description="Version of the framework")
    is_active: bool = Field(True, description="Whether the framework is active")

class ComplianceFrameworkCreate(ComplianceFrameworkBase):
    pass

class ComplianceFrameworkUpdate(ComplianceFrameworkBase):
    name: Optional[str] = None

class ComplianceFramework(ComplianceFrameworkBase):
    id: UUID
    
    class Config:
        orm_mode = True

class ModelComplianceBase(BaseModel):
    status: str = Field(..., description="Compliance status")
    last_assessed_date: Optional[date] = Field(None, description="Date of last assessment")
    next_assessment_date: Optional[date] = Field(None, description="Date of next assessment")
    notes: Optional[str] = Field(None, description="Assessment notes")
    evidence_url: Optional[str] = Field(None, description="URL to evidence documentation")

    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['compliant', 'non_compliant', 'partial', 'assessment_pending']
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return v

class ModelComplianceCreate(ModelComplianceBase):
    framework_id: UUID = Field(..., description="ID of the compliance framework")

class ModelComplianceUpdate(ModelComplianceBase):
    framework_id: Optional[UUID] = None

class ModelCompliance(ModelComplianceBase):
    id: UUID
    model_card_id: UUID
    framework_id: UUID
    assessor_id: Optional[UUID] = None
    
    class Config:
        orm_mode = True

class PerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., description="Name of the performance metric")
    value: float = Field(..., description="Value of the metric")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    test_dataset: Optional[str] = Field(None, description="Dataset used for testing")
    measurement_date: Optional[date] = Field(None, description="Date of measurement")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class PerformanceMetricCreate(PerformanceMetricBase):
    pass

class PerformanceMetricUpdate(PerformanceMetricBase):
    metric_name: Optional[str] = None

class PerformanceMetric(PerformanceMetricBase):
    id: UUID
    model_card_id: UUID
    
    class Config:
        orm_mode = True

class ImpactAssessmentBase(BaseModel):
    assessment_type: str = Field(..., description="Type of assessment")
    impact_level: str = Field(..., description="Level of impact")
    affected_groups: Optional[List[str]] = Field(None, description="Groups affected by the model")
    mitigation_measures: Optional[List[str]] = Field(None, description="Measures to mitigate impact")
    assessment_date: Optional[date] = Field(None, description="Date of assessment")
    notes: Optional[str] = Field(None, description="Assessment notes")
    status: str = Field("active", description="Status of the assessment")

    @validator('impact_level')
    def validate_impact_level(cls, v):
        allowed_levels = ['low', 'medium', 'high', 'critical']
        if v not in allowed_levels:
            raise ValueError(f"Impact level must be one of {allowed_levels}")
        return v

class ImpactAssessmentCreate(ImpactAssessmentBase):
    pass

class ImpactAssessmentUpdate(ImpactAssessmentBase):
    assessment_type: Optional[str] = None
    impact_level: Optional[str] = None

class ImpactAssessment(ImpactAssessmentBase):
    id: UUID
    model_card_id: UUID
    assessor_id: Optional[UUID] = None
    
    class Config:
        orm_mode = True

class ModelVersionBase(BaseModel):
    version: str = Field(..., description="Version of the model")
    changelog: Optional[str] = Field(None, description="Changelog for this version")
    is_current: bool = Field(False, description="Whether this is the current version")

class ModelVersionCreate(ModelVersionBase):
    pass

class ModelVersionUpdate(ModelVersionBase):
    version: Optional[str] = None

class ModelVersion(ModelVersionBase):
    id: UUID
    model_card_id: UUID
    created_at: datetime
    created_by: Optional[UUID] = None
    
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
    organization_id: Optional[UUID] = Field(None, description="ID of the organization this model belongs to")

    @validator('risk_tier')
    def validate_risk_tier(cls, v):
        allowed_tiers = ['low', 'medium', 'high', 'critical']
        if v not in allowed_tiers:
            raise ValueError(f"Risk tier must be one of {allowed_tiers}")
        return v

class ModelCardCreate(ModelCardBase):
    fairness_metrics: Optional[List[FairnessMetricCreate]] = Field(None, description="Fairness metrics for the model")
    compliance_records: Optional[List[ModelComplianceCreate]] = Field(None, description="Compliance records for the model")
    performance_metrics: Optional[List[PerformanceMetricCreate]] = Field(None, description="Performance metrics for the model")
    impact_assessments: Optional[List[ImpactAssessmentCreate]] = Field(None, description="Impact assessments for the model")

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
    compliance_records: List[ModelCompliance] = []
    performance_metrics: List[PerformanceMetric] = []
    impact_assessments: List[ImpactAssessment] = []
    versions: List[ModelVersion] = []
    
    class Config:
        orm_mode = True

class ModelCardList(BaseModel):
    models: List[ModelCard]
    total: int
    page: int
    size: int

class ModelAuditLog(BaseModel):
    id: UUID
    model_card_id: UUID
    action: str
    performed_by: UUID
    performed_at: datetime
    details: Optional[Dict[str, Any]] = None
    previous_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True

class OrganizationBase(BaseModel):
    name: str = Field(..., description="Name of the organization")
    description: Optional[str] = Field(None, description="Description of the organization")
    industry: Optional[str] = Field(None, description="Industry of the organization")
    website: Optional[str] = Field(None, description="Website URL")
    contact_email: Optional[str] = Field(None, description="Contact email address")
    contact_phone: Optional[str] = Field(None, description="Contact phone number")
    address: Optional[str] = Field(None, description="Physical address")
    is_active: bool = Field(True, description="Whether the organization is active")
    is_verified: bool = Field(False, description="Whether the organization is verified")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(OrganizationBase):
    name: Optional[str] = None

class Organization(OrganizationBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    model_cards: List[ModelCard] = []
    
    class Config:
        orm_mode = True