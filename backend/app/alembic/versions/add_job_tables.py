"""Job execution system tables

Revision ID: add_job_tables
Revises: model_card_tables
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_job_tables'
down_revision = 'model_card_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('job_type', sa.Enum('notebook_execution', 'model_training', 'data_processing', 'assessment', 'report_generation', 'cleanup', name='jobtype'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('status', sa.Enum('pending', 'running', 'completed', 'failed', 'cancelled', 'retrying', name='jobstatus'), nullable=False, server_default='pending'),
        sa.Column('priority', sa.Integer, nullable=False, server_default='0'),
        sa.Column('parameters', postgresql.JSON, nullable=False),
        sa.Column('input_files', postgresql.JSON, nullable=True),
        sa.Column('output_files', postgresql.JSON, nullable=True),
        sa.Column('celery_task_id', sa.String(255), nullable=True),
        sa.Column('progress', sa.Integer, nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('retry_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('max_retries', sa.Integer, nullable=False, server_default='3'),
        sa.Column('artifact_urls', postgresql.JSON, nullable=True),
        sa.Column('artifact_metadata', postgresql.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('estimated_duration', sa.Integer, nullable=True),
        sa.Column('actual_duration', sa.Integer, nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('tags', postgresql.JSON, nullable=True),
        sa.Column('config', postgresql.JSON, nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('celery_task_id')
    )
    
    # Create indexes
    op.create_index('ix_jobs_job_type', 'jobs', ['job_type'])
    op.create_index('ix_jobs_status', 'jobs', ['status'])
    op.create_index('ix_jobs_created_at', 'jobs', ['created_at'])
    op.create_index('ix_jobs_created_by', 'jobs', ['created_by'])
    op.create_index('ix_jobs_organization_id', 'jobs', ['organization_id'])
    op.create_index('ix_jobs_priority', 'jobs', ['priority'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_jobs_priority')
    op.drop_index('ix_jobs_organization_id')
    op.drop_index('ix_jobs_created_by')
    op.drop_index('ix_jobs_created_at')
    op.drop_index('ix_jobs_status')
    op.drop_index('ix_jobs_job_type')
    
    # Drop jobs table
    op.drop_table('jobs')
    
    # Drop enums
    op.execute('DROP TYPE jobtype')
    op.execute('DROP TYPE jobstatus')