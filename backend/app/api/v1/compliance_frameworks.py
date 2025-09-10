from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.crud.compliance_framework import compliance_framework
from backend.app.schemas.compliance_framework import (
    ComplianceFramework,
    ComplianceFrameworkCreate,
    ComplianceFrameworkUpdate,
    ComplianceFrameworkList,
    ComplianceRequirement,
    ComplianceRequirementCreate,
    ComplianceRequirementUpdate
)
from backend.app.core.security import get_current_active_user

router = APIRouter()


# Compliance Framework CRUD operations
@router.get("/", response_model=ComplianceFrameworkList)
def read_compliance_frameworks(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: str = Depends(get_current_active_user)
):
    """
    Retrieve compliance frameworks with optional filtering.
    """
    frameworks = compliance_framework.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )
    total = compliance_framework.count(db=db)
    
    return {
        "frameworks": frameworks,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit
    }


@router.post("/", response_model=ComplianceFramework)
def create_compliance_framework(
    *,
    db: Session = Depends(get_db),
    framework_in: ComplianceFrameworkCreate,
    current_user: str = Depends(get_current_active_user)
):
    """
    Create new compliance framework.
    """
    return compliance_framework.create(db=db, obj_in=framework_in)


@router.get("/{id}", response_model=ComplianceFramework)
def read_compliance_framework(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework to get"),
    current_user: str = Depends(get_current_active_user)
):
    """
    Get compliance framework by ID.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    return framework


@router.put("/{id}", response_model=ComplianceFramework)
def update_compliance_framework(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework to update"),
    framework_in: ComplianceFrameworkUpdate,
    current_user: str = Depends(get_current_active_user)
):
    """
    Update a compliance framework.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    
    return compliance_framework.update(db=db, db_obj=framework, obj_in=framework_in)


@router.delete("/{id}", response_model=ComplianceFramework)
def delete_compliance_framework(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework to delete"),
    current_user: str = Depends(get_current_active_user)
):
    """
    Delete a compliance framework.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    
    return compliance_framework.delete(db=db, id=id)


# Compliance Requirement CRUD operations
@router.get("/{id}/requirements", response_model=List[ComplianceRequirement])
def read_compliance_requirements(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework"),
    current_user: str = Depends(get_current_active_user)
):
    """
    Get all requirements for a compliance framework.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    
    return compliance_framework.get_requirements(db=db, framework_id=id)


@router.post("/{id}/requirements", response_model=ComplianceRequirement)
def create_compliance_requirement(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework"),
    requirement_in: ComplianceRequirementCreate,
    current_user: str = Depends(get_current_active_user)
):
    """
    Create a new requirement for a compliance framework.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    
    return compliance_framework.create_requirement(
        db=db, obj_in=requirement_in, framework_id=id
    )


@router.put("/{id}/requirements/{requirement_id}", response_model=ComplianceRequirement)
def update_compliance_requirement(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework"),
    requirement_id: UUID = Path(..., title="The ID of the requirement"),
    requirement_in: ComplianceRequirementUpdate,
    current_user: str = Depends(get_current_active_user)
):
    """
    Update a compliance requirement.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    
    requirement = compliance_framework.get_requirement(db=db, id=requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Compliance requirement not found")
    
    if requirement.framework_id != id:
        raise HTTPException(status_code=400, detail="Requirement does not belong to this framework")
    
    return compliance_framework.update_requirement(
        db=db, db_obj=requirement, obj_in=requirement_in
    )


@router.delete("/{id}/requirements/{requirement_id}", response_model=ComplianceRequirement)
def delete_compliance_requirement(
    *,
    db: Session = Depends(get_db),
    id: UUID = Path(..., title="The ID of the compliance framework"),
    requirement_id: UUID = Path(..., title="The ID of the requirement"),
    current_user: str = Depends(get_current_active_user)
):
    """
    Delete a compliance requirement.
    """
    framework = compliance_framework.get(db=db, id=id)
    if not framework:
        raise HTTPException(status_code=404, detail="Compliance framework not found")
    
    requirement = compliance_framework.get_requirement(db=db, id=requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Compliance requirement not found")
    
    if requirement.framework_id != id:
        raise HTTPException(status_code=400, detail="Requirement does not belong to this framework")
    
    return compliance_framework.delete_requirement(db=db, id=requirement_id)