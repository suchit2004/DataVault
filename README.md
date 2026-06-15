# 🛡️ DataVault + SafeShare

> **"Find. Fight. Firewall. — Then Share, On Your Terms."**

DataVault + SafeShare is a dual-sided digital rights platform designed for the **Mass Surveillance vs. Public Safety** challenge. While most solutions pick a side—either reinforcing surveillance for safety or completely locking down privacy—DataVault bridges the gap. It empowers citizens to reclaim their personal data from commercial brokers while letting them voluntarily contribute anonymized, generalized data to public safety initiatives under a secure cryptographic ledger.

---

## ✨ Key Hackathon USPs & Features

1. **⚖️ SafeShare (The Coexistence Bridge)**
   Directly addresses the hackathon theme. It turns individual privacy protection into a cooperative system. Citizens can toggle SafeShare to share generalized, non-identifiable data with public safety agencies, traffic planners, or disease control teams. Includes a **Fine-Grained Consent Panel** with a live JSON preview showing exactly what data leaves your browser.
2. **🔗 Tamper-Evident Cryptographic Ledger**
   Replaces slow, expensive blockchain solutions. It implements a **SHA-256 Hash Chain** (similar to a Git log) directly in the database. Every time a research query accesses the SafeShare pool, the access log is cryptographically linked to the hash of the previous log. Features a step-by-step validation checking animation that verifies ledger integrity.
3. **🍯 Data-Broker Honey-Pot (Active Auditing)**
   When requesting deletions, the AI registers unique, trackable email aliases (e.g., `user+shield_spokeo@datavault.com`). Features a **Simulated Honey-Pot Email Inbox** where you can inspect intercepted spam/marketing emails, serving as **definitive cryptographic proof** of broker non-compliance.
4. **🕸️ Interactive "Shadow Profile" Exposure Map**
   An interactive SVG graph visualization that maps out how your personal data exposure is connected to your family, friends, and co-workers. Users can dynamically **add new associate connections** to see how data brokers bridge records.
5. **⚡ AI Regulatory Escalation**
   If a broker ignores the legal deletion window (GDPR 30 days, CCPA 45 days, DPDP 30 days), our AI automatically prepares a pre-filled regulatory complaint form. Users can review the draft in a styled modal and trigger a simulated regulatory agency filing.

---

## 🔗 Cryptographic Hash Ledger Specification

SafeShare ensures that all access to the shared anonymized data pool is completely auditable and tamper-proof using a SHA-256 Hash Chain.

Each block contains:
- `id`: A unique UUID.
- `researcherId`: Name of the agency querying the data.
- `datasetQueried`: Name of the query dataset partition.
- `timestamp`: ISO timestamp.
- `previousHash`: The hash of the previous block in the chain (or `000...000` for the genesis block).
- `hash`: Calculated using SHA-256 over:
  `block.id + "-" + block.researcherId + "-" + block.datasetQueried + "-" + block.timestamp + "-" + block.previousHash`

Any modification to past ledger logs will break the hash linkages, making tampering immediately visible during verification sweeps.

---

## 🛠️ System Architecture & Technology Stack

```mermaid
graph TD
    subgraph Client Layer
        A[React Web Client / Tailwind CSS / SVGs]
    end

    subgraph Application Server
        B[Next.js App Router]
        C[Server Actions & API Routes]
    end

    subgraph Core Services
        D[Exposure Scanner Service]
        E[AI Opt-Out Agent]
        F[Re-listing Monitor]
        G[SafeShare Anonymization Engine]
    end

    subgraph Data Layer
        H[Prisma ORM]
        I[(SQLite Database)]
        J[Cryptographic Hash Chain Ledger]
    end

    subgraph External Integrations
        K[HaveIBeenPwned API]
        L[Claude / Gemini API]
        M[Data Broker Portals]
    end

    A <-->|HTTPS / Server Actions| B
    B <--> C
    C --> D
    C --> E
    C --> F
    C --> G

    D -->|Prisma| H
    E -->|Prisma| H
    F -->|Prisma| H
    G -->|Prisma| H
    
    H <--> I
    G -->|Chained Hashing| J
    J <--> I

    D -->|Queries| K
    E -->|Legal Templates| L
    D & F -->|Scrapers| M
```

- **Frontend & Backend:** Next.js 16 (unified App Router, React 19, Tailwind CSS v4)
- **Database ORM:** Prisma v7
- **Database Driver:** `@prisma/adapter-better-sqlite3` + `better-sqlite3` (SQLite local database file)
- **Scoring & Verification:** Native Node.js Cryptography & custom JSON telemetry filters.

---

## 🔑 Environment Variables & API Keys

Rename `.env.example` to `.env` or create it in the project root. The application supports the following key configurations:

```env
# Database configuration (using local SQLite)
DATABASE_URL="file:./dev.db"

# AI Legal Letter Generation API Key (Required for live AI generation)
# Supports Gemini API for automated legal letter drafting and compliance analysis.
GEMINI_API_KEY="your_gemini_api_key_here"

# Data Breach Scanner (Optional)
# Optional HaveIBeenPwned API key for checking email exposure in known breaches.
HIBP_API_KEY="your_hibp_api_key_here"
```

> [!NOTE]
> **Demo-Friendly Mock Engine:** If no API keys are provided, the application automatically runs on a realistic simulation engine. This ensures the dashboard, legal letter generation, honey-pot inbox, and ledger are 100% functional for offline hackathon presentations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm

### Installation & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Prepare the database:**
   Create migrations, initialize the SQLite database, and seed the index of 10 major data brokers:
   ```bash
   npx prisma migrate dev --name init
   npx tsx prisma/seed.js
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Verify Ledger Integrity (Automated Test):**
   Run our CLI ledger verification test script to assert cryptographic hash health:
   ```bash
   npx tsx src/lib/verify-ledger.js
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the interactive dashboard.
