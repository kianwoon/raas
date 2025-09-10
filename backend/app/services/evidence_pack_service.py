from typing import List, Dict, Any, Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json
import os
import tempfile
import zipfile
from datetime import datetime
import logging
import base64
from pathlib import Path

from app.models.model_card import ModelCard, FairnessMetric, PerformanceMetric, ModelCompliance
from app.models.fairness_assessment import FairnessAssessment, FairnessAssessmentMetric, FairnessReport
from app.models.diagnosis_assessment import DiagnosisAssessment, DiagnosisMetric, DriftDetection, ExplainabilityResult, DiagnosisReport
from app.services.visualization_service import visualization_service
# Import service class instead of instance to avoid startup issues

logger = logging.getLogger(__name__)


class EvidencePackGenerator:
    """
    Service for generating comprehensive evidence packs for model cards.
    Handles JSON, PDF, and ZIP file generation with visualizations and reports.
    """

    def __init__(self):
        self.supported_formats = ["json", "pdf", "html", "zip"]
        self.temp_dir = tempfile.gettempdir()

    def generate_evidence_pack(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        format: str = "json",
        include_sections: Optional[Dict[str, bool]] = None,
        custom_template: Optional[str] = None,
        branding_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate evidence pack in specified format.
        
        Args:
            model_card_id: UUID of the model card
            format: Output format (json, pdf, html, zip)
            include_sections: Dict specifying which sections to include
            custom_template: Path to custom template
            branding_config: Custom branding configuration
        
        Returns:
            Dict with evidence pack data and metadata
        """
        if format not in self.supported_formats:
            raise ValueError(f"Unsupported format: {format}. Supported formats: {self.supported_formats}")

        logger.info(f"Generating evidence pack for model card {model_card_id} in {format} format")

        # Default sections to include
        default_sections = {
            "model_card": True,
            "fairness": True,
            "performance": True,
            "compliance": True,
            "visualizations": True,
            "reports": True,
            "risk_assessment": True,
            "metadata": True
        }

        if include_sections:
            default_sections.update(include_sections)

        include_sections = default_sections

        # Generate evidence data
        evidence_data = self._collect_evidence_data(db, model_card_id, include_sections)

        # Apply branding
        if branding_config:
            evidence_data = self._apply_branding(evidence_data, branding_config)

        # Generate output based on format
        if format == "json":
            return self._generate_json_evidence_pack(evidence_data)
        elif format == "html":
            return self._generate_html_evidence_pack(evidence_data, custom_template)
        elif format == "pdf":
            return self._generate_pdf_evidence_pack(evidence_data, custom_template)
        elif format == "zip":
            return self._generate_zip_evidence_pack(evidence_data, include_sections)

    def generate_model_card_report(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        report_type: str = "comprehensive",  # comprehensive, executive, technical, compliance
        template_id: Optional[str] = None,
        include_appendices: bool = True
    ) -> Dict[str, Any]:
        """
        Generate a formatted model card report.
        """
        logger.info(f"Generating {report_type} report for model card {model_card_id}")

        # Get model card data
        model_card_obj = db.query(ModelCard).filter(ModelCard.id == model_card_id).first()
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        # Collect report data
        report_data = self._collect_report_data(db, model_card_obj, report_type)

        # Generate report based on type
        if report_type == "executive":
            return self._generate_executive_report(report_data, include_appendices)
        elif report_type == "technical":
            return self._generate_technical_report(report_data, include_appendices)
        elif report_type == "compliance":
            return self._generate_compliance_report(report_data, include_appendices)
        else:
            return self._generate_comprehensive_report(report_data, include_appendices)

    def download_evidence_pack(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        format: str = "zip",
        expiration_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Generate and upload evidence pack to MinIO for download.
        """
        logger.info(f"Preparing evidence pack download for model card {model_card_id}")

        # Generate evidence pack
        evidence_pack = self.generate_evidence_pack(db, model_card_id=model_card_id, format=format)

        # Create file
        if format == "zip":
            file_content = self._create_zip_file(evidence_pack)
            content_type = "application/zip"
            file_extension = "zip"
        elif format == "json":
            file_content = json.dumps(evidence_pack, indent=2).encode('utf-8')
            content_type = "application/json"
            file_extension = "json"
        elif format == "pdf":
            # PDF generation would require additional library
            file_content = self._create_pdf_file(evidence_pack)
            content_type = "application/pdf"
            file_extension = "pdf"
        else:
            file_content = evidence_pack["html_content"].encode('utf-8')
            content_type = "text/html"
            file_extension = "html"

        # Upload to MinIO
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        object_name = f"evidence-packs/{model_card_id}/{timestamp}_evidence_pack.{file_extension}"
        
        try:
            from app.services.minio_service import MinioService
            minio_service = MinioService()
            url = minio_service.upload_file(
                file_content=file_content,
                object_name=object_name,
                content_type=content_type,
                expiration_hours=expiration_hours
            )
            
            return {
                "download_url": url,
                "expires_at": (datetime.now() + timedelta(hours=expiration_hours)).isoformat(),
                "file_size": len(file_content),
                "format": format,
                "object_name": object_name
            }
        except Exception as e:
            logger.error(f"Failed to upload evidence pack to MinIO: {str(e)}")
            raise ValueError(f"Failed to generate download link: {str(e)}")

    def _collect_evidence_data(
        self, db: Session, model_card_id: UUID, include_sections: Dict[str, bool]
    ) -> Dict[str, Any]:
        """Collect all evidence data for a model card."""
        evidence_data = {
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "model_card_id": str(model_card_id),
                "version": "1.0",
                "generator": "RaaS Evidence Pack Generator"
            }
        }

        # Get model card
        model_card_obj = db.query(ModelCard).filter(ModelCard.id == model_card_id).first()
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        if include_sections["model_card"]:
            evidence_data["model_card"] = self._serialize_model_card(model_card_obj)

        if include_sections["fairness"]:
            evidence_data["fairness"] = self._collect_fairness_evidence(db, model_card_id)

        if include_sections["performance"]:
            evidence_data["performance"] = self._collect_performance_evidence(db, model_card_id)

        if include_sections["compliance"]:
            evidence_data["compliance"] = self._collect_compliance_evidence(db, model_card_id)

        if include_sections["visualizations"]:
            evidence_data["visualizations"] = self._collect_visualizations(db, model_card_id)

        if include_sections["reports"]:
            evidence_data["reports"] = self._collect_reports(db, model_card_id)

        if include_sections["risk_assessment"]:
            evidence_data["risk_assessment"] = self._generate_risk_assessment(db, model_card_id)

        # Generate summary
        evidence_data["summary"] = self._generate_evidence_summary(evidence_data)

        return evidence_data

    def _collect_fairness_evidence(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect fairness evidence."""
        fairness_metrics = db.query(FairnessMetric).filter(
            FairnessMetric.model_card_id == model_card_id
        ).all()

        fairness_assessments = db.query(FairnessAssessment).filter(
            FairnessAssessment.model_id == model_card_id
        ).all()

        metrics_data = []
        for metric in fairness_metrics:
            metrics_data.append({
                "id": str(metric.id),
                "metric_name": metric.metric_name,
                "value": float(metric.value),
                "threshold": float(metric.threshold),
                "status": metric.status,
                "demographic_groups": metric.demographic_groups or [],
                "calculation_method": metric.calculation_method,
                "last_calculated": metric.last_calculated.isoformat() if metric.last_calculated else None,
                "description": metric.description
            })

        assessments_data = []
        for assessment in fairness_assessments:
            assessments_data.append({
                "id": str(assessment.id),
                "name": assessment.name,
                "description": assessment.description,
                "status": assessment.status,
                "overall_fairness_score": assessment.overall_fairness_score,
                "created_at": assessment.created_at.isoformat(),
                "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None,
                "report_url": assessment.report_url
            })

        return {
            "metrics": metrics_data,
            "assessments": assessments_data,
            "overall_fairness_score": model_card_obj.fairness_score,
            "summary": self._generate_fairness_summary(metrics_data, assessments_data)
        }

    def _collect_performance_evidence(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect performance evidence."""
        performance_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.model_card_id == model_card_id
        ).all()

        diagnosis_assessments = db.query(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id
        ).all()

        metrics_data = []
        for metric in performance_metrics:
            metrics_data.append({
                "id": str(metric.id),
                "metric_name": metric.metric_name,
                "value": float(metric.value),
                "unit": metric.unit,
                "test_dataset": metric.test_dataset,
                "measurement_date": metric.measurement_date.isoformat() if metric.measurement_date else None,
                "metadata": metric.performance_metadata
            })

        assessments_data = []
        for assessment in diagnosis_assessments:
            assessments_data.append({
                "id": str(assessment.id),
                "name": assessment.name,
                "description": assessment.description,
                "status": assessment.status,
                "overall_performance_score": assessment.overall_performance_score,
                "drift_detected": assessment.drift_detected,
                "created_at": assessment.created_at.isoformat(),
                "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None,
                "report_url": assessment.report_url
            })

        return {
            "metrics": metrics_data,
            "assessments": assessments_data,
            "summary": self._generate_performance_summary(metrics_data, assessments_data)
        }

    def _collect_compliance_evidence(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect compliance evidence."""
        compliance_records = db.query(ModelCompliance).filter(
            ModelCompliance.model_card_id == model_card_id
        ).all()

        records_data = []
        for record in compliance_records:
            records_data.append({
                "id": str(record.id),
                "framework": record.framework.name if record.framework else "Unknown",
                "framework_version": record.framework.version if record.framework else "Unknown",
                "status": record.status,
                "last_assessed_date": record.last_assessed_date.isoformat() if record.last_assessed_date else None,
                "next_assessment_date": record.next_assessment_date.isoformat() if record.next_assessed_date else None,
                "assessor_notes": record.notes,
                "evidence_url": record.evidence_url
            })

        total_frameworks = len(records_data)
        compliant_frameworks = sum(1 for record in records_data if record.status == "compliant")

        return {
            "records": records_data,
            "total_frameworks": total_frameworks,
            "compliant_frameworks": compliant_frameworks,
            "compliance_rate": (compliant_frameworks / total_frameworks * 100) if total_frameworks > 0 else 0,
            "overall_status": "compliant" if compliant_frameworks == total_frameworks else "partially_compliant"
        }

    def _collect_visualizations(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect visualization data."""
        visualizations = {}

        try:
            # Generate fairness metrics chart
            fairness_chart = visualization_service.generate_fairness_metrics_chart(db, model_card_id)
            visualizations["fairness_metrics"] = fairness_chart

            # Generate performance metrics chart
            performance_chart = visualization_service.generate_performance_metrics_chart(db, model_card_id)
            visualizations["performance_metrics"] = performance_chart

            # Generate compliance dashboard
            compliance_dashboard = visualization_service.generate_compliance_dashboard(db, model_card_id)
            visualizations["compliance_dashboard"] = compliance_dashboard

            # Generate risk assessment chart
            risk_chart = visualization_service.generate_risk_assessment_chart(db, model_card_id)
            visualizations["risk_assessment"] = risk_chart

        except Exception as e:
            logger.error(f"Error generating visualizations: {str(e)}")
            visualizations["error"] = "Failed to generate some visualizations"

        return visualizations

    def _collect_reports(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect report data."""
        reports = []

        # Collect fairness reports
        fairness_reports = db.query(FairnessReport).join(FairnessAssessment).filter(
            FairnessAssessment.model_id == model_card_id
        ).all()

        for report in fairness_reports:
            reports.append({
                "type": "fairness",
                "report_type": report.report_type,
                "title": report.title,
                "subtitle": report.subtitle,
                "url": report.report_url,
                "generated_at": report.created_at.isoformat(),
                "summary_findings": report.summary_findings,
                "recommendations": report.recommendations
            })

        # Collect diagnosis reports
        diagnosis_reports = db.query(DiagnosisReport).join(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id
        ).all()

        for report in diagnosis_reports:
            reports.append({
                "type": "diagnosis",
                "report_type": report.report_type,
                "title": report.title,
                "subtitle": report.subtitle,
                "url": report.report_url,
                "generated_at": report.created_at.isoformat(),
                "executive_summary": report.executive_summary,
                "key_findings": report.key_findings,
                "recommendations": report.recommendations
            })

        return {
            "reports": reports,
            "total_reports": len(reports),
            "report_types": {
                "fairness": len([r for r in reports if r["type"] == "fairness"]),
                "diagnosis": len([r for r in reports if r["type"] == "diagnosis"])
            }
        }

    def _generate_risk_assessment(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Generate risk assessment."""
        model_card_obj = db.query(ModelCard).filter(ModelCard.id == model_card_id).first()
        if not model_card_obj:
            return {}

        # Calculate risk factors
        risk_factors = {
            "fairness_risk": self._calculate_fairness_risk(db, model_card_id),
            "performance_risk": self._calculate_performance_risk(db, model_card_id),
            "compliance_risk": self._calculate_compliance_risk(db, model_card_id),
            "operational_risk": self._calculate_operational_risk(db, model_card_id)
        }

        # Calculate overall risk
        overall_risk = sum(risk_factors.values()) / len(risk_factors)

        # Determine risk level
        if overall_risk >= 0.8:
            risk_level = "high"
        elif overall_risk >= 0.6:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "overall_risk_score": overall_risk,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "risk_mitigation": self._generate_risk_mitigation_strategies(risk_factors, risk_level),
            "last_assessed": datetime.utcnow().isoformat()
        }

    def _generate_evidence_summary(self, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate evidence summary."""
        summary = {
            "overall_status": "healthy",
            "key_findings": [],
            "recommendations": [],
            "next_steps": []
        }

        # Analyze fairness
        if "fairness" in evidence_data:
            fairness_score = evidence_data["fairness"].get("overall_fairness_score", 0)
            if fairness_score < 0.7:
                summary["overall_status"] = "attention_needed"
                summary["key_findings"].append("Fairness score below threshold")
                summary["recommendations"].append("Review fairness metrics and implement improvements")

        # Analyze performance
        if "performance" in evidence_data:
            performance_metrics = evidence_data["performance"].get("metrics", [])
            if performance_metrics:
                avg_performance = sum(m["value"] for m in performance_metrics) / len(performance_metrics)
                if avg_performance < 0.8:
                    summary["overall_status"] = "attention_needed"
                    summary["key_findings"].append("Performance metrics below expected levels")

        # Analyze compliance
        if "compliance" in evidence_data:
            compliance_rate = evidence_data["compliance"].get("compliance_rate", 0)
            if compliance_rate < 100:
                summary["key_findings"].append(f"Compliance rate at {compliance_rate:.1f}%")
                summary["recommendations"].append("Address compliance gaps")

        # Add next steps
        summary["next_steps"] = [
            "Schedule next assessment cycle",
            "Update monitoring thresholds",
            "Review stakeholder feedback"
        ]

        return summary

    def _generate_json_evidence_pack(self, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate JSON evidence pack."""
        return {
            "format": "json",
            "content": evidence_data,
            "metadata": {
                "content_type": "application/json",
                "size": len(json.dumps(evidence_data).encode('utf-8'))
            }
        }

    def _generate_html_evidence_pack(self, evidence_data: Dict[str, Any], template_path: Optional[str]) -> Dict[str, Any]:
        """Generate HTML evidence pack."""
        # This would use a template engine like Jinja2
        html_content = self._render_html_template(evidence_data, template_path)
        
        return {
            "format": "html",
            "html_content": html_content,
            "metadata": {
                "content_type": "text/html",
                "size": len(html_content.encode('utf-8'))
            }
        }

    def _generate_pdf_evidence_pack(self, evidence_data: Dict[str, Any], template_path: Optional[str]) -> Dict[str, Any]:
        """Generate PDF evidence pack."""
        # This would use a PDF generation library
        # For now, return HTML that can be converted to PDF
        html_content = self._render_html_template(evidence_data, template_path)
        
        return {
            "format": "pdf",
            "html_content": html_content,
            "metadata": {
                "content_type": "application/pdf",
                "size": len(html_content.encode('utf-8'))  # Approximate
            }
        }

    def _generate_zip_evidence_pack(self, evidence_data: Dict[str, Any], include_sections: Dict[str, bool]) -> Dict[str, Any]:
        """Generate ZIP evidence pack with multiple files."""
        zip_content = self._create_zip_file(evidence_data)
        
        return {
            "format": "zip",
            "zip_content": base64.b64encode(zip_content).decode('utf-8'),
            "metadata": {
                "content_type": "application/zip",
                "size": len(zip_content),
                "files": self._get_zip_file_list(include_sections)
            }
        }

    def _create_zip_file(self, evidence_data: Dict[str, Any]) -> bytes:
        """Create ZIP file from evidence data."""
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add main JSON file
            zipf.writestr("evidence_pack.json", json.dumps(evidence_data, indent=2))
            
            # Add individual section files
            for section, data in evidence_data.items():
                if section != "metadata":
                    zipf.writestr(f"{section}.json", json.dumps(data, indent=2))
            
            # Add visualizations as separate files
            if "visualizations" in evidence_data:
                for viz_name, viz_data in evidence_data["visualizations"].items():
                    if isinstance(viz_data, dict) and "chart_data" in viz_data:
                        zipf.writestr(f"visualizations/{viz_name}.json", json.dumps(viz_data, indent=2))
        
        return zip_buffer.getvalue()

    def _render_html_template(self, evidence_data: Dict[str, Any], template_path: Optional[str]) -> str:
        """Render HTML template with evidence data."""
        # This is a simplified HTML template
        # In production, use Jinja2 or similar template engine
        
        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Model Card Evidence Pack</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .section { margin-bottom: 30px; }
                .metric { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
                .status-healthy { color: #28a745; }
                .status-warning { color: #ffc107; }
                .status-danger { color: #dc3545; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Model Card Evidence Pack</h1>
                <p>Generated: {generated_at}</p>
                <p>Model: {model_name} v{model_version}</p>
            </div>
            
            <div class="section">
                <h2>Summary</h2>
                <div class="metric">
                    <strong>Overall Status:</strong> <span class="status-{status_class}">{overall_status}</span>
                </div>
                <div class="metric">
                    <strong>Fairness Score:</strong> {fairness_score:.3f}
                </div>
            </div>
            
            {sections_html}
        </body>
        </html>
        """
        
        # Generate sections HTML
        sections_html = ""
        if "fairness" in evidence_data:
            sections_html += self._generate_fairness_html(evidence_data["fairness"])
        
        if "performance" in evidence_data:
            sections_html += self._generate_performance_html(evidence_data["performance"])
        
        if "compliance" in evidence_data:
            sections_html += self._generate_compliance_html(evidence_data["compliance"])
        
        # Fill template
        html_content = html_template.format(
            generated_at=evidence_data["metadata"]["generated_at"],
            model_name=evidence_data.get("model_card", {}).get("name", "Unknown"),
            model_version=evidence_data.get("model_card", {}).get("version", "Unknown"),
            status_class=evidence_data.get("summary", {}).get("overall_status", "healthy"),
            overall_status=evidence_data.get("summary", {}).get("overall_status", "Healthy"),
            fairness_score=evidence_data.get("model_card", {}).get("fairness_score", 0),
            sections_html=sections_html
        )
        
        return html_content

    def _generate_fairness_html(self, fairness_data: Dict[str, Any]) -> str:
        """Generate fairness section HTML."""
        html = """
        <div class="section">
            <h2>Fairness Assessment</h2>
            <div class="metric">
                <strong>Overall Fairness Score:</strong> {score:.3f}
            </div>
            <h3>Metrics</h3>
            {metrics_html}
        </div>
        """
        
        metrics_html = ""
        for metric in fairness_data.get("metrics", []):
            status_class = "healthy" if metric["status"] == "pass" else "danger"
            metrics_html += f"""
            <div class="metric">
                <strong>{metric["metric_name"]}:</strong> {metric["value"]:.3f}
                <span class="status-{status_class}">({metric["status"]})</span>
            </div>
            """
        
        return html.format(score=fairness_data.get("overall_fairness_score", 0), metrics_html=metrics_html)

    def _generate_performance_html(self, performance_data: Dict[str, Any]) -> str:
        """Generate performance section HTML."""
        html = """
        <div class="section">
            <h2>Performance Assessment</h2>
            <h3>Metrics</h3>
            {metrics_html}
        </div>
        """
        
        metrics_html = ""
        for metric in performance_data.get("metrics", []):
            metrics_html += f"""
            <div class="metric">
                <strong>{metric["metric_name"]}:</strong> {metric["value"]:.3f} {metric["unit"]}
            </div>
            """
        
        return html.format(metrics_html=metrics_html)

    def _generate_compliance_html(self, compliance_data: Dict[str, Any]) -> str:
        """Generate compliance section HTML."""
        html = """
        <div class="section">
            <h2>Compliance Assessment</h2>
            <div class="metric">
                <strong>Compliance Rate:</strong> {rate:.1f}%
            </div>
            <h3>Frameworks</h3>
            {frameworks_html}
        </div>
        """
        
        frameworks_html = ""
        for record in compliance_data.get("records", []):
            status_class = "healthy" if record["status"] == "compliant" else "warning"
            frameworks_html += f"""
            <div class="metric">
                <strong>{record["framework"]}:</strong> {record["status"]}
                <span class="status-{status_class}"></span>
            </div>
            """
        
        return html.format(rate=compliance_data.get("compliance_rate", 0), frameworks_html=frameworks_html)

    def _apply_branding(self, evidence_data: Dict[str, Any], branding_config: Dict[str, Any]) -> Dict[str, Any]:
        """Apply branding to evidence data."""
        evidence_data["branding"] = branding_config
        
        # Apply branding to visualizations
        if "visualizations" in evidence_data:
            for viz_name, viz_data in evidence_data["visualizations"].items():
                if isinstance(viz_data, dict):
                    viz_data["branding"] = branding_config
        
        return evidence_data

    def _serialize_model_card(self, model_card_obj: ModelCard) -> Dict[str, Any]:
        """Serialize model card object."""
        return {
            "id": str(model_card_obj.id),
            "name": model_card_obj.name,
            "version": model_card_obj.version,
            "description": model_card_obj.description,
            "domain": model_card_obj.domain,
            "risk_tier": model_card_obj.risk_tier,
            "status": model_card_obj.status,
            "fairness_score": float(model_card_obj.fairness_score),
            "created_at": model_card_obj.created_at.isoformat() if model_card_obj.created_at else None,
            "updated_at": model_card_obj.updated_at.isoformat() if model_card_obj.updated_at else None,
            "contact_email": model_card_obj.contact_email,
            "tags": model_card_obj.tags or [],
            "metadata": model_card_obj.model_metadata
        }

    def _calculate_fairness_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate fairness risk score."""
        model_card_obj = db.query(ModelCard).filter(ModelCard.id == model_card_id).first()
        if not model_card_obj:
            return 0.5
        
        return 1.0 - float(model_card_obj.fairness_score)

    def _calculate_performance_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate performance risk score."""
        performance_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.model_card_id == model_card_id
        ).all()
        
        if not performance_metrics:
            return 0.5
        
        avg_performance = sum(float(metric.value) for metric in performance_metrics) / len(performance_metrics)
        return 1.0 - avg_performance

    def _calculate_compliance_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate compliance risk score."""
        compliance_records = db.query(ModelCompliance).filter(
            ModelCompliance.model_card_id == model_card_id
        ).all()
        
        if not compliance_records:
            return 0.5
        
        non_compliant = sum(1 for record in compliance_records if record.status != "compliant")
        return non_compliant / len(compliance_records)

    def _calculate_operational_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate operational risk score."""
        # Simplified operational risk calculation
        return 0.3

    def _generate_risk_mitigation_strategies(self, risk_factors: Dict[str, float], risk_level: str) -> List[str]:
        """Generate risk mitigation strategies."""
        strategies = []
        
        if risk_factors["fairness_risk"] > 0.5:
            strategies.append("Implement bias detection and mitigation techniques")
            strategies.append("Conduct regular fairness assessments")
        
        if risk_factors["performance_risk"] > 0.5:
            strategies.append("Optimize model performance through hyperparameter tuning")
            strategies.append("Implement model retraining pipeline")
        
        if risk_factors["compliance_risk"] > 0.5:
            strategies.append("Address compliance gaps and update documentation")
            strategies.append("Schedule regular compliance reviews")
        
        if risk_factors["operational_risk"] > 0.5:
            strategies.append("Implement monitoring and alerting systems")
            strategies.append("Create backup and recovery procedures")
        
        return strategies

    def _generate_fairness_summary(self, metrics: List[Dict], assessments: List[Dict]) -> str:
        """Generate fairness summary."""
        if not metrics:
            return "No fairness metrics available"
        
        avg_score = sum(m["value"] for m in metrics) / len(metrics)
        passing_metrics = sum(1 for m in metrics if m["status"] == "pass")
        
        return f"Average fairness score: {avg_score:.3f}. {passing_metrics}/{len(metrics)} metrics passing thresholds."

    def _generate_performance_summary(self, metrics: List[Dict], assessments: List[Dict]) -> str:
        """Generate performance summary."""
        if not metrics:
            return "No performance metrics available"
        
        avg_score = sum(m["value"] for m in metrics) / len(metrics)
        
        return f"Average performance score: {avg_score:.3f} across {len(metrics)} metrics."

    def _get_zip_file_list(self, include_sections: Dict[str, bool]) -> List[str]:
        """Get list of files that will be included in ZIP."""
        files = ["evidence_pack.json"]
        
        for section, include in include_sections.items():
            if include and section != "metadata":
                files.append(f"{section}.json")
        
        return files

    def _create_pdf_file(self, evidence_data: Dict[str, Any]) -> bytes:
        """Create PDF file from evidence data."""
        # This would use a PDF generation library like ReportLab or WeasyPrint
        # For now, return HTML content
        html_content = self._render_html_template(evidence_data, None)
        return html_content.encode('utf-8')


# Import required modules
import io
from datetime import timedelta

evidence_pack_generator = EvidencePackGenerator()