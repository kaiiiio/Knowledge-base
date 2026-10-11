# Deep Dive: Frameworks, Legal Comparisons, Real Cases, and Technical Privacy Techniques

---

## 1. NIST AI Risk Management Framework (AI RMF 1.0, January 2023)

Voluntary US framework, developed by NIST under direction of the National AI Initiative Act. Organized around **4 core functions**, meant to be applied continuously across the AI lifecycle rather than once:

### GOVERN
Establishes the organizational culture and accountability structure for managing AI risk — *before* you even build anything.
- Policies, roles, and responsibility for AI risk across the org (who owns model risk? who signs off on deployment?).
- Processes to document risk tolerance, legal/regulatory requirements, and diverse-stakeholder engagement.
- Mechanisms for monitoring third-party/vendor AI risk (increasingly relevant as companies buy rather than build models).

### MAP
Establishes context so risks can be identified. Done early, before deployment decisions are locked in.
- Categorize the AI system's intended purpose, deployment context, and likely impacted populations.
- Identify who is likely to be positively/negatively affected, including historically marginalized groups.
- Map legal and regulatory requirements relevant to the specific use case (e.g., a hiring tool triggers EEOC-adjacent obligations in the US).

### MEASURE
Quantifies and analyzes risks identified during Map, using rigorous methods.
- Apply quantitative/qualitative/mixed methods to assess trustworthiness characteristics: validity, reliability, safety, security, resilience, accountability, transparency, explainability, privacy, fairness.
- Track and benchmark performance disaggregated by demographic subgroup (this is where bias testing lives).
- Red-team and adversarially test the system.

### MANAGE
Allocates resources to the risks mapped and measured, and tracks them over time.
- Prioritize and respond to identified risks based on the Map/Measure outputs.
- Plan responses: mitigate, transfer, avoid, or accept each risk.
- Establish mechanisms for incident response, and feed lessons from incidents back into Govern.

The 4 functions are explicitly **not sequential** — NIST designed them as a continuous, overlapping cycle, with Govern cutting across all the others.

---

## 2. GDPR vs CCPA/CPRA vs DPDP Act — 8-Dimension Comparison

| Dimension | GDPR (EU) | CCPA/CPRA (California) | DPDP Act (India, 2023) |
|---|---|---|---|
| **Scope/extraterritoriality** | Applies to any entity processing EU residents' data, regardless of where the entity is based | Applies to for-profit businesses meeting revenue/volume thresholds doing business in California | Applies to processing of digital personal data of individuals in India, and processing outside India if it relates to offering goods/services to individuals in India |
| **Lawful basis model** | 6 enumerated lawful bases (consent, contract, legal obligation, vital interests, public task, legitimate interests) | No "lawful basis" concept — rights-based opt-out model instead | Primarily consent-based, with defined "legitimate uses" (e.g., for specified purposes the individual has voluntarily provided data for, employment purposes, medical emergencies) |
| **Key individual rights** | Access, rectification, erasure, restriction, portability, objection, rights re: automated decisions | Know, delete, correct, opt-out of sale/sharing, limit use of sensitive info, non-discrimination for exercising rights | Access information, correction/erasure, grievance redressal, nominate another person to exercise rights on death/incapacity |
| **Penalties (max)** | €20M or 4% global annual turnover, whichever higher | $2,500 (unintentional) / $7,500 (intentional) per violation | Up to ₹250 crore per instance |
| **DPO requirement** | Mandatory for public authorities and large-scale systematic monitoring/special-category processing (Art. 37) | No DPO mandate, but CPRA requires risk assessments & cybersecurity audits for high-risk processing | Mandatory for "Significant Data Fiduciaries" only; must be based in India for SDFs |
| **Cross-border transfer rules** | Adequacy decisions, Standard Contractual Clauses (SCCs), Binding Corporate Rules — "whitelist/mechanism" approach | No general cross-border restriction regime | Transfers allowed by default except to government-notified restricted countries — "blacklist" approach |
| **Breach notification** | 72 hours to supervisory authority (Art. 33); without undue delay to individuals if high risk (Art. 34) | No general breach-notification duty in CCPA itself (separate CA breach law, Civ. Code 1798.82, governs this) | "As soon as possible" notification to Data Protection Board and affected individuals (exact timeline to be specified in rules) |
| **Regulator** | Independent Data Protection Authorities (DPAs) per member state + European Data Protection Board (EDPB) for consistency | California Privacy Protection Agency (CPPA), est. by CPRA — first US dedicated privacy regulator | Data Protection Board of India (adjudicatory, not a full independent regulator in the DPA sense) |

---

## 3. Real-World Enforcement Cases

