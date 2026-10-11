# AI Policy & Data Privacy — Learning Roadmap

A structured path from "what is data privacy" to being conversant enough to work as a Privacy Engineer, AI Policy Analyst, or Data Protection Officer (DPO). Each stage builds on the last. Estimated time assumes ~5-8 hrs/week.

---

## Stage 1 — Foundations (Week 1-2)

**Goal:** Understand why privacy is a distinct discipline from security, and the basic legal vocabulary used everywhere else in this KB.

- What is "data privacy" vs "data security" vs "data protection" (security = confidentiality/integrity/availability controls; privacy = rules about *why/how/when* personal data may be used, even if perfectly secured).
- Core vocabulary: **personal data / PII**, **data subject**, **data controller** vs **data processor**, **processing**, **lawful basis**, **consent**, **data minimization**, **purpose limitation**, **cross-border transfer**.
- Why privacy regulation exists: historical drivers — 1970s Fair Information Practice Principles (FIPPs, US HEW report 1973), OECD Privacy Guidelines (1980), EU Data Protection Directive 95/46/EC → GDPR (2018), post-Cambridge Analytica political pressure, rise of AI/ML making re-identification and profiling cheaper.
- The "personal data lifecycle": collection → storage → use → sharing → retention → deletion. Every law in this KB regulates some slice of this lifecycle.

**Read:** `01_crash_course.md` (GDPR principles section) after finishing this stage.

---

## Stage 2 — Major Data Protection Laws Deep Dive (Week 3-6)

Work through each law, understanding its *scope* (who/what it covers), its *rights* (what individuals can demand), and its *obligations* (what organizations must do).

1. **GDPR (EU, 2018)** — the global reference standard. Lawful bases, data subject rights, DPO requirement, 72-hour breach notification, fines up to €20M or 4% global turnover.
2. **CCPA/CPRA (California, US, 2020/2023)** — opt-out model rather than consent model; "sale/sharing" of data; CPRA added a dedicated regulator (CPPA) and sensitive personal information category.
3. **India's DPDP Act, 2023** — India's first comprehensive data protection statute; Data Fiduciary/Data Processor framing; Consent Manager as a novel Indian concept; graded penalties up to ₹250 crore.
4. **HIPAA (US, 1996)** — sector-specific (health data only); Privacy Rule + Security Rule; covered entities vs business associates; useful as a contrast to "omnibus" laws like GDPR.
5. (Awareness level) Other notable regimes: Brazil's LGPD (closely modeled on GDPR), China's PIPL (2021, state-security-inflected), UK GDPR (post-Brexit near-copy of EU GDPR).

**Read:** `02_deep_dive_frameworks_and_cases.md` comparison table for a side-by-side.

---

## Stage 3 — AI-Specific Regulation (Week 7-9)

Privacy law tells you what you can do with *data*. AI regulation tells you what you can do with *systems built from that data*. These are converging but distinct.

- **EU AI Act (Regulation (EU) 2024/1689)** — world's first comprehensive AI law. Risk-tiered approach: unacceptable (banned), high-risk (heavily regulated), limited-risk (transparency duties), minimal-risk (no obligations). Entered into force August 2024, obligations phasing in through 2027 (prohibited-practice bans applied from Feb 2025; GPAI obligations from Aug 2025; high-risk obligations largely from Aug 2026).
- **US approach** — no single federal AI law as of 2026. Key artifacts: Executive Order 14110 "Safe, Secure, and Trustworthy AI" (Biden, Oct 2023) — later rescinded/replaced in direction by the Trump administration's Jan 2025 EO 14179 ("Removing Barriers to American AI Innovation"); NIST AI Risk Management Framework (AI RMF 1.0, Jan 2023) as the de facto voluntary technical standard many companies and even procurement contracts reference; sectoral/state activity (Colorado AI Act, various state biometric privacy laws like Illinois BIPA).
- **China's AI regulation** — fast-moving, state-directed: Algorithmic Recommendation Management Provisions (2022), Deep Synthesis (deepfake) Provisions (2023), Interim Measures for Generative AI Services (2023) requiring security assessments and content labeling for public-facing generative AI.

