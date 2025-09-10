import json
from typing import Dict, Any, List, Optional
from app.models.diagnosis_assessment import (
    DiagnosisAssessment, 
    DiagnosisMetric, 
    DriftDetection, 
    ExplainabilityResult
)
import structlog

logger = structlog.get_logger()

class VisualizationService:
    """Service for generating visualizations for diagnosis assessment results."""
    
    def __init__(self):
        self.chart_configs = {
            'performance_metrics': {
                'type': 'bar',
                'title': 'Performance Metrics',
                'x_axis': 'metric_name',
                'y_axis': 'metric_value',
                'colors': {
                    'passed': '#28a745',
                    'failed': '#dc3545'
                }
            },
            'drift_detection': {
                'type': 'bar',
                'title': 'Drift Detection Results',
                'x_axis': 'feature_name',
                'y_axis': 'drift_score',
                'threshold_line': 'drift_threshold',
                'colors': {
                    'drifted': '#dc3545',
                    'stable': '#28a745'
                }
            },
            'feature_importance': {
                'type': 'horizontal_bar',
                'title': 'Feature Importance',
                'x_axis': 'importance_score',
                'y_axis': 'feature_name',
                'colors': ['#007bff', '#6610f2', '#e83e8c', '#fd7e14', '#ffc107']
            },
            'performance_comparison': {
                'type': 'line',
                'title': 'Performance Over Time',
                'x_axis': 'timestamp',
                'y_axis': 'performance_score',
                'colors': ['#007bff']
            },
            'drift_heatmap': {
                'type': 'heatmap',
                'title': 'Drift Detection Heatmap',
                'x_axis': 'feature',
                'y_axis': 'time_period',
                'colors': ['#28a745', '#ffc107', '#dc3545']
            }
        }
    
    def generate_performance_metrics_chart(self, assessment: DiagnosisAssessment) -> Dict[str, Any]:
        """Generate performance metrics visualization."""
        try:
            if not hasattr(assessment, 'performance_metrics') or not assessment.performance_metrics:
                return self._empty_chart("performance_metrics")
            
            metrics = assessment.performance_metrics
            chart_data = {
                'chart_type': 'bar',
                'title': 'Performance Metrics',
                'data': {
                    'labels': [m.metric_name for m in metrics],
                    'datasets': [{
                        'label': 'Metric Value',
                        'data': [float(m.metric_value) for m in metrics],
                        'backgroundColor': [
                            '#28a745' if m.passed else '#dc3545' for m in metrics
                        ],
                        'borderColor': [
                            '#1e7e34' if m.passed else '#c82333' for m in metrics
                        ],
                        'borderWidth': 1
                    }]
                },
                'options': {
                    'responsive': True,
                    'plugins': {
                        'legend': {
                            'display': False
                        },
                        'tooltip': {
                            'callbacks': {
                                'label': lambda context: f"{context.parsed.y:.4f}"
                            }
                        }
                    },
                    'scales': {
                        'y': {
                            'beginAtZero': True,
                            'max': 1.0
                        }
                    }
                }
            }
            
            # Add threshold lines if available
            threshold_lines = []
            for metric in metrics:
                if metric.threshold_min is not None:
                    threshold_lines.append({
                        'type': 'line',
                        'yMin': float(metric.threshold_min),
                        'yMax': float(metric.threshold_min),
                        'borderColor': '#ffc107',
                        'borderWidth': 2,
                        'borderDash': [5, 5]
                    })
                if metric.threshold_max is not None:
                    threshold_lines.append({
                        'type': 'line',
                        'yMin': float(metric.threshold_max),
                        'yMax': float(metric.threshold_max),
                        'borderColor': '#ffc107',
                        'borderWidth': 2,
                        'borderDash': [5, 5]
                    })
            
            if threshold_lines:
                chart_data['options']['plugins']['annotation'] = {
                    'annotations': threshold_lines
                }
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Failed to generate performance metrics chart: {e}", exc_info=True)
            return self._error_chart("performance_metrics", str(e))
    
    def generate_drift_detection_chart(self, assessment: DiagnosisAssessment) -> Dict[str, Any]:
        """Generate drift detection visualization."""
        try:
            if not hasattr(assessment, 'drift_results') or not assessment.drift_results:
                return self._empty_chart("drift_detection")
            
            drift_results = assessment.drift_results
            chart_data = {
                'chart_type': 'bar',
                'title': 'Drift Detection Results',
                'data': {
                    'labels': [d.feature_name for d in drift_results],
                    'datasets': [{
                        'label': 'Drift Score',
                        'data': [float(d.drift_score) for d in drift_results],
                        'backgroundColor': [
                            '#dc3545' if d.drift_detected else '#28a745' 
                            for d in drift_results
                        ],
                        'borderColor': [
                            '#c82333' if d.drift_detected else '#1e7e34' 
                            for d in drift_results
                        ],
                        'borderWidth': 1
                    }]
                },
                'options': {
                    'responsive': True,
                    'plugins': {
                        'legend': {
                            'display': False
                        },
                        'tooltip': {
                            'callbacks': {
                                'label': lambda context: f"Drift Score: {context.parsed.y:.3f}"
                            }
                        }
                    },
                    'scales': {
                        'y': {
                            'beginAtZero': True
                        }
                    }
                }
            }
            
            # Add threshold line
            if drift_results:
                threshold = float(drift_results[0].drift_threshold)
                chart_data['options']['plugins']['annotation'] = {
                    'annotations': {
                        'threshold': {
                            'type': 'line',
                            'yMin': threshold,
                            'yMax': threshold,
                            'borderColor': '#ffc107',
                            'borderWidth': 2,
                            'borderDash': [5, 5],
                            'label': {
                                'display': True,
                                'content': f'Threshold: {threshold:.3f}'
                            }
                        }
                    }
                }
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Failed to generate drift detection chart: {e}", exc_info=True)
            return self._error_chart("drift_detection", str(e))
    
    def generate_feature_importance_chart(self, assessment: DiagnosisAssessment) -> Dict[str, Any]:
        """Generate feature importance visualization."""
        try:
            if not hasattr(assessment, 'explainability_results') or not assessment.explainability_results:
                return self._empty_chart("feature_importance")
            
            # Aggregate feature importance from all explainability results
            feature_importance = {}
            for exp_result in assessment.explainability_results:
                if exp_result.feature_importance:
                    for feature, importance in exp_result.feature_importance.items():
                        if feature in feature_importance:
                            feature_importance[feature] += float(importance)
                        else:
                            feature_importance[feature] = float(importance)
            
            # Normalize and sort
            if not feature_importance:
                return self._empty_chart("feature_importance")
            
            # Sort by importance
            sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
            top_features = sorted_features[:10]  # Top 10 features
            
            chart_data = {
                'chart_type': 'horizontal_bar',
                'title': 'Feature Importance',
                'data': {
                    'labels': [f[0] for f in top_features],
                    'datasets': [{
                        'label': 'Importance Score',
                        'data': [f[1] for f in top_features],
                        'backgroundColor': [
                            '#007bff', '#6610f2', '#e83e8c', '#fd7e14', '#ffc107',
                            '#28a745', '#20c997', '#17a2b8', '#6f42c1', '#e83e8c'
                        ][:len(top_features)],
                        'borderWidth': 1
                    }]
                },
                'options': {
                    'responsive': True,
                    'indexAxis': 'y',
                    'plugins': {
                        'legend': {
                            'display': False
                        }
                    },
                    'scales': {
                        'x': {
                            'beginAtZero': True
                        }
                    }
                }
            }
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Failed to generate feature importance chart: {e}", exc_info=True)
            return self._error_chart("feature_importance", str(e))
    
    def generate_performance_timeline(self, assessments: List[DiagnosisAssessment]) -> Dict[str, Any]:
        """Generate performance timeline chart for multiple assessments."""
        try:
            if not assessments:
                return self._empty_chart("performance_timeline")
            
            # Sort by creation date
            sorted_assessments = sorted(assessments, key=lambda a: a.created_at)
            
            chart_data = {
                'chart_type': 'line',
                'title': 'Performance Over Time',
                'data': {
                    'labels': [a.created_at.strftime('%Y-%m-%d') for a in sorted_assessments],
                    'datasets': [{
                        'label': 'Overall Performance Score',
                        'data': [a.overall_performance_score or 0 for a in sorted_assessments],
                        'borderColor': '#007bff',
                        'backgroundColor': 'rgba(0, 123, 255, 0.1)',
                        'fill': True,
                        'tension': 0.4
                    }]
                },
                'options': {
                    'responsive': True,
                    'plugins': {
                        'legend': {
                            'display': False
                        }
                    },
                    'scales': {
                        'y': {
                            'beginAtZero': True,
                            'max': 1.0
                        }
                    }
                }
            }
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Failed to generate performance timeline: {e}", exc_info=True)
            return self._error_chart("performance_timeline", str(e))
    
    def generate_drift_heatmap(self, assessments: List[DiagnosisAssessment]) -> Dict[str, Any]:
        """Generate drift detection heatmap for multiple assessments."""
        try:
            if not assessments:
                return self._empty_chart("drift_heatmap")
            
            # Collect all features and their drift scores over time
            feature_drift_data = {}
            for assessment in assessments:
                if hasattr(assessment, 'drift_results') and assessment.drift_results:
                    for drift_result in assessment.drift_results:
                        feature = drift_result.feature_name
                        if feature not in feature_drift_data:
                            feature_drift_data[feature] = []
                        feature_drift_data[feature].append({
                            'date': assessment.created_at.strftime('%Y-%m-%d'),
                            'drift_score': float(drift_result.drift_score),
                            'drift_detected': drift_result.drift_detected
                        })
            
            if not feature_drift_data:
                return self._empty_chart("drift_heatmap")
            
            # Get unique dates and features
            all_dates = sorted(list(set(
                item['date'] for features in feature_drift_data.values() 
                for item in features
            )))
            all_features = list(feature_drift_data.keys())
            
            # Create heatmap data
            heatmap_data = []
            for feature in all_features:
                feature_data = {'feature': feature}
                for date in all_dates:
                    drift_score = 0
                    drift_detected = False
                    
                    # Find drift score for this feature and date
                    for item in feature_drift_data[feature]:
                        if item['date'] == date:
                            drift_score = item['drift_score']
                            drift_detected = item['drift_detected']
                            break
                    
                    feature_data[date] = drift_score
                
                heatmap_data.append(feature_data)
            
            chart_data = {
                'chart_type': 'heatmap',
                'title': 'Drift Detection Heatmap',
                'data': {
                    'labels': {
                        'x': all_dates,
                        'y': all_features
                    },
                    'datasets': [{
                        'label': 'Drift Score',
                        'data': heatmap_data
                    }]
                },
                'options': {
                    'responsive': True,
                    'plugins': {
                        'legend': {
                            'display': False
                        }
                    },
                    'scales': {
                        'x': {
                            'title': {
                                'display': True,
                                'text': 'Date'
                            }
                        },
                        'y': {
                            'title': {
                                'display': True,
                                'text': 'Features'
                            }
                        }
                    }
                }
            }
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Failed to generate drift heatmap: {e}", exc_info=True)
            return self._error_chart("drift_heatmap", str(e))
    
    def generate_dashboard_config(self, assessment: DiagnosisAssessment) -> Dict[str, Any]:
        """Generate interactive dashboard configuration."""
        try:
            dashboard_config = {
                'title': f'Diagnosis Dashboard - {assessment.model_name}',
                'layout': 'grid',
                'widgets': [
                    {
                        'id': 'overview_stats',
                        'type': 'stats',
                        'title': 'Overview',
                        'metrics': [
                            {'label': 'Overall Performance', 'value': assessment.overall_performance_score or 0, 'format': 'percentage'},
                            {'label': 'Drift Detected', 'value': assessment.drift_detected, 'format': 'boolean'},
                            {'label': 'Status', 'value': assessment.status.value, 'format': 'text'},
                            {'label': 'Duration', 'value': assessment.duration, 'format': 'duration'}
                        ],
                        'position': {'row': 0, 'col': 0, 'width': 12, 'height': 2}
                    },
                    {
                        'id': 'performance_metrics',
                        'type': 'chart',
                        'chart_type': 'performance_metrics',
                        'title': 'Performance Metrics',
                        'position': {'row': 2, 'col': 0, 'width': 6, 'height': 4}
                    },
                    {
                        'id': 'drift_detection',
                        'type': 'chart',
                        'chart_type': 'drift_detection',
                        'title': 'Drift Detection',
                        'position': {'row': 2, 'col': 6, 'width': 6, 'height': 4}
                    },
                    {
                        'id': 'feature_importance',
                        'type': 'chart',
                        'chart_type': 'feature_importance',
                        'title': 'Feature Importance',
                        'position': {'row': 6, 'col': 0, 'width': 6, 'height': 4}
                    },
                    {
                        'id': 'key_insights',
                        'type': 'insights',
                        'title': 'Key Insights',
                        'insights': self._extract_key_insights(assessment),
                        'position': {'row': 6, 'col': 6, 'width': 6, 'height': 4}
                    }
                ]
            }
            
            return dashboard_config
            
        except Exception as e:
            logger.error(f"Failed to generate dashboard config: {e}", exc_info=True)
            return {'error': str(e)}
    
    def _extract_key_insights(self, assessment: DiagnosisAssessment) -> List[Dict[str, Any]]:
        """Extract key insights from assessment results."""
        insights = []
        
        # Performance insights
        if hasattr(assessment, 'performance_metrics') and assessment.performance_metrics:
            total_metrics = len(assessment.performance_metrics)
            passed_metrics = sum(1 for m in assessment.performance_metrics if m.passed)
            
            insights.append({
                'type': 'performance',
                'title': 'Performance Summary',
                'content': f'{passed_metrics} out of {total_metrics} metrics passed thresholds',
                'severity': 'success' if passed_metrics == total_metrics else 'warning'
            })
        
        # Drift insights
        if assessment.drift_detected:
            insights.append({
                'type': 'drift',
                'title': 'Drift Detected',
                'content': 'Data drift detected in model input distribution',
                'severity': 'error'
            })
        
        # Explainability insights
        if hasattr(assessment, 'explainability_results') and assessment.explainability_results:
            total_insights = sum(
                len(r.key_insights) for r in assessment.explainability_results 
                if r.key_insights
            )
            
            if total_insights > 0:
                insights.append({
                    'type': 'explainability',
                    'title': 'Explainability Analysis',
                    'content': f'Generated {total_insights} explainability insights',
                    'severity': 'info'
                })
        
        return insights
    
    def _empty_chart(self, chart_type: str) -> Dict[str, Any]:
        """Generate empty chart placeholder."""
        return {
            'chart_type': 'empty',
            'title': f'{chart_type.replace("_", " ").title()}',
            'data': None,
            'message': 'No data available'
        }
    
    def _error_chart(self, chart_type: str, error: str) -> Dict[str, Any]:
        """Generate error chart."""
        return {
            'chart_type': 'error',
            'title': f'{chart_type.replace("_", " ").title()}',
            'data': None,
            'message': f'Error generating chart: {error}'
        }
    
    def get_chart_config(self, chart_type: str) -> Dict[str, Any]:
        """Get configuration for a specific chart type."""
        return self.chart_configs.get(chart_type, {})


# Create service instance
visualization_service = VisualizationService()