# Database Migration for Model Card Tables

This document provides instructions on how to run the database migration to create the Model Card tables in the PostgreSQL database.

## Prerequisites

- Docker and Docker Compose installed
- Access to the PostgreSQL database

## Method 1: Using Docker Compose (Recommended)

This method uses Docker Compose to set up a PostgreSQL database and run the migration in one command.

1. Navigate to the backend directory:
   ```bash
   cd backend/app
   ```

2. Run the migration using Docker Compose:
   ```bash
   docker-compose -f docker-compose.migration.yml up --build
   ```

3. After the migration is complete, you can stop the containers:
   ```bash
   docker-compose -f docker-compose.migration.yml down
   ```

## Method 2: Running the Migration Script Directly

If you already have a PostgreSQL database running, you can run the migration script directly.

1. Set the DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL=postgresql://postgres:password@localhost:5432/raas_db
   ```

2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the migration script:
   ```bash
   python scripts/run_migration.py
   ```

## Method 3: Using Alembic Directly

If you prefer to use Alembic directly:

1. Set the DATABASE_URL environment variable as shown in Method 2.

2. Install the required Python packages as shown in Method 2.

3. Run the Alembic upgrade command:
   ```bash
   alembic upgrade head
   ```

## Verifying the Migration

After running the migration, you can verify that the tables were created by connecting to the PostgreSQL database and running:

```sql
\dt
```

You should see the following tables:
- model_cards
- model_versions
- fairness_metrics
- fairness_metrics_history
- compliance_frameworks
- model_compliance
- model_audit_logs
- performance_metrics
- impact_assessments

## Troubleshooting

If you encounter any issues during the migration:

1. Check that the PostgreSQL database is running and accessible.
2. Verify that the DATABASE_URL environment variable is set correctly.
3. Check the logs for any error messages.
4. Make sure all required Python packages are installed.

## Rolling Back the Migration

If you need to roll back the migration, you can run:

```bash
alembic downgrade base
```

This will drop all the tables created by the migration.