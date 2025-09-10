from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import structlog
from jinja2 import Template
import base64
import os

logger = structlog.get_logger()

class FairnessReportGenerator:
    """Service for generating comprehensive fairness assessment reports."""
    
    def __init__(self):
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Template]:
        """Load report templates."""
        templates = {}
        
        # HTML template for interactive reports
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ report.title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .metric-card {
            border-left: 4px solid;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .metric-pass {
            border-left-color: #28a745;
            background-color: #f8fff9;
        }
        .metric-fail {
            border-left-color: #dc3545;
            background-color: #fff8f8;
        }
        .risk-high {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        .risk-medium {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
        }
        .risk-low {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        .executive-summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .score-badge {
            font-size: 2rem;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 50px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <!-- Executive Summary -->
        <div class="executive-summary">
            <h1>{{ report.title }}</h1>
            <p class="lead">{{ report.subtitle }}</p>
            <div class="row mt-4">
                <div class="col-md-3">
                    <h4>Overall Fairness Score</h4>
                    <div class="score-badge {% if report.overall_fairness_score >= 0.9 %}bg-success{% elif report.overall_fairness_score >= 0.7 %}bg-warning{% else %}bg-danger{% endif %}">
                        {{ "%.2f"|format(report.overall_fairness_score * 100) }}%
                    </div>
                </div>
                <div class="col-md-3">
                    <h4>Pass Rate</h4>
                    <div class="score-badge {% if report.pass_rate >= 0.8 %}bg-success{% elif report.pass_rate >= 0.6 %}bg-warning{% else %}bg-danger{% endif %}">
                        {{ "%.1f"|format(report.pass_rate * 100) }}%
                    </div>
                </div>
                <div class="col-md-3">
                    <h4>Risk Level</h4>
                    <div class="score-badge risk-{{ report.risk_level }}">
                        {{ report.risk_level|title }}
                    </div>
                </div>
                <div class="col-md-3">
                    <h4>Assessment Date</h4>
                    <p>{{ report.assessment_date }}</p>
                </div>
            </div>
        </div>

        <!-- Key Findings -->
        <div class="row mb-4">
            <div class="col-12">
                <h2>Key Findings</h2>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body text-center">
                                <h3 class="card-title">{{ report.total_metrics }}</h3>
                                <p class="card-text">Total Metrics Evaluated</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body text-center">
                                <h3 class="card-title text-success">{{ report.passed_metrics }}</h3>
                                <p class="card-text">Metrics Passed</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body text-center">
                                <h3 class="card-title text-danger">{{ report.failed_metrics }}</h3>
                                <p class="card-text">Metrics Failed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5>Metric Pass/Fail Distribution</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="passFailChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5>Fairness Scores by Protected Attribute</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="attributeChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Metrics -->
        <div class="row mb-4">
            <div class="col-12">
                <h2>Detailed Fairness Metrics</h2>
                {% for metric in report.detailed_metrics %}
                <div class="metric-card {% if metric.passed %}metric-pass{% else %}metric-fail{% endif %}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>{{ metric.metric_name|replace('_', ' ')|title }}</h5>
                            <p class="mb-1"><strong>Protected Attribute:</strong> {{ metric.protected_attribute }}</p>
                            <p class="mb-1"><strong>Value:</strong> {{ "%.4f"|format(metric.metric_value) }}</p>
                            <p class="mb-1"><strong>Threshold:</strong> {{ "%.4f"|format(metric.threshold_value) }}</p>
                        </div>
                        <div class="text-right">
                            <span class="badge {% if metric.passed %}bg-success{% else %}bg-danger{% endif %}">
                                {% if metric.passed %}PASS{% else %}FAIL{% endif %}
                            </span>
                        </div>
                    </div>
                    {% if not metric.passed %}
                    <div class="mt-2">
                        <small class="text-danger">{{ metric.failure_reason or 'Threshold exceeded' }}</small>
                    </div>
                    {% endif %}
                </div>
                {% endfor %}
            </div>
        </div>

        <!-- Risk Assessment -->
        <div class="row mb-4">
            <div class="col-12">
                <h2>Risk Assessment</h2>
                <div class="alert alert-{{ report.risk_level }} role="alert">
                    <h4 class="alert-heading">{{ report.risk_level|title }} Risk</h4>
                    <p>{{ report.risk_description }}</p>
                    <hr>
                    <h5>Key Risk Factors:</h5>
                    <ul>
                        {% for factor in report.risk_factors %}
                        <li>{{ factor }}</li>
                        {% endfor %}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="row mb-4">
            <div class="col-12">
                <h2>Recommendations</h2>
                {% for rec in report.recommendations %}
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5 class="card-title">{{ rec.title }}</h5>
                                <p class="card-text">{{ rec.description }}</p>
                            </div>
                            <div>
                                <span class="badge bg-{{ rec.priority }} text-white">{{ rec.priority|title }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>

        <!-- Appendix -->
        <div class="row mb-4">
            <div class="col-12">
                <h2>Technical Appendix</h2>
                <div class="card">
                    <div class="card-body">
                        <h5>Assessment Configuration</h5>
                        <p><strong>Model:</strong> {{ report.model_name }} (v{{ report.model_version }})</p>
                        <p><strong>Assessment ID:</strong> {{ report.assessment_id }}</p>
                        <p><strong>Confidence Level:</strong> {{ "%.1f"|format(report.confidence_level * 100) }}%</p>
                        <p><strong>Test Size:</strong> {{ "%.1f"|format(report.test_size * 100) }}%</p>
                        
                        <h5 class="mt-3">Protected Attributes</h5>
                        <ul>
                            {% for attr in report.protected_attributes %}
                            <li><strong>{{ attr.name }}:</strong> Privileged groups: {{ attr.privileged_groups|join(', ') }}, Unprivileged groups: {{ attr.unprivileged_groups|join(', ') }}</li>
                            {% endfor %}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Pass/Fail Distribution Chart
        const passFailCtx = document.getElementById('passFailChart').getContext('2d');
        new Chart(passFailCtx, {
            type: 'pie',
            data: {
                labels: ['Passed', 'Failed'],
                datasets: [{
                    data: [{{ report.passed_metrics }}, {{ report.failed_metrics }}],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Attribute Fairness Scores Chart
        const attributeCtx = document.getElementById('attributeChart').getContext('2d');
        new Chart(attributeCtx, {
            type: 'bar',
            data: {
                labels: {{ report.attribute_labels|tojson }},
                datasets: [{
                    label: 'Fairness Score',
                    data: {{ report.attribute_scores|tojson }},
                    backgroundColor: '#007bff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });
    </script>
</body>
</html>
        """
        
        templates['html'] = Template(html_template)
        
        # JSON template for API responses
        json_template = """
{
    "report_metadata": {
        "id": "{{ report.id }}",
        "title": "{{ report.title }}",
        "subtitle": "{{ report.subtitle }}",
        "report_type": "{{ report.report_type }}",
        "generated_at": "{{ report.generated_at }}",
        "assessment_id": "{{ report.assessment_id }}",
        "model_name": "{{ report.model_name }}",
        "model_version": "{{ report.model_version }}"
    },
    "executive_summary": {
        "overall_fairness_score": {{ report.overall_fairness_score }},
        "pass_rate": {{ report.pass_rate }},
        "risk_level": "{{ report.risk_level }}",
        "total_metrics": {{ report.total_metrics }},
        "passed_metrics": {{ report.passed_metrics }},
        "failed_metrics": {{ report.failed_metrics }},
        "assessment_date": "{{ report.assessment_date }}"
    },
    "detailed_metrics": {{ report.detailed_metrics|tojson }},
    "risk_assessment": {
        "risk_level": "{{ report.risk_level }}",
        "risk_description": "{{ report.risk_description }}",
        "risk_factors": {{ report.risk_factors|tojson }}
    },
    "recommendations": {{ report.recommendations|tojson }},
    "technical_appendix": {
        "protected_attributes": {{ report.protected_attributes|tojson }},
        "confidence_level": {{ report.confidence_level }},
        "test_size": {{ report.test_size }},
        "threshold_configurations": {{ report.threshold_configurations|tojson }}
    }
}
        """
        
        templates['json'] = Template(json_template)
        
        return templates
    
    def generate_report(self, assessment_data: Dict[str, Any], report_type: str = "html") -> str:
        """Generate a fairness assessment report."""
        try:
            # Prepare report data
            report_data = self._prepare_report_data(assessment_data)
            
            # Generate report based on type
            if report_type == "html":
                return self._generate_html_report(report_data)
            elif report_type == "json":
                return self._generate_json_report(report_data)
            else:
                raise ValueError(f"Unsupported report type: {report_type}")
                
        except Exception as e:
            logger.error(f"Failed to generate report: {str(e)}")
            raise
    
    def _prepare_report_data(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare data for report generation."""
        summary_stats = assessment_data.get('summary_statistics', {})
        detailed_metrics = assessment_data.get('detailed_metrics', [])
        risk_assessment = assessment_data.get('risk_assessment', {})
        recommendations = assessment_data.get('recommendations', [])
        
        # Calculate pass rate
        total_metrics = summary_stats.get('total_metrics', 0)
        passed_metrics = summary_stats.get('passed_metrics', 0)
        pass_rate = passed_metrics / total_metrics if total_metrics > 0 else 0.0
        
        # Extract attribute scores
        attribute_scores = {}
        for metric in detailed_metrics:
            attr = metric.get('protected_attribute')
            if attr not in attribute_scores:
                attribute_scores[attr] = []
            attribute_scores[attr].append(metric.get('metric_score', 0.0))
        
        # Calculate average scores by attribute
        avg_attribute_scores = {
            attr: sum(scores) / len(scores) 
            for attr, scores in attribute_scores.items()
        }
        
        # Determine risk level and description
        risk_level = risk_assessment.get('risk_level', 'medium')
        risk_descriptions = {
            'low': 'The model demonstrates good fairness characteristics with minimal bias detected.',
            'medium': 'The model shows some fairness concerns that should be monitored and addressed.',
            'high': 'The model exhibits significant fairness issues that require immediate attention.'
        }
        
        # Prepare report data
        report_data = {
            'id': assessment_data.get('assessment_metadata', {}).get('assessment_id', ''),
            'title': f"Fairness Assessment Report - {assessment_data.get('assessment_metadata', {}).get('model_name', 'Unknown Model')}",
            'subtitle': f"Assessment conducted on {datetime.now().strftime('%B %d, %Y')}",
            'report_type': 'comprehensive',
            'generated_at': datetime.now().isoformat(),
            'assessment_id': assessment_data.get('assessment_metadata', {}).get('assessment_id', ''),
            'model_name': assessment_data.get('assessment_metadata', {}).get('model_name', 'Unknown'),
            'model_version': assessment_data.get('assessment_metadata', {}).get('model_version', 'Unknown'),
            'overall_fairness_score': summary_stats.get('average_fairness_score', 0.0),
            'pass_rate': pass_rate,
            'risk_level': risk_level,
            'total_metrics': total_metrics,
            'passed_metrics': passed_metrics,
            'failed_metrics': total_metrics - passed_metrics,
            'assessment_date': datetime.now().strftime('%Y-%m-%d'),
            'detailed_metrics': detailed_metrics,
            'risk_description': risk_descriptions.get(risk_level, ''),
            'risk_factors': risk_assessment.get('factors', []),
            'recommendations': recommendations,
            'protected_attributes': assessment_data.get('protected_attributes', []),
            'confidence_level': assessment_data.get('confidence_level', 0.95),
            'test_size': assessment_data.get('test_size', 0.2),
            'threshold_configurations': assessment_data.get('fairness_thresholds', []),
            'attribute_labels': list(avg_attribute_scores.keys()),
            'attribute_scores': list(avg_attribute_scores.values())
        }
        
        return report_data
    
    def _generate_html_report(self, report_data: Dict[str, Any]) -> str:
        """Generate HTML report."""
        template = self.templates['html']
        return template.render(report=report_data)
    
    def _generate_json_report(self, report_data: Dict[str, Any]) -> str:
        """Generate JSON report."""
        template = self.templates['json']
        return template.render(report=report_data)
    
    def generate_executive_summary(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate executive summary for dashboard display."""
        summary_stats = assessment_data.get('summary_statistics', {})
        risk_assessment = assessment_data.get('risk_assessment', {})
        
        return {
            'overall_fairness_score': summary_stats.get('average_fairness_score', 0.0),
            'pass_rate': summary_stats.get('pass_rate', 0.0),
            'risk_level': risk_assessment.get('risk_level', 'medium'),
            'total_metrics': summary_stats.get('total_metrics', 0),
            'failed_metrics': summary_stats.get('failed_metrics', 0),
            'key_recommendations': assessment_data.get('recommendations', [])[:3],  # Top 3 recommendations
            'last_assessment': datetime.now().isoformat()
        }
    
    def generate_dashboard_data(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate data for dashboard visualization."""
        detailed_metrics = assessment_data.get('detailed_metrics', [])
        
        # Prepare chart data
        pass_fail_data = {
            'labels': ['Passed', 'Failed'],
            'data': [
                sum(1 for m in detailed_metrics if m.get('passed', False)),
                sum(1 for m in detailed_metrics if not m.get('passed', False))
            ]
        }
        
        # Metrics by type
        metrics_by_type = {}
        for metric in detailed_metrics:
            metric_type = metric.get('metric_name', 'Unknown')
            if metric_type not in metrics_by_type:
                metrics_by_type[metric_type] = []
            metrics_by_type[metric_type].append(metric.get('metric_value', 0.0))
        
        metrics_distribution = {
            'labels': list(metrics_by_type.keys()),
            'data': [np.mean(scores) for scores in metrics_by_type.values()]
        }
        
        return {
            'pass_fail_distribution': pass_fail_data,
            'metrics_distribution': metrics_distribution,
            'overall_score': assessment_data.get('summary_statistics', {}).get('average_fairness_score', 0.0),
            'total_assessments': 1  # This would be aggregated across multiple assessments
        }