FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install psycopg2-binary

# Copy the SQL script and execution script
COPY scripts/execute_sql.py .
COPY scripts/create_tables.sql .

# Set environment variables
ENV DATABASE_URL=postgresql://postgres:password@postgres:5432/raas_db

# Make the execution script executable
RUN chmod +x execute_sql.py

# Run the SQL execution script
CMD ["python", "execute_sql.py"]