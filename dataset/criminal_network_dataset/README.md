# Criminal Network Analysis Dataset

**Version:** 1.0  
**Date:** 2024-08-29  
**Classification:** SYNTHETIC - FOR DEVELOPMENT/TESTING ONLY

---

## ⚠️ IMPORTANT DISCLAIMER

**This dataset is 100% synthetic fictional data** created for software development, testing, graph analytics, NLP experimentation, and hackathon demonstration purposes.

- **No real persons, real case numbers, real financial accounts, or real sensitive operational data** were used
- All names, phone numbers, bank accounts, vehicle registrations, organizations, locations, and narratives are **fictional**
- The dataset simulates fragmented law-enforcement/intelligence information from multiple sources
- Designed to test entity resolution, relationship extraction, graph construction, temporal analysis, financial analysis, communication analysis, community detection, centrality analysis, and anomaly detection

---

## 📁 FOLDER STRUCTURE

```
criminal_network_dataset/
├── structured/
│   ├── cdr.csv                      # 150 Call Detail Records
│   ├── financial_transactions.csv   # 80 Financial Transactions
│   ├── phone_registry.csv           # 40 Phone Registry Entries
│   ├── vehicle_registry.csv         # 25 Vehicle Registrations
│   ├── bank_accounts.csv            # 35 Bank Accounts
│   ├── organization_registry.csv    # 20 Organizations
│   ├── locations.csv                # 50 Locations
│   └── criminal_records.csv         # 51 Criminal/Case History Records
├── semi_structured/
│   ├── fir_records.json             # 5 Primary FIRs + metadata
│   ├── case_metadata.json           # 15 Case Metadata Records
│   ├── social_media_export.json     # 40 Social Media Posts
│   └── email_records.json           # 30 Email Records
├── unstructured/
│   ├── fir_narratives/              # 8 FIR Narrative Documents
│   ├── surveillance_reports/        # 8 Surveillance Reports
│   ├── intelligence_reports/        # 7 Intelligence Reports
│   ├── witness_statements/          # 8 Witness Statements
│   └── investigation_notes/         # 10 Investigation Notes
└── README.md                        # This file
```

---

## 📊 STRUCTURED DATA - SCHEMAS & DESCRIPTIONS

### 1. CDR Records (`structured/cdr.csv`) - 150 Records
**Canonical 30 CDR rows preserved from specification + 120 synthetic additions**

| Column | Description | Example |
|--------|-------------|---------|
| `cdr_id` | Unique record identifier | CDR001 |
| `caller_number` | Calling party phone number | 9876543210 |
| `receiver_number` | Receiving party phone number | 9123456789 |
| `caller_name` | Caller name (with aliases) | Rajesh Kumar / Rajesh K. / R. Kumar |
| `receiver_name` | Receiver name (with aliases) | Vikram Singh / Vikram S. |
| `date` | Call date (YYYY-MM-DD) | 2024-01-10 |
| `time` | Call time (HH:MM:SS) | 22:30:00 |
| `duration_seconds` | Call duration | 345 |
| `tower_location` | Cell tower location | Dwarka Delhi |
| `source_case_id` | Originating FIR | FIR-2024-001 |

**Key Features:**
- Preserves all 30 canonical CDR rows exactly
- Entity resolution challenges: name variations (Rajesh Kumar/Rajesh K./R. Kumar), phone format variations
- Cross-case communication links (drug↔fraud, fraud↔hawala, hawala↔arms)
- Temporal patterns: night calls (22:00-23:45) for covert ops, morning (10:00-11:00) for hawala settlements
- Source provenance via `source_case_id`

### 2. Financial Transactions (`structured/financial_transactions.csv`) - 80 Records
**Canonical 20 transactions preserved + 60 synthetic additions**

| Column | Description | Example |
|--------|-------------|---------|
| `transaction_id` | Unique transaction ID | TXN001 |
| `date` | Transaction date | 2024-01-05 |
| `sender_name` | Sender name (with aliases) | Rajesh Kumar |
| `sender_account` | Sender bank account | HDFC12345678901234 |
| `receiver_name` | Receiver name | Vikram Singh |
| `receiver_account` | Receiver bank account | PNB98765432101234 |
| `amount_inr` | Amount in Indian Rupees | 500000 |
| `bank` | Bank name | HDFC |
| `type` | Transaction type | NEFT/RTGS/IMPS/SWIFT |
| `description` | Transaction description | Business payment |
| `source_case_id` | Originating FIR | FIR-2024-001 |

