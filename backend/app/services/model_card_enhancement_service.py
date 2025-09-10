from typing import List, Dict, Any, Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json
import logging
from datetime import datetime, timedelta

from app.models.model_card import ModelCard, ModelVersion, FairnessMetric, PerformanceMetric, ModelCompliance, ImpactAssessment, ModelAuditLog
from app.models.fairness_assessment import FairnessAssessment, FairnessAssessmentMetric
from app.models.diagnosis_assessment import DiagnosisAssessment, DiagnosisMetric, DriftDetection
from app.crud.model_card import model_card, fairness_metric, performance_metric, model_compliance, model_version, model_audit_log

logger = logging.getLogger(__name__)


class ModelCardEnhancementService:
    """
    Service for enhancing model cards with automatic calculations,
    real-time updates, and advanced analytics.
    """

    def __init__(self):
        self.calculation_cache = {}
        self.cache_ttl = 300  # 5 minutes cache

    def calculate_comprehensive_fairness_score(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        include_weighted_factors: bool = True,
        recalculate: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive fairness score with multiple factors.
        """
        cache_key = f"fairness_score_{model_card_id}"
        
        # Check cache
        if not recalculate and cache_key in self.calculation_cache:
            cached_result = self.calculation_cache[cache_key]
            if (datetime.utcnow() - cached_result["calculated_at"]).total_seconds() < self.cache_ttl:
                return cached_result

        logger.info(f"Calculating comprehensive fairness score for model card {model_card_id}")

        # Get all fairness metrics
        fairness_metrics = db.query(FairnessMetric).filter(
            FairnessMetric.model_card_id == model_card_id
        ).all()

        if not fairness_metrics:
            result = {
                "overall_score": 0.5,
                "factors": {},
                "recommendations": ["No fairness metrics available"],
                "calculated_at": datetime.utcnow()
            }
            self.calculation_cache[cache_key] = result
            return result

        # Calculate base score from metrics
        base_score = self._calculate_base_fairness_score(fairness_metrics)

        # Calculate weighted factors
        factors = {}
        if include_weighted_factors:
            factors["demographic_parity"] = self._calculate_demographic_parity_score(fairness_metrics)
            factors["equal_opportunity"] = self._calculate_equal_opportunity_score(fairness_metrics)
            factors["predictive_parity"] = self._calculate_predictive_parity_score(fairness_metrics)
            factors["overall_accuracy"] = self._calculate_overall_accuracy_score(fairness_metrics)

        # Calculate weighted overall score
        if include_weighted_factors and factors:
            weights = {
                "demographic_parity": 0.3,
                "equal_opportunity": 0.3,
                "predictive_parity": 0.2,
                "overall_accuracy": 0.2
            }
            
            weighted_score = sum(factors[factor] * weights[factor] for factor in factors)
            overall_score = (base_score + weighted_score) / 2
        else:
            overall_score = base_score

        # Generate recommendations
        recommendations = self._generate_fairness_recommendations(fairness_metrics, factors)

        result = {
            "overall_score": overall_score,
            "base_score": base_score,
            "factors": factors,
            "recommendations": recommendations,
            "metric_count": len(fairness_metrics),
            "passing_metrics": sum(1 for m in fairness_metrics if m.status == "pass"),
            "calculated_at": datetime.utcnow()
        }

        # Cache result
        self.calculation_cache[cache_key] = result

        # Update model card
        model_card.update(
            db=db,
            db_obj=model_card.get(db, id=model_card_id),
            obj_in={"fairness_score": overall_score}
        )

        return result

    def calculate_performance_metrics(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        include_baselines: bool = True,
        calculate_trends: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive performance metrics with trends and baselines.
        """
        logger.info(f"Calculating performance metrics for model card {model_card_id}")

        # Get performance metrics
        performance_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.model_card_id == model_card_id
        ).all()

        # Get diagnosis assessment results for additional metrics
        diagnosis_assessments = db.query(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id,
            DiagnosisAssessment.status == "completed"
        ).all()

        metrics_data = {}
        
        # Process standard performance metrics
        for metric in performance_metrics:
            metrics_data[metric.metric_name] = {
                "current_value": float(metric.value),
                "unit": metric.unit,
                "test_dataset": metric.test_dataset,
                "measurement_date": metric.measurement_date,
                "metadata": metric.performance_metadata
            }

        # Add diagnosis metrics
        for assessment in diagnosis_assessments:
            diagnosis_metrics = db.query(DiagnosisMetric).filter(
                DiagnosisMetric.assessment_id == assessment.id
            ).all()
            
            for metric in diagnosis_metrics:
                if metric.metric_name not in metrics_data:
                    metrics_data[metric.metric_name] = {
                        "current_value": float(metric.metric_value),
                        "unit": "score",
                        "test_dataset": metric.dataset_type,
                        "measurement_date": metric.measurement_date,
                        "degradation": metric.degradation,
                        "degradation_percentage": metric.degradation_percentage,
                        "passed": metric.passed,
                        "baseline_value": float(metric.baseline_value) if metric.baseline_value else None
                    }

        # Calculate trends if requested
        trends = {}
        if calculate_trends:
            trends = self._calculate_performance_trends(db, model_card_id, metrics_data)

        # Calculate overall performance score
        overall_score = self._calculate_overall_performance_score(metrics_data)

        result = {
            "metrics": metrics_data,
            "overall_performance_score": overall_score,
            "trends": trends,
            "total_metrics": len(metrics_data),
            "healthy_metrics": sum(1 for m in metrics_data.values() if m.get("passed", True)),
            "calculated_at": datetime.utcnow()
        }

        return result

    def detect_drift_status(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        lookback_days: int = 30
    ) -> Dict[str, Any]:
        """
        Detect and analyze drift status for model card.
        """
        logger.info(f"Detecting drift status for model card {model_card_id}")

        # Get recent diagnosis assessments
        cutoff_date = datetime.utcnow() - timedelta(days=lookback_days)
        recent_assessments = db.query(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id,
            DiagnosisAssessment.completed_at >= cutoff_date,
            DiagnosisAssessment.status == "completed"
        ).all()

        drift_analysis = {
            "overall_drift_status": "no_drift",
            "drift_detected": False,
            "drift_by_feature": {},
            "drift_severity": "none",
            "last_checked": datetime.utcnow(),
            "assessment_count": len(recent_assessments)
        }

        if not recent_assessments:
            return drift_analysis

        # Analyze drift from recent assessments
        drift_detections = []
        for assessment in recent_assessments:
            drift_results = db.query(DriftDetection).filter(
                DriftDetection.assessment_id == assessment.id
            ).all()
            drift_detections.extend(drift_results)

        if drift_detections:
            # Aggregate drift results
            total_features = len(drift_detections)
            drifting_features = sum(1 for d in drift_detections if d.drift_detected)

            if drifting_features > 0:
                drift_analysis["drift_detected"] = True
                drift_analysis["overall_drift_status"] = "drift_detected"
                drift_analysis["drift_percentage"] = (drifting_features / total_features) * 100

                # Determine drift severity
                if drift_analysis["drift_percentage"] > 20:
                    drift_analysis["drift_severity"] = "high"
                elif drift_analysis["drift_percentage"] > 10:
                    drift_analysis["drift_severity"] = "medium"
                else:
                    drift_analysis["drift_severity"] = "low"

            # Analyze drift by feature
            for drift in drift_detections:
                drift_analysis["drift_by_feature"][drift.feature_name] = {
                    "drift_score": float(drift.drift_score),
                    "drift_threshold": float(drift.drift_threshold),
                    "drift_detected": drift.drift_detected,
                    "drift_severity": drift.drift_magnitude,
                    "drift_type": drift.drift_type.value,
                    "last_detected": drift.calculated_at.isoformat()
                }

        # Update model card metadata with drift status
        model_card_obj = model_card.get(db, id=model_card_id)
        if model_card_obj:
            metadata = model_card_obj.model_metadata or {}
            metadata.update({
                "drift_status": drift_analysis["overall_drift_status"],
                "drift_detected": drift_analysis["drift_detected"],
                "drift_severity": drift_analysis["drift_severity"],
                "last_drift_check": drift_analysis["last_checked"].isoformat()
            })
            
            model_card.update(
                db=db,
                db_obj=model_card_obj,
                obj_in={"metadata": metadata}
            )

        return drift_analysis

    def calculate_explainability_insights(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        include_feature_importance: bool = True,
        include_shap_values: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate explainability insights from diagnosis assessments.
        """
        logger.info(f"Calculating explainability insights for model card {model_card_id}")

        # Get diagnosis assessments with explainability results
        diagnosis_assessments = db.query(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id,
            DiagnosisAssessment.status == "completed"
        ).all()

        insights = {
            "feature_importance": {},
            "key_insights": [],
            "recommendations": [],
            "method_coverage": {},
            "total_explanations": 0
        }

        for assessment in diagnosis_assessments:
            explainability_results = db.query(ExplainabilityResult).filter(
                ExplainabilityResult.assessment_id == assessment.id
            ).all()

            insights["total_explanations"] += len(explainability_results)

            for result in explainability_results:
                method = result.method.value
                
                # Track method coverage
                if method not in insights["method_coverage"]:
                    insights["method_coverage"][method] = 0
                insights["method_coverage"][method] += 1

                # Process feature importance
                if include_feature_importance and result.feature_importance:
                    for feature, importance in result.feature_importance.items():
                        if feature not in insights["feature_importance"]:
                            insights["feature_importance"][feature] = []
                        insights["feature_importance"][feature].append(float(importance))

                # Extract key insights
                if result.key_insights:
                    insights["key_insights"].extend(result.key_insights)

                # Extract recommendations
                if result.recommendations:
                    insights["recommendations"].extend(result.recommendations)

        # Aggregate feature importance
        if insights["feature_importance"]:
            for feature in insights["feature_importance"]:
                values = insights["feature_importance"][feature]
                insights["feature_importance"][feature] = {
                    "average": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }

            # Sort features by average importance
            insights["feature_importance"] = dict(
                sorted(insights["feature_importance"].items(), 
                      key=lambda x: x[1]["average"], reverse=True)
            )

        # Generate summary insights
        insights["summary"] = self._generate_explainability_summary(insights)

        return insights

    def calculate_compliance_status(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        include_frameworks: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive compliance status.
        """
        logger.info(f"Calculating compliance status for model card {model_card_id}")

        # Get compliance records
        query = db.query(ModelCompliance).filter(
            ModelCompliance.model_card_id == model_card_id
        )

        if include_frameworks:
            query = query.join(ModelCompliance.framework).filter(
                ComplianceFramework.name.in_(include_frameworks)
            )

        compliance_records = query.all()

        if not compliance_records:
            return {
                "overall_status": "unknown",
                "compliance_rate": 0,
                "total_frameworks": 0,
                "compliant_frameworks": 0,
                "frameworks": [],
                "recommendations": ["No compliance records found"]
            }

        # Analyze compliance status
        total_frameworks = len(compliance_records)
        compliant_frameworks = sum(1 for record in compliance_records if record.status == "compliant")
        partially_compliant = sum(1 for record in compliance_records if record.status == "partially_compliant")
        non_compliant = sum(1 for record in compliance_records if record.status == "non_compliant")

        compliance_rate = (compliant_frameworks / total_frameworks) * 100

        # Determine overall status
        if compliance_rate == 100:
            overall_status = "compliant"
        elif compliance_rate >= 80:
            overall_status = "partially_compliant"
        else:
            overall_status = "non_compliant"

        # Check for expiring assessments
        expiring_soon = []
        overdue = []
        today = datetime.utcnow().date()

        for record in compliance_records:
            if record.next_assessment_date:
                days_until = (record.next_assessment_date - today).days
                if days_until < 0:
                    overdue.append(record.framework.name if record.framework else "Unknown")
                elif days_until <= 30:
                    expiring_soon.append(record.framework.name if record.framework else "Unknown")

        # Generate recommendations
        recommendations = []
        if non_compliant > 0:
            recommendations.append(f"Address {non_compliant} non-compliant frameworks")
        if partially_compliant > 0:
            recommendations.append(f"Complete compliance for {partially_compliant} partially compliant frameworks")
        if overdue:
            recommendations.append(f"Overdue assessments for: {', '.join(overdue)}")
        if expiring_soon:
            recommendations.append(f"Schedule assessments for expiring frameworks: {', '.join(expiring_soon)}")

        result = {
            "overall_status": overall_status,
            "compliance_rate": compliance_rate,
            "total_frameworks": total_frameworks,
            "compliant_frameworks": compliant_frameworks,
            "partially_compliant_frameworks": partially_compliant,
            "non_compliant_frameworks": non_compliant,
            "expiring_soon": expiring_soon,
            "overdue": overdue,
            "frameworks": [
                {
                    "framework": record.framework.name if record.framework else "Unknown",
                    "status": record.status,
                    "last_assessed": record.last_assessed_date.isoformat() if record.last_assessed_date else None,
                    "next_assessment": record.next_assessment_date.isoformat() if record.next_assessed_date else None,
                    "days_until_next_assessment": (record.next_assessment_date - today).days if record.next_assessed_date else None
                }
                for record in compliance_records
            ],
            "recommendations": recommendations,
            "last_updated": datetime.utcnow().isoformat()
        }

        return result

    def generate_model_card_summary(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        include_recommendations: bool = True
    ) -> Dict[str, Any]:
        """
        Generate comprehensive model card summary with all calculated metrics.
        """
        logger.info(f"Generating comprehensive summary for model card {model_card_id}")

        # Get model card
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        # Calculate all metrics
        fairness_analysis = self.calculate_comprehensive_fairness_score(db, model_card_id=model_card_id)
        performance_analysis = self.calculate_performance_metrics(db, model_card_id=model_card_id)
        drift_analysis = self.detect_drift_status(db, model_card_id=model_card_id)
        compliance_analysis = self.calculate_compliance_status(db, model_card_id=model_card_id)
        explainability_insights = self.calculate_explainability_insights(db, model_card_id=model_card_id)

        # Generate overall health assessment
        health_score = self._calculate_overall_health_score(
            fairness_analysis["overall_score"],
            performance_analysis["overall_performance_score"],
            compliance_analysis["compliance_rate"],
            drift_analysis["drift_detected"]
        )

        # Determine overall status
        if health_score >= 0.8:
            overall_status = "healthy"
        elif health_score >= 0.6:
            overall_status = "warning"
        else:
            overall_status = "critical"

        # Generate recommendations
        recommendations = []
        if include_recommendations:
            recommendations.extend(fairness_analysis.get("recommendations", []))
            recommendations.extend(compliance_analysis.get("recommendations", []))
            
            if performance_analysis["overall_performance_score"] < 0.8:
                recommendations.append("Review and optimize model performance")
            
            if drift_analysis["drift_detected"]:
                recommendations.append("Investigate and address detected drift")
            
            if overall_status == "critical":
                recommendations.append("Immediate attention required - multiple issues detected")

        summary = {
            "model_card": {
                "id": str(model_card_obj.id),
                "name": model_card_obj.name,
                "version": model_card_obj.version,
                "domain": model_card_obj.domain,
                "risk_tier": model_card_obj.risk_tier,
                "status": model_card_obj.status
            },
            "overall_health": {
                "score": health_score,
                "status": overall_status,
                "last_updated": datetime.utcnow().isoformat()
            },
            "fairness": fairness_analysis,
            "performance": performance_analysis,
            "drift": drift_analysis,
            "compliance": compliance_analysis,
            "explainability": explainability_insights,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }

        return summary

    def _calculate_base_fairness_score(self, metrics: List[FairnessMetric]) -> float:
        """Calculate base fairness score from metrics."""
        if not metrics:
            return 0.5

        total_score = 0
        weighted_sum = 0

        for metric in metrics:
            weight = 1.0
            if metric.status == "pass":
                weight = 1.0
            elif metric.status == "warning":
                weight = 0.8
            elif metric.status == "fail":
                weight = 0.3

            weighted_sum += float(metric.value) * weight
            total_score += weight

        return weighted_sum / total_score if total_score > 0 else 0.5

    def _calculate_demographic_parity_score(self, metrics: List[FairnessMetric]) -> float:
        """Calculate demographic parity score."""
        dp_metrics = [m for m in metrics if "demographic_parity" in m.metric_name.lower()]
        if not dp_metrics:
            return 0.8  # Default if no specific metrics
        
        return sum(float(m.value) for m in dp_metrics) / len(dp_metrics)

    def _calculate_equal_opportunity_score(self, metrics: List[FairnessMetric]) -> float:
        """Calculate equal opportunity score."""
        eo_metrics = [m for m in metrics if "equal_opportunity" in m.metric_name.lower()]
        if not eo_metrics:
            return 0.8
        
        return sum(float(m.value) for m in eo_metrics) / len(eo_metrics)

    def _calculate_predictive_parity_score(self, metrics: List[FairnessMetric]) -> float:
        """Calculate predictive parity score."""
        pp_metrics = [m for m in metrics if "predictive_parity" in m.metric_name.lower()]
        if not pp_metrics:
            return 0.8
        
        return sum(float(m.value) for m in pp_metrics) / len(pp_metrics)

    def _calculate_overall_accuracy_score(self, metrics: List[FairnessMetric]) -> float:
        """Calculate overall accuracy score."""
        accuracy_metrics = [m for m in metrics if "accuracy" in m.metric_name.lower()]
        if not accuracy_metrics:
            return 0.8
        
        return sum(float(m.value) for m in accuracy_metrics) / len(accuracy_metrics)

    def _generate_fairness_recommendations(self, metrics: List[FairnessMetric], factors: Dict[str, float]) -> List[str]:
        """Generate fairness improvement recommendations."""
        recommendations = []
        
        # Check failing metrics
        failing_metrics = [m for m in metrics if m.status == "fail"]
        if failing_metrics:
            recommendations.append(f"Address {len(failing_metrics)} failing fairness metrics")
        
        # Check low factor scores
        for factor, score in factors.items():
            if score < 0.7:
                factor_name = factor.replace("_", " ").title()
                recommendations.append(f"Improve {factor_name} (current score: {score:.3f})")
        
        # Check overall score
        if not factors:
            overall_score = sum(float(m.value) for m in metrics) / len(metrics) if metrics else 0.5
            if overall_score < 0.8:
                recommendations.append("Implement fairness optimization techniques")
        
        return recommendations

    def _calculate_performance_trends(self, db: Session, model_card_id: UUID, current_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate performance trends over time."""
        # This would analyze historical performance data
        # For now, return placeholder data
        return {
            "trend_analysis": "stable",
            "trend_direction": "neutral",
            "confidence": 0.8
        }

    def _calculate_overall_performance_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall performance score."""
        if not metrics:
            return 0.5
        
        values = [data["current_value"] for data in metrics.values()]
        return sum(values) / len(values)

    def _generate_explainability_summary(self, insights: Dict[str, Any]) -> Dict[str, Any]:
        """Generate explainability summary."""
        summary = {
            "top_features": list(insights["feature_importance"].keys())[:5] if insights["feature_importance"] else [],
            "total_methods": len(insights["method_coverage"]),
            "method_diversity": "good" if len(insights["method_coverage"]) >= 3 else "limited",
            "insight_count": len(insights["key_insights"])
        }
        
        return summary

    def _calculate_overall_health_score(
        self, fairness_score: float, performance_score: float, compliance_rate: float, drift_detected: bool
    ) -> float:
        """Calculate overall model health score."""
        weights = {
            "fairness": 0.3,
            "performance": 0.3,
            "compliance": 0.3,
            "drift": 0.1
        }
        
        drift_score = 0.0 if drift_detected else 1.0
        
        weighted_score = (
            fairness_score * weights["fairness"] +
            performance_score * weights["performance"] +
            (compliance_rate / 100) * weights["compliance"] +
            drift_score * weights["drift"]
        )
        
        return weighted_score


# Import required modules
from app.models.model_card import ComplianceFramework


model_card_enhancement_service = ModelCardEnhancementService()