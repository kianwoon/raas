# Model Card System Architecture

## Database Schema Visualization

```mermaid
erDiagram
    MODEL_CARDS ||--o{ MODEL_VERSIONS : has
    MODEL_CARDS ||--o{ FAIRNESS_METRICS : has
    MODEL_CARDS ||--o{ MODEL_COMPLIANCE : has
    MODEL_CARDS ||--o{ MODEL_AUDIT_LOGS : has
    MODEL_CARDS ||--o{ PERFORMANCE_METRICS : has
    MODEL_CARDS ||--o{ IMPACT_ASSESSMENTS : has
    MODEL_CARDS }o--|| USERS : created_by
    MODEL_CARDS }o--|| ORGANIZATIONS : belongs_to
    
    FAIRNESS_METRICS ||--o{ FAIRNESS_METRICS_HISTORY : has
    FAIRNESS_METRICS }o--|| MODEL_CARDS : belongs_to
    
    MODEL_COMPLIANCE }o--|| MODEL_CARDS : belongs_to
    MODEL_COMPLIANCE }o--|| COMPLIANCE_FRAMEWORKS : conforms_to
    MODEL_COMPLIANCE }o--|| USERS : assessed_by
    
    MODEL_VERSIONS }o--|| MODEL_CARDS : belongs_to
    MODEL_VERSIONS }o--|| USERS : created_by
    
    PERFORMANCE_METRICS }o--|| MODEL_CARDS : belongs_to
    
    IMPACT_ASSESSMENTS }o--|| MODEL_CARDS : belongs_to
    IMPACT_ASSESSMENTS }o--|| USERS : assessed_by
    
    MODEL_AUDIT_LOGS }o--|| MODEL_CARDS : belongs_to
    MODEL_AUDIT_LOGS }o--|| USERS : performed_by
    
    MODEL_CARDS {
        UUID id PK
        VARCHAR name
        VARCHAR version
        TEXT description
        VARCHAR domain
        VARCHAR risk_tier
        VARCHAR status
        DECIMAL fairness_score
        TIMESTAMP created_at
        TIMESTAMP updated_at
        UUID created_by FK
        UUID organization_id FK
        DATE last_audit_date
        DATE next_audit_date
        TEXT documentation_url
        VARCHAR contact_email
        TEXT[] tags
        JSONB metadata
    }
    
    MODEL_VERSIONS {
        UUID id PK
        UUID model_card_id FK
        VARCHAR version
        TEXT changelog
        TIMESTAMP created_at
        UUID created_by FK
        BOOLEAN is_current
    }
    
    FAIRNESS_METRICS {
        UUID id PK
        UUID model_card_id FK
        VARCHAR metric_name
        DECIMAL value
        DECIMAL threshold
        VARCHAR status
        TEXT description
        TEXT[] demographic_groups
        VARCHAR calculation_method
        TIMESTAMP last_calculated
        JSONB metadata
    }
    
    FAIRNESS_METRICS_HISTORY {
        UUID id PK
        UUID fairness_metric_id FK
        DECIMAL value
        VARCHAR status
        TIMESTAMP calculated_at
        UUID calculated_by FK
        TEXT notes
    }
    
    COMPLIANCE_FRAMEWORKS {
        UUID id PK
        VARCHAR name
        TEXT description
        VARCHAR version
        BOOLEAN is_active
    }
    
    MODEL_COMPLIANCE {
        UUID id PK
        UUID model_card_id FK
        UUID framework_id FK
        VARCHAR status
        DATE last_assessed_date
        DATE next_assessment_date
        UUID assessor_id FK
        TEXT notes
        TEXT evidence_url
    }
    
    MODEL_AUDIT_LOGS {
        UUID id PK
        UUID model_card_id FK
        VARCHAR action
        UUID performed_by FK
        TIMESTAMP performed_at
        JSONB details
        JSONB previous_values
        JSONB new_values
    }
    
    PERFORMANCE_METRICS {
        UUID id PK
        UUID model_card_id FK
        VARCHAR metric_name
        DECIMAL value
        VARCHAR unit
        VARCHAR test_dataset
        DATE measurement_date
        JSONB metadata
    }
    
    IMPACT_ASSESSMENTS {
        UUID id PK
        UUID model_card_id FK
        VARCHAR assessment_type
        VARCHAR impact_level
        TEXT[] affected_groups
        TEXT[] mitigation_measures
        DATE assessment_date
        UUID assessor_id FK
        TEXT notes
        VARCHAR status
    }
```

## API Layer Architecture