### GDPR fines
- **Meta (Ireland) — €1.2 billion, May 2023.** Irish Data Protection Commission (lead EU regulator for Meta), following an EDPB binding decision, fined Meta Platforms Ireland for transferring EU users' Facebook data to the US without adequate safeguards following the *Schrems II* ruling that invalidated the EU-US Privacy Shield. Largest GDPR fine to date as of this writing.
- **Amazon (Luxembourg) — €746 million, July 2021.** Luxembourg's CNPD fined Amazon over its advertising-targeting practices, found to lack valid legal basis/consent for behavioral advertising — largest fine at the time, later surpassed by Meta's.
- **Google (France) — €50 million, January 2019** (one of the earliest landmark fines, by France's CNIL) for lack of transparency and insufficiently specific/informed consent for ad personalization during Android setup.
- **Clearview AI — multiple EU/UK fines** (France €20M in 2022, Italy €20M, UK ICO ~£7.5M in 2022 later partially overturned on jurisdictional grounds) for scraping facial images from the internet without consent to build a biometric search database — illustrates how GDPR-style "unlawful collection" claims intersect with AI-specific harms (facial recognition databases are also an EU AI Act Tier-1 banned practice when built via untargeted scraping).

### AI bias controversies
- **COMPAS recidivism algorithm (US, analyzed by ProPublica, 2016).** Northpointe/Equivant's COMPAS tool, used by US courts to predict reoffending risk, was found by ProPublica's investigation to flag Black defendants as future criminals at nearly twice the rate of white defendants relative to actual reoffense rates, while white defendants were more often mislabeled as low-risk. The case became the central case study in algorithmic fairness debates and spawned the enduring tension between different, mathematically incompatible, definitions of "fairness" (e.g., equal false-positive rates vs. equal calibration — Northpointe disputed ProPublica's framing on exactly this ground).
- **Amazon's scrapped AI hiring tool (reported by Reuters, 2018).** Amazon built an internal experimental recruiting tool trained on 10 years of submitted resumes, which were predominantly from men (reflecting historical tech-industry hiring patterns). The model learned to penalize resumes containing the word "women's" (e.g., "women's chess club captain") and downgraded graduates of two all-women's colleges. Amazon tried to fix it, found the fixes weren't reliable, and scrapped the project in 2017 — a widely cited example of bias encoded via historical training data rather than explicit programmer intent.
- **Dutch childcare benefits scandal (SyRI / "toeslagenaffaire", Netherlands, exposed 2019-2021).** A risk-scoring algorithm used by Dutch tax authorities to flag suspected childcare-benefit fraud disproportionately flagged families with dual nationality, pushing thousands of (often lower-income, immigrant) families into false fraud accusations, debt, and in some cases family separation. Led to the resignation of the Dutch government in 2021 and is frequently cited in EU AI Act debates as the motivating case for banning certain public-sector "social scoring"-adjacent systems.

---

## 4. Privacy-Preserving Techniques, Explained

### Differential Privacy
A mathematical framework guaranteeing that the output of an analysis is (almost) statistically indistinguishable whether or not any single individual's data is included in the dataset. Achieved by adding carefully calibrated random noise to query results or to the data/gradients.

- **Epsilon (ε), simply:** epsilon is the "privacy budget" — a small number (e.g. 0.1-10) controlling how much the probability of any output can differ between two datasets that differ by one person's record. **Smaller epsilon = more noise = stronger privacy = less accurate results.** Larger epsilon = weaker privacy guarantee, more accuracy. Each query against the data "spends" some epsilon; a cumulative budget prevents repeated querying from leaking information piece by piece.
- Real deployments: **US Census Bureau** used differential privacy for 2020 Census disclosure avoidance; **Apple** uses local differential privacy to collect aggregate usage statistics (emoji usage, typing suggestions) from iPhones without the device ever sending raw user data to Apple; **Google** uses it in RAPPOR and in Chrome telemetry.

### k-Anonymity
An older (1998, Latanya Sweeney) generalization-based model: a released dataset satisfies k-anonymity if every combination of "quasi-identifier" fields (ZIP code, birth date, gender, etc.) is shared by at least **k** individuals in the dataset, so no individual can be singled out among fewer than k people. Achieved by generalizing (e.g., exact age → age range) or suppressing fields.
- Weaknesses it doesn't fully solve: **homogeneity attack** (if all k people in a group share the same sensitive value, e.g. same diagnosis, anonymity doesn't protect that attribute) — addressed partially by the follow-on model **l-diversity**, and further by **t-closeness**.

### Federated Learning
A training approach where the model is sent *to* the data instead of the data being sent to a central server. Each device/node (e.g., a phone, a hospital) trains the model locally on its own private data and only sends back model updates (gradients/weight deltas) to a central aggregator, which combines them into an improved global model. Raw data never leaves the local device/institution.
- Used in: Google's Gboard next-word prediction (trains across millions of Android phones), cross-hospital medical-imaging model consortia where patient data can't legally leave each hospital's jurisdiction.
- Caveat: federated learning reduces but doesn't eliminate privacy risk — gradient updates can still leak information via "gradient inversion" attacks, which is why it's often combined with differential privacy (adding noise to the updates) or secure aggregation.

### Homomorphic Encryption (HE)
Encryption scheme that allows computation to be performed **directly on encrypted ciphertext**, producing an encrypted result that, when decrypted, matches the result of performing the same operation on the plaintext. In principle this lets an untrusted party (e.g., a cloud provider) run a computation (even a full ML inference) on your data without ever seeing it unencrypted.
- **Partially homomorphic** schemes support only one operation (addition *or* multiplication) indefinitely; **Fully Homomorphic Encryption (FHE)**, first constructed by Craig Gentry in 2009, supports arbitrary computation but is still computationally expensive (orders of magnitude slower than plaintext computation), limiting production use mostly to narrow, high-value use cases (e.g., Microsoft SEAL, IBM HElib, encrypted genomic analysis pilots) rather than general-purpose ML at scale as of 2026.
