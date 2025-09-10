-- SQL script to create Model Card tables in PostgreSQL
-- Run this script directly in your PostgreSQL database to create all necessary tables

-- Create model_cards table
CREATE TABLE IF NOT EXISTS model_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL,
    risk_tier VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    fairness_score NUMERIC(5, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    organization_id UUID,
    last_audit_date DATE,
    next_audit_date DATE,
    documentation_url TEXT,
    contact_email VARCHAR(255),
    tags TEXT[],
    metadata JSONB,
    CONSTRAINT model_cards_risk_tier_check CHECK (risk_tier IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT model_cards_status_check CHECK (status IN ('active', 'deprecated', 'archived')),
    CONSTRAINT model_cards_fairness_score_check CHECK (fairness_score >= 0 AND fairness_score <= 1)
);

-- Create model_versions table
CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL,
    version VARCHAR(50) NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,
    is_current BOOLEAN DEFAULT FALSE,
    CONSTRAINT model_versions_model_card_id_version_key UNIQUE (model_card_id, version)
);

-- Create fairness_metrics table
CREATE TABLE IF NOT EXISTS fairness_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC(5, 4) NOT NULL,
    threshold NUMERIC(5, 4) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    demographic_groups TEXT[],
    calculation_method VARCHAR(100),
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB,
    CONSTRAINT fairness_metrics_status_check CHECK (status IN ('pass', 'fail', 'warning')),
    CONSTRAINT fairness_metrics_value_check CHECK (value >= 0 AND value <= 1),
    CONSTRAINT fairness_metrics_threshold_check CHECK (threshold >= 0 AND threshold <= 1),
    CONSTRAINT fairness_metrics_model_card_id_metric_name_key UNIQUE (model_card_id, metric_name)
);

-- Create fairness_metrics_history table
CREATE TABLE IF NOT EXISTS fairness_metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fairness_metric_id UUID NOT NULL,
    value NUMERIC(5, 4) NOT NULL,
    status VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    calculated_by UUID,
    notes TEXT,
    CONSTRAINT fairness_metrics_history_status_check CHECK (status IN ('pass', 'fail', 'warning')),
    CONSTRAINT fairness_metrics_history_value_check CHECK (value >= 0 AND value <= 1)
);

-- Create compliance_frameworks table
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT compliance_frameworks_name_version_key UNIQUE (name, version)
);

-- Create model_compliance table
CREATE TABLE IF NOT EXISTS model_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL,
    framework_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    last_assessed_date DATE,
    next_assessment_date DATE,
    assessor_id UUID,
    notes TEXT,
    evidence_url TEXT,
    CONSTRAINT model_compliance_status_check CHECK (status IN ('compliant', 'non_compliant', 'partial', 'assessment_pending')),
    CONSTRAINT model_compliance_model_card_id_framework_id_key UNIQUE (model_card_id, framework_id)
);

-- Create model_audit_logs table
CREATE TABLE IF NOT EXISTS model_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    details JSONB,
    previous_values JSONB,
    new_values JSONB
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(20),
    test_dataset VARCHAR(255),
    measurement_date DATE,
    metadata JSONB,
    CONSTRAINT performance_metrics_model_card_id_metric_name_measurement_date_key UNIQUE (model_card_id, metric_name, measurement_date)
);

-- Create impact_assessments table
CREATE TABLE IF NOT EXISTS impact_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_card_id UUID NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    impact_level VARCHAR(20) NOT NULL,
    affected_groups TEXT[],
    mitigation_measures TEXT[],
    assessment_date DATE,
    assessor_id UUID,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    CONSTRAINT impact_assessments_impact_level_check CHECK (impact_level IN ('low', 'medium', 'high', 'critical'))
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS ix_model_cards_domain ON model_cards (domain);
CREATE INDEX IF NOT EXISTS ix_model_cards_risk_tier ON model_cards (risk_tier);
CREATE INDEX IF NOT EXISTS ix_model_cards_status ON model_cards (status);
CREATE INDEX IF NOT EXISTS ix_model_cards_created_at ON model_cards (created_at);
CREATE INDEX IF NOT EXISTS ix_model_cards_name_search ON model_cards USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_fairness_metrics_model_card_id ON fairness_metrics (model_card_id);
CREATE INDEX IF NOT EXISTS ix_model_compliance_model_card_id ON model_compliance (model_card_id);
CREATE INDEX IF NOT EXISTS ix_model_audit_logs_model_card_id ON model_audit_logs (model_card_id);
CREATE INDEX IF NOT EXISTS ix_performance_metrics_model_card_id ON performance_metrics (model_card_id);
CREATE INDEX IF NOT EXISTS ix_impact_assessments_model_card_id ON impact_assessments (model_card_id);

