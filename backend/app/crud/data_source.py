from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.data_source import DataSource, SchemaMapping, DataValidation, ProtectedAttributeConfig
from app.schemas.data_source import (
    DataSourceCreate, DataSourceUpdate, 
    SchemaMappingCreate, SchemaMappingUpdate,
    DataValidationCreate, DataValidationUpdate,
    ProtectedAttributeConfigCreate, ProtectedAttributeConfigUpdate
)
import structlog
import uuid

logger = structlog.get_logger()

class DataSourceCRUD:
    """CRUD operations for data sources."""
    
    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: DataSourceCreate,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> DataSource:
        """Create a new data source."""
        obj_data = obj_in.dict(exclude={"file_content", "file_name"})
        db_obj = DataSource(
            **obj_data,
            created_by=user_id,
            organization_id=organization_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get(self, db: AsyncSession, id: uuid.UUID) -> Optional[DataSource]:
        """Get a data source by ID."""
        result = await db.execute(select(DataSource).where(DataSource.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        organization_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        source_type: Optional[str] = None
    ) -> List[DataSource]:
        """Get multiple data sources."""
        query = select(DataSource)
        
        if organization_id:
            query = query.where(DataSource.organization_id == organization_id)
        if user_id:
            query = query.where(DataSource.created_by == user_id)
        if source_type:
            query = query.where(DataSource.source_type == source_type)
        
        query = query.offset(skip).limit(limit).order_by(DataSource.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: DataSource, 
        obj_in: DataSourceUpdate
    ) -> DataSource:
        """Update a data source."""
        obj_data = obj_in.dict(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, *, id: uuid.UUID) -> DataSource:
        """Delete a data source."""
        obj = await self.get(db, id=id)
        await db.delete(obj)
        await db.commit()
        return obj
    
    async def get_by_organization(
        self, 
        db: AsyncSession, 
        organization_id: uuid.UUID
    ) -> List[DataSource]:
        """Get all data sources for an organization."""
        result = await db.execute(
            select(DataSource).where(DataSource.organization_id == organization_id)
        )
        return result.scalars().all()

class SchemaMappingCRUD:
    """CRUD operations for schema mappings."""
    
    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: SchemaMappingCreate,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> SchemaMapping:
        """Create a new schema mapping."""
        obj_data = obj_in.dict()
        db_obj = SchemaMapping(
            **obj_data,
            created_by=user_id,
            organization_id=organization_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get(self, db: AsyncSession, id: uuid.UUID) -> Optional[SchemaMapping]:
        """Get a schema mapping by ID."""
        result = await db.execute(select(SchemaMapping).where(SchemaMapping.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        data_source_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        organization_id: Optional[uuid.UUID] = None
    ) -> List[SchemaMapping]:
        """Get multiple schema mappings."""
        query = select(SchemaMapping)
        
        if data_source_id:
            query = query.where(SchemaMapping.data_source_id == data_source_id)
        if user_id:
            query = query.where(SchemaMapping.created_by == user_id)
        if organization_id:
            query = query.where(SchemaMapping.organization_id == organization_id)
        
        query = query.offset(skip).limit(limit).order_by(SchemaMapping.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: SchemaMapping, 
        obj_in: SchemaMappingUpdate
    ) -> SchemaMapping:
        """Update a schema mapping."""
        obj_data = obj_in.dict(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, *, id: uuid.UUID) -> SchemaMapping:
        """Delete a schema mapping."""
        obj = await self.get(db, id=id)
        await db.delete(obj)
        await db.commit()
        return obj

class DataValidationCRUD:
    """CRUD operations for data validations."""
    
    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: DataValidationCreate,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> DataValidation:
        """Create a new data validation."""
        obj_data = obj_in.dict()
        db_obj = DataValidation(
            **obj_data,
            created_by=user_id,
            organization_id=organization_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get(self, db: AsyncSession, id: uuid.UUID) -> Optional[DataValidation]:
        """Get a data validation by ID."""
        result = await db.execute(select(DataValidation).where(DataValidation.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        data_source_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        organization_id: Optional[uuid.UUID] = None
    ) -> List[DataValidation]:
        """Get multiple data validations."""
        query = select(DataValidation)
        
        if data_source_id:
            query = query.where(DataValidation.data_source_id == data_source_id)
        if user_id:
            query = query.where(DataValidation.created_by == user_id)
        if organization_id:
            query = query.where(DataValidation.organization_id == organization_id)
        
        query = query.offset(skip).limit(limit).order_by(DataValidation.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: DataValidation, 
        obj_in: DataValidationUpdate
    ) -> DataValidation:
        """Update a data validation."""
        obj_data = obj_in.dict(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, *, id: uuid.UUID) -> DataValidation:
        """Delete a data validation."""
        obj = await self.get(db, id=id)
        await db.delete(obj)
        await db.commit()
        return obj

class ProtectedAttributeConfigCRUD:
    """CRUD operations for protected attribute configurations."""
    
    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: ProtectedAttributeConfigCreate,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> ProtectedAttributeConfig:
        """Create a new protected attribute configuration."""
        obj_data = obj_in.dict()
        db_obj = ProtectedAttributeConfig(
            **obj_data,
            created_by=user_id,
            organization_id=organization_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get(self, db: AsyncSession, id: uuid.UUID) -> Optional[ProtectedAttributeConfig]:
        """Get a protected attribute configuration by ID."""
        result = await db.execute(select(ProtectedAttributeConfig).where(ProtectedAttributeConfig.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[uuid.UUID] = None,
        organization_id: Optional[uuid.UUID] = None
    ) -> List[ProtectedAttributeConfig]:
        """Get multiple protected attribute configurations."""
        query = select(ProtectedAttributeConfig)
        
        if user_id:
            query = query.where(ProtectedAttributeConfig.created_by == user_id)
        if organization_id:
            query = query.where(ProtectedAttributeConfig.organization_id == organization_id)
        
        query = query.offset(skip).limit(limit).order_by(ProtectedAttributeConfig.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: ProtectedAttributeConfig, 
        obj_in: ProtectedAttributeConfigUpdate
    ) -> ProtectedAttributeConfig:
        """Update a protected attribute configuration."""
        obj_data = obj_in.dict(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, *, id: uuid.UUID) -> ProtectedAttributeConfig:
        """Delete a protected attribute configuration."""
        obj = await self.get(db, id=id)
        await db.delete(obj)
        await db.commit()
        return obj

# Create CRUD instances
data_source_crud = DataSourceCRUD()
schema_mapping_crud = SchemaMappingCRUD()
data_validation_crud = DataValidationCRUD()
protected_attribute_config_crud = ProtectedAttributeConfigCRUD()