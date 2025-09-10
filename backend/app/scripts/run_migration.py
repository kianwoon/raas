#!/usr/bin/env python3
"""
Script to run database migrations for the Model Card functionality.
This script will create all the necessary tables in the PostgreSQL database.
"""

import os
import sys
import logging
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from alembic import command
from alembic.config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_migration():
    """Run the database migration to create Model Card tables."""
    try:
        # Get the path to the alembic.ini file
        alembic_ini_path = Path(__file__).parent.parent / "alembic.ini"
        
        if not alembic_ini_path.exists():
            logger.error(f"Alembic configuration file not found at {alembic_ini_path}")
            return False
        
        # Create Alembic configuration
        alembic_cfg = Config(str(alembic_ini_path))
        
        # Run the migration
        logger.info("Running database migration...")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migration completed successfully.")
        
        return True
    except Exception as e:
        logger.error(f"Error running database migration: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)