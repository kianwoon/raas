"""Model Card tables

Revision ID: model_card_tables
Revises: base
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'model_card_tables'
down_revision = 'base'
branch_labels = None
depends_on = None


def upgrade():
    # Create model_cards table
    op.create_table(
        'model_cards',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('domain', sa.String(100), nullable=False),
        sa.Column('risk_tier', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), server_default='active', nullable=False),
        sa.Column('fairness_score', sa.Numeric(5, 4), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('last_audit_date', sa.Date, nullable=True),
        sa.Column('next_audit_date', sa.Date, nullable=True),
        sa.Column('documentation_url', sa.Text, nullable=True),
        sa.Column('contact_email', sa.String(255), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('metadata', sa.JSON, nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('risk_tier IN (\'low\', \'medium\', \'high\', \'critical\')', name='model_cards_risk_tier_check'),
        sa.CheckConstraint('status IN (\'active\', \'deprecated\', \'archived\')', name='model_cards_status_check'),
        sa.CheckConstraint('fairness_score >= 0 AND fairness_score <= 1', name='model_cards_fairness_score_check')
    )
    
    # Create model_versions table
    op.create_table(
        'model_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('model_card_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('changelog', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_current', sa.Boolean, server_default='false', nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['model_card_id'], ['model_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('model_card_id', 'version', name='model_versions_model_card_id_version_key')
    )
    
    # Create fairness_metrics table
    op.create_table(
        'fairness_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('model_card_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('value', sa.Numeric(5, 4), nullable=False),
        sa.Column('threshold', sa.Numeric(5, 4), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('demographic_groups', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('calculation_method', sa.String(100), nullable=True),
        sa.Column('last_calculated', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('metadata', sa.JSON, nullable=True),
        sa.ForeignKeyConstraint(['model_card_id'], ['model_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('status IN (\'pass\', \'fail\', \'warning\')', name='fairness_metrics_status_check'),
        sa.CheckConstraint('value >= 0 AND value <= 1', name='fairness_metrics_value_check'),
        sa.CheckConstraint('threshold >= 0 AND threshold <= 1', name='fairness_metrics_threshold_check'),
        sa.UniqueConstraint('model_card_id', 'metric_name', name='fairness_metrics_model_card_id_metric_name_key')
    )
    
    # Create fairness_metrics_history table
    op.create_table(
        'fairness_metrics_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('fairness_metric_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('value', sa.Numeric(5, 4), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('calculated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.ForeignKeyConstraint(['calculated_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['fairness_metric_id'], ['fairness_metrics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('status IN (\'pass\', \'fail\', \'warning\')', name='fairness_metrics_history_status_check'),
        sa.CheckConstraint('value >= 0 AND value <= 1', name='fairness_metrics_history_value_check')
    )
    
    # Create compliance_frameworks table
    op.create_table(
        'compliance_frameworks',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('version', sa.String(50), nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true', nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', 'version', name='compliance_frameworks_name_version_key')
    )
    
    # Create model_compliance table
    op.create_table(
        'model_compliance',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('model_card_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('last_assessed_date', sa.Date, nullable=True),
        sa.Column('next_assessment_date', sa.Date, nullable=True),
        sa.Column('assessor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('evidence_url', sa.Text, nullable=True),
        sa.ForeignKeyConstraint(['assessor_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['framework_id'], ['compliance_frameworks.id'], ),
        sa.ForeignKeyConstraint(['model_card_id'], ['model_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('status IN (\'compliant\', \'non_compliant\', \'partial\', \'assessment_pending\')', name='model_compliance_status_check'),
        sa.UniqueConstraint('model_card_id', 'framework_id', name='model_compliance_model_card_id_framework_id_key')
    )
    
    # Create model_audit_logs table
    op.create_table(
        'model_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('model_card_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('performed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('performed_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('details', sa.JSON, nullable=True),
        sa.Column('previous_values', sa.JSON, nullable=True),
        sa.Column('new_values', sa.JSON, nullable=True),
        sa.ForeignKeyConstraint(['model_card_id'], ['model_cards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['performed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create performance_metrics table
    op.create_table(
        'performance_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('model_card_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('value', sa.Numeric(10, 4), nullable=False),
        sa.Column('unit', sa.String(20), nullable=True),
        sa.Column('test_dataset', sa.String(255), nullable=True),
        sa.Column('measurement_date', sa.Date, nullable=True),
        sa.Column('metadata', sa.JSON, nullable=True),
        sa.ForeignKeyConstraint(['model_card_id'], ['model_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('model_card_id', 'metric_name', 'measurement_date', name='performance_metrics_model_card_id_metric_name_measurement_date_key')
    )
    
    # Create impact_assessments table
    op.create_table(
        'impact_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('model_card_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assessment_type', sa.String(50), nullable=False),
        sa.Column('impact_level', sa.String(20), nullable=False),
        sa.Column('affected_groups', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('mitigation_measures', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('assessment_date', sa.Date, nullable=True),
        sa.Column('assessor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('status', sa.String(20), server_default='active', nullable=False),
        sa.ForeignKeyConstraint(['assessor_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['model_card_id'], ['model_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('impact_level IN (\'low\', \'medium\', \'high\', \'critical\')', name='impact_assessments_impact_level_check')
    )
    
    # Create indexes for performance optimization
    op.create_index('ix_model_cards_domain', 'model_cards', ['domain'])
    op.create_index('ix_model_cards_risk_tier', 'model_cards', ['risk_tier'])
    op.create_index('ix_model_cards_status', 'model_cards', ['status'])
    op.create_index('ix_model_cards_created_at', 'model_cards', ['created_at'])
    op.create_index('ix_model_cards_name_search', 'model_cards', ['name'], postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})
    op.create_index('ix_fairness_metrics_model_card_id', 'fairness_metrics', ['model_card_id'])
    op.create_index('ix_model_compliance_model_card_id', 'model_compliance', ['model_card_id'])
    op.create_index('ix_model_audit_logs_model_card_id', 'model_audit_logs', ['model_card_id'])
    op.create_index('ix_performance_metrics_model_card_id', 'performance_metrics', ['model_card_id'])
    op.create_index('ix_impact_assessments_model_card_id', 'impact_assessments', ['model_card_id'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_impact_assessments_model_card_id', table_name='impact_assessments')
    op.drop_index('ix_performance_metrics_model_card_id', table_name='performance_metrics')
    op.drop_index('ix_model_audit_logs_model_card_id', table_name='model_audit_logs')
    op.drop_index('ix_model_compliance_model_card_id', table_name='model_compliance')
    op.drop_index('ix_fairness_metrics_model_card_id', table_name='fairness_metrics')
    op.drop_index('ix_model_cards_name_search', table_name='model_cards')
    op.drop_index('ix_model_cards_created_at', table_name='model_cards')
    op.drop_index('ix_model_cards_status', table_name='model_cards')
    op.drop_index('ix_model_cards_risk_tier', table_name='model_cards')
    op.drop_index('ix_model_cards_domain', table_name='model_cards')
    
    # Drop tables
    op.drop_table('impact_assessments')
    op.drop_table('performance_metrics')
    op.drop_table('model_audit_logs')
    op.drop_table('model_compliance')
    op.drop_table('compliance_frameworks')
    op.drop_table('fairness_metrics_history')
    op.drop_table('fairness_metrics')
    op.drop_table('model_versions')
    op.drop_table('model_cards')