from typing import List, Optional, Dict, Any, Union
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc

from app.models.model_card import (
    ModelCard,
    FairnessMetric,
    FairnessMetricHistory,
    ModelCompliance,
    ModelAuditLog,
    PerformanceMetric,
    ImpactAssessment,
    ModelVersion
)
from app.schemas.model_card import (
    ModelCardCreate,
    ModelCardUpdate,
    FairnessMetricCreate,
    FairnessMetricUpdate,
    ModelComplianceCreate,
    ModelComplianceUpdate,
    PerformanceMetricCreate,
    PerformanceMetricUpdate,
    ImpactAssessmentCreate,
    ImpactAssessmentUpdate,
    ModelVersionCreate,
    ModelVersionUpdate
)


class CRUDModelCard:
    def get(self, db: Session, id: UUID) -> Optional[ModelCard]:
        return db.query(ModelCard).filter(ModelCard.id == id).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        domain: Optional[str] = None,
        risk_tier: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ModelCard]:
        query = db.query(ModelCard)
        
        if domain:
            query = query.filter(ModelCard.domain == domain)
        
        if risk_tier:
            query = query.filter(ModelCard.risk_tier == risk_tier)
        
        if status:
            query = query.filter(ModelCard.status == status)
        
        if search:
            query = query.filter(
                or_(
                    ModelCard.name.ilike(f"%{search}%"),
                    ModelCard.description.ilike(f"%{search}%"),
                    ModelCard.tags.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: ModelCardCreate) -> ModelCard:
        db_obj = ModelCard(
            name=obj_in.name,
            version=obj_in.version,
            description=obj_in.description,
            domain=obj_in.domain,
            risk_tier=obj_in.risk_tier,
            status="draft",
            fairness_score=obj_in.fairness_score,
            organization_id=obj_in.organization_id,
            documentation_url=obj_in.documentation_url,
            contact_email=obj_in.contact_email,
            tags=obj_in.tags,
            metadata=obj_in.metadata
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelCard,
        obj_in: Union[ModelCardUpdate, Dict[str, Any]]
    ) -> ModelCard:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in update_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> ModelCard:
        obj = db.query(ModelCard).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def get_by_domain(self, db: Session, domain: str) -> List[ModelCard]:
        return db.query(ModelCard).filter(ModelCard.domain == domain).all()

    def get_by_risk_tier(self, db: Session, risk_tier: str) -> List[ModelCard]:
        return db.query(ModelCard).filter(ModelCard.risk_tier == risk_tier).all()

    def get_by_status(self, db: Session, status: str) -> List[ModelCard]:
        return db.query(ModelCard).filter(ModelCard.status == status).all()

    def get_by_organization(self, db: Session, organization_id: UUID) -> List[ModelCard]:
        return db.query(ModelCard).filter(ModelCard.organization_id == organization_id).all()

    def count(self, db: Session) -> int:
        return db.query(ModelCard).count()

    def count_by_domain(self, db: Session) -> Dict[str, int]:
        result = db.query(ModelCard.domain, db.func.count(ModelCard.id)).group_by(ModelCard.domain).all()
        return {domain: count for domain, count in result}

    def count_by_risk_tier(self, db: Session) -> Dict[str, int]:
        result = db.query(ModelCard.risk_tier, db.func.count(ModelCard.id)).group_by(ModelCard.risk_tier).all()
        return {tier: count for tier, count in result}

    def count_by_status(self, db: Session) -> Dict[str, int]:
        result = db.query(ModelCard.status, db.func.count(ModelCard.id)).group_by(ModelCard.status).all()
        return {status: count for status, count in result}

    def get_average_fairness_score(self, db: Session) -> float:
        result = db.query(db.func.avg(ModelCard.fairness_score)).scalar()
        return float(result) if result else 0.0

    def get_fairness_score_distribution(self, db: Session) -> Dict[str, int]:
        distribution = {
            "0.0-0.5": 0,
            "0.5-0.7": 0,
            "0.7-0.85": 0,
            "0.85-0.95": 0,
            "0.95-1.0": 0
        }
        
        model_cards = db.query(ModelCard.fairness_score).all()
        
        for card in model_cards:
            score = float(card.fairness_score)
            if score < 0.5:
                distribution["0.0-0.5"] += 1
            elif score < 0.7:
                distribution["0.5-0.7"] += 1
            elif score < 0.85:
                distribution["0.7-0.85"] += 1
            elif score < 0.95:
                distribution["0.85-0.95"] += 1
            else:
                distribution["0.95-1.0"] += 1
        
        return distribution


class CRUFFairnessMetric:
    def get(self, db: Session, id: UUID) -> Optional[FairnessMetric]:
        return db.query(FairnessMetric).filter(FairnessMetric.id == id).first()

    def get_by_model_card(self, db: Session, model_card_id: UUID) -> List[FairnessMetric]:
        return db.query(FairnessMetric).filter(FairnessMetric.model_card_id == model_card_id).all()

    def create(self, db: Session, *, obj_in: FairnessMetricCreate, model_card_id: UUID) -> FairnessMetric:
        db_obj = FairnessMetric(
            model_card_id=model_card_id,
            metric_name=obj_in.metric_name,
            value=obj_in.value,
            threshold=obj_in.threshold,
            status=obj_in.status,
            description=obj_in.description,
            demographic_groups=obj_in.demographic_groups,
            calculation_method=obj_in.calculation_method,
            metadata=obj_in.metadata
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: FairnessMetric,
        obj_in: Union[FairnessMetricUpdate, Dict[str, Any]]
    ) -> FairnessMetric:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in update_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> FairnessMetric:
        obj = db.query(FairnessMetric).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def create_history(
        self,
        db: Session,
        *,
        fairness_metric_id: UUID,
        value: float,
        status: str,
        calculated_by: Optional[str] = None,
        notes: Optional[str] = None
    ) -> FairnessMetricHistory:
        db_obj = FairnessMetricHistory(
            fairness_metric_id=fairness_metric_id,
            value=value,
            status=status,
            calculated_by=calculated_by,
            notes=notes
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_history(self, db: Session, fairness_metric_id: UUID) -> List[FairnessMetricHistory]:
        return (
            db.query(FairnessMetricHistory)
            .filter(FairnessMetricHistory.fairness_metric_id == fairness_metric_id)
            .order_by(desc(FairnessMetricHistory.calculated_at))
            .all()
        )


class CRUDModelCompliance:
    def get(self, db: Session, id: UUID) -> Optional[ModelCompliance]:
        return db.query(ModelCompliance).filter(ModelCompliance.id == id).first()

    def get_by_model_card(self, db: Session, model_card_id: UUID) -> List[ModelCompliance]:
        return db.query(ModelCompliance).filter(ModelCompliance.model_card_id == model_card_id).all()

    def create(self, db: Session, *, obj_in: ModelComplianceCreate, model_card_id: UUID) -> ModelCompliance:
        db_obj = ModelCompliance(
            model_card_id=model_card_id,
            framework_id=obj_in.framework_id,
            status=obj_in.status,
            last_assessed_date=obj_in.last_assessed_date,
            next_assessment_date=obj_in.next_assessment_date,
            assessor_id=obj_in.assessor_id,
            notes=obj_in.notes,
            evidence_url=obj_in.evidence_url
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelCompliance,
        obj_in: Union[ModelComplianceUpdate, Dict[str, Any]]
    ) -> ModelCompliance:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in update_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> ModelCompliance:
        obj = db.query(ModelCompliance).get(id)
        db.delete(obj)
        db.commit()
        return obj


class CRUDModelAuditLog:
    def get(self, db: Session, id: UUID) -> Optional[ModelAuditLog]:
        return db.query(ModelAuditLog).filter(ModelAuditLog.id == id).first()

    def get_by_model_card(self, db: Session, model_card_id: UUID) -> List[ModelAuditLog]:
        return (
            db.query(ModelAuditLog)
            .filter(ModelAuditLog.model_card_id == model_card_id)
            .order_by(desc(ModelAuditLog.performed_at))
            .all()
        )

    def create(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        action: str,
        performed_by: str,
        details: Optional[Dict[str, Any]] = None,
        previous_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None
    ) -> ModelAuditLog:
        db_obj = ModelAuditLog(
            model_card_id=model_card_id,
            action=action,
            performed_by=performed_by,
            details=details,
            previous_values=previous_values,
            new_values=new_values
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDPerformanceMetric:
    def get(self, db: Session, id: UUID) -> Optional[PerformanceMetric]:
        return db.query(PerformanceMetric).filter(PerformanceMetric.id == id).first()

    def get_by_model_card(self, db: Session, model_card_id: UUID) -> List[PerformanceMetric]:
        return db.query(PerformanceMetric).filter(PerformanceMetric.model_card_id == model_card_id).all()

    def create(self, db: Session, *, obj_in: PerformanceMetricCreate, model_card_id: UUID) -> PerformanceMetric:
        db_obj = PerformanceMetric(
            model_card_id=model_card_id,
            metric_name=obj_in.metric_name,
            value=obj_in.value,
            unit=obj_in.unit,
            test_dataset=obj_in.test_dataset,
            measurement_date=obj_in.measurement_date,
            metadata=obj_in.metadata
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: PerformanceMetric,
        obj_in: Union[PerformanceMetricUpdate, Dict[str, Any]]
    ) -> PerformanceMetric:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in update_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> PerformanceMetric:
        obj = db.query(PerformanceMetric).get(id)
        db.delete(obj)
        db.commit()
        return obj


class CRUDImpactAssessment:
    def get(self, db: Session, id: UUID) -> Optional[ImpactAssessment]:
        return db.query(ImpactAssessment).filter(ImpactAssessment.id == id).first()

    def get_by_model_card(self, db: Session, model_card_id: UUID) -> List[ImpactAssessment]:
        return db.query(ImpactAssessment).filter(ImpactAssessment.model_card_id == model_card_id).all()

    def create(self, db: Session, *, obj_in: ImpactAssessmentCreate, model_card_id: UUID) -> ImpactAssessment:
        db_obj = ImpactAssessment(
            model_card_id=model_card_id,
            assessment_type=obj_in.assessment_type,
            impact_level=obj_in.impact_level,
            affected_groups=obj_in.affected_groups,
            mitigation_measures=obj_in.mitigation_measures,
            assessment_date=obj_in.assessment_date,
            assessor_id=obj_in.assessor_id,
            notes=obj_in.notes,
            status=obj_in.status
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ImpactAssessment,
        obj_in: Union[ImpactAssessmentUpdate, Dict[str, Any]]
    ) -> ImpactAssessment:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in update_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> ImpactAssessment:
        obj = db.query(ImpactAssessment).get(id)
        db.delete(obj)
        db.commit()
        return obj


class CRUDModelVersion:
    def get(self, db: Session, id: UUID) -> Optional[ModelVersion]:
        return db.query(ModelVersion).filter(ModelVersion.id == id).first()

    def get_by_model_card(self, db: Session, model_card_id: UUID) -> List[ModelVersion]:
        return (
            db.query(ModelVersion)
            .filter(ModelVersion.model_card_id == model_card_id)
            .order_by(desc(ModelVersion.created_at))
            .all()
        )

    def get_current(self, db: Session, model_card_id: UUID) -> Optional[ModelVersion]:
        return (
            db.query(ModelVersion)
            .filter(and_(ModelVersion.model_card_id == model_card_id, ModelVersion.is_current == True))
            .first()
        )

    def create(self, db: Session, *, obj_in: ModelVersionCreate, model_card_id: UUID) -> ModelVersion:
        # If this is marked as current, unset any existing current version
        if obj_in.is_current:
            db.query(ModelVersion).filter(
                and_(ModelVersion.model_card_id == model_card_id, ModelVersion.is_current == True)
            ).update({"is_current": False})

        db_obj = ModelVersion(
            model_card_id=model_card_id,
            version=obj_in.version,
            changelog=obj_in.changelog,
            created_by=obj_in.created_by,
            is_current=obj_in.is_current if obj_in.is_current is not None else True
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelVersion,
        obj_in: Union[ModelVersionUpdate, Dict[str, Any]]
    ) -> ModelVersion:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        # If this is being set as current, unset any existing current version
        if update_data.get("is_current") is True:
            db.query(ModelVersion).filter(
                and_(
                    ModelVersion.model_card_id == db_obj.model_card_id,
                    ModelVersion.id != db_obj.id,
                    ModelVersion.is_current == True
                )
            ).update({"is_current": False})
        
        for field in update_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> ModelVersion:
        obj = db.query(ModelVersion).get(id)
        db.delete(obj)
        db.commit()
        return obj


model_card = CRUDModelCard()
fairness_metric = CRUFFairnessMetric()
model_compliance = CRUDModelCompliance()
model_audit_log = CRUDModelAuditLog()
performance_metric = CRUDPerformanceMetric()
impact_assessment = CRUDImpactAssessment()
model_version = CRUDModelVersion()