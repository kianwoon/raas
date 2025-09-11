"""Add API keys management system

Revision ID: add_api_keys_management
Revises: add_organization_id_to_users
Create Date: 2025-01-11 11:58:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = 'add_api_keys_management'
down_revision = 'add_organization_id_to_users'
branch_labels = None
depends_on = None


def upgrade():
    # Create api_keys table
    op.create_table('api_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('key', sa.String(length=500), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('environment', sa.Enum('development', 'production', name='apikeyenvironment'), nullable=False),
        sa.Column('permissions', sa.ARRAY(sa.String()), nullable=False),
        sa.Column('rate_limit', sa.Integer(), nullable=False),
        sa.Column('ip_whitelist', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=False),
        sa.Column('monthly_usage', sa.Integer(), nullable=False),
        sa.Column('last_month_reset', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )
    op.create_index(op.f('ix_api_keys_id'), 'api_keys', ['id'], unique=False)
    op.create_index(op.f('ix_api_keys_key'), 'api_keys', ['key'], unique=True)
    
    # Create api_key_activities table
    op.create_table('api_key_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('api_key_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.Enum('created', 'used', 'revoked', 'regenerated', name='apikeyaction'), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('endpoint', sa.String(length=500), nullable=True),
        sa.Column('method', sa.String(length=10), nullable=True),
        sa.Column('response_status', sa.Integer(), nullable=True),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.Column('additional_metadata', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['api_key_id'], ['api_keys.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_api_key_activities_id'), 'api_key_activities', ['id'], unique=False)


def downgrade():
    # Drop api_key_activities table
    op.drop_index(op.f('ix_api_key_activities_id'), table_name='api_key_activities')
    op.drop_table('api_key_activities')
    
    # Drop api_keys table
    op.drop_index(op.f('ix_api_keys_key'), table_name='api_keys')
    op.drop_index(op.f('ix_api_keys_id'), table_name='api_keys')
    op.drop_table('api_keys')
    
    # Drop enums
    op.execute('DROP TYPE apikeyaction')
    op.execute('DROP TYPE apikeyenvironment')