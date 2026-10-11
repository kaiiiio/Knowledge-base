# Practical Exercises

Work through these in order; each builds skills used in the Privacy Engineer / AI Policy Analyst / DPO career paths from `00_roadmap.md`.

---

## Exercise 1 — Mini GDPR Gap-Analysis Checklist for a Hypothetical SaaS Product

**Scenario:** "TaskFlow" is a project-management SaaS, EU customers included, storing user emails, names, uploaded files, and usage analytics (including IP-based location).

Walk through this checklist and mark Compliant / Partial / Gap for each item:

- [ ] **Legal basis documented** for each processing activity (account creation = contract; analytics = legitimate interest or consent; marketing emails = consent)?
- [ ] **Privacy notice** published, written in plain language, covering: what data is collected, purposes, legal basis, retention periods, third parties/sub-processors, international transfer mechanism, data subject rights, and contact details for the DPO/privacy contact?
- [ ] **Records of Processing Activities (ROPA)** maintained per Article 30 (a log of what's processed, why, by whom, for how long)?
- [ ] **Data minimization** — is IP-based location actually necessary, or can it be dropped/truncated/aggregated?
- [ ] **Retention policy** defined and enforced (e.g., auto-delete analytics data after 13 months; delete account data N days after account closure)?
- [ ] **DSAR (Data Subject Access Request) process** — can the company produce a full data export within the statutory 1-month window, and action an erasure request across all systems (including backups/sub-processors)?
- [ ] **Sub-processor contracts** — do all vendors (cloud hosting, email delivery, analytics, support-ticketing tools) have Data Processing Agreements (DPAs) in place per Article 28?
- [ ] **International transfer mechanism** — if any sub-processor is US-based, are Standard Contractual Clauses (SCCs) or an adequacy mechanism (e.g., EU-US Data Privacy Framework) in place?
- [ ] **Breach response plan** — documented process to detect, assess, and notify the supervisory authority within 72 hours?
- [ ] **DPIA triggered?** — does the product do any large-scale profiling or systematic monitoring that would require a Data Protection Impact Assessment?
- [ ] **Cookie/tracking consent** — does the marketing site use a compliant consent banner (no pre-ticked boxes, granular choices, easy withdrawal)?
- [ ] **DPO appointment need assessed** — is DPO appointment mandatory here (large-scale systematic monitoring)? If not mandatory, is there still a designated privacy contact?

**Deliverable:** produce a one-page table with columns: Requirement | Status | Owner | Remediation Action | Target Date.

---

## Exercise 2 — Draft a Basic Privacy Policy (GDPR + CCPA + DPDP)

Write a privacy policy for a fictional app "NoteSync" covering, at minimum, these sections (use this as your outline and fill in plausible NoteSync-specific details):

1. **Who we are** (controller/fiduciary identity and contact)
2. **What data we collect** (account info, content you create, device/usage data)
3. **Why we collect it / legal bases** (GDPR Art. 6 bases; DPDP "specified purpose" language)
4. **How we share it** (sub-processors, no sale of data — state explicitly for CCPA's "we do not sell personal information" disclosure if true)
5. **Your rights** — segment this into:
   - *If you are in the EU/EEA:* access, rectification, erasure, restriction, portability, objection, right to lodge a complaint with your supervisory authority.
   - *If you are a California resident:* right to know, delete, correct, opt out of sale/sharing, limit use of sensitive personal information, non-discrimination.
   - *If you are in India:* right to access a summary of processing, correction/erasure, grievance redressal via our Grievance Officer, right to nominate someone to exercise your rights after death/incapacity.
6. **Data retention** (specific periods per data category)
7. **International transfers** (mechanism used)
8. **Children's privacy** (age gate, parental consent language — required explicitly under DPDP for under-18s)
9. **Security measures** (high-level, not a vulnerability roadmap)
10. **Changes to this policy**
11. **Contact us / Grievance Officer / DPO** (DPDP requires a published Grievance Officer contact; GDPR requires DPO contact if applicable)

**Deliverable:** a complete markdown or doc draft, ~800-1200 words, with each section populated.

---

## Exercise 3 — Classify 10 AI Use Cases into EU AI Act Risk Tiers

For each scenario below, assign **Unacceptable / High / Limited / Minimal** risk and justify with reference to the Annex III categories or Article 5 prohibitions from `01_crash_course.md`.

| # | Scenario | Your Tier | Justification (fill in) |
|---|---|---|---|
| 1 | A government agency assigns citizens a trust score based on social media activity, affecting access to public services | Unacceptable | Social scoring by public authorities — Art. 5 banned practice |
| 2 | An AI tool screens job applicants' resumes and ranks them before human review | High | Employment/recruitment — explicit Annex III high-risk category |
| 3 | A customer-service chatbot on an e-commerce site | Limited | Must disclose it's AI, but doesn't materially affect rights — transparency obligation only |
| 4 | A bank's AI model used to approve/deny loan applications | High | Creditworthiness assessment — Annex III high-risk category |
| 5 | A mobile game's AI-controlled non-player characters | Minimal | No safety/rights impact |
| 6 | Police use of live facial recognition on public street cameras to scan crowds for any match | Unacceptable | Real-time remote biometric identification in public spaces by law enforcement — Art. 5 banned (narrow carve-outs don't apply to general crowd scanning) |
| 7 | An AI system used by a hospital to triage/prioritize ER patients | High | Medical device/healthcare triage — high-risk |
| 8 | A video-conferencing tool with a filter that adds virtual backgrounds | Minimal | Cosmetic, no rights impact |
| 9 | A company tool that generates a synthetic "deepfake" video for a marketing ad | Limited | Must be labeled as AI-generated/manipulated content |
| 10 | An AI system scoring exam answers to determine university admission | High | Education access/evaluation — explicit Annex III high-risk category |

**Deliverable:** fill in your own justification text for each row independently before checking the above (write-your-own-first, then compare).

---

## Exercise 4 — Bias Detection with IBM AI Fairness 360 (AIF360)

**Setup:**

```bash
pip install aif360
# Optional extras for some datasets/explainers:
pip install 'aif360[Reductions]'
```

**Goal:** Detect bias (disparate impact) in a classifier trained on the well-known **German Credit** dataset (bundled with AIF360), using `age` as the protected attribute, then apply a mitigation technique.

```python
import numpy as np
from aif360.datasets import GermanDataset
from aif360.metrics import BinaryLabelDatasetMetric, ClassificationMetric
from aif360.algorithms.preprocessing import Reweighing
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

# 1. Load the dataset. AIF360 ships the German Credit dataset with
#    a default privileged/unprivileged split on 'age' (>=25 vs <25).
dataset = GermanDataset(
    protected_attribute_names=['age'],
    privileged_classes=[lambda x: x >= 25],   # age >= 25 is the privileged group
    features_to_drop=['personal_status', 'sex']  # drop other sensitive proxies for this exercise
)

# 2. Split into train/test
train, test = dataset.split([0.7], shuffle=True, seed=42)

privileged_groups = [{'age': 1}]
unprivileged_groups = [{'age': 0}]

# 3. Measure bias in the RAW TRAINING DATA before any model is trained
metric_train = BinaryLabelDatasetMetric(
    train, unprivileged_groups=unprivileged_groups, privileged_groups=privileged_groups
)
print("Disparate impact (raw training data):", metric_train.disparate_impact())
print("Mean difference (raw training data):", metric_train.mean_difference())
# Disparate impact ~1.0 = no disparity. Values far below 0.8 (the commonly cited
# "80% rule" threshold from US EEOC guidance) indicate a protected group is
# receiving favorable outcomes at a much lower rate.

# 4. Train a plain logistic regression classifier (no mitigation yet)
scaler = StandardScaler()
X_train = scaler.fit_transform(train.features)
y_train = train.labels.ravel()
X_test = scaler.transform(test.features)

clf = LogisticRegression(solver='liblinear', random_state=42)
clf.fit(X_train, y_train, sample_weight=train.instance_weights)

test_pred = test.copy()
test_pred.labels = clf.predict(X_test).reshape(-1, 1)

# 5. Measure CLASSIFIER bias: compare predictions vs ground truth across groups
clf_metric = ClassificationMetric(
    test, test_pred,
    unprivileged_groups=unprivileged_groups, privileged_groups=privileged_groups
)
print("\n--- Before mitigation ---")
print("Disparate impact:", clf_metric.disparate_impact())
print("Equal opportunity difference:", clf_metric.equal_opportunity_difference())
print("Average odds difference:", clf_metric.average_odds_difference())

# 6. MITIGATE bias using Reweighing (a pre-processing technique that assigns
#    different sample weights to re-balance the training data across groups
#    before training, without changing the labels or features themselves).
RW = Reweighing(unprivileged_groups=unprivileged_groups, privileged_groups=privileged_groups)
train_rw = RW.fit_transform(train)

clf_rw = LogisticRegression(solver='liblinear', random_state=42)
X_train_rw = scaler.fit_transform(train_rw.features)
clf_rw.fit(X_train_rw, train_rw.labels.ravel(), sample_weight=train_rw.instance_weights)

test_pred_rw = test.copy()
test_pred_rw.labels = clf_rw.predict(scaler.transform(test.features)).reshape(-1, 1)

clf_metric_rw = ClassificationMetric(
    test, test_pred_rw,
    unprivileged_groups=unprivileged_groups, privileged_groups=privileged_groups
)
print("\n--- After Reweighing mitigation ---")
print("Disparate impact:", clf_metric_rw.disparate_impact())
print("Equal opportunity difference:", clf_metric_rw.equal_opportunity_difference())
print("Average odds difference:", clf_metric_rw.average_odds_difference())
```

**What to interpret:**
- `disparate_impact()` close to 1.0 is ideal; below ~0.8 is the commonly used (though contested) threshold suggesting adverse impact, borrowed from the US EEOC's "four-fifths rule."
- `equal_opportunity_difference()` and `average_odds_difference()` close to 0 indicate the model's true-positive/false-positive rates are similar across groups.
- Compare the "before" and "after" numbers — Reweighing should move disparate impact closer to 1.0 and the difference metrics closer to 0, usually at some small cost to raw accuracy. Report that tradeoff explicitly — this tension (fairness vs. accuracy) is exactly what makes algorithmic fairness hard, and is the same tension underlying the COMPAS debate in `02_deep_dive_frameworks_and_cases.md`.

**Deliverable:** run the script, capture the before/after metric values, and write 3-4 sentences on what you'd recommend to the (hypothetical) credit team given the tradeoff observed.

---

## Exercise 5 — Draft a DPIA for a Hypothetical Facial Recognition Feature

**Scenario:** "SecureGate," an office building access-control vendor, wants to add a facial-recognition entry feature so employees can walk in without badging. You are the privacy engineer asked to produce the DPIA before this ships (GDPR Art. 35 — mandatory here because this is both large-scale systematic monitoring *and* special-category biometric data processing, both independent DPIA triggers).

### DPIA Template (filled)

**1. Description of processing**
- *Nature:* Capturing employee facial images via entry-point cameras, converting to biometric templates, matching against an enrolled-employee database for building access.
- *Scope:* All employees and frequent contractors at a given office (~500 people); cameras active during all building operating hours.
- *Context:* Enrollment is proposed as opt-in with badge-swipe as a fallback for anyone who declines.
- *Purpose:* Convenience and faster throughput at entry points; secondary purpose of reducing badge-sharing/tailgating security risk.

**2. Necessity and proportionality assessment**
- Is facial recognition *necessary*, or would a less invasive alternative (badge + PIN, badge + fingerprint on a local-only device) achieve the same security goal? — *Document the comparison; this is the single most commonly challenged section in real DPIAs and regulator reviews.*
- Data minimization: can templates be stored as mathematical embeddings rather than raw images, and can raw images be deleted immediately after template generation?
- Purpose limitation: explicitly state the templates will **not** be reused for behavior/attendance analytics without a separate legal basis and a new DPIA.

**3. Identification and assessment of risks to individuals**

| Risk | Likelihood | Severity | Overall risk |
|---|---|---|---|
| Biometric data breach exposing irrevocable identifiers (you can't reset your face like a password) | Medium | High | High |
| Function creep — template reused later for productivity/attendance monitoring | Medium | Medium | Medium |
| Differential accuracy across skin tones/demographics causing false rejections for some groups (a well-documented issue in facial recognition literature, e.g. NIST's own FRVT demographic-effects studies) | Medium-High | Medium | High |
| Chilling effect on employees who decline, if fallback process is slower/stigmatized | Low-Medium | Low | Low |
| Unlawful processing if consent isn't freely given (power imbalance in employment relationships can undermine "freely given" consent under GDPR) | Medium | High | High |

**4. Measures to address the risks**
- Store only encrypted biometric templates, never raw images, with keys managed separately from the template database (pseudonymization control).
- Independent bias/accuracy testing disaggregated by demographic group before go-live, with a defined acceptable false-rejection-rate gap; re-test after any model update.
- Explicit written policy that templates will never be used for attendance/productivity monitoring without new consent + new DPIA.
- Genuine opt-out: badge-only fallback must be equally fast and carry no social stigma (e.g., not a separate slower "manual" line).
- Legal basis review: given the employment power imbalance, consider whether "freely given" consent is realistically achievable, or whether this should instead rely on employer legitimate interest with very strong compensating controls, documented and defensible.
- Data retention: templates deleted within N days of an employee's departure; raw footage (if any is retained for security-log purposes) retained no longer than the organization's general CCTV retention policy.
- Vendor/processor due diligence: DPA with the facial-recognition software vendor, confirming no secondary use of any data for the vendor's own model training.

**5. Consultation**
- Employee representatives/works council consulted (required in several EU jurisdictions before deploying workplace monitoring technology).
- DPO sign-off recorded.
- If residual risk remains high after mitigations, prior consultation with the supervisory authority (GDPR Art. 36) is required before processing begins.

**6. Outcome**
- Record whether residual risk is acceptable, and the sign-off chain (DPO, privacy engineer, business owner, works council where applicable).

**Deliverable:** adapt this template to your own hypothetical org and produce a filled DPIA document, including your own risk-scoring rationale for section 3.
