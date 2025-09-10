from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session

from app.crud.model_card import (
    model_card,
    fairness_metric,
    model_compliance,
    model_audit_log,
    performance_metric,
    impact_assessment,
    model_version
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
from app.models.model_card import ModelCard, FairnessMetric
# from app.services.tasks import calculate_fairness_score  # Function doesn't exist yet


class ModelCardService:
    """
    Service class for Model Card business logic.
    Handles complex operations that span multiple CRUD operations.
    """

    def create_model_card_with_metrics(
        self,
        db: Session,
        *,
        model_card_in: ModelCardCreate,
        fairness_metrics: List[FairnessMetricCreate] = None,
        performance_metrics: List[PerformanceMetricCreate] = None,
        compliance_records: List[ModelComplianceCreate] = None,
        impact_assessments: List[ImpactAssessmentCreate] = None,
        current_user: str
    ) -> ModelCard:
        """
        Create a new model card with associated metrics and assessments.
        """
        # Create the model card
        db_model_card = model_card.create(db=db, obj_in=model_card_in)
        
        # Log the creation
        model_audit_log.create(
            db=db,
            model_card_id=db_model_card.id,
            action="create",
            performed_by=current_user,
            new_values=model_card_in.dict()
        )
        
        # Create fairness metrics if provided
        if fairness_metrics:
            for metric_in in fairness_metrics:
                fairness_metric.create(
                    db=db, obj_in=metric_in, model_card_id=db_model_card.id
                )
                
                # Log the metric creation
                model_audit_log.create(
                    db=db,
                    model_card_id=db_model_card.id,
                    action="create_fairness_metric",
                    performed_by=current_user,
                    new_values={"fairness_metric": metric_in.dict()}
                )
        
        # Create performance metrics if provided
        if performance_metrics:
            for metric_in in performance_metrics:
                performance_metric.create(
                    db=db, obj_in=metric_in, model_card_id=db_model_card.id
                )
                
                # Log the metric creation
                model_audit_log.create(
                    db=db,
                    model_card_id=db_model_card.id,
                    action="create_performance_metric",
                    performed_by=current_user,
                    new_values={"performance_metric": metric_in.dict()}
                )
        
        # Create compliance records if provided
        if compliance_records:
            for compliance_in in compliance_records:
                model_compliance.create(
                    db=db, obj_in=compliance_in, model_card_id=db_model_card.id
                )
                
                # Log the compliance record creation
                model_audit_log.create(
                    db=db,
                    model_card_id=db_model_card.id,
                    action="create_compliance_record",
                    performed_by=current_user,
                    new_values={"compliance_record": compliance_in.dict()}
                )
        
        # Create impact assessments if provided
        if impact_assessments:
            for assessment_in in impact_assessments:
                impact_assessment.create(
                    db=db, obj_in=assessment_in, model_card_id=db_model_card.id
                )
                
                # Log the assessment creation
                model_audit_log.create(
                    db=db,
                    model_card_id=db_model_card.id,
                    action="create_impact_assessment",
                    performed_by=current_user,
                    new_values={"impact_assessment": assessment_in.dict()}
                )
        
        # Trigger fairness score calculation asynchronously (commented out for now)
        # calculate_fairness_score.delay(str(db_model_card.id))
        
        return db_model_card

    def update_model_card_with_metrics(
        self,
        db: Session,
        *,
        db_obj: ModelCard,
        model_card_in: ModelCardUpdate,
        fairness_metrics: List[FairnessMetricUpdate] = None,
        performance_metrics: List[PerformanceMetricUpdate] = None,
        compliance_records: List[ModelComplianceUpdate] = None,
        impact_assessments: List[ImpactAssessmentUpdate] = None,
        current_user: str
    ) -> ModelCard:
        """
        Update a model card and its associated metrics and assessments.
        """
        # Get previous values for audit log
        previous_values = db_obj.__dict__.copy()
        
        # Update the model card
        db_model_card = model_card.update(db=db, db_obj=db_obj, obj_in=model_card_in)
        
        # Log the update
        model_audit_log.create(
            db=db,
            model_card_id=db_model_card.id,
            action="update",
            performed_by=current_user,
            previous_values=previous_values,
            new_values=model_card_in.dict(exclude_unset=True)
        )
        
        # Update fairness metrics if provided
        if fairness_metrics:
            for metric_in in fairness_metrics:
                if metric_in.id:
                    # Update existing metric
                    db_metric = fairness_metric.get(db=db, id=metric_in.id)
                    if db_metric and db_metric.model_card_id == db_model_card.id:
                        fairness_metric.update(db=db, db_obj=db_metric, obj_in=metric_in)
                        
                        # Log the metric update
                        model_audit_log.create(
                            db=db,
                            model_card_id=db_model_card.id,
                            action="update_fairness_metric",
                            performed_by=current_user,
                            new_values={"fairness_metric_id": str(metric_in.id), **metric_in.dict(exclude_unset=True)}
                        )
                else:
                    # Create new metric
                    fairness_metric.create(
                        db=db, obj_in=metric_in, model_card_id=db_model_card.id
                    )
                    
                    # Log the metric creation
                    model_audit_log.create(
                        db=db,
                        model_card_id=db_model_card.id,
                        action="create_fairness_metric",
                        performed_by=current_user,
                        new_values={"fairness_metric": metric_in.dict()}
                    )
        
        # Update performance metrics if provided
        if performance_metrics:
            for metric_in in performance_metrics:
                if metric_in.id:
                    # Update existing metric
                    db_metric = performance_metric.get(db=db, id=metric_in.id)
                    if db_metric and db_metric.model_card_id == db_model_card.id:
                        performance_metric.update(db=db, db_obj=db_metric, obj_in=metric_in)
                        
                        # Log the metric update
                        model_audit_log.create(
                            db=db,
                            model_card_id=db_model_card.id,
                            action="update_performance_metric",
                            performed_by=current_user,
                            new_values={"performance_metric_id": str(metric_in.id), **metric_in.dict(exclude_unset=True)}
                        )
                else:
                    # Create new metric
                    performance_metric.create(
                        db=db, obj_in=metric_in, model_card_id=db_model_card.id
                    )
                    
                    # Log the metric creation
                    model_audit_log.create(
                        db=db,
                        model_card_id=db_model_card.id,
                        action="create_performance_metric",
                        performed_by=current_user,
                        new_values={"performance_metric": metric_in.dict()}
                    )
        
        # Update compliance records if provided
        if compliance_records:
            for compliance_in in compliance_records:
                if compliance_in.id:
                    # Update existing record
                    db_compliance = model_compliance.get(db=db, id=compliance_in.id)
                    if db_compliance and db_compliance.model_card_id == db_model_card.id:
                        model_compliance.update(db=db, db_obj=db_compliance, obj_in=compliance_in)
                        
                        # Log the compliance record update
                        model_audit_log.create(
                            db=db,
                            model_card_id=db_model_card.id,
                            action="update_compliance_record",
                            performed_by=current_user,
                            new_values={"compliance_id": str(compliance_in.id), **compliance_in.dict(exclude_unset=True)}
                        )
                else:
                    # Create new record
                    model_compliance.create(
                        db=db, obj_in=compliance_in, model_card_id=db_model_card.id
                    )
                    
                    # Log the record creation
                    model_audit_log.create(
                        db=db,
                        model_card_id=db_model_card.id,
                        action="create_compliance_record",
                        performed_by=current_user,
                        new_values={"compliance_record": compliance_in.dict()}
                    )
        
        # Update impact assessments if provided
        if impact_assessments:
            for assessment_in in impact_assessments:
                if assessment_in.id:
                    # Update existing assessment
                    db_assessment = impact_assessment.get(db=db, id=assessment_in.id)
                    if db_assessment and db_assessment.model_card_id == db_model_card.id:
                        impact_assessment.update(db=db, db_obj=db_assessment, obj_in=assessment_in)
                        
                        # Log the assessment update
                        model_audit_log.create(
                            db=db,
                            model_card_id=db_model_card.id,
                            action="update_impact_assessment",
                            performed_by=current_user,
                            new_values={"impact_assessment_id": str(assessment_in.id), **assessment_in.dict(exclude_unset=True)}
                        )
                else:
                    # Create new assessment
                    impact_assessment.create(
                        db=db, obj_in=assessment_in, model_card_id=db_model_card.id
                    )
                    
                    # Log the assessment creation
                    model_audit_log.create(
                        db=db,
                        model_card_id=db_model_card.id,
                        action="create_impact_assessment",
                        performed_by=current_user,
                        new_values={"impact_assessment": assessment_in.dict()}
                    )
        
        # Trigger fairness score calculation asynchronously (commented out for now)
        # calculate_fairness_score.delay(str(db_model_card.id))
        
        return db_model_card

    def create_model_version(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        version_in: ModelVersionCreate,
        current_user: str
    ) -> Any:
        """
        Create a new version for a model card.
        """
        # Check if model card exists
        db_model_card = model_card.get(db=db, id=model_card_id)
        if not db_model_card:
            raise ValueError(f"Model card with ID {model_card_id} not found")
        
        # Create the version
        db_version = model_version.create(
            db=db, obj_in=version_in, model_card_id=model_card_id
        )
        
        # Log the version creation
        model_audit_log.create(
            db=db,
            model_card_id=model_card_id,
            action="create_model_version",
            performed_by=current_user,
            new_values={"version_id": str(db_version.id), **version_in.dict()}
        )
        
        return db_version

    def calculate_model_card_fairness_score(
        self,
        db: Session,
        *,
        model_card_id: UUID
    ) -> float:
        """
        Calculate the overall fairness score for a model card based on its fairness metrics.
        """
        # Get all fairness metrics for the model card
        metrics = fairness_metric.get_by_model_card(db=db, model_card_id=model_card_id)
        
        if not metrics:
            # If no metrics, return a default score
            return 0.5
        
        # Calculate weighted average based on metric status
        total_weight = 0
        weighted_sum = 0
        
        for metric in metrics:
            weight = 1.0  # Default weight
            
            # Adjust weight based on status
            if metric.status == "pass":
                weight = 1.0
            elif metric.status == "fail":
                weight = 0.5
            elif metric.status == "warning":
                weight = 0.75
            
            weighted_sum += metric.value * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0.0
        
        # Calculate average
        average_score = weighted_sum / total_weight
        
        # Update the model card with the new score
        model_card.update(
            db=db,
            db_obj=model_card.get(db=db, id=model_card_id),
            obj_in={"fairness_score": average_score}
        )
        
        return average_score

    def get_model_card_statistics(self, db: Session) -> Dict[str, Any]:
        """
        Get overall statistics for model cards.
        """
        total = model_card.count(db)
        average_fairness_score = model_card.get_average_fairness_score(db)
        domain_distribution = model_card.count_by_domain(db)
        risk_tier_distribution = model_card.count_by_risk_tier(db)
        status_distribution = model_card.count_by_status(db)
        
        return {
            "total_model_cards": total,
            "average_fairness_score": average_fairness_score,
            "domain_distribution": domain_distribution,
            "risk_tier_distribution": risk_tier_distribution,
            "status_distribution": status_distribution
        }

    def get_fairness_score_distribution(self, db: Session) -> Dict[str, int]:
        """
        Get the distribution of fairness scores across all model cards.
        """
        return model_card.get_fairness_score_distribution(db)


model_card_service = ModelCardService()