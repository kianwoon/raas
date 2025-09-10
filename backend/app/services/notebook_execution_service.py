import asyncio
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path
import structlog
from app.models.diagnosis_assessment import DiagnosisAssessment, DiagnosisAssessmentStatus
from app.models.job import Job, JobStatus
from app.core.database import get_db
from app.services.minio_service import MinioService
from app.services.job_service import JobService

logger = structlog.get_logger()

class NotebookExecutionService:
    """Service for executing Jupyter notebooks for diagnosis assessment."""
    
    def __init__(self):
        self.minio_service = MinioService()
        self.job_service = JobService()
        
    async def execute_diagnosis_notebook(self, job_id: uuid.UUID, db) -> None:
        """Execute diagnosis assessment notebook."""
        try:
            # Get job and assessment
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                raise ValueError(f"Job {job_id} not found")
            
            assessment_id = job.parameters.get('assessment_id')
            assessment = db.query(DiagnosisAssessment).filter(
                DiagnosisAssessment.id == assessment_id
            ).first()
            
            if not assessment:
                raise ValueError(f"Assessment {assessment_id} not found")
            
            # Update job status
            job.status = JobStatus.RUNNING
            job.started_at = datetime.utcnow()
            db.commit()
            
            logger.info(f"Starting diagnosis notebook execution", 
                       job_id=job_id, assessment_id=assessment_id)
            
            # Get notebook template
            notebook_template = assessment.notebook_template
            if not notebook_template:
                raise ValueError("Notebook template not specified")
            
            # Prepare notebook parameters
            notebook_params = self._prepare_notebook_parameters(assessment, job.parameters)
            
            # Execute notebook (this would be implemented with actual Jupyter execution)
            result = await self._execute_jupyter_notebook(
                notebook_template=notebook_template,
                parameters=notebook_params,
                job_id=job_id
            )
            
            # Process results
            if result['success']:
                await self._process_successful_execution(assessment, result, db)
                job.status = JobStatus.COMPLETED
                job.progress = 100
                job.completed_at = datetime.utcnow()
                
                # Store artifact URLs
                if result.get('artifacts'):
                    job.artifact_urls = result['artifacts']
                    job.artifact_metadata = result.get('artifact_metadata', {})
            else:
                await self._process_failed_execution(assessment, result, db)
                job.status = JobStatus.FAILED
                job.error_message = result.get('error', 'Unknown error')
                job.completed_at = datetime.utcnow()
            
            db.commit()
            
            logger.info(f"Completed diagnosis notebook execution", 
                       job_id=job_id, success=result['success'])
            
        except Exception as e:
            logger.error(f"Failed to execute diagnosis notebook: {e}", exc_info=True)
            
            # Update job status to failed
            if 'job' in locals():
                job.status = JobStatus.FAILED
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise
    
    def _prepare_notebook_parameters(self, assessment: DiagnosisAssessment, job_parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare parameters for notebook execution."""
        params = {
            'assessment_id': str(assessment.id),
            'model_name': assessment.model_name,
            'model_version': assessment.model_version,
            'diagnosis_types': assessment.diagnosis_types,
            'performance_metrics': assessment.performance_metrics,
            'drift_detection_config': assessment.drift_detection_config,
            'explainability_config': assessment.explainability_config,
            'test_size': assessment.test_size,
            'random_seed': assessment.random_seed,
            'confidence_level': assessment.confidence_level,
            'drift_threshold': assessment.drift_threshold,
            'drift_significance_level': assessment.drift_significance_level,
            'explainability_samples': assessment.explainability_samples,
            'explainability_background_size': assessment.explainability_background_size,
        }
        
        # Add data source information
        if assessment.data_source_id:
            params['data_source_id'] = str(assessment.data_source_id)
        
        if assessment.baseline_data_source_id:
            params['baseline_data_source_id'] = str(assessment.baseline_data_source_id)
        
        if assessment.data_query:
            params['data_query'] = assessment.data_query
        
        # Add notebook-specific parameters
        if assessment.notebook_parameters:
            params.update(assessment.notebook_parameters)
        
        # Add job-specific parameters
        params.update(job_parameters)
        
        return params
    
    async def _execute_jupyter_notebook(self, notebook_template: str, parameters: Dict[str, Any], 
                                       job_id: uuid.UUID) -> Dict[str, Any]:
        """Execute Jupyter notebook with given parameters."""
        """
        This is a mock implementation. In a real system, you would:
        1. Use Jupyter API or papermill to execute the notebook
        2. Handle notebook execution asynchronously
        3. Monitor execution progress
        4. Handle errors and timeouts
        5. Extract results from notebook output
        """
        
        try:
            # Mock execution - in real implementation, this would execute actual notebook
            await asyncio.sleep(2)  # Simulate execution time
            
            # Mock successful execution with sample results
            return {
                'success': True,
                'artifacts': {
                    'notebook_output': f'notebooks/outputs/{job_id}_output.ipynb',
                    'metrics': f'notebooks/outputs/{job_id}_metrics.json',
                    'visualizations': f'notebooks/outputs/{job_id}_visualizations.html'
                },
                'artifact_metadata': {
                    'execution_time': 2.0,
                    'cells_executed': 15,
                    'notebook_version': '1.0.0'
                },
                'results': {
                    'performance_metrics': self._generate_mock_performance_metrics(),
                    'drift_results': self._generate_mock_drift_results(),
                    'explainability_results': self._generate_mock_explainability_results()
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_mock_performance_metrics(self) -> List[Dict[str, Any]]:
        """Generate mock performance metrics for testing."""
        return [
            {
                'metric_name': 'accuracy',
                'metric_type': 'accuracy',
                'dataset_type': 'test',
                'metric_value': 0.875,
                'baseline_value': 0.890,
                'threshold_min': 0.800,
                'threshold_max': 1.0,
                'passed': True,
                'degradation_detected': True,
                'sample_size': 1000,
                'confidence_interval': {'lower': 0.852, 'upper': 0.898}
            },
            {
                'metric_name': 'precision',
                'metric_type': 'precision',
                'dataset_type': 'test',
                'metric_value': 0.843,
                'baseline_value': 0.867,
                'threshold_min': 0.750,
                'threshold_max': 1.0,
                'passed': True,
                'degradation_detected': True,
                'sample_size': 1000,
                'confidence_interval': {'lower': 0.816, 'upper': 0.870}
            },
            {
                'metric_name': 'recall',
                'metric_type': 'recall',
                'dataset_type': 'test',
                'metric_value': 0.892,
                'baseline_value': 0.901,
                'threshold_min': 0.800,
                'threshold_max': 1.0,
                'passed': True,
                'degradation_detected': False,
                'sample_size': 1000,
                'confidence_interval': {'lower': 0.868, 'upper': 0.916}
            },
            {
                'metric_name': 'f1_score',
                'metric_type': 'f1_score',
                'dataset_type': 'test',
                'metric_value': 0.867,
                'baseline_value': 0.883,
                'threshold_min': 0.800,
                'threshold_max': 1.0,
                'passed': True,
                'degradation_detected': True,
                'sample_size': 1000,
                'confidence_interval': {'lower': 0.842, 'upper': 0.892}
            },
            {
                'metric_name': 'auc_roc',
                'metric_type': 'auc_roc',
                'dataset_type': 'test',
                'metric_value': 0.923,
                'baseline_value': 0.931,
                'threshold_min': 0.850,
                'threshold_max': 1.0,
                'passed': True,
                'degradation_detected': True,
                'sample_size': 1000,
                'confidence_interval': {'lower': 0.902, 'upper': 0.944}
            }
        ]
    
    def _generate_mock_drift_results(self) -> List[Dict[str, Any]]:
        """Generate mock drift detection results for testing."""
        return [
            {
                'feature_name': 'age',
                'drift_type': 'psi',
                'dataset_type': 'production',
                'drift_score': 0.234,
                'drift_threshold': 0.100,
                'p_value': 0.012,
                'drift_detected': True,
                'drift_severity': 'medium',
                'drift_direction': 'distributional',
                'baseline_stats': {'mean': 45.2, 'std': 12.3, 'min': 18, 'max': 80},
                'current_stats': {'mean': 42.8, 'std': 11.9, 'min': 16, 'max': 78},
                'feature_type': 'numerical',
                'sample_size_baseline': 10000,
                'sample_size_current': 5000
            },
            {
                'feature_name': 'income',
                'drift_type': 'psi',
                'dataset_type': 'production',
                'drift_score': 0.156,
                'drift_threshold': 0.100,
                'p_value': 0.045,
                'drift_detected': True,
                'drift_severity': 'low',
                'drift_direction': 'distributional',
                'baseline_stats': {'mean': 65000, 'std': 25000, 'min': 20000, 'max': 150000},
                'current_stats': {'mean': 68000, 'std': 23000, 'min': 18000, 'max': 140000},
                'feature_type': 'numerical',
                'sample_size_baseline': 10000,
                'sample_size_current': 5000
            },
            {
                'feature_name': 'gender',
                'drift_type': 'chi_square',
                'dataset_type': 'production',
                'drift_score': 0.087,
                'drift_threshold': 0.100,
                'p_value': 0.234,
                'drift_detected': False,
                'drift_severity': 'low',
                'drift_direction': 'stable',
                'baseline_stats': {'male': 0.52, 'female': 0.48},
                'current_stats': {'male': 0.54, 'female': 0.46},
                'feature_type': 'categorical',
                'sample_size_baseline': 10000,
                'sample_size_current': 5000
            }
        ]
    
    def _generate_mock_explainability_results(self) -> List[Dict[str, Any]]:
        """Generate mock explainability results for testing."""
        return [
            {
                'method': 'shap',
                'feature_name': None,
                'instance_id': None,
                'explanation_score': None,
                'feature_importance': {
                    'age': 0.234,
                    'income': 0.198,
                    'credit_score': 0.176,
                    'debt_to_income': 0.145,
                    'employment_length': 0.098,
                    'loan_amount': 0.087,
                    'interest_rate': 0.062
                },
                'key_insights': [
                    'Age and income are the most influential features',
                    'Credit score has moderate impact on predictions',
                    'Debt-to-income ratio is a key factor in loan decisions'
                ],
                'interpretation': 'The model relies heavily on demographic and financial features',
                'recommendations': [
                    'Monitor age and income features for fairness',
                    'Consider adding more diverse features',
                    'Validate model fairness across different demographic groups'
                ],
                'sample_size': 1000,
                'background_size': 100
            },
            {
                'method': 'lime',
                'feature_name': None,
                'instance_id': 'sample_001',
                'explanation_score': 0.876,
                'feature_importance': {
                    'age': 0.342,
                    'income': 0.289,
                    'credit_score': 0.234,
                    'debt_to_income': 0.135
                },
                'key_insights': [
                    'For this specific instance, age is the dominant factor',
                    'Income level significantly impacts the prediction'
                ],
                'interpretation': 'This prediction is primarily driven by applicant age',
                'recommendations': [
                    'Review similar instances to ensure consistency',
                    'Consider if age-based decisions are appropriate'
                ],
                'sample_size': 1,
                'background_size': 100
            }
        ]
    
    async def _process_successful_execution(self, assessment: DiagnosisAssessment, result: Dict[str, Any], db) -> None:
        """Process successful notebook execution results."""
        try:
            # Update assessment status
            assessment.status = DiagnosisAssessmentStatus.COMPLETED
            assessment.completed_at = datetime.utcnow()
            
            # Process performance metrics
            metrics_data = result['results'].get('performance_metrics', [])
            for metric_data in metrics_data:
                from app.models.diagnosis_assessment import DiagnosisMetric
                metric = DiagnosisMetric(
                    assessment_id=assessment.id,
                    metric_name=metric_data['metric_name'],
                    metric_type=metric_data['metric_type'],
                    dataset_type=metric_data['dataset_type'],
                    metric_value=metric_data['metric_value'],
                    baseline_value=metric_data.get('baseline_value'),
                    confidence_interval=metric_data.get('confidence_interval'),
                    threshold_min=metric_data.get('threshold_min'),
                    threshold_max=metric_data.get('threshold_max'),
                    passed=metric_data['passed'],
                    degradation_detected=metric_data.get('degradation_detected', False),
                    sample_size=metric_data.get('sample_size')
                )
                db.add(metric)
            
            # Process drift results
            drift_data = result['results'].get('drift_results', [])
            drift_detected = False
            for drift_result in drift_data:
                from app.models.diagnosis_assessment import DriftDetection
                drift = DriftDetection(
                    assessment_id=assessment.id,
                    feature_name=drift_result['feature_name'],
                    drift_type=drift_result['drift_type'],
                    dataset_type=drift_result['dataset_type'],
                    drift_score=drift_result['drift_score'],
                    drift_threshold=drift_result['drift_threshold'],
                    p_value=drift_result.get('p_value'),
                    drift_detected=drift_result['drift_detected'],
                    drift_severity=drift_result['drift_severity'],
                    drift_direction=drift_result['drift_direction'],
                    baseline_stats=drift_result.get('baseline_stats'),
                    current_stats=drift_result.get('current_stats'),
                    feature_type=drift_result.get('feature_type'),
                    sample_size_baseline=drift_result.get('sample_size_baseline'),
                    sample_size_current=drift_result.get('sample_size_current')
                )
                db.add(drift)
                if drift_result['drift_detected']:
                    drift_detected = True
            
            # Process explainability results
            explainability_data = result['results'].get('explainability_results', [])
            for exp_result in explainability_data:
                from app.models.diagnosis_assessment import ExplainabilityResult
                explainability = ExplainabilityResult(
                    assessment_id=assessment.id,
                    method=exp_result['method'],
                    feature_name=exp_result.get('feature_name'),
                    instance_id=exp_result.get('instance_id'),
                    explanation_score=exp_result.get('explanation_score'),
                    feature_importance=exp_result.get('feature_importance'),
                    key_insights=exp_result.get('key_insights'),
                    interpretation=exp_result.get('interpretation'),
                    recommendations=exp_result.get('recommendations'),
                    sample_size=exp_result.get('sample_size'),
                    background_size=exp_result.get('background_size')
                )
                db.add(explainability)
            
            # Calculate overall performance score
            if metrics_data:
                passed_metrics = sum(1 for m in metrics_data if m['passed'])
                total_metrics = len(metrics_data)
                assessment.overall_performance_score = passed_metrics / total_metrics if total_metrics > 0 else 0.0
            
            # Update drift detection status
            assessment.drift_detected = drift_detected
            
            # Store explainability insights
            if explainability_data:
                assessment.explainability_insights = {
                    'methods_used': list(set(r['method'] for r in explainability_data)),
                    'key_features': [],
                    'total_insights': 0
                }
                
                for exp_result in explainability_data:
                    if exp_result.get('feature_importance'):
                        top_features = sorted(exp_result['feature_importance'].items(), 
                                            key=lambda x: x[1], reverse=True)[:5]
                        assessment.explainability_insights['key_features'].extend(top_features)
                    if exp_result.get('key_insights'):
                        assessment.explainability_insights['total_insights'] += len(exp_result['key_insights'])
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to process successful execution: {e}", exc_info=True)
            raise
    
    async def _process_failed_execution(self, assessment: DiagnosisAssessment, result: Dict[str, Any], db) -> None:
        """Process failed notebook execution."""
        try:
            # Update assessment status
            assessment.status = DiagnosisAssessmentStatus.FAILED
            assessment.completed_at = datetime.utcnow()
            
            # Store error information
            error_info = {
                'error': result.get('error', 'Unknown error'),
                'timestamp': datetime.utcnow().isoformat(),
                'execution_details': result
            }
            
            if assessment.explainability_insights is None:
                assessment.explainability_insights = {}
            
            assessment.explainability_insights['execution_error'] = error_info
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to process failed execution: {e}", exc_info=True)
            raise
    
    def get_notebook_templates(self) -> List[Dict[str, Any]]:
        """Get available notebook templates."""
        return [
            {
                'id': 'veritas_comprehensive_diagnosis_template.ipynb',
                'name': 'Veritas Comprehensive Diagnosis',
                'description': 'Comprehensive diagnosis notebook for performance, drift, and explainability analysis',
                'diagnosis_types': ['performance', 'drift_detection', 'explainability'],
                'parameters': {
                    'test_size': 0.2,
                    'confidence_level': 0.95,
                    'drift_threshold': 0.1,
                    'explainability_samples': 1000
                }
            },
            {
                'id': 'performance_analysis_template.ipynb',
                'name': 'Performance Analysis',
                'description': 'Performance analysis notebook with detailed metrics',
                'diagnosis_types': ['performance'],
                'parameters': {
                    'test_size': 0.2,
                    'confidence_level': 0.95
                }
            },
            {
                'id': 'drift_detection_template.ipynb',
                'name': 'Drift Detection',
                'description': 'Drift detection notebook with multiple statistical methods',
                'diagnosis_types': ['drift_detection'],
                'parameters': {
                    'drift_threshold': 0.1,
                    'significance_level': 0.05
                }
            },
            {
                'id': 'explainability_analysis_template.ipynb',
                'name': 'Explainability Analysis',
                'description': 'Explainability analysis notebook with SHAP and LIME',
                'diagnosis_types': ['explainability'],
                'parameters': {
                    'explainability_samples': 1000,
                    'background_size': 100
                }
            }
        ]
    
    def validate_notebook_template(self, template_name: str) -> bool:
        """Validate if notebook template exists."""
        templates = self.get_notebook_templates()
        return any(t['id'] == template_name for t in templates)
    
    def get_template_parameters(self, template_name: str) -> Dict[str, Any]:
        """Get default parameters for a notebook template."""
        templates = self.get_notebook_templates()
        for template in templates:
            if template['id'] == template_name:
                return template.get('parameters', {})
        return {}