"""Add organizations table

Revision ID: add_organizations_table
Revises: model_card_tables
Create Date: 2024-01-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_organizations_table'
down_revision = 'model_card_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('website', sa.String(500), nullable=True),
        sa.Column('contact_email', sa.String(255), nullable=True),
        sa.Column('contact_phone', sa.String(50), nullable=True),
        sa.Column('address', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true', nullable=False),
        sa.Column('is_verified', sa.Boolean, server_default='false', nullable=False),
        sa.Column('metadata', sa.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='organizations_name_key')
    )
    
    # Create indexes for performance optimization
    op.create_index('ix_organizations_name', 'organizations', ['name'])
    op.create_index('ix_organizations_is_active', 'organizations', ['is_active'])
    op.create_index('ix_organizations_created_at', 'organizations', ['created_at'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_organizations_created_at', table_name='organizations')
    op.drop_index('ix_organizations_is_active', table_name='organizations')
    op.drop_index('ix_organizations_name', table_name='organizations')
    
    # Drop table
    op.drop_table('organizations')