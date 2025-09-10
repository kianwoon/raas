#!/usr/bin/env python3
"""
Script to execute SQL scripts directly against the PostgreSQL database.
This script will create all the necessary tables in the PostgreSQL database.
"""

import os
import sys
import logging
import psycopg2
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def execute_sql_script(database_url, sql_file_path):
    """Execute an SQL script against the PostgreSQL database."""
    try:
        # Connect to the database
        logger.info(f"Connecting to database: {database_url}")
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Read the SQL script
        logger.info(f"Reading SQL script from: {sql_file_path}")
        with open(sql_file_path, 'r') as file:
            sql_script = file.read()
        
        # Execute the SQL script
        logger.info("Executing SQL script...")
        cursor.execute(sql_script)
        
        # Close the connection
        cursor.close()
        conn.close()
        
        logger.info("SQL script executed successfully.")
        return True
    except Exception as e:
        logger.error(f"Error executing SQL script: {str(e)}")
        return False

if __name__ == "__main__":
    # Get the database URL from environment variable or use default
    database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/raas_db')
    
    # Get the path to the SQL script
    sql_file_path = Path(__file__).parent / 'create_tables.sql'
    
    if not sql_file_path.exists():
        logger.error(f"SQL script file not found at {sql_file_path}")
        sys.exit(1)
    
    success = execute_sql_script(database_url, sql_file_path)
    sys.exit(0 if success else 1)