```mermaid
graph TD
    subgraph Frontend
        MC[Model Card Components]
        MF[Model Forms]
        MD[Model Detail Views]
        AD[Admin Dashboard]
    end
    
    subgraph API Gateway
        AG[API Gateway / Router]
    end
    
    subgraph Model Card API
        MCRUD[CRUD Endpoints]
        FMETRICS[Fairness Metrics API]
        COMP[Compliance API]
        PERF[Performance API]
        IMPACT[Impact API]
        AUDIT[Audit API]
        SEARCH[Search & Filter API]
    end
    
    subgraph Business Logic
        SVC[Model Card Service]
        FSVC[Fairness Service]
        CSVC[Compliance Service]
        ASVC[Audit Service]
    end
    
    subgraph Data Access
        REPO[Repository Pattern]
        ORM[SQLAlchemy ORM]
        DB[PostgreSQL Database]
    end
    
    MC --> AG
    MF --> AG
    MD --> AG
    AD --> AG
    
    AG --> MCRUD
    AG --> FMETRICS
    AG --> COMP
    AG --> PERF
    AG --> IMPACT
    AG --> AUDIT
    AG --> SEARCH
    
    MCRUD --> SVC
    FMETRICS --> FSVC
    COMP --> CSVC
    AUDIT --> ASVC
    
    SVC --> REPO
    FSVC --> REPO
    CSVC --> REPO
    ASVC --> REPO
    
    REPO --> ORM
    ORM --> DB
```

## Frontend Component Architecture

```mermaid
graph TD
    subgraph Pages
        MPL[Model Card List Page]
        MDP[Model Card Detail Page]
        MCP[Model Card Create Page]
        MEP[Model Card Edit Page]
        ADP[Admin Dashboard Page]
    end
    
    subgraph Components
        MCL[Model Card List]
        MCI[Model Card Item]
        MCD[Model Card Detail]
        MCF[Model Card Form]
        FB[Filter Bar]
        PAG[Pagination]
        FMV[Fairness Metrics View]
        CV[Compliance View]
        PV[Performance View]
        IV[Impact View]
        AV[Audit View]
    end
    
    subgraph Services
        MS[Model Service]
        FS[Fairness Service]
        CS[Compliance Service]
        AS[Audit Service]
        LS[Loading Service]
        NS[Notification Service]
    end
    
    subgraph Utilities
        MU[Model Utils]
        VU[Validation Utils]
        DU[Date Utils]
        CU[Chart Utils]
    end
    
    MPL --> MCL
    MPL --> FB
    MPL --> PAG
    
    MDP --> MCD
    MDP --> FMV
    MDP --> CV
    MDP --> PV
    MDP --> IV
    MDP --> AV
    
    MCP --> MCF
    MEP --> MCF
    
    ADP --> MCL
    ADP --> FB
    
    MCL --> MCI
    MCD --> FMV
    MCD --> CV
    MCD --> PV
    MCD --> IV
    MCD --> AV
    
    MCI --> MS
    MCD --> MS
    MCD --> FS
    MCD --> CS
    MCD --> AS
    MCF --> MS
    MCF --> FS
    MCF --> LS
    FB --> MS
    FMV --> FS
    FMV --> CU
    CV --> CS
    PV --> MS
    IV --> MS
    AV --> AS
    
    MS --> MU
    FS --> MU
    CS --> MU
    AS --> MU
    MCF --> VU
    AV --> DU
    FMV --> CU
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant AG as API Gateway
    participant SVC as Service Layer
    participant REPO as Repository
    participant DB as Database
    participant A as Audit Service
    
    U->>F: View Model Cards
    F->>AG: GET /api/v1/models?filters
    AG->>SVC: getModelCards(filters)
    SVC->>REPO: getMulti(filters)
    REPO->>DB: SELECT * FROM model_cards WHERE...
    DB-->>REPO: Model Card Data
    REPO-->>SVC: Model Card Objects
    SVC-->>AG: Model Card Response
    AG-->>F: Model Card JSON
    F-->>U: Display Model Cards
    
    U->>F: Create Model Card
    F->>AG: POST /api/v1/models
    AG->>SVC: createModelCard(data)
    SVC->>REPO: create(data)
    REPO->>DB: INSERT INTO model_cards...
    DB-->>REPO: New Model Card ID
    REPO-->>SVC: Model Card Object
    SVC->>A: logAudit(action='create')
    A->>REPO: createAuditLog()
    REPO->>DB: INSERT INTO model_audit_logs...
    SVC-->>AG: Model Card Response
    AG-->>F: Model Card JSON
    F-->>U: Display Success
    
    U->>F: View Model Card Details
    F->>AG: GET /api/v1/models/{id}
    AG->>SVC: getModelCard(id)
    SVC->>REPO: get(id)
    REPO->>DB: SELECT * FROM model_cards WHERE id = ...
    DB-->>REPO: Model Card Data
    REPO-->>SVC: Model Card Object
    SVC->>REPO: getFairnessMetrics(model_id)
    REPO->>DB: SELECT * FROM fairness_metrics WHERE...
    DB-->>REPO: Fairness Metrics
    REPO-->>SVC: Fairness Metric Objects
    SVC->>REPO: getComplianceStatus(model_id)
    REPO->>DB: SELECT * FROM model_compliance WHERE...
    DB-->>REPO: Compliance Data
    REPO-->>SVC: Compliance Objects
    SVC-->>AG: Model Card with Details
    AG-->>F: Model Card JSON
    F-->>U: Display Model Card Details
    
    U->>F: Update Fairness Metric
    F->>AG: PUT /api/v1/models/{id}/fairness/{metric_id}
    AG->>SVC: updateFairnessMetric(id, metric_id, data)
    SVC->>REPO: getFairnessMetric(metric_id)
    REPO->>DB: SELECT * FROM fairness_metrics WHERE id = ...
    DB-->>REPO: Fairness Metric
    REPO-->>SVC: Fairness Metric Object
    SVC->>REPO: update(fairness_metric, data)
    REPO->>DB: UPDATE fairness_metrics SET...
    DB-->>REPO: Updated Fairness Metric
    SVC->>REPO: createFairnessMetricHistory()
    REPO->>DB: INSERT INTO fairness_metrics_history...
    SVC->>A: logAudit(action='update_fairness_metric')
    A->>REPO: createAuditLog()
    REPO->>DB: INSERT INTO model_audit_logs...
    SVC-->>AG: Updated Fairness Metric
    AG-->>F: Fairness Metric JSON
    F-->>U: Display Updated Metric
```

## Security and Access Control Architecture

```mermaid
graph TD
    subgraph Authentication
        U[User]
        AD[Auth Database]
        JWT[JWT Tokens]
    end
    
    subgraph Authorization
        RBAC[Role-Based Access Control]
        ABAC[Attribute-Based Access Control]
        POL[Policy Engine]
    end
    
    subgraph API Protection
        AG[API Gateway]
        AUTHZ[Authorization Middleware]
        VAL[Validation Middleware]
        RL[Rate Limiting]
    end
    
    subgraph Resources
        MC[Model Cards]
        FM[Fairness Metrics]
        CM[Compliance Data]
        ADT[Audit Trails]
    end
    
    U-->|Login| AD
    AD-->|User Data| U
    U-->|Credentials| AG
    AG-->|Verify| AD
    AD-->|Validation| AG
    AG-->|Generate| JWT
    JWT-->|Token| U
    U-->|Token| AG
    
    AG-->|Extract Claims| AUTHZ
    AUTHZ-->|Check Permissions| RBAC
    RBAC-->|Roles/Permissions| POL
    ABAC-->|Attributes| POL
    POL-->|Decision| AUTHZ
    AUTHZ-->|Allow/Deny| VAL
    
    VAL-->|Validate Input| RL
    RL-->|Apply Limits| MC
    RL-->|Apply Limits| FM
    RL-->|Apply Limits| CM
    RL-->|Apply Limits| ADT
    
    MC-->|Log Access| ADT
    FM-->|Log Access| ADT
    CM-->|Log Access| ADT
```

## Search and Filtering Architecture

```mermaid
graph TD
    subgraph Frontend
        UI[Filter Interface]
        SQ[Search Query]
    end
    
    subgraph API Layer
        EP[API Endpoint]
        PQ[Parse Query]
        VF[Validate Filters]
    end
    
    subgraph Query Building
        QB[Query Builder]
        ES[Elasticsearch Query]
        PG[PostgreSQL Query]
    end
    
    subgraph Data Sources
        PG_DB[(PostgreSQL)]
        ES_IDX[(Elasticsearch Index)]
    end
    
    subgraph Results
        MR[Model Results]
        AG[Aggregate Results]
        PG_R[Paginated Results]
    end
    
    UI-->|Filters| SQ
    SQ-->|Query String| EP
    EP-->|Raw Query| PQ
    PQ-->|Parsed| VF
    VF-->|Validated| QB
    
    QB-->|Text Search| ES
    QB-->|Structured Filters| PG
    
    ES-->|Search Query| ES_IDX
    ES_IDX-->|Search Results| ES
    ES-->|Result IDs| QB
    
    PG-->|DB Query| PG_DB
    PG_DB-->|Model Data| PG
    PG-->|Model Objects| QB
    
    QB-->|Combined Results| MR
    MR-->|Sort/Aggregate| AG
    AG-->|Paginate| PG_R
    PG_R-->|Final Response| EP
    EP-->|JSON| UI
```

This architecture provides a comprehensive overview of how the Model Card system will be structured, from the database layer through to the frontend components. It ensures proper separation of concerns, scalability, and maintainability while supporting the complex requirements of AI model transparency and fairness tracking.