**Read:** `01_crash_course.md` risk-tier section with concrete examples.

---

## Stage 4 — Privacy Engineering Concepts (Week 10-12)

Move from "what the law requires" to "how engineers actually implement it."

- **Data minimization** — collect/retain only what's needed for the stated purpose.
- **Anonymization vs pseudonymization** — anonymization is irreversible (data falls outside GDPR scope if truly anonymous); pseudonymization is reversible with a separately-held key (still regulated personal data under GDPR).
- **Differential privacy** — mathematically bounded privacy guarantee via calibrated noise (epsilon-budget); used by Apple, Google, US Census Bureau.
- **k-anonymity / l-diversity** — older generalization-based anonymization models, still used in data releases.
- **Federated learning** — train models without centralizing raw data (used in Google Gboard, healthcare consortia).
- **Homomorphic encryption** — compute directly on encrypted data.
- **Consent management platforms (CMPs)** — technical systems (cookie banners, preference centers) that operationalize consent at scale (e.g., OneTrust, TrustArc, Cookiebot).

**Read:** `02_deep_dive_frameworks_and_cases.md` technical techniques section; practice with `04_practical_exercises.md`.

---

## Stage 5 — AI Governance Frameworks (Week 13-14)

- **NIST AI RMF** — Govern/Map/Measure/Manage functions (the dominant US voluntary framework).
- **Model Cards** (Google/Mitchell et al., 2019) — standardized documentation of a trained model's intended use, performance across subgroups, limitations.
- **Datasheets for Datasets** (Gebru et al., 2018) — the dataset-level analogue of model cards.
- **Responsible AI principles** from major labs: Google's AI Principles (2018), Microsoft's Responsible AI Standard v2, OpenAI's usage policies and Preparedness Framework, Anthropic's Responsible Scaling Policy.
- **ISO/IEC 42001** — first international certifiable standard for AI management systems (2023).

---

## Stage 6 — Career Paths

| Role | What they do | Typical background |
|---|---|---|
| **Privacy Engineer** | Builds technical controls (data mapping, anonymization pipelines, consent systems, DSAR automation) into products | Software engineering + privacy law literacy |
| **AI Policy Analyst** | Researches/drafts AI regulation, advises legislators or think tanks, tracks global AI policy developments | Public policy, law, or CS + policy |
| **Data Protection Officer (DPO)** | GDPR-mandated independent role monitoring compliance, training staff, liaising with regulators (mandatory for public authorities and large-scale sensitive-data processors under GDPR Art. 37) | Legal/compliance background, often CIPP/E + CIPM certified |
| **AI Governance Lead / Responsible AI Manager** | Runs internal AI risk review processes, model cards, red-teaming programs | ML background + policy/ethics training |
| **Privacy Counsel / Compliance Lawyer** | Legal risk advice, regulatory filings, breach response | JD + privacy certifications |

---

## Stage 7 — Certifications (IAPP and beyond)

- **CIPP/E** (Certified Information Privacy Professional/Europe) — GDPR-focused, the most recognized privacy credential globally. iapp.org/certify/cippe/
- **CIPP/US** — US privacy law variant (sectoral laws, state laws).
- **CIPM** (Certified Information Privacy Manager) — operational/program-management focus, vendor-neutral.
- **CIPT** (Certified Information Privacy Technologist) — the most engineering-relevant IAPP cert; covers privacy-by-design, anonymization, engineering tradeoffs.
- **AIGP** (Artificial Intelligence Governance Professional) — IAPP's newer (2024) credential covering AI law, ethics, and governance frameworks like NIST AI RMF and the EU AI Act.
- Complementary: **ISO/IEC 27701 Lead Implementer**, **ISO/IEC 42001 Lead Auditor**.

---

## Suggested reading order in this folder

1. `00_roadmap.md` (this file)
2. `01_crash_course.md`
3. `02_deep_dive_frameworks_and_cases.md`
4. `03_tools_and_resources.md`
5. `04_practical_exercises.md` (do alongside, not after)
