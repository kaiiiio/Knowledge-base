# Crash Course: Data Privacy & AI Policy

Dense reference. Read this after `00_roadmap.md` Stage 1-3.

---

## 1. GDPR Core Principles (Article 5)

GDPR (General Data Protection Regulation, EU 2016/679, applicable since 25 May 2018) sets out **7 principles** that every processing activity must satisfy:

1. **Lawfulness, fairness, and transparency** — you need a legal basis, must not process in ways people wouldn't expect, and must tell people what you're doing (via a privacy notice).
2. **Purpose limitation** — collect data for specified, explicit, legitimate purposes; don't reuse it for incompatible new purposes.
3. **Data minimization** — only collect what's adequate, relevant, and necessary.
4. **Accuracy** — keep data accurate and up to date; erase or correct inaccurate data.
5. **Storage limitation** — don't keep personal data longer than necessary.
6. **Integrity and confidentiality** — appropriate security (encryption, access control).
7. **Accountability** — the controller must be able to *demonstrate* compliance with all of the above (documentation, DPIAs, records of processing).

### The 6 (commonly cited as "7") Lawful Bases for Processing (Article 6)

GDPR requires at least one of these to process personal data:

| Lawful basis | Example |
|---|---|
| **Consent** | Marketing emails after opt-in checkbox |
| **Contract** | Processing shipping address to deliver an order |
| **Legal obligation** | Keeping tax records for statutory period |
| **Vital interests** | Processing medical data in a life-threatening emergency |
| **Public task** | A government agency administering public benefits |
| **Legitimate interests** | Fraud prevention, internal analytics — requires a balancing test against the individual's rights |

(Special category/sensitive data — health, biometric, religion, sexual orientation, etc. — under Article 9 needs an *additional* condition on top of an Article 6 basis, e.g. explicit consent or substantial public interest.)

### Data Subject Rights (Articles 15-22)

- **Right of access** — get a copy of your data + info on how it's processed.
- **Right to rectification** — correct inaccurate data.
- **Right to erasure** ("right to be forgotten") — deletion under specific conditions (e.g., data no longer necessary, consent withdrawn).
- **Right to restrict processing** — "freeze" data without deleting it.
- **Right to data portability** — receive your data in a structured, machine-readable format and transmit it elsewhere.
- **Right to object** — especially to direct marketing and profiling.
- **Rights related to automated decision-making** — right not to be subject to a decision based solely on automated processing (including profiling) that has legal or similarly significant effects, with limited exceptions.

### Breach Notification — the 72-Hour Rule

Article 33: controllers must notify the relevant supervisory authority **within 72 hours** of becoming aware of a personal data breach, unless the breach is unlikely to risk individuals' rights and freedoms. If there's a high risk to individuals, affected individuals must also be notified (Article 34), without undue delay.

---

## 2. GDPR vs CCPA/CPRA — Consumer Rights Comparison

| Dimension | GDPR (EU) | CCPA/CPRA (California) |
|---|---|---|
| Model | Opt-IN (consent-centric for many uses) | Opt-OUT (right to say no to "sale/sharing") |
| Who it covers | Any entity processing EU residents' data | Businesses meeting revenue/data-volume thresholds ($25M+ revenue, or 100k+ consumers' data, or 50%+ revenue from data sales) |
| Right to know/access | Yes | Yes |
| Right to delete | Yes ("erasure") | Yes |
| Right to correct | Yes | Yes (added by CPRA) |
| Right to opt out of sale | N/A (consent-based instead) | Yes — core right |
| Right to opt out of targeted advertising/sharing | Via objection/consent withdrawal | Yes, explicit (CPRA) |
| Right to limit use of sensitive personal info | Via Art. 9 special category rules | Yes, explicit right (CPRA) |
| Portability | Yes | Yes |
| Dedicated regulator | Varies by member state (DPAs) + EDPB | Yes — California Privacy Protection Agency (CPPA), created by CPRA |
| Private right of action | Very limited | Limited — only for certain data breaches |
| Penalties | Up to €20M or 4% global annual turnover, whichever higher | Up to $2,500 per violation (unintentional), $7,500 per violation (intentional, incl. minors) |

---

## 3. India's Digital Personal Data Protection (DPDP) Act, 2023

Passed August 2023; rules notified progressively (draft rules released Jan 2025, final implementation phased through 2026-27). Key provisions:

- **Data Fiduciary vs Data Processor** — mirrors GDPR's controller/processor split. The Data Fiduciary decides the purpose/means of processing and bears primary legal responsibility; the Data Processor processes on the Fiduciary's behalf under contract.
- **Consent Manager** — a uniquely Indian concept: a registered, interoperable platform through which individuals (termed "Data Principals") can give, manage, review, and withdraw consent across multiple fiduciaries from one place — conceptually similar to India's Account Aggregator model in finance.
- **Significant Data Fiduciaries (SDFs)** — entities designated by the government based on volume/sensitivity of data processed; face extra obligations (appoint a Data Protection Officer based in India, independent data audits, DPIAs).
- **Children's data** — verifiable parental consent required for processing data of anyone under 18; behavioral tracking/targeted advertising to children is prohibited.
- **Cross-border transfer** — DPDP takes a "blacklist" approach: data can be transferred internationally by default *except* to countries the government specifically restricts (a notable contrast to GDPR's adequacy-based "whitelist" approach).
- **Penalties** — graded, up to **₹250 crore (~US$30M)** per instance for failure to take reasonable security safeguards leading to a breach; up to ₹200 crore for breach of children's data obligations. No private right to sue for damages built in — enforced via the Data Protection Board of India.
- **Exemptions** — broad exemptions for government agencies citing national security, public order, and research/statistical purposes — a frequent point of civil-society criticism.

---

## 4. EU AI Act — The 4 Risk Tiers

The EU AI Act (Regulation (EU) 2024/1689) classifies AI systems by risk:

### Tier 1 — Unacceptable Risk (BANNED, Article 5)
- Social scoring by governments (China-style citizen scoring).
- Real-time remote biometric identification in public spaces by law enforcement (narrow exceptions exist, e.g. searching for a missing child, imminent terrorist threat).
- Subliminal/manipulative techniques that cause harm.
- Emotion recognition in workplaces/schools (with narrow medical/safety exceptions).
- Untargeted scraping of facial images to build facial recognition databases.
- AI that exploits vulnerabilities of children, elderly, or disabled people to distort behavior.

### Tier 2 — High Risk (Heavily Regulated, Annex III)
Requires conformity assessment, risk management system, data governance, technical documentation, human oversight, logging, and registration in an EU database. Examples:
- AI used in recruitment/hiring (CV-screening tools, interview scoring).
- Credit scoring / creditworthiness assessment.
- AI in critical infrastructure safety components (e.g., water, gas, electricity management).
- Medical device AI (diagnostics, triage).
- AI used in law enforcement (e.g., risk-assessment tools for recidivism, evidence reliability evaluation).
- Education: AI determining access to educational institutions or scoring exams.
- Biometric categorization systems (non-prohibited uses).

### Tier 3 — Limited Risk (Transparency Obligations)
- Chatbots — must disclose that the user is interacting with AI.
- Deepfakes — AI-generated/manipulated image, audio, or video content must be labeled as such.
- Emotion-recognition or biometric-categorization systems (non-prohibited uses) must disclose their use to the people exposed to them.

### Tier 4 — Minimal Risk (No Specific Obligations)
- Spam filters, AI-enabled video games, inventory-management AI, most recommendation engines without profiling-driven manipulation — the vast majority of AI in use today falls here; voluntary codes of conduct are encouraged.

**Note:** General-Purpose AI (GPAI) models (e.g., large foundation/language models) have a separate horizontal set of obligations (Articles 51-56) regardless of downstream risk tier — transparency documentation for all GPAI providers, and additional systemic-risk obligations for the most capable models (those trained above a defined compute threshold, currently 10^25 FLOPs).

---

## 5. Key AI Policy Terms

- **Algorithmic bias** — systematic, unfair discrimination produced by a model, usually traceable to skewed training data, proxy variables correlated with protected classes, or flawed objective functions. Canonical example: the COMPAS recidivism tool (see `02_deep_dive_frameworks_and_cases.md`).
- **Explainability / XAI (Explainable AI)** — techniques and practices that make a model's decisions interpretable to humans (e.g., SHAP, LIME, attention visualization, counterfactual explanations). Distinguished from mere "transparency" (disclosing that AI is used) — XAI is about understanding *why* a specific output occurred.
- **Model Cards** — short structured documents (Mitchell et al., Google, 2019) accompanying a trained model describing intended use, training data, evaluation results disaggregated by subgroup, ethical considerations, and known limitations.
- **Red-teaming (for AI safety)** — adversarial testing where a team deliberately tries to elicit harmful, biased, or unsafe outputs from a model before release, analogous to security red-teaming. Used extensively by OpenAI, Anthropic, Google DeepMind pre-launch, and now referenced directly in the EU AI Act's obligations for systemic-risk GPAI models.
- **Data Protection Impact Assessment (DPIA)** — a GDPR-mandated (Article 35) risk assessment required before processing likely to result in high risk to individuals (e.g., large-scale profiling, systematic monitoring, processing special category data at scale). See the template exercise in `04_practical_exercises.md`.