-- Add foreign key constraints
ALTER TABLE model_versions 
ADD CONSTRAINT fk_model_versions_model_card_id 
FOREIGN KEY (model_card_id) REFERENCES model_cards(id) ON DELETE CASCADE;

ALTER TABLE model_versions 
ADD CONSTRAINT fk_model_versions_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE fairness_metrics 
ADD CONSTRAINT fk_fairness_metrics_model_card_id 
FOREIGN KEY (model_card_id) REFERENCES model_cards(id) ON DELETE CASCADE;

ALTER TABLE fairness_metrics_history 
ADD CONSTRAINT fk_fairness_metrics_history_fairness_metric_id 
FOREIGN KEY (fairness_metric_id) REFERENCES fairness_metrics(id) ON DELETE CASCADE;

ALTER TABLE fairness_metrics_history 
ADD CONSTRAINT fk_fairness_metrics_history_calculated_by 
FOREIGN KEY (calculated_by) REFERENCES users(id);

ALTER TABLE model_compliance 
ADD CONSTRAINT fk_model_compliance_model_card_id 
FOREIGN KEY (model_card_id) REFERENCES model_cards(id) ON DELETE CASCADE;

ALTER TABLE model_compliance 
ADD CONSTRAINT fk_model_compliance_framework_id 
FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id);

ALTER TABLE model_compliance 
ADD CONSTRAINT fk_model_compliance_assessor_id 
FOREIGN KEY (assessor_id) REFERENCES users(id);

ALTER TABLE model_audit_logs 
ADD CONSTRAINT fk_model_audit_logs_model_card_id 
FOREIGN KEY (model_card_id) REFERENCES model_cards(id) ON DELETE CASCADE;

ALTER TABLE model_audit_logs 
ADD CONSTRAINT fk_model_audit_logs_performed_by 
FOREIGN KEY (performed_by) REFERENCES users(id);

ALTER TABLE performance_metrics 
ADD CONSTRAINT fk_performance_metrics_model_card_id 
FOREIGN KEY (model_card_id) REFERENCES model_cards(id) ON DELETE CASCADE;

ALTER TABLE impact_assessments 
ADD CONSTRAINT fk_impact_assessments_model_card_id 
FOREIGN KEY (model_card_id) REFERENCES model_cards(id) ON DELETE CASCADE;

ALTER TABLE impact_assessments 
ADD CONSTRAINT fk_impact_assessments_assessor_id 
FOREIGN KEY (assessor_id) REFERENCES users(id);

-- Add comments to tables
COMMENT ON TABLE model_cards IS 'Stores information about AI model cards';
COMMENT ON TABLE model_versions IS 'Stores version history for model cards';
COMMENT ON TABLE fairness_metrics IS 'Stores fairness metrics for model cards';
COMMENT ON TABLE fairness_metrics_history IS 'Stores historical values of fairness metrics';
COMMENT ON TABLE compliance_frameworks IS 'Stores compliance frameworks';
COMMENT ON TABLE model_compliance IS 'Stores compliance information for model cards';
COMMENT ON TABLE model_audit_logs IS 'Stores audit logs for model cards';
COMMENT ON TABLE performance_metrics IS 'Stores performance metrics for model cards';
COMMENT ON TABLE impact_assessments IS 'Stores impact assessments for model cards';