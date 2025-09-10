"""
Alembic migration script for fairness assessment models.
Run this script to create the necessary database tables.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import Enum
import uuid

# revision identifiers
revision = 'add_fairness_assessment_tables'
down_revision = 'initial'
branch_labels = None
depends_on = None

def upgrade():
    """Create fairness assessment tables."""
    
    # Create fairness_assessments table
    op.create_table(
        'fairness_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('status', Enum('pending', 'configuring', 'running', 'completed', 'failed', 'cancelled', name='fairnessassessmentstatus'), nullable=False, default='pending'),
        sa.Column('model_name', sa.String(255), nullable=False),
        sa.Column('model_version', sa.String(100)),
        sa.Column('model_id', postgresql.UUID(as_uuid=True)),
        sa.Column('protected_attributes', sa.JSON, nullable=False),
        sa.Column('reference_groups', sa.JSON),
        sa.Column('target_column', sa.String(255), nullable=False),
        sa.Column('fairness_thresholds', sa.JSON),
        sa.Column('test_size', sa.Float, default=0.2),
        sa.Column('random_seed', sa.Integer),
        sa.Column('confidence_level', sa.Float, default=0.95),
        sa.Column('data_source_id', postgresql.UUID(as_uuid=True)),
        sa.Column('data_query', sa.Text),
        sa.Column('notebook_template', sa.String(255)),
        sa.Column('notebook_parameters', sa.JSON),
        sa.Column('execution_job_id', postgresql.UUID(as_uuid=True)),
        sa.Column('overall_fairness_score', sa.Float),
        sa.Column('results_summary', sa.JSON),
        sa.Column('visualization_config', sa.JSON),
        sa.Column('report_generated', sa.Boolean, default=False),
        sa.Column('report_url', sa.String(500)),
        sa.Column('narrative_summary', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True)),
        sa.ForeignKey('model_cards.id'),
        sa.ForeignKey('data_sources.id'),
        sa.ForeignKey('jobs.id'),
        sa.ForeignKey('users.id'),
        sa.ForeignKey('organizations.id'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create fairness_metrics table
    op.create_table(
        'fairness_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(255), nullable=False),
        sa.Column('metric_type', Enum('demographic_parity', 'equal_opportunity', 'equalized_odds', 'predictive_parity', 'accuracy_parity', 'treatment_equality', 'statistical_parity', 'overall_accuracy', 'auc_roc', 'precision', 'recall', 'f1_score', name='fairnessmetrictype'), nullable=False),
        sa.Column('protected_attribute', sa.String(255), nullable=False),
        sa.Column('metric_value', sa.Numeric(10, 6), nullable=False),
        sa.Column('threshold_value', sa.Numeric(10, 6)),
        sa.Column('confidence_interval', sa.JSON),
        sa.Column('p_value', sa.Numeric(10, 6)),
        sa.Column('passed', sa.Boolean, nullable=False),
        sa.Column('failure_reason', sa.Text),
        sa.Column('privileged_group_value', sa.String(255)),
        sa.Column('unprivileged_group_value', sa.String(255)),
        sa.Column('privileged_metric_value', sa.Numeric(10, 6)),
        sa.Column('unprivileged_metric_value', sa.Numeric(10, 6)),
        sa.Column('sample_size', sa.Integer),
        sa.Column('statistical_power', sa.Float),
        sa.Column('effect_size', sa.Numeric(10, 6)),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKey('fairness_assessments.id', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create fairness_thresholds table
    op.create_table(
        'fairness_thresholds',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_type', Enum('demographic_parity', 'equal_opportunity', 'equalized_odds', 'predictive_parity', 'accuracy_parity', 'treatment_equality', 'statistical_parity', 'overall_accuracy', 'auc_roc', 'precision', 'recall', 'f1_score', name='fairnessmetrictype'), nullable=False),
        sa.Column('threshold_type', Enum('absolute', 'relative', 'custom', name='fairnesstresholdtype'), nullable=False),
        sa.Column('threshold_value', sa.Numeric(10, 6), nullable=False),
        sa.Column('direction', sa.String(10), default='less_than'),
        sa.Column('confidence_level', sa.Float, default=0.95),
        sa.Column('protected_attribute', sa.String(255)),
        sa.Column('subgroup', sa.String(255)),
        sa.Column('description', sa.Text),
        sa.Column('is_custom', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKey('fairness_assessments.id', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create fairness_reports table
    op.create_table(
        'fairness_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('report_type', sa.String(100), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('subtitle', sa.String(500)),
        sa.Column('summary_findings', sa.JSON),
        sa.Column('recommendations', sa.JSON),
        sa.Column('risk_assessment', sa.JSON),
        sa.Column('charts', sa.JSON),
        sa.Column('dashboard_config', sa.JSON),
        sa.Column('report_url', sa.String(500)),
        sa.Column('data_export_url', sa.String(500)),
        sa.Column('visualizations_url', sa.String(500)),
        sa.Column('generated_by', sa.String(255)),
        sa.Column('template_version', sa.String(50)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.ForeignKey('fairness_assessments.id'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_fairness_assessments_status', 'fairness_assessments', ['status'])
    op.create_index('idx_fairness_assessments_model', 'fairness_assessments', ['model_name'])
    op.create_index('idx_fairness_assessments_org', 'fairness_assessments', ['organization_id'])
    op.create_index('idx_fairness_assessments_created', 'fairness_assessments', ['created_at'])
    op.create_index('idx_fairness_metrics_assessment', 'fairness_metrics', ['assessment_id'])
    op.create_index('idx_fairness_metrics_type', 'fairness_metrics', ['metric_type'])
    op.create_index('idx_fairness_reports_assessment', 'fairness_reports', ['assessment_id'])

def downgrade():
    """Drop fairness assessment tables."""
    
    # Drop indexes
    op.drop_index('idx_fairness_reports_assessment', table_name='fairness_reports')
    op.drop_index('idx_fairness_metrics_type', table_name='fairness_metrics')
    op.drop_index('idx_fairness_metrics_assessment', table_name='fairness_metrics')
    op.drop_index('idx_fairness_assessments_created', table_name='fairness_assessments')
    op.drop_index('idx_fairness_assessments_org', table_name='fairness_assessments')
    op.drop_index('idx_fairness_assessments_model', table_name='fairness_assessments')
    op.drop_index('idx_fairness_assessments_status', table_name='fairness_assessments')
    
    # Drop tables
    op.drop_table('fairness_reports')
    op.drop_table('fairness_thresholds')
    op.drop_table('fairness_metrics')
    op.drop_table('fairness_assessments')
    
    # Drop enum types
    op.execute('DROP TYPE fairnessassessmentstatus')
    op.execute('DROP TYPE fairnessmetrictype')
    op.execute('DROP TYPE fairnesstresholdtype')