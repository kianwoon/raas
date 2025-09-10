import asyncio
import json
import time
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pathlib import Path
import structlog
from app.models.diagnosis_assessment import InferenceMonitoring, DiagnosisAssessment
from app.models.diagnosis_assessment import DiagnosisMetric, DriftDetection
from app.core.database import get_db
from app.services.minio_service import MinioService

logger = structlog.get_logger()

class InferenceMonitoringService:
    """Service for real-time model inference monitoring."""
    
    def __init__(self):
        self.minio_service = MinioService()
        self.active_monitors = {}  # Dictionary of active monitoring tasks
        self.monitoring_interval = 60  # seconds
        
    async def start_monitoring(self, monitoring_id: uuid.UUID, db) -> None:
        """Start monitoring for a specific model."""
        try:
            # Get monitoring configuration
            monitoring = db.query(InferenceMonitoring).filter(
                InferenceMonitoring.id == monitoring_id
            ).first()
            
            if not monitoring:
                raise ValueError(f"Monitoring configuration {monitoring_id} not found")
            
            if not monitoring.monitoring_enabled:
                raise ValueError("Monitoring is disabled for this model")
            
            logger.info(f"Starting inference monitoring", 
                       monitoring_id=monitoring_id, model_name=monitoring.model_name)
            
            # Start monitoring task
            task = asyncio.create_task(
                self._monitor_model(monitoring_id, db)
            )
            
            self.active_monitors[monitoring_id] = task
            
        except Exception as e:
            logger.error(f"Failed to start monitoring: {e}", exc_info=True)
            raise
    
    async def stop_monitoring(self, monitoring_id: uuid.UUID) -> None:
        """Stop monitoring for a specific model."""
        try:
            if monitoring_id in self.active_monitors:
                task = self.active_monitors[monitoring_id]
                task.cancel()
                
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                
                del self.active_monitors[monitoring_id]
                
                logger.info(f"Stopped inference monitoring", monitoring_id=monitoring_id)
            else:
                logger.warning(f"Monitoring task not found", monitoring_id=monitoring_id)
                
        except Exception as e:
            logger.error(f"Failed to stop monitoring: {e}", exc_info=True)
            raise
    
    async def _monitor_model(self, monitoring_id: uuid.UUID, db) -> None:
        """Main monitoring loop for a model."""
        try:
            while True:
                # Get monitoring configuration
                monitoring = db.query(InferenceMonitoring).filter(
                    InferenceMonitoring.id == monitoring_id
                ).first()
                
                if not monitoring or not monitoring.monitoring_enabled:
                    logger.info(f"Monitoring disabled or configuration removed", 
                               monitoring_id=monitoring_id)
                    break
                
                # Check if it's time to run monitoring
                current_time = datetime.utcnow()
                if (monitoring.next_check_time and 
                    current_time < monitoring.next_check_time):
                    await asyncio.sleep(30)  # Wait 30 seconds before checking again
                    continue
                
                # Run monitoring check
                await self._run_monitoring_check(monitoring, db)
                
                # Update next check time
                monitoring.next_check_time = current_time + timedelta(seconds=self.monitoring_interval)
                monitoring.last_check_time = current_time
                db.commit()
                
                # Wait for next interval
                await asyncio.sleep(self.monitoring_interval)
                
        except asyncio.CancelledError:
            logger.info(f"Monitoring task cancelled", monitoring_id=monitoring_id)
            raise
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}", exc_info=True)
            # Wait before retrying
            await asyncio.sleep(30)
    
    async def _run_monitoring_check(self, monitoring: InferenceMonitoring, db) -> None:
        """Run a single monitoring check for a model."""
        try:
            logger.info(f"Running monitoring check", 
                       monitoring_id=monitoring.id, model_name=monitoring.model_name)
            
            # Simulate inference monitoring - in real implementation, 
            # this would connect to the model endpoint and collect metrics
            monitoring_data = await self._collect_inference_data(monitoring)
            
            # Update monitoring statistics
            self._update_monitoring_stats(monitoring, monitoring_data, db)
            
            # Check for alerts
            alerts = self._check_alerts(monitoring, monitoring_data)
            
            if alerts:
                await self._send_alerts(monitoring, alerts)
            
            # Store monitoring data
            await self._store_monitoring_data(monitoring, monitoring_data)
            
            logger.info(f"Completed monitoring check", 
                       monitoring_id=monitoring.id, 
                       total_inferences=monitoring_data.get('total_inferences', 0))
            
        except Exception as e:
            logger.error(f"Failed to run monitoring check: {e}", exc_info=True)
    
    async def _collect_inference_data(self, monitoring: InferenceMonitoring) -> Dict[str, Any]:
        """Collect inference data from model endpoint."""
        """
        This is a mock implementation. In a real system, you would:
        1. Make API calls to the model endpoint
        2. Collect inference latency and error rates
        3. Sample input data for drift detection
        4. Collect prediction distributions
        5. Monitor resource usage
        """
        
        # Simulate API call to model endpoint
        await asyncio.sleep(0.1)  # Simulate network latency
        
        # Mock monitoring data
        return {
            'total_inferences': monitoring.total_inferences + 150,  # Simulate 150 new inferences
            'successful_inferences': 145,
            'failed_inferences': 5,
            'average_latency': 0.085,  # 85ms average latency
            'p95_latency': 0.125,  # 125ms P95 latency
            'p99_latency': 0.200,  # 200ms P99 latency
            'error_rate': 0.033,  # 3.3% error rate
            'throughput': 25.0,  # 25 requests per second
            'prediction_distribution': {
                'class_0': 0.65,
                'class_1': 0.35
            },
            'sampled_inputs': [
                {'age': 45, 'income': 75000, 'credit_score': 720},
                {'age': 32, 'income': 58000, 'credit_score': 680},
                {'age': 28, 'income': 92000, 'credit_score': 780}
            ],
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _update_monitoring_stats(self, monitoring: InferenceMonitoring, 
                                data: Dict[str, Any], db) -> None:
        """Update monitoring statistics."""
        try:
            # Update basic statistics
            monitoring.total_inferences = data.get('total_inferences', monitoring.total_inferences)
            monitoring.last_inference_time = datetime.utcnow()
            monitoring.average_latency = data.get('average_latency')
            monitoring.error_rate = data.get('error_rate')
            
            # Update performance metrics
            if 'performance_metrics' not in monitoring.performance_metrics:
                monitoring.performance_metrics = {}
            
            monitoring.performance_metrics.update({
                'p95_latency': data.get('p95_latency'),
                'p99_latency': data.get('p99_latency'),
                'throughput': data.get('throughput'),
                'success_rate': (data.get('successful_inferences', 0) / 
                                 data.get('total_inferences', 1)) * 100
            })
            
            # Store prediction distribution for drift detection
            if 'prediction_distribution' in data:
                if 'prediction_history' not in monitoring.performance_metrics:
                    monitoring.performance_metrics['prediction_history'] = []
                
                monitoring.performance_metrics['prediction_history'].append({
                    'timestamp': data['timestamp'],
                    'distribution': data['prediction_distribution']
                })
                
                # Keep only last 100 predictions
                if len(monitoring.performance_metrics['prediction_history']) > 100:
                    monitoring.performance_metrics['prediction_history'] = (
                        monitoring.performance_metrics['prediction_history'][-100:]
                    )
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to update monitoring stats: {e}", exc_info=True)
    
    def _check_alerts(self, monitoring: InferenceMonitoring, 
                      data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for alert conditions."""
        alerts = []
        
        try:
            alert_thresholds = monitoring.alert_thresholds or {}
            
            # Check error rate
            error_rate = data.get('error_rate', 0)
            if error_rate > alert_thresholds.get('error_rate', 0.05):
                alerts.append({
                    'type': 'error_rate',
                    'severity': 'high',
                    'message': f'High error rate: {error_rate:.1%}',
                    'current_value': error_rate,
                    'threshold': alert_thresholds.get('error_rate', 0.05)
                })
            
            # Check latency
            avg_latency = data.get('average_latency', 0)
            if avg_latency > alert_thresholds.get('latency', 0.5):
                alerts.append({
                    'type': 'latency',
                    'severity': 'medium',
                    'message': f'High latency: {avg_latency*1000:.1f}ms',
                    'current_value': avg_latency,
                    'threshold': alert_thresholds.get('latency', 0.5)
                })
            
            # Check throughput
            throughput = data.get('throughput', 0)
            if throughput < alert_thresholds.get('throughput', 10):
                alerts.append({
                    'type': 'throughput',
                    'severity': 'medium',
                    'message': f'Low throughput: {throughput:.1f} req/s',
                    'current_value': throughput,
                    'threshold': alert_thresholds.get('throughput', 10)
                })
            
            # Check for prediction drift (simple distribution change)
            if 'prediction_distribution' in data:
                prediction_drift = self._calculate_prediction_drift(monitoring, data['prediction_distribution'])
                if prediction_drift > alert_thresholds.get('prediction_drift', 0.1):
                    alerts.append({
                        'type': 'prediction_drift',
                        'severity': 'medium',
                        'message': f'Prediction drift detected: {prediction_drift:.3f}',
                        'current_value': prediction_drift,
                        'threshold': alert_thresholds.get('prediction_drift', 0.1)
                    })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Failed to check alerts: {e}", exc_info=True)
            return []
    
    def _calculate_prediction_drift(self, monitoring: InferenceMonitoring, 
                                   current_distribution: Dict[str, float]) -> float:
        """Calculate prediction distribution drift."""
        try:
            prediction_history = monitoring.performance_metrics.get('prediction_history', [])
            
            if not prediction_history:
                return 0.0
            
            # Get baseline distribution (average of last 10 predictions)
            baseline_distributions = prediction_history[-10:]
            baseline = {}
            
            for hist in baseline_distributions:
                for class_name, prob in hist['distribution'].items():
                    if class_name not in baseline:
                        baseline[class_name] = []
                    baseline[class_name].append(prob)
            
            # Calculate average baseline
            baseline_avg = {
                class_name: sum(probs) / len(probs) 
                for class_name, probs in baseline.items()
            }
            
            # Calculate KL divergence
            drift_score = 0.0
            for class_name in current_distribution:
                if class_name in baseline_avg:
                    p = current_distribution[class_name]
                    q = baseline_avg[class_name]
                    if p > 0 and q > 0:
                        drift_score += p * (p / q)
            
            return drift_score
            
        except Exception as e:
            logger.error(f"Failed to calculate prediction drift: {e}", exc_info=True)
            return 0.0
    
    async def _send_alerts(self, monitoring: InferenceMonitoring, 
                          alerts: List[Dict[str, Any]]) -> None:
        """Send alerts to configured contacts."""
        try:
            logger.info(f"Sending {len(alerts)} alerts", 
                       monitoring_id=monitoring.id, model_name=monitoring.model_name)
            
            # Mock alert sending - in real implementation, this would send emails, 
            # Slack notifications, etc.
            for alert in alerts:
                alert_message = {
                    'monitoring_id': str(monitoring.id),
                    'model_name': monitoring.model_name,
                    'timestamp': datetime.utcnow().isoformat(),
                    'alert': alert
                }
                
                logger.warning(f"Alert triggered", alert_message=alert_message)
                
                # Store alert in monitoring data
                if 'alert_history' not in monitoring.performance_metrics:
                    monitoring.performance_metrics['alert_history'] = []
                
                monitoring.performance_metrics['alert_history'].append(alert_message)
                
                # Keep only last 50 alerts
                if len(monitoring.performance_metrics['alert_history']) > 50:
                    monitoring.performance_metrics['alert_history'] = (
                        monitoring.performance_metrics['alert_history'][-50:]
                    )
            
            # This would be where you integrate with actual notification services
            # await self._send_email_alerts(monitoring, alerts)
            # await self._send_slack_alerts(monitoring, alerts)
            
        except Exception as e:
            logger.error(f"Failed to send alerts: {e}", exc_info=True)
    
    async def _store_monitoring_data(self, monitoring: InferenceMonitoring, 
                                   data: Dict[str, Any]) -> None:
        """Store monitoring data for long-term analysis."""
        try:
            # Create monitoring data record
            monitoring_record = {
                'monitoring_id': str(monitoring.id),
                'model_name': monitoring.model_name,
                'timestamp': data['timestamp'],
                'metrics': {
                    'total_inferences': data.get('total_inferences'),
                    'successful_inferences': data.get('successful_inferences'),
                    'failed_inferences': data.get('failed_inferences'),
                    'average_latency': data.get('average_latency'),
                    'error_rate': data.get('error_rate'),
                    'throughput': data.get('throughput')
                },
                'prediction_distribution': data.get('prediction_distribution'),
                'sampled_inputs': data.get('sampled_inputs', [])
            }
            
            # Store in MinIO or database
            # In real implementation, you would store this in a time-series database
            # or monitoring system like Prometheus/Grafana
            
            logger.debug(f"Stored monitoring data", 
                        monitoring_id=monitoring.id, 
                        timestamp=data['timestamp'])
            
        except Exception as e:
            logger.error(f"Failed to store monitoring data: {e}", exc_info=True)
    
    def get_monitoring_status(self, monitoring_id: uuid.UUID, db) -> Dict[str, Any]:
        """Get current monitoring status."""
        try:
            monitoring = db.query(InferenceMonitoring).filter(
                InferenceMonitoring.id == monitoring_id
            ).first()
            
            if not monitoring:
                return {'error': 'Monitoring configuration not found'}
            
            # Check if monitoring is active
            is_active = monitoring_id in self.active_monitors
            
            status = {
                'monitoring_id': str(monitoring.id),
                'model_name': monitoring.model_name,
                'model_version': monitoring.model_version,
                'monitoring_enabled': monitoring.monitoring_enabled,
                'monitoring_status': monitoring.monitoring_status,
                'is_active': is_active,
                'total_inferences': monitoring.total_inferences,
                'last_inference_time': monitoring.last_inference_time,
                'average_latency': monitoring.average_latency,
                'error_rate': monitoring.error_rate,
                'last_check_time': monitoring.last_check_time,
                'next_check_time': monitoring.next_check_time,
                'performance_metrics': monitoring.performance_metrics or {},
                'alert_thresholds': monitoring.alert_thresholds or {}
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get monitoring status: {e}", exc_info=True)
            return {'error': str(e)}
    
    def get_monitoring_history(self, monitoring_id: uuid.UUID, db, 
                             hours: int = 24) -> Dict[str, Any]:
        """Get monitoring history for a specific time period."""
        try:
            monitoring = db.query(InferenceMonitoring).filter(
                InferenceMonitoring.id == monitoring_id
            ).first()
            
            if not monitoring:
                return {'error': 'Monitoring configuration not found'}
            
            # Mock history data - in real implementation, you would query 
            # your monitoring database or time-series storage
            history = {
                'monitoring_id': str(monitoring.id),
                'model_name': monitoring.model_name,
                'time_range': f"Last {hours} hours",
                'metrics': {
                    'latency_trend': [0.085, 0.082, 0.088, 0.091, 0.087],
                    'error_rate_trend': [0.033, 0.028, 0.035, 0.041, 0.033],
                    'throughput_trend': [25.0, 28.5, 22.3, 30.1, 25.0],
                    'timestamps': [
                        (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                        (datetime.utcnow() - timedelta(hours=3)).isoformat(),
                        (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                        (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                        datetime.utcnow().isoformat()
                    ]
                },
                'alerts': monitoring.performance_metrics.get('alert_history', [])[-10:] if monitoring.performance_metrics else []
            }
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get monitoring history: {e}", exc_info=True)
            return {'error': str(e)}
    
    async def start_all_active_monitors(self, db) -> None:
        """Start monitoring for all active monitoring configurations."""
        try:
            # Get all active monitoring configurations
            active_monitoring = db.query(InferenceMonitoring).filter(
                InferenceMonitoring.monitoring_enabled == True,
                InferenceMonitoring.monitoring_status == "active"
            ).all()
            
            logger.info(f"Starting {len(active_monitoring)} active monitoring tasks")
            
            for monitoring in active_monitoring:
                try:
                    await self.start_monitoring(monitoring.id, db)
                except Exception as e:
                    logger.error(f"Failed to start monitoring for {monitoring.model_name}: {e}", exc_info=True)
                    continue
            
        except Exception as e:
            logger.error(f"Failed to start active monitors: {e}", exc_info=True)
    
    async def stop_all_monitors(self) -> None:
        """Stop all active monitoring tasks."""
        try:
            logger.info(f"Stopping {len(self.active_monitors)} active monitoring tasks")
            
            for monitoring_id in list(self.active_monitors.keys()):
                await self.stop_monitoring(monitoring_id)
            
        except Exception as e:
            logger.error(f"Failed to stop monitors: {e}", exc_info=True)
    
    def get_active_monitors(self) -> List[Dict[str, Any]]:
        """Get list of currently active monitors."""
        try:
            active_monitors = []
            for monitoring_id, task in self.active_monitors.items():
                if not task.done():
                    active_monitors.append({
                        'monitoring_id': str(monitoring_id),
                        'status': 'active'
                    })
            
            return active_monitors
            
        except Exception as e:
            logger.error(f"Failed to get active monitors: {e}", exc_info=True)
            return []