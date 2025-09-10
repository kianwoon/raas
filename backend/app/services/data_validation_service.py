import pandas as pd
import structlog
from typing import Optional, List, Dict, Any, Tuple
import uuid
import json
from datetime import datetime
import numpy as np
from decimal import Decimal
import re

from app.models.data_source import DataSource, DataValidation, SchemaMapping
from app.schemas.data_source import (
    DataValidationCreate, DataValidationUpdate, DataValidationResponse,
    ValidationRule, ValidationSummary
)
from app.core.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

logger = structlog.get_logger()

class DataValidationService:
    """Service for validating data quality and schema compliance."""
    
    def __init__(self):
        self.supported_rule_types = [
            "not_null", "unique", "range", "regex", "type", "length", "custom"
        ]
    
    async def create_validation(
        self, 
        validation_data: DataValidationCreate, 
        user_id: uuid.UUID, 
        organization_id: uuid.UUID
    ) -> DataValidationResponse:
        """Create a new data validation."""
        try:
            async with AsyncSessionLocal() as session:
                # Get data source
                data_source = await session.get(DataSource, validation_data.data_source_id)
                if not data_source:
                    raise ValueError(f"Data source not found: {validation_data.data_source_id}")
                
                # Get schema mapping if provided
                schema_mapping = None
                if validation_data.schema_mapping_id:
                    schema_mapping = await session.get(SchemaMapping, validation_data.schema_mapping_id)
                    if not schema_mapping:
                        raise ValueError(f"Schema mapping not found: {validation_data.schema_mapping_id}")
                
                # Create validation record
                validation = DataValidation(
                    name=validation_data.name,
                    data_source_id=validation_data.data_source_id,
                    schema_mapping_id=validation_data.schema_mapping_id,
                    validation_rules=[rule.dict() for rule in validation_data.validation_rules],
                    validation_type=validation_data.validation_type,
                    sample_size=validation_data.sample_size,
                    status="pending",
                    created_by=user_id,
                    organization_id=organization_id
                )
                
                session.add(validation)
                await session.commit()
                await session.refresh(validation)
                
                # Run validation
                validation_result = await self._run_validation(validation, data_source, schema_mapping)
                
                # Update validation record with results
                validation.is_valid = validation_result["is_valid"]
                validation.validation_results = validation_result["results"]
                validation.error_summary = validation_result["error_summary"]
                validation.warnings = validation_result["warnings"]
                validation.total_records = validation_result["total_records"]
                validation.valid_records = validation_result["valid_records"]
                validation.invalid_records = validation_result["invalid_records"]
                validation.validation_score = validation_result["validation_score"]
                validation.execution_time = validation_result["execution_time"]
                validation.memory_usage = validation_result["memory_usage"]
                validation.status = "completed"
                validation.completed_at = datetime.utcnow()
                
                await session.commit()
                await session.refresh(validation)
                
                logger.info(f"Created and executed validation: {validation_data.name}", validation_id=str(validation.id))
                return DataValidationResponse.model_validate(validation)
                
        except Exception as e:
            logger.error(f"Failed to create validation: {e}")
            raise
    
    async def get_validations(
        self, 
        data_source_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        organization_id: Optional[uuid.UUID] = None
    ) -> List[DataValidationResponse]:
        """Get data validations with optional filters."""
        try:
            async with AsyncSessionLocal() as session:
                query = select(DataValidation)
                
                if data_source_id:
                    query = query.where(DataValidation.data_source_id == data_source_id)
                if user_id:
                    query = query.where(DataValidation.created_by == user_id)
                if organization_id:
                    query = query.where(DataValidation.organization_id == organization_id)
                
                query = query.order_by(DataValidation.created_at.desc())
                
                result = await session.execute(query)
                validations = result.scalars().all()
                
                return [DataValidationResponse.model_validate(validation) for validation in validations]
                
        except Exception as e:
            logger.error(f"Failed to get validations: {e}")
            raise
    
    async def get_validation_summary(
        self, 
        data_source_id: uuid.UUID
    ) -> ValidationSummary:
        """Get validation summary for a data source."""
        try:
            async with AsyncSessionLocal() as session:
                # Get all validations for the data source
                query = select(DataValidation).where(
                    DataValidation.data_source_id == data_source_id
                )
                result = await session.execute(query)
                validations = result.scalars().all()
                
                if not validations:
                    return ValidationSummary(
                        total_rules=0,
                        passed_rules=0,
                        failed_rules=0,
                        total_records=0,
                        valid_records=0,
                        invalid_records=0,
                        validation_score=0.0,
                        critical_issues=[],
                        warnings=["No validations found"]
                    )
                
                # Aggregate results
                total_rules = sum(len(v.validation_rules) for v in validations)
                passed_rules = sum(
                    len([r for r in v.validation_results.get("rule_results", []) if r.get("passed")])
                    for v in validations
                )
                failed_rules = total_rules - passed_rules
                
                total_records = sum(v.total_records or 0 for v in validations)
                valid_records = sum(v.valid_records or 0 for v in validations)
                invalid_records = sum(v.invalid_records or 0 for v in validations)
                
                # Calculate average validation score
                valid_scores = [v.validation_score for v in validations if v.validation_score is not None]
                validation_score = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0
                
                # Collect issues and warnings
                critical_issues = []
                warnings = []
                
                for validation in validations:
                    if validation.error_summary:
                        critical_issues.extend(validation.error_summary.get("errors", []))
                    if validation.warnings:
                        warnings.extend(validation.warnings)
                
                return ValidationSummary(
                    total_rules=total_rules,
                    passed_rules=passed_rules,
                    failed_rules=failed_rules,
                    total_records=total_records,
                    valid_records=valid_records,
                    invalid_records=invalid_records,
                    validation_score=validation_score,
                    critical_issues=critical_issues,
                    warnings=warnings
                )
                
        except Exception as e:
            logger.error(f"Failed to get validation summary: {e}")
            raise
    
    async def _run_validation(
        self, 
        validation: DataValidation, 
        data_source: DataSource, 
        schema_mapping: Optional[SchemaMapping]
    ) -> Dict[str, Any]:
        """Run validation rules against data."""
        try:
            start_time = datetime.utcnow()
            
            # Get data to validate
            data = await self._get_validation_data(data_source, schema_mapping, validation.sample_size)
            
            if not data:
                return {
                    "is_valid": False,
                    "results": {"rule_results": []},
                    "error_summary": {"errors": ["No data to validate"]},
                    "warnings": [],
                    "total_records": 0,
                    "valid_records": 0,
                    "invalid_records": 0,
                    "validation_score": 0.0,
                    "execution_time": 0.0,
                    "memory_usage": 0.0
                }
            
            # Convert to DataFrame for easier processing
            df = pd.DataFrame(data)
            
            # Run validation rules
            rule_results = []
            total_failed_records = 0
            
            for rule_dict in validation.validation_rules:
                rule = ValidationRule(**rule_dict)
                result = await self._validate_rule(df, rule)
                rule_results.append(result)
                total_failed_records += result["failed_records"]
            
            # Calculate overall results
            total_records = len(df)
            valid_records = total_records - total_failed_records
            invalid_records = total_failed_records
            validation_score = valid_records / total_records if total_records > 0 else 0.0
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Calculate memory usage (approximate)
            memory_usage = df.memory_usage(deep=True).sum() / 1024 / 1024  # MB
            
            return {
                "is_valid": validation_score >= 0.95,  # 95% threshold
                "results": {"rule_results": rule_results},
                "error_summary": {
                    "errors": [r["error"] for r in rule_results if r["error"]],
                    "total_errors": len([r for r in rule_results if not r["passed"]])
                },
                "warnings": [r["warning"] for r in rule_results if r["warning"]],
                "total_records": total_records,
                "valid_records": valid_records,
                "invalid_records": invalid_records,
                "validation_score": validation_score,
                "execution_time": execution_time,
                "memory_usage": memory_usage
            }
            
        except Exception as e:
            logger.error(f"Failed to run validation: {e}")
            return {
                "is_valid": False,
                "results": {"rule_results": []},
                "error_summary": {"errors": [f"Validation execution error: {str(e)}"]},
                "warnings": [],
                "total_records": 0,
                "valid_records": 0,
                "invalid_records": 0,
                "validation_score": 0.0,
                "execution_time": 0.0,
                "memory_usage": 0.0
            }
    
    async def _get_validation_data(
        self, 
        data_source: DataSource, 
        schema_mapping: Optional[SchemaMapping], 
        sample_size: int
    ) -> List[Dict[str, Any]]:
        """Get data for validation."""
        try:
            # Use sample data if available
            if data_source.sample_data:
                return data_source.sample_data[:sample_size]
            
            # Otherwise read from file
            from app.services.minio_service import MinioService
            minio_service = MinioService()
            file_content = minio_service.download_file_content(
                data_source.file_path.split('/')[-1]
            )
            
            # Read file based on type
            if data_source.file_type == 'csv':
                df = pd.read_csv(pd.io.common.BytesIO(file_content), nrows=sample_size)
            elif data_source.file_type == 'parquet':
                df = pd.read_parquet(pd.io.common.BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file type: {data_source.file_type}")
            
            # Apply schema mapping if provided
            if schema_mapping:
                df = await self._apply_schema_mapping(df, schema_mapping)
            
            return df.to_dict('records')
            
        except Exception as e:
            logger.error(f"Failed to get validation data: {e}")
            return []
    
    async def _apply_schema_mapping(self, df: pd.DataFrame, schema_mapping: SchemaMapping) -> pd.DataFrame:
        """Apply schema mapping to DataFrame."""
        try:
            # Apply column mappings
            if schema_mapping.column_mappings:
                df = df.rename(columns=schema_mapping.column_mappings)
            
            # Apply data type conversions
            if schema_mapping.data_type_mappings:
                for column, target_type in schema_mapping.data_type_mappings.items():
                    if column in df.columns:
                        df[column] = await self._convert_column_type(df[column], target_type)
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to apply schema mapping: {e}")
            return df
    
    async def _convert_column_type(self, series: pd.Series, target_type: str) -> pd.Series:
        """Convert column to target data type."""
        try:
            if target_type == "integer":
                return pd.to_numeric(series, errors='coerce').astype('Int64')
            elif target_type == "float":
                return pd.to_numeric(series, errors='coerce')
            elif target_type == "boolean":
                return series.astype(bool)
            elif target_type == "datetime":
                return pd.to_datetime(series, errors='coerce')
            elif target_type == "string":
                return series.astype(str)
            else:
                return series
                
        except Exception as e:
            logger.error(f"Failed to convert column type: {e}")
            return series
    
    async def _validate_rule(self, df: pd.DataFrame, rule: ValidationRule) -> Dict[str, Any]:
        """Validate a single rule against data."""
        try:
            result = {
                "rule_name": rule.column_name,
                "rule_type": rule.rule_type,
                "passed": True,
                "failed_records": 0,
                "error": None,
                "warning": None
            }
            
            if rule.column_name not in df.columns:
                result["passed"] = False
                result["error"] = f"Column '{rule.column_name}' not found in data"
                return result
            
            column_data = df[rule.column_name]
            
            if rule.rule_type == "not_null":
                failed_count = column_data.isnull().sum()
                result["failed_records"] = int(failed_count)
                result["passed"] = failed_count == 0
                
            elif rule.rule_type == "unique":
                total_count = len(column_data)
                unique_count = column_data.nunique()
                result["failed_records"] = int(total_count - unique_count)
                result["passed"] = result["failed_records"] == 0
                
            elif rule.rule_type == "range":
                min_val = rule.parameters.get("min")
                max_val = rule.parameters.get("max")
                if min_val is not None and max_val is not None:
                    numeric_data = pd.to_numeric(column_data, errors='coerce')
                    failed_count = ((numeric_data < min_val) | (numeric_data > max_val)).sum()
                    result["failed_records"] = int(failed_count)
                    result["passed"] = failed_count == 0
                    
            elif rule.rule_type == "regex":
                pattern = rule.parameters.get("pattern")
                if pattern:
                    try:
                        regex = re.compile(pattern)
                        string_data = column_data.astype(str)
                        failed_count = (~string_data.str.match(regex)).sum()
                        result["failed_records"] = int(failed_count)
                        result["passed"] = failed_count == 0
                    except re.error:
                        result["passed"] = False
                        result["error"] = f"Invalid regex pattern: {pattern}"
                        
            elif rule.rule_type == "type":
                expected_type = rule.parameters.get("expected_type")
                if expected_type:
                    try:
                        converted_data = await self._convert_column_type(column_data, expected_type)
                        failed_count = converted_data.isnull().sum() - column_data.isnull().sum()
                        result["failed_records"] = int(max(0, failed_count))
                        result["passed"] = result["failed_records"] == 0
                    except Exception as e:
                        result["passed"] = False
                        result["error"] = f"Type conversion failed: {str(e)}"
                        
            elif rule.rule_type == "length":
                min_len = rule.parameters.get("min_length")
                max_len = rule.parameters.get("max_length")
                if min_len is not None or max_len is not None:
                    string_data = column_data.astype(str)
                    lengths = string_data.str.len()
                    failed_count = 0
                    
                    if min_len is not None:
                        failed_count += (lengths < min_len).sum()
                    if max_len is not None:
                        failed_count += (lengths > max_len).sum()
                        
                    result["failed_records"] = int(failed_count)
                    result["passed"] = failed_count == 0
                    
            elif rule.rule_type == "custom":
                # Custom validation using condition
                condition = rule.condition
                if condition:
                    try:
                        # Simple condition evaluation (be careful with eval in production)
                        # This is a simplified implementation
                        result["warning"] = "Custom validation not fully implemented"
                        result["passed"] = True
                    except Exception as e:
                        result["passed"] = False
                        result["error"] = f"Custom validation error: {str(e)}"
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to validate rule: {e}")
            return {
                "rule_name": rule.column_name,
                "rule_type": rule.rule_type,
                "passed": False,
                "failed_records": 0,
                "error": f"Rule validation error: {str(e)}",
                "warning": None
            }
    
    async def get_validation_templates(self) -> List[Dict[str, Any]]:
        """Get predefined validation rule templates."""
        return [
            {
                "name": "Email Validation",
                "description": "Validate email format",
                "rules": [
                    {
                        "column_name": "email",
                        "rule_type": "not_null",
                        "parameters": {}
                    },
                    {
                        "column_name": "email",
                        "rule_type": "regex",
                        "parameters": {"pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"}
                    }
                ]
            },
            {
                "name": "Phone Number Validation",
                "description": "Validate phone number format",
                "rules": [
                    {
                        "column_name": "phone",
                        "rule_type": "regex",
                        "parameters": {"pattern": r"^\+?1?\d{9,15}$"}
                    }
                ]
            },
            {
                "name": "Age Validation",
                "description": "Validate age range",
                "rules": [
                    {
                        "column_name": "age",
                        "rule_type": "not_null",
                        "parameters": {}
                    },
                    {
                        "column_name": "age",
                        "rule_type": "range",
                        "parameters": {"min": 0, "max": 150}
                    }
                ]
            }
        ]
    
    async def suggest_validation_rules(self, data_source_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Suggest validation rules based on data schema."""
        try:
            async with AsyncSessionLocal() as session:
                data_source = await session.get(DataSource, data_source_id)
                if not data_source:
                    raise ValueError(f"Data source not found: {data_source_id}")
                
                suggestions = []
                schema_info = data_source.schema_info
                
                if not schema_info or "columns" not in schema_info:
                    return suggestions
                
                for column in schema_info["columns"]:
                    column_name = column["name"]
                    data_type = column["data_type"]
                    is_nullable = column.get("nullable", True)
                    
                    # Suggest not_null rule for important columns
                    if not is_nullable:
                        suggestions.append({
                            "column_name": column_name,
                            "rule_type": "not_null",
                            "parameters": {},
                            "reason": "Column is marked as non-nullable"
                        })
                    
                    # Suggest type-specific rules
                    if data_type == "email":
                        suggestions.append({
                            "column_name": column_name,
                            "rule_type": "regex",
                            "parameters": {"pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"},
                            "reason": "Email format validation"
                        })
                    elif data_type == "phone":
                        suggestions.append({
                            "column_name": column_name,
                            "rule_type": "regex",
                            "parameters": {"pattern": r"^\+?1?\d{9,15}$"},
                            "reason": "Phone number format validation"
                        })
                    elif data_type in ["integer", "float"]:
                        # Suggest range validation for numeric columns
                        sample_stats = schema_info.get("sample_stats", {}).get(column_name, {})
                        if "min" in sample_stats and "max" in sample_stats:
                            suggestions.append({
                                "column_name": column_name,
                                "rule_type": "range",
                                "parameters": {
                                    "min": float(sample_stats["min"]),
                                    "max": float(sample_stats["max"])
                                },
                                "reason": "Range validation based on sample data"
                            })
                
                return suggestions
                
        except Exception as e:
            logger.error(f"Failed to suggest validation rules: {e}")
            return []