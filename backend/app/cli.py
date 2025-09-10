#!/usr/bin/env python3
"""
Command Line Interface for the RAI Platform application.
Provides commands for database setup, data generation, and other administrative tasks.
"""

import click
from typing import List
from sqlalchemy.orm import Session
from uuid import uuid4
import random
from datetime import datetime, timedelta

from app.core.database import SessionLocal, sync_engine, Base
from app.models.model_card import ModelCard, FairnessMetric
from app.models.organization import Organization
from app.models.user import User
from app.services.model_card_data import get_sample_model_cards, get_sample_fairness_score_distribution, get_sample_model_card_statistics


def get_password_hash(password: str) -> str:
    """Simple password hash function for CLI use."""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def create_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=sync_engine)
    click.echo("Database tables created successfully.")


def create_sample_organization(db: Session) -> Organization:
    """Create a sample organization."""
    organization = Organization(
        id=uuid4(),
        name="AI Transparency Corp",
        description="A company committed to transparent and fair AI systems",
        industry="Technology",
        website="https://ai-transparency-corp.example.com",
        contact_email="contact@ai-transparency-corp.example.com",
        address="123 Transparency Street, Singapore 123456",
        metadata={"founded": 2020, "employees": 50}
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization


def create_sample_user(db: Session, organization_id: str) -> User:
    """Create a sample user."""
    user = User(
        id=uuid4(),
        email="admin@example.com",
        username="admin",
        hashed_password=get_password_hash("password123"),
        full_name="Admin User",
        is_active=True,
        is_superuser=True,
        organization="AI Transparency Corp",
        role="admin",
        metadata={"department": "Engineering"}
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user




def create_sample_model_cards(db: Session, organization_id: str) -> List[ModelCard]:
    """Create sample model cards."""
    sample_cards_data = get_sample_model_cards(10)
    
    model_cards = []
    for card_data in sample_cards_data:
        # Convert string ID to UUID
        card_id = uuid4()
        
        # Update organization ID
        card_data["organization_id"] = organization_id
        
        # Create model card
        card_data["id"] = card_id
        model_card = ModelCard(
            **card_data
        )
        db.add(model_card)
        model_cards.append(model_card)
    
    db.commit()
    for model_card in model_cards:
        db.refresh(model_card)
        
        # Add sample fairness metrics
        fairness_metrics_data = [
            {
                "metric_name": "Demographic Parity",
                "value": random.uniform(0.7, 0.95),
                "threshold": 0.8,
                "status": "pass" if random.random() > 0.3 else "fail",
                "description": "Measures the difference in selection rates across demographic groups",
                "demographic_groups": ["gender", "race", "age"],
                "calculation_method": "disparate_impact_ratio",
                "metadata": {"test_dataset": "validation_set_v1"}
            },
            {
                "metric_name": "Equal Opportunity",
                "value": random.uniform(0.75, 0.98),
                "threshold": 0.85,
                "status": "pass" if random.random() > 0.2 else "fail",
                "description": "Measures the difference in true positive rates across demographic groups",
                "demographic_groups": ["gender", "race"],
                "calculation_method": "tpr_difference",
                "metadata": {"test_dataset": "validation_set_v1"}
            }
        ]
        
        for metric_data in fairness_metrics_data:
            fairness_metric = FairnessMetric(
                model_card_id=model_card.id,
                **metric_data
            )
            db.add(fairness_metric)
        
            
    db.commit()
    return model_cards


@click.group()
def cli():
    """RAI Platform CLI"""
    pass


@cli.command()
def init_db():
    """Initialize the database with all tables."""
    create_tables()
    click.echo("Database initialized successfully.")


@cli.command()
def create_sample_data():
    """Create sample data for development and testing."""
    db = SessionLocal()
    
    try:
        # Get or create sample organization
        organization = db.query(Organization).filter(Organization.name == "AI Transparency Corp").first()
        if not organization:
            organization = create_sample_organization(db)
            click.echo(f"Created organization: {organization.name}")
        else:
            click.echo(f"Using existing organization: {organization.name}")
        
        # Create sample user if not exists
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            user = existing_user
            click.echo(f"Using existing user: {user.email}")
        else:
            user = create_sample_user(db, str(organization.id))
            click.echo(f"Created user: {user.email}")
        
                
        # Create sample model cards
        model_cards = create_sample_model_cards(db, str(organization.id))
        click.echo(f"Created {len(model_cards)} model cards")
        
        click.echo("Sample data created successfully.")
        
    except Exception as e:
        click.echo(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()


@cli.command()
def reset_db():
    """Reset the database by dropping all tables and recreating them."""
    Base.metadata.drop_all(bind=sync_engine)
    click.echo("Database tables dropped.")
    create_tables()
    click.echo("Database reset successfully.")


if __name__ == "__main__":
    cli()