**Key Features:**
- Preserves all 20 canonical transactions exactly
- Transaction chains: Drug proceeds → Shell companies → Offshore → Shell companies → Properties
- Anomaly patterns: Large round-number transfers, new shell activations, velocity bursts, offshore routing
- Cross-case flows: Fraud→Drug (TXN010, TXN030, TXN058), Fraud→Arms (TXN035, TXN063), Drug→Arms (TXN049, TXN077)
- Shell company layering: 12 Indian shells + 6 offshore entities

### 3. Phone Registry (`structured/phone_registry.csv`) - 40 Entries

| Column | Description | Example |
|--------|-------------|---------|
| `phone_id` | Unique phone record ID | PH001 |
| `phone_number` | Phone number (various formats) | 9876543210 / +91-971-50-1234567 |
| `subscriber_name` | Registered subscriber | Rajesh Kumar / Rajesh K. / Unknown |
| `subscriber_type` | Personal/Business/International | Personal |
| `city` | Registered city | Delhi |
| `status` | Active/Inactive | Active |
| `first_seen` | First appearance in data | 2023-01-15 |
| `last_seen` | Last appearance in data | 2024-06-11 |
| `source_case_id` | Originating FIR | FIR-2024-001 |

**Key Features:**
- Core numbers: 9876543210 (Rajesh), 9123456789 (Vikram), 9111222333 (Farooq), 8877665544 (Sunil), 7766554433 (Amit), 8899001122 (Ravi), 7788990011 (Baldev), 9900112233 (Kiran), 9988776655 (Unknown Ludhiana), +971-50-1234567 (Hassan Ali Dubai)
- Alias variations for entity resolution testing
- Reassigned/inactive numbers for temporal resolution
- International format variations (+91, +971)

### 4. Vehicle Registry (`structured/vehicle_registry.csv`) - 25 Entries

| Column | Description | Example |
|--------|-------------|---------|
| `vehicle_id` | Unique vehicle ID | VEH001 |
| `registration_number` | Registration plate | DL-5C-AB-1234 |
| `make_model` | Vehicle make/model | Toyota Fortuner |
| `color` | Vehicle color | White |
| `registered_owner` | Registered owner name | Rajesh Kumar |
| `associated_person` | Observed user | Rajesh Kumar |
| `city` | Registration city | Delhi |
| `status` | Active/Seized | Active |
| `source_case_id` | Originating FIR | FIR-2024-001 |

**Key Features:**
- Canonical vehicles: DL-5C-AB-1234 (Fortuner), HR-26-DK-9876 (Scorpio), DL-1C-MN-4567 (Innova), UP-32-BN-5678 (Truck)
- Dual-use vehicles: Scorpio/Innova used for BOTH cash transport AND arms transport
- Registered owner vs. observed user distinction
- Registration format variations

### 5. Bank Accounts (`structured/bank_accounts.csv`) - 35 Entries

| Column | Description | Example |
|--------|-------------|---------|
| `account_id` | Unique account ID | ACC001 |
| `account_number` | Bank account number | HDFC12345678901234 |
| `holder_name` | Account holder | Rajesh Kumar |
| `bank` | Bank name | HDFC Bank |
| `branch_city` | Branch city | Dwarka Delhi |
| `account_type` | Savings/Current | Savings |
| `opened_date` | Account opening date | 2020-01-15 |
| `status` | Active/Frozen | Active |
| `linked_entity_type` | Person/Organization | Person |
| `linked_entity_id` | Link to person/org ID | PER001 |

**Key Features:**
- All accounts from transaction data + FIR narratives
- 12 shell company accounts (Kolkata, Mumbai, Delhi, Dubai, Mauritius)
- Offshore accounts: Emirates NBD (Dubai), Mauritius entities
- Account number format variations for resolution testing
- Person vs. Organization linking

### 6. Organization Registry (`structured/organization_registry.csv`) - 20 Entries

