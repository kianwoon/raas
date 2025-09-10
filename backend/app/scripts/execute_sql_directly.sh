#!/bin/bash

# Script to directly execute the SQL script to create tables
echo "Executing SQL script to create Model Card tables..."

cd backend/app

# Run the docker-compose to execute the SQL script
docker-compose -f docker-compose.sql.yml up --build

echo "SQL script execution completed."