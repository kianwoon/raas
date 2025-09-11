"""Add organization_id to users table

Revision ID: add_organization_id_to_users
Revises: add_organizations_table
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_organization_id_to_users'
down_revision = 'add_organizations_table'
branch_labels = None
depends_on = None


def upgrade():
    # Add organization_id column to users table
    op.add_column('users', sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True))
    
    # Create foreign key constraint
    op.create_foreign_key(
        'fk_users_organization_id', 
        'users', 
        'organizations', 
        ['organization_id'], 
        ['id'],
        ondelete='SET NULL'
    )
    
    # Create index for performance optimization
    op.create_index('ix_users_organization_id', 'users', ['organization_id'])


def downgrade():
    # Drop the index
    op.drop_index('ix_users_organization_id', table_name='users')
    
    # Drop the foreign key constraint
    op.drop_constraint('fk_users_organization_id', 'users', type_='foreignkey')
    
    # Drop the column
    op.drop_column('users', 'organization_id')