| Column | Description | Example |
|--------|-------------|---------|
| `organization_id` | Unique org ID | ORG001 |
| `organization_name` | Organization name | Tech Solutions Pvt Ltd |
| `organization_type` | Shell/Front/Legitimate/Offshore | Shell Company |
| `registration_city` | Registration city | Bangalore |
| `registration_address` | Full address | 123 MG Road, Bangalore |
| `director_name` | Director name | Priya Sharma |
| `status` | Active/Struck Off | Active |
| `source_case_id` | Originating FIR | FIR-2024-005 |

**Key Features:**
- Canonical: Tech Solutions Pvt Ltd, Northern Trading Co.
- 12 shell companies across Kolkata, Mumbai, Delhi, Bangalore, Goa, Surat, Kochi
- 6 offshore entities (3 Mauritius, 3 Dubai)
- Front companies for specific crime types
- Director overlap for entity resolution

### 7. Locations (`structured/locations.csv`) - 50 Entries

| Column | Description | Example |
|--------|-------------|---------|
| `location_id` | Unique location ID | LOC001 |
| `name` | Location name | Dwarka |
| `type` | Neighborhood/City/Market/Vehicle/Phone | Neighborhood |
| `city` | City | Delhi |
| `state` | State | Delhi |
| `country` | Country | India |
| `latitude` | Latitude | 28.5921 |
| `longitude` | Longitude | 77.0460 |
| `aliases` | Alternative names | "Sector 12, Dwarka" |

**Key Features:**
- All cities from FIRs: Delhi, Mumbai, Amritsar, Lucknow, Bangalore, Surat, Kochi, Goa, Kolkata, Ludhiana, Munger, Srinagar, Jammu, Dubai, Mauritius
- Specific venues: Hotel Grand Palace, Taj Hotel Goa, Shop No. 78, House No. 45
- Mobile locations: Vehicles, Phone numbers (for geospatial analysis)
- Aliases for entity resolution

### 8. Criminal Records (`structured/criminal_records.csv`) - 51 Entries

| Column | Description | Example |
|--------|-------------|---------|
| `record_id` | Unique record ID | CR001 |
| `person_id` | Person identifier | PER001 |
| `person_name` | Person name | Rajesh Kumar |
| `case_id` | Case/FIR ID | FIR-2024-001 |
| `offense_type` | Offense category | Drug Trafficking |
| `date` | Offense/Case date | 2024-01-15 |
| `role` | Role in case | Primary Suspect |
| `status` | Case status | Under Investigation |
| `jurisdiction` | Jurisdiction | Delhi |

**Key Features:**
- Cross-case appearances (same person in multiple FIRs)
- Historical cases (2022-2023) providing background
- Various roles: Primary Suspect, Co-conspirator, Associate, Witness, Minor Role
- Status variations: Under Investigation, Active, Chargesheet Filed, Closed
- **NOT ground truth** - synthetic case records only

---

## 📋 SEMI-STRUCTURED DATA - SCHEMAS & DESCRIPTIONS

### 1. FIR Records (`semi_structured/fir_records.json`) - 5 Primary FIRs
Complete structured representation of the 5 canonical FIRs with rich narratives, evidence lists, and metadata.

### 2. Case Metadata (`semi_structured/case_metadata.json`) - 15 Records
5 primary FIRs + 10 historical/related cases with explicit cross-case links:
- FIR-2024-001 ↔ FIR-2024-002 (Rajesh/Sunil communication, financial flows)
- FIR-2024-001 ↔ FIR-2024-003 (Vikram/Farooq hawala, Rajesh/Farooq)
- FIR-2024-002 ↔ FIR-2024-005 (Tech Solutions layering, Sunil/Priya/Kiran)
- FIR-2024-003 ↔ FIR-2024-004 (Ravi Shankar dual role, Farooq hawala for arms)
- FIR-2024-004 ↔ FIR-2024-005 (Northern Trading finance, Priya contact)

### 3. Social Media Export (`semi_structured/social_media_export.json`) - 40 Posts
Platforms: WhatsApp, Telegram, Signal, Instagram, Facebook
- Explicit relationships: "Rajesh called Vikram"
- Implicit relationships: "The individual previously linked to Amritsar contact..."
- Co-location: "Priya and Kiran were present at same meeting"
- Coded/vague language requiring NLP extraction
- Entity mentions with aliases
- Temporal references: "Two days after the meeting..."

### 4. Email Records (`semi_structured/email_records.json`) - 30 Emails
- Direct references to people, organizations, locations, meetings, transactions
- Coded language: "Consignment", "Delivery", "Party", "Rate"
- Attachments referencing: ledgers, manifests, route maps, forged docs
- Cross-case references in email threads
- Provenance via `case_id` field

---

## 📄 UNSTRUCTURED DATA - DOCUMENT TYPES

### FIR Narratives (`unstructured/fir_narratives/`) - 8 Documents
- 5 primary FIR narratives (FIR-2024-001 through 005)
- 3 historical FIR narratives (FIR-2023-012, 028, 045)
- Each with: DOCUMENT_ID, CASE_ID, DATE, SOURCE_TYPE, full narrative text
- Rich entity mentions: people, phones, vehicles, accounts, locations, organizations

### Surveillance Reports (`unstructured/surveillance_reports/`) - 8 Reports
- SURV-001 through SURV-008 (4 canonical + 4 synthetic)
- Structured observations with timestamps, persons, vehicles, locations
- Explicit behavioral observations (envelope exchanges, box loading, meetings)
- Cross-references to CDR, financial transactions, other surveillance

### Intelligence Reports (`unstructured/intelligence_reports/`) - 7 Reports
- INTL-001 through INTL-007
- Strategic assessments with network topology, volume estimates, route analysis
- Anomaly detection indicators
- Cross-case nexus analysis
- Classification markings (CONFIDENTIAL/SECRET/TOP SECRET)

### Witness Statements (`unstructured/witness_statements/`) - 8 Statements
- WIT-001 through WIT-008
- Civilian witnesses: coffee shop owner, shop assistant, call center employee, dhaba owner, hotel staff, neighbor, transporter associate, property broker
- Varying reliability and proximity to events
- Ambiguous/uncertain language: "appeared to be", "seemed like", "I think"
- Entity resolution challenges: "Sardar ji", "the lady", "Farooq bhai"

### Investigation Notes (`unstructured/investigation_notes/`) - 10 Notes
- INV-001 through INV-010
- Officer working notes with interrogation summaries, CDR analysis, financial trails
- Anomaly detection results (Isolation Forest, LSTM)
- Code book deciphering (Farooq's hawala codes)
- Network topology assessments
- Prosecution strategy documents
- Kashmir nexus investigation (INV-009)
- Final consolidated assessment (INV-010)

---

## 🔑 KEY ENTITIES (CANONICAL)

### Core Persons (11 Primary)
| Person | Aliases | Primary Role | Cases |
|--------|---------|--------------|-------|
| Rajesh Kumar | Rajesh K., R. Kumar | Drug Supplier/Proceeds Source | 001, 002, 005 |
| Vikram Singh | Vikram S., Vikram Singh Amritsar | Drug/Arms Recipient, Hub | 001, 002, 003, 004 |
| Mohammed Farooq | Mohd. Farooq, M. Farooq | Hawala Operator | 001, 002, 003, 004, 005 |
| Priya Sharma | Priya S., P. Sharma | Shell Architect, Coordinator | 001, 002, 003, 004, 005 |
| Sunil Verma | Sunil V., S. Verma | Fraud Operator, Arms Finance | 001, 002, 003, 004, 005 |
| Amit Patel | Amit P. | Infrastructure (SIM/Accounts/Docs/Gold) | 002, 003, 005 |
| Deepa Nair | Deepa N. | Crypto Converter, Fund Router | 002, 003, 005 |
| Ravi Shankar | Ravi S. | Transporter (Cash + Arms) | 003, 004 |
| Baldev Raj | - | Arms Manufacturer (Munger) | 003, 004 |
| Kiran Desai | Kiran D., P. Sharma | Property Front | 003, 005 |
| Hassan Ali | - | International Settlement (Dubai) | 003, 005 |

### Core Phone Numbers (10 Primary)
| Number | Entity | Location | Notes |
|--------|--------|----------|-------|
| 9876543210 | Rajesh Kumar | Delhi | Primary |
| 9123456789 | Vikram Singh | Amritsar | Primary |
| 9111222333 | Mohammed Farooq | Delhi | Primary |
| 8877665544 | Sunil Verma | Mumbai | Primary |
| 7766554433 | Amit Patel | Surat | Primary |
| 8899001122 | Ravi Shankar | Lucknow | Primary |
| 7788990011 | Baldev Raj | Munger | Primary |
| 9900112233 | Kiran Desai | Bangalore | Primary |
| 9988776655 | Unknown | Ludhiana | Burner/Courier |
| +971-50-1234567 | Hassan Ali | Dubai | International |

### Core Vehicles (4 Canonical)
| Registration | Make/Model | Primary User | Dual Use |
|--------------|------------|--------------|----------|
| DL-5C-AB-1234 | Toyota Fortuner | Rajesh Kumar | Drug transport |
| HR-26-DK-9876 | Mahindra Scorpio | Ravi Shankar | Cash + Arms pilot |
| DL-1C-MN-4567 | Toyota Innova | Farooq/Ravi | Cash backup + Arms backup |
| UP-32-BN-5678 | Truck | Ravi Shankar | Arms primary |

### Core Organizations (2 Canonical + 18 Synthetic)
| Organization | Type | Key Director | Cases |
|--------------|------|--------------|-------|
| Tech Solutions Pvt Ltd | Shell Company | Priya Sharma | 002, 005 |
| Northern Trading Co. | Front Company | Sunil Verma | 004, 005 |
| 12 Shell Companies | Shell | Various proxies | 001, 002, 003, 005 |
| 6 Offshore Entities | Offshore | Priya/Sunil/Rajesh/Hassan/Farooq | 003, 005 |

---

## 🕸️ NETWORK TOPOLOGY - CLUSTERS & BRIDGES

### Cluster A: Drug Core (Delhi-Amritsar)
**Rajesh Kumar ↔ Vikram Singh ↔ Mohammed Farooq**
- Drug supply chain: Rajesh (Delhi distribution) ← Vikram (Amritsar supply) → Farooq (hawala settlement)
- Vehicle: Fortuner DL-5C-AB-1234 (Delhi-Amritsar NH44)
- Financial: HDFC→PNB→AXIS hawala chain

### Cluster B: Fraud Operations (Mumbai-Surat-Kochi)
**Sunil Verma ↔ Amit Patel ↔ Deepa Nair**
- Call centers: Malad/Goregaon (Sunil)
- Infrastructure: SIMs, accounts, docs (Amit, Surat)
- Crypto conversion: Deepa (Kochi) via FED/KOTAK/HDFC/YES shells
- Proceeds routing: Mumbai → Surat → Kochi → Offshore

### Cluster C: Shell Company Layering (Bangalore-Goa)
**Priya Sharma ↔ Kiran Desai ↔ Tech Solutions Pvt Ltd**
- Tech Solutions: Primary layering vehicle (Bangalore)
- Properties: Koramangala (Bangalore), Calangute (Goa)
- Offshore: Oceanic Holdings, Island Finance, Pacific Rim (Mauritius)
- Director overlap across 12 shells

### Cluster D: Arms Pipeline (Munger-Lucknow-Amritsar-Kashmir)
**Baldev Raj → Ravi Shankar → Vikram Singh**
- Production: Baldev (Munger workshop)
- Transport: Ravi (Truck UP-32-BN-5678, Scorpio, Innova)
- Recipient: Vikram (Amritsar) → Kashmir diversion (Shopian, Pulwaram, Srinagar)
- Finance: Northern Trading Co. (Lucknow) → Hawala (Farooq)

### Critical Bridge Entities (Inter-Cluster Connectors)
| Bridge | Connects | Mechanism |
|--------|----------|-----------|
| **Mohammed Farooq** | ALL clusters | Hawala settlements for drug, fraud, arms, shells |
| **Priya Sharma** | A, B, C, D | Shell coordination, Goa meetings, property fronts |
| **Vikram Singh** | A, B, D | Drug recipient, fraud beneficiary, arms recipient |
| **Sunil Verma** | B, C, D | Fraud ops, Northern Trading finance, shell funding |
| **Ravi Shankar** | A, C, D | Cash transport (Farooq), Arms transport (Baldev/Vikram) |
| **Amit Patel** | B, C, D | SIM/Accounts (Fraud), Gold (Hawala), Forged docs (Shells) |
| **Deepa Nair** | B, C | Crypto (Fraud), Commission routing (Hawala/Shells) |
| **Kiran Desai** | C, D | Property (Shells), Goa meetings (Arms coordination) |
| **Baldev Raj** | C, D | Arms production, Hawala client (Farooq) |
| **Hassan Ali** | C, D | International settlement (Shells, Hawala) |

---

## 🚨 ANOMALY PATTERNS (FOR DETECTION TESTING)

### Financial Anomalies
1. **Large Round-Number Transfers**: TXN039 (30L shell activation), TXN016 (50L new shell), TXN043/071 (70L crypto prep)
2. **Velocity Bursts**: Feb-Mar 2024: 40% volume increase post-raids
3. **New Account Activation**: Shell3, Shell8, Shell10, KOTAK/HDFC/YES/IDFC shells activated in clusters
4. **Offshore Routing Spikes**: AXIS 8888... (Mauritius) 40L single transfer (TXN067)
5. **Property Flipping**: Goa villa 75L→1Cr in 16 days (TXN009→TXN014)
6. **Circular Flows**: Rajesh→Offshore→Tech Solutions→Priya→Kiran→Priya

### Communication Anomalies
1. **Night-Only Pattern**: 9988776655 (Ludhiana) exclusively 23:00-23:45 calls to Rajesh/Vikram
2. **Burner Acceleration**: 3/month → 8/month post-Feb raids
3. **Geographic Bursts**: Chandni Chowk heat → Kolkata shell activation
4. **Platform Migration**: WhatsApp → Signal → Telegram → Session (decentralized)

### Structural Anomalies
1. **Dual-Use Vehicles**: Scorpio/Innova for cash AND arms transport
2. **Unified Transporter**: Ravi Shankar = single physical node for drug/hawala/arms
3. **Single Hawala Hub**: Farooq processes 100Cr+ for ALL revenue streams
4. **Diplomatic Exploitation**: CD-plate vehicle at coordination meeting

---

## 🧩 ENTITY RESOLUTION CHALLENGES

### Name Variations (Deliberate)
| Canonical | Variations |
|-----------|------------|
| Rajesh Kumar | Rajesh K., R. Kumar |
| Vikram Singh | Vikram S., Vikram Singh Amritsar |
| Mohammed Farooq | Mohd. Farooq, M. Farooq |
| Priya Sharma | Priya S., P. Sharma |
| Sunil Verma | Sunil V., S. Verma |
| Amit Patel | Amit P. |
| Deepa Nair | Deepa N. |
| Ravi Shankar | Ravi S. |
| Kiran Desai | Kiran D. |

### Phone Format Variations
- 9876543210 / +91-9876543210 / 91-9876543210
- +971-50-1234567 / 00971-50-1234567
- With/without spaces, dashes, country codes

### Account Format Variations
- HDFC12345678901234 / HDFC 1234 5678 9012 34 / 12345678901234
- With/without bank prefix, spaces, grouping

### Vehicle Registration Variations
- DL-5C-AB-1234 / DL5CAB1234 / DL 5C AB 1234
- HR-26-DK-9876 / HR26DK9876

### Organization Name Variations
- Tech Solutions Pvt Ltd / Tech Solutions / Tech Solutions Private Limited
- Northern Trading Co. / Northern Trading Company / Northern Trading

### Location Aliases
- Chandni Chowk / Old Delhi / Shop No. 78
- Hotel Grand Palace / Grand Palace / Karol Bagh Hotel
- Taj Hotel Goa / Taj Fort Aguada / Taj Goa

---

## 🤖 AI/NLP TESTING CAPABILITIES

### Easy Extraction (Explicit)
- "Rajesh Kumar called Vikram Singh"
- "5kg heroin seized from Rajesh Kumar"
- "TXN001: 5L transferred from Rajesh to Vikram"

### Medium Extraction (Semi-Explicit)
- "The Fortuner was driven by Rajesh"
- "Funds were transferred from account X to account Y"
- "Priya was seen meeting Sunil at Hotel Grand Palace"

### Difficult Extraction (Implicit/Contextual)
- "The individual previously linked to the Amritsar contact was seen meeting the person associated with the Dwarka number"
- "Priya was reportedly seen with the broker"
- "Two days after the meeting, a transfer occurred"
- "The Scorpio and Innova both clean per latest check"

### Ambiguity Testing
- "believed to be", "possibly", "reportedly", "suspected", "appeared to"
- Pronoun resolution: "he", "she", "they" across sentences
- Coded language: "Consignment", "Delivery", "Party", "Rate", "Broker"
- Temporal references: "last week", "the other day", "recently"

---

## 📍 SOURCE PROVENANCE TRACKING

Every record includes traceability fields:

### Structured Data
- `source_record_id` / `cdr_id` / `transaction_id` / `phone_id` / `vehicle_id` / `account_id` / `organization_id` / `location_id` / `record_id`
- `source_file` (implied by filename)
- `source_case_id` / `case_id` linking to originating FIR

### Semi-Structured Data
- `document_id` / `fir_id` / `case_metadata_id` / `post_id` / `email_id`
- `case_id` linking to FIR
- `source_type` indicating origin

### Unstructured Data
- `DOCUMENT_ID` in header
- `CASE_ID` in header
- `DATE` in header
- `SOURCE_TYPE` in header
- `SOURCE` (unit/officer) in header
- Full text content for NLP extraction

**Provenance Chain Example:**
```
Entity: "Rajesh Kumar"
  → Relationship: "called Vikram Singh"
    → Source: CDR001 (structured/cdr.csv)
      → Original Row: caller=9876543210, receiver=9123456789, date=2024-01-10
    → Corroborated: SURV-001 (unstructured/surveillance_reports/SURV-001.txt)
      → Text: "Subject Rajesh Kumar observed leaving residence in white Toyota Fortuner DL-5C-AB-1234"
    → Corroborated: EML001 (semi_structured/email_records.json)
      → Text: "The Fortuner (DL-5C-AB-1234) will depart Dwarka at 2200 hrs"
```

---

## 📈 INTENDED USE CASES

### 1. Neo4j Knowledge Graph Ingestion
- Nodes: Person, Phone, Vehicle, Account, Organization, Location, Case, Document
- Edges: CALLS, TRANSFERS, OWNS, REGISTERED_TO, ASSOCIATED_WITH, MENTIONED_IN, PART_OF, LINKED_TO
- Properties: All column fields + extracted entities from text
- Provenance: Every edge traced to source record/document

### 2. Graph Analytics (Neo4j GDS / NetworkX)
- **Degree Centrality**: Identify hubs (Farooq, Priya, Vikram, Sunil, Ravi)
- **Betweenness Centrality**: Identify bridges (Amit, Deepa, Kiran, Baldev, Hassan)
- **PageRank**: Influence scoring across multi-layer network
- **Community Detection**: Louvain/Leiden - should reveal 4 clusters with bridges
- **Shortest Paths**: Cross-case connection paths (e.g., Rajesh → Sunil → Amit → Farooq → Baldev)
- **Temporal Analysis**: Network evolution Jan-Jul 2024

### 3. Anomaly Detection
- **Isolation Forest**: Financial transaction amounts, velocities, new accounts
- **LSTM/Time Series**: Communication patterns, transaction sequences
- **Graph-based**: Structural anomalies (dual-use vehicles, unified transporter)
- **Rule-based**: Night calls, round numbers, offshore routing, property flips

### 4. Entity Resolution
- **Deterministic**: Exact matches on phone, account, vehicle, registration
- **Probabilistic**: Name variations, fuzzy address matching, alias clustering
- **Contextual**: Co-occurrence in documents, communication patterns, shared attributes

### 5. NLP/Relation Extraction
- **NER**: Person, Organization, Location, Phone, Vehicle, Account, Date, Money, Weapon, Drug
- **REL**: PERSON-CALLS-PERSON, PERSON-OWNS-VEHICLE, PERSON-TRANSFERS-TO-PERSON, ORG-LOCATED-AT-LOCATION, PERSON-MEETS-PERSON-AT-LOCATION
- **Event Extraction**: Meeting, Transfer, Transport, Raid, Arrest, Seizure
- **Coreference**: Pronoun resolution, alias linking, entity chaining

### 5. Temporal Analysis
- Communication sequences leading to raids
- Financial layering stages (placement→layering→integration)
- Network regeneration post-intervention
- Seasonal/quarterly patterns (Goa meetings)

---

## 🔄 SUGGESTED INGESTION FLOW

```
structured/
   ↓
schema mapping + normalization
   (CDR → Call edges, Transactions → Transfer edges, Registry → Node properties)

semi_structured/
   ↓
field extraction + text processing
   (JSON → structured fields, NER on narratives, relation extraction on emails/social)

unstructured/
   ↓
text extraction + NLP/LLM
   (PDF/TXT/MD → NER + REL + Event extraction + Coreference resolution)

all sources
   ↓
canonical entities + relationships + events + evidence
   (Entity resolution → Graph construction → Provenance attachment)

   ↓
Neo4j
   (Node/Edge creation → GDS analytics → Visualization → API)
```

### Recommended Processing Order
1. **Structured first** - establishes canonical entities (persons, phones, accounts, vehicles, orgs, locations)
2. **Semi-structured second** - enriches with metadata, cross-case links, communication content
3. **Unstructured last** - extracts implicit relationships, corroborates/contradicts structured data
4. **Entity Resolution pass** - merges aliases, resolves references across all sources
5. **Graph Construction** - builds Neo4j with full provenance
6. **Analytics** - runs GDS algorithms, anomaly detection, community detection

---

## 📊 APPROXIMATE RECORD COUNTS

| Category | Files | Records |
|----------|-------|---------|
| **Structured** | 8 CSV files | ~431 total |
| CDR | 1 | 150 |
| Financial Transactions | 1 | 80 |
| Phone Registry | 1 | 40 |
| Vehicle Registry | 1 | 25 |
| Bank Accounts | 1 | 35 |
| Organization Registry | 1 | 20 |
| Locations | 1 | 50 |
| Criminal Records | 1 | 51 |
| **Semi-Structured** | 4 JSON files | ~90 total |
| FIR Records | 1 | 5 |
| Case Metadata | 1 | 15 |
| Social Media Posts | 1 | 40 |
| Email Records | 1 | 30 |
| **Unstructured** | 41 text files | 41 documents |
| FIR Narratives | 8 | 8 |
| Surveillance Reports | 8 | 8 |
| Intelligence Reports | 7 | 7 |
| Witness Statements | 8 | 8 |
| Investigation Notes | 10 | 10 |
| **TOTAL** | **53 files** | **~562 primary records + full text** |

---

## ✅ QUALITY ASSURANCE CHECKLIST

- [x] All 30 canonical CDR rows preserved exactly
- [x] All 20 canonical financial transactions preserved exactly
- [x] All 4 canonical surveillance reports preserved (SURV-001 to SURV-004)
- [x] All 5 canonical FIRs represented in all formats
- [x] Consistent entity references across all 53 files
- [x] Cross-case links explicit in case_metadata.json
- [x] Bridge entities connect all 4 clusters
- [x] Anomaly patterns embedded (financial, communication, structural)
- [x] Entity resolution variations deliberate and testable
- [x] Source provenance on every record
- [x] Easy/medium/difficult NLP examples included
- [x] Ambiguous/uncertain language for confidence scoring
- [x] No duplicate IDs where uniqueness required
- [x] Foreign-key-like references consistent
- [x] CSV files parse correctly (tested)
- [x] JSON files valid (tested)
- [x] Text files readable with metadata headers

---

## 📝 LICENSE & USAGE

**Free for development, testing, research, and hackathon use.**

- No attribution required (but appreciated)
- No warranty - synthetic data for testing only
- Not for production decision-making
- Not for training models on real PII (contains none)

---

## 🤝 CONTRIBUTING

This is a static dataset for the hackathon. For issues or suggestions, please refer to the hackathon organizers.

---

## 📞 CONTACT

**Dataset Architect:** Synthetic Data Engineering Team  
**Project:** Criminal Network Analysis System - 5-Day Hackathon MVP  
**Generated:** 2024-08-29

---

*End of README*