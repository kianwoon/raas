from typing import Dict, Any, List, Optional, Union
from uuid import UUID
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ModelCardTemplateService:
    """
    Service for generating model card templates for different audiences.
    Provides pre-configured templates for technical, business, compliance, and executive audiences.
    """

    def __init__(self):
        self.templates = {
            "technical": self._get_technical_template(),
            "business": self._get_business_template(),
            "compliance": self._get_compliance_template(),
            "executive": self._get_executive_template()
        }

    def generate_model_card_from_template(
        self,
        *,
        template_type: str,
        model_card_data: Dict[str, Any],
        assessment_results: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate model card content using specified template.
        """
        if template_type not in self.templates:
            raise ValueError(f"Unknown template type: {template_type}")

        template = self.templates[template_type]
        generated_content = {}

        # Apply template transformations
        for section, section_config in template.items():
            if section_config["enabled"]:
                generated_content[section] = self._process_template_section(
                    section_config,
                    model_card_data,
                    assessment_results
                )

        return generated_content

    def get_template_definitions(self) -> Dict[str, Any]:
        """
        Get all available template definitions.
        """
        return {
            template_name: {
                "name": template_data["name"],
                "description": template_data["description"],
                "audience": template_data["audience"],
                "sections": list(template_data["sections"].keys())
            }
            for template_name, template_data in self.templates.items()
        }

    def get_template_preview(self, template_type: str) -> Dict[str, Any]:
        """
        Get preview of template structure.
        """
        if template_type not in self.templates:
            raise ValueError(f"Unknown template type: {template_type}")

        template = self.templates[template_type]
        
        return {
            "name": template["name"],
            "description": template["description"],
            "audience": template["audience"],
            "sections": {
                section_name: {
                    "title": section_data["title"],
                    "description": section_data["description"],
                    "fields": section_data.get("fields", []),
                    "importance": section_data.get("importance", "medium")
                }
                for section_name, section_data in template["sections"].items()
            }
        }

    def _get_technical_template(self) -> Dict[str, Any]:
        """
        Technical template for data scientists and ML engineers.
        """
        return {
            "name": "Technical Model Card",
            "description": "Comprehensive technical documentation for data scientists and ML engineers",
            "audience": "Data Scientists, ML Engineers, Technical Teams",
            "sections": {
                "model_overview": {
                    "enabled": True,
                    "title": "Model Overview",
                    "description": "Basic information about the model",
                    "importance": "high",
                    "fields": [
                        "name", "version", "description", "model_type", "framework",
                        "training_data_size", "input_features", "output_features"
                    ]
                },
                "performance_metrics": {
                    "enabled": True,
                    "title": "Performance Metrics",
                    "description": "Detailed performance analysis",
                    "importance": "high",
                    "fields": [
                        "accuracy", "precision", "recall", "f1_score", "auc_roc",
                        "confusion_matrix", "roc_curve", "precision_recall_curve"
                    ]
                },
                "fairness_analysis": {
                    "enabled": True,
                    "title": "Fairness Analysis",
                    "description": "Comprehensive fairness evaluation",
                    "importance": "high",
                    "fields": [
                        "demographic_parity", "equal_opportunity", "equalized_odds",
                        "predictive_parity", "disparate_impact", "fairness_constraints"
                    ]
                },
                "model_architecture": {
                    "enabled": True,
                    "title": "Model Architecture",
                    "description": "Technical details of model architecture",
                    "importance": "medium",
                    "fields": [
                        "architecture_type", "layers", "parameters", "hyperparameters",
                        "training_procedure", "optimization_algorithm"
                    ]
                },
                "data_preprocessing": {
                    "enabled": True,
                    "title": "Data Preprocessing",
                    "description": "Data preparation and feature engineering",
                    "importance": "medium",
                    "fields": [
                        "data_sources", "feature_extraction", "normalization",
                        "handling_missing_values", "data_splits"
                    ]
                },
                "explainability": {
                    "enabled": True,
                    "title": "Explainability",
                    "description": "Model interpretability and feature importance",
                    "importance": "medium",
                    "fields": [
                        "feature_importance", "shap_values", "lime_explanations",
                        "partial_dependence_plots", "counterfactual_explanations"
                    ]
                },
                "monitoring": {
                    "enabled": True,
                    "title": "Monitoring & Alerting",
                    "description": "Model monitoring configuration and thresholds",
                    "importance": "medium",
                    "fields": [
                        "performance_monitoring", "drift_detection", "alert_thresholds",
                        "retraining_triggers", "degradation_handling"
                    ]
                },
                "technical_appendix": {
                    "enabled": True,
                    "title": "Technical Appendix",
                    "description": "Additional technical details and references",
                    "importance": "low",
                    "fields": [
                        "mathematical_formulation", "algorithm_complexity",
                        "computational_requirements", "known_limitations"
                    ]
                }
            }
        }

    def _get_business_template(self) -> Dict[str, Any]:
        """
        Business template for stakeholders and business users.
        """
        return {
            "name": "Business Model Card",
            "description": "Business-focused model documentation for stakeholders",
            "audience": "Business Stakeholders, Product Managers, Decision Makers",
            "sections": {
                "executive_summary": {
                    "enabled": True,
                    "title": "Executive Summary",
                    "description": "High-level overview for business stakeholders",
                    "importance": "high",
                    "fields": [
                        "business_objective", "model_purpose", "key_benefits",
                        "business_impact", "roi_estimate", "implementation_timeline"
                    ]
                },
                "performance_summary": {
                    "enabled": True,
                    "title": "Performance Summary",
                    "description": "Business-relevant performance metrics",
                    "importance": "high",
                    "fields": [
                        "business_metrics", "accuracy_business_impact", "cost_savings",
                        "efficiency_gains", "quality_improvements"
                    ]
                },
                "risk_assessment": {
                    "enabled": True,
                    "title": "Risk Assessment",
                    "description": "Business risks and mitigation strategies",
                    "importance": "high",
                    "fields": [
                        "business_risks", "fairness_concerns", "compliance_risks",
                        "operational_risks", "mitigation_strategies"
                    ]
                },
                "use_case_details": {
                    "enabled": True,
                    "title": "Use Case Details",
                    "description": "Business use cases and applications",
                    "importance": "medium",
                    "fields": [
                        "primary_use_cases", "target_users", "integration_points",
                        "business_processes", "success_criteria"
                    ]
                },
                "cost_analysis": {
                    "enabled": True,
                    "title": "Cost Analysis",
                    "description": "Financial impact and cost considerations",
                    "importance": "medium",
                    "fields": [
                        "development_costs", "maintenance_costs", "infrastructure_costs",
                        "training_costs", "total_cost_of_ownership"
                    ]
                },
                "stakeholder_impact": {
                    "enabled": True,
                    "title": "Stakeholder Impact",
                    "description": "Impact on different stakeholder groups",
                    "importance": "medium",
                    "fields": [
                        "customer_impact", "employee_impact", "partner_impact",
                        "regulatory_impact", "community_impact"
                    ]
                },
                "implementation_plan": {
                    "enabled": True,
                    "title": "Implementation Plan",
                    "description": "Deployment and rollout strategy",
                    "importance": "medium",
                    "fields": [
                        "deployment_phases", "timeline", "resource_requirements",
                        "success_metrics", "rollback_plan"
                    ]
                },
                "business_appendix": {
                    "enabled": True,
                    "title": "Business Appendix",
                    "description": "Additional business documentation",
                    "importance": "low",
                    "fields": [
                        "market_analysis", "competitive_landscape", "business_case",
                        "stakeholder_signoffs", "budget_approval"
                    ]
                }
            }
        }

    def _get_compliance_template(self) -> Dict[str, Any]:
        """
        Compliance template for regulators and compliance officers.
        """
        return {
            "name": "Compliance Model Card",
            "description": "Compliance-focused documentation for regulators and auditors",
            "audience": "Compliance Officers, Regulators, Legal Teams, Auditors",
            "sections": {
                "compliance_overview": {
                    "enabled": True,
                    "title": "Compliance Overview",
                    "description": "Summary of compliance status and frameworks",
                    "importance": "high",
                    "fields": [
                        "regulatory_frameworks", "compliance_status", "risk_classification",
                        "audit_trail", "compliance_ownership"
                    ]
                },
                "legal_ethical_review": {
                    "enabled": True,
                    "title": "Legal & Ethical Review",
                    "description": "Legal and ethical considerations",
                    "importance": "high",
                    "fields": [
                        "data_privacy_compliance", "bias_assessment", "discrimination_risks",
                        "transparency_requirements", "accountability_measures"
                    ]
                },
                "fairness_compliance": {
                    "enabled": True,
                    "title": "Fairness Compliance",
                    "description": "Detailed fairness compliance analysis",
                    "importance": "high",
                    "fields": [
                        "protected_attributes", "fairness_testing", "bias_mitigation",
                        "equity_assessments", "disparity_analysis"
                    ]
                },
                "data_governance": {
                    "enabled": True,
                    "title": "Data Governance",
                    "description": "Data handling and governance practices",
                    "importance": "high",
                    "fields": [
                        "data_provenance", "consent_management", "data_retention",
                        "access_controls", "privacy_preservation"
                    ]
                },
                "risk_management": {
                    "enabled": True,
                    "title": "Risk Management",
                    "description": "Risk identification and mitigation",
                    "importance": "medium",
                    "fields": [
                        "risk_assessment", "mitigation_strategies", "monitoring_controls",
                        "incident_response", "continuity_planning"
                    ]
                },
                "audit_documentation": {
                    "enabled": True,
                    "title": "Audit Documentation",
                    "description": "Audit trail and verification evidence",
                    "importance": "medium",
                    "fields": [
                        "audit_log", "verification_methods", "evidence_packaging",
                        "third_party_assessments", "certification_status"
                    ]
                },
                "regulatory_reporting": {
                    "enabled": True,
                    "title": "Regulatory Reporting",
                    "description": "Reporting requirements and submissions",
                    "importance": "medium",
                    "fields": [
                        "reporting_obligations", "disclosure_requirements",
                        "regulatory_filings", "compliance_certifications"
                    ]
                },
                "compliance_appendix": {
                    "enabled": True,
                    "title": "Compliance Appendix",
                    "description": "Additional compliance documentation",
                    "importance": "low",
                    "fields": [
                        "policy_references", "legal_citations", "standards_compliance",
                        "assessment_methodologies", "governance_structure"
                    ]
                }
            }
        }

    def _get_executive_template(self) -> Dict[str, Any]:
        """
        Executive template for C-level executives and board members.
        """
        return {
            "name": "Executive Model Card",
            "description": "High-level summary for executive decision-making",
            "audience": "C-Level Executives, Board Members, Senior Leadership",
            "sections": {
                "executive_summary": {
                    "enabled": True,
                    "title": "Executive Summary",
                    "description": "Concise overview for executive decision-making",
                    "importance": "high",
                    "fields": [
                        "strategic_importance", "business_value", "risk_profile",
                        "recommendation", "key_metrics", "timeline"
                    ]
                },
                "strategic_alignment": {
                    "enabled": True,
                    "title": "Strategic Alignment",
                    "description": "Alignment with business strategy and objectives",
                    "importance": "high",
                    "fields": [
                        "business_objectives", "strategic_initiatives", "competitive_advantage",
                        "market_positioning", "long_term_vision"
                    ]
                },
                "financial_impact": {
                    "enabled": True,
                    "title": "Financial Impact",
                    "description": "Financial implications and ROI analysis",
                    "importance": "high",
                    "fields": [
                        "investment_required", "expected_roi", "payback_period",
                        "cost_benefits", "financial_risks"
                    ]
                },
                "risk_summary": {
                    "enabled": True,
                    "title": "Risk Summary",
                    "description": "High-level risk assessment and mitigation",
                    "importance": "high",
                    "fields": [
                        "critical_risks", "risk_mitigation", "compliance_status",
                        "reputation_risks", "operational_risks"
                    ]
                },
                "performance_highlights": {
                    "enabled": True,
                    "title": "Performance Highlights",
                    "description": "Key performance indicators and achievements",
                    "importance": "medium",
                    "fields": [
                        "key_success_metrics", "performance_benchmarks", "achievement_summary",
                        "continuous_improvement", "innovation_highlights"
                    ]
                },
                "implementation_summary": {
                    "enabled": True,
                    "title": "Implementation Summary",
                    "description": "High-level deployment and resource requirements",
                    "importance": "medium",
                    "fields": [
                        "deployment_strategy", "resource_requirements", "key_milestones",
                        "success_criteria", "governance_structure"
                    ]
                },
                "market_position": {
                    "enabled": True,
                    "title": "Market Position",
                    "description": "Competitive landscape and market positioning",
                    "importance": "medium",
                    "fields": [
                        "competitive_analysis", "market_opportunity", "differentiation_factors",
                        "industry_trends", "future_outlook"
                    ]
                },
                "recommendations": {
                    "enabled": True,
                    "title": "Recommendations",
                    "description": "Executive recommendations and next steps",
                    "importance": "high",
                    "fields": [
                        "go_no_go_recommendation", "strategic_recommendations",
                        "investment_recommendations", "risk_mitigation_actions"
                    ]
                }
            }
        }

    def _process_template_section(
        self,
        section_config: Dict[str, Any],
        model_card_data: Dict[str, Any],
        assessment_results: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a single template section with model card data.
        """
        section_content = {
            "title": section_config["title"],
            "description": section_config["description"],
            "importance": section_config.get("importance", "medium"),
            "content": {},
            "data_sources": [],
            "last_updated": datetime.utcnow().isoformat()
        }

        # Process fields based on section type
        section_name = section_config["title"].lower().replace(" ", "_")
        
        if "performance" in section_name:
            section_content["content"] = self._extract_performance_data(model_card_data, assessment_results)
        elif "fairness" in section_name:
            section_content["content"] = self._extract_fairness_data(model_card_data, assessment_results)
        elif "compliance" in section_name:
            section_content["content"] = self._extract_compliance_data(model_card_data, assessment_results)
        elif "risk" in section_name:
            section_content["content"] = self._extract_risk_data(model_card_data, assessment_results)
        elif "executive" in section_name or "summary" in section_name:
            section_content["content"] = self._extract_summary_data(model_card_data, assessment_results)
        else:
            section_content["content"] = self._extract_general_data(model_card_data, assessment_results)

        return section_content

    def _extract_performance_data(self, model_card_data: Dict[str, Any], assessment_results: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract performance-related data."""
        performance_data = {
            "metrics": model_card_data.get("performance_metrics", []),
            "overall_score": model_card_data.get("fairness_score", 0),
            "trends": assessment_results.get("performance_trends", {}) if assessment_results else {},
            "recommendations": []
        }

        # Add performance recommendations
        if performance_data["overall_score"] < 0.8:
            performance_data["recommendations"].append("Consider model optimization to improve performance")

        return performance_data

    def _extract_fairness_data(self, model_card_data: Dict[str, Any], assessment_results: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract fairness-related data."""
        fairness_data = {
            "metrics": model_card_data.get("fairness_metrics", []),
            "overall_score": model_card_data.get("fairness_score", 0),
            "protected_attributes": [],
            "bias_assessment": "acceptable",
            "recommendations": []
        }

        # Analyze fairness metrics
        failing_metrics = [m for m in fairness_data["metrics"] if m.get("status") == "fail"]
        if failing_metrics:
            fairness_data["bias_assessment"] = "concerns_identified"
            fairness_data["recommendations"].append(f"Address {len(failing_metrics)} failing fairness metrics")

        return fairness_data

    def _extract_compliance_data(self, model_card_data: Dict[str, Any], assessment_results: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract compliance-related data."""
        compliance_data = {
            "frameworks": model_card_data.get("compliance_records", []),
            "overall_status": "compliant",
            "expiring_assessments": [],
            "recommendations": []
        }

        # Analyze compliance status
        non_compliant = [r for r in compliance_data["frameworks"] if r.get("status") != "compliant"]
        if non_compliant:
            compliance_data["overall_status"] = "partial_compliance"
            compliance_data["recommendations"].append(f"Address {len(non_compliant)} compliance gaps")

        return compliance_data

    def _extract_risk_data(self, model_card_data: Dict[str, Any], assessment_results: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract risk-related data."""
        risk_data = {
            "overall_risk_level": model_card_data.get("risk_tier", "unknown"),
            "risk_factors": [],
            "mitigation_strategies": [],
            "monitoring_status": "active"
        }

        # Add risk factors based on data
        if model_card_data.get("fairness_score", 1) < 0.7:
            risk_data["risk_factors"].append("Fairness concerns identified")
        
        if assessment_results and assessment_results.get("drift_detected"):
            risk_data["risk_factors"].append("Model drift detected")

        return risk_data

    def _extract_summary_data(self, model_card_data: Dict[str, Any], assessment_results: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract summary data for executive views."""
        return {
            "model_name": model_card_data.get("name", "Unknown"),
            "version": model_card_data.get("version", "Unknown"),
            "domain": model_card_data.get("domain", "Unknown"),
            "overall_health": "good",
            "key_highlights": [
                f"Fairness score: {model_card_data.get('fairness_score', 0):.3f}",
                f"Risk tier: {model_card_data.get('risk_tier', 'Unknown')}",
                f"Status: {model_card_data.get('status', 'Unknown')}"
            ],
            "recommendations": [
                "Continue monitoring model performance",
                "Schedule regular fairness assessments"
            ]
        }

    def _extract_general_data(self, model_card_data: Dict[str, Any], assessment_results: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract general model card data."""
        return {
            "basic_info": {
                "name": model_card_data.get("name"),
                "version": model_card_data.get("version"),
                "description": model_card_data.get("description"),
                "domain": model_card_data.get("domain"),
                "created_at": model_card_data.get("created_at"),
                "updated_at": model_card_data.get("updated_at")
            },
            "metadata": model_card_data.get("metadata", {}),
            "tags": model_card_data.get("tags", [])
        }


model_card_template_service = ModelCardTemplateService()