from sqlalchemy import Column, String, Text, Numeric, Date, DateTime, Boolean, JSON, UUID, ForeignKey, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
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
    model_metadata = Column(JSON, name='metadata')
    
    # Relationships
    versions = relationship("ModelVersion", back_populates="model_card", cascade="all, delete-orphan")
    fairness_metrics = relationship("FairnessMetric", back_populates="model_card", cascade="all, delete-orphan")
    compliance_records = relationship("ModelCompliance", back_populates="model_card", cascade="all, delete-orphan")
    performance_metrics = relationship("PerformanceMetric", back_populates="model_card", cascade="all, delete-orphan")
    impact_assessments = relationship("ImpactAssessment", back_populates="model_card", cascade="all, delete-orphan")
    audit_logs = relationship("ModelAuditLog", back_populates="model_card", cascade="all, delete-orphan")
    organization = relationship("Organization", back_populates="model_cards")

    @property
    def current_version(self):
        """Get the current version object"""
        for version in self.versions:
            if version.is_current:
                return version
        return None

    def __repr__(self):
        return f"<ModelCard(id={self.id}, name='{self.name}', version='{self.version}')>"

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

    def __repr__(self):
        return f"<ModelVersion(id={self.id}, version='{self.version}', is_current={self.is_current})>"

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
    metric_metadata = Column(JSON, name='metadata')
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="fairness_metrics")
    history = relationship("FairnessMetricHistory", back_populates="fairness_metric", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FairnessMetric(id={self.id}, name='{self.metric_name}', value={self.value}, status='{self.status}')>"

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

    def __repr__(self):
        return f"<FairnessMetricHistory(id={self.id}, value={self.value}, status='{self.status}')>"

class ComplianceFramework(Base):
    __tablename__ = "compliance_frameworks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    version = Column(String(50))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    model_compliance = relationship("ModelCompliance", back_populates="framework")

    def __repr__(self):
        return f"<ComplianceFramework(id={self.id}, name='{self.name}', version='{self.version}')>"

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
    compliance_metadata = Column(JSON, name='metadata')
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="compliance_records")
    framework = relationship("ComplianceFramework", back_populates="model_compliance")

    def __repr__(self):
        return f"<ModelCompliance(id={self.id}, status='{self.status}')>"

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
    audit_metadata = Column(JSON, name='metadata')
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="audit_logs")

    def __repr__(self):
        return f"<ModelAuditLog(id={self.id}, action='{self.action}', performed_at={self.performed_at})>"

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_card_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    value = Column(Numeric(10, 4), nullable=False)
    unit = Column(String(20))
    test_dataset = Column(String(255))
    measurement_date = Column(Date)
    performance_metadata = Column(JSON, name='metadata')
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="performance_metrics")

    def __repr__(self):
        return f"<PerformanceMetric(id={self.id}, name='{self.metric_name}', value={self.value})>"

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
    impact_metadata = Column(JSON, name='metadata')
    
    # Relationships
    model_card = relationship("ModelCard", back_populates="impact_assessments")

    def __repr__(self):
        return f"<ImpactAssessment(id={self.id}, type='{self.assessment_type}', level='{self.impact_level}')>"