# Tools and Resources

Curated list of real, existing platforms, standards bodies, and learning resources.

---

## Quantum Computing

### Cloud Platforms / SDKs
| Resource | URL | Notes |
|---|---|---|
| IBM Quantum Platform (Qiskit) | https://quantum.ibm.com | Free tier gives cloud access to real IBM quantum hardware + simulators; Qiskit is the Python SDK |
| Google Quantum AI / Cirq | https://quantumai.google/cirq | Google's open-source Python framework for NISQ circuits |
| Microsoft Azure Quantum | https://azure.microsoft.com/en-us/products/quantum | Multi-hardware-provider cloud access (IonQ, Quantinuum, Rigetti) + Q# language |
| Amazon Braket | https://aws.amazon.com/braket/ | AWS's quantum cloud service, access to IonQ, Rigetti, QuEra hardware + simulators |
| PennyLane (Xanadu) | https://pennylane.ai | Quantum machine learning focused framework, integrates with Qiskit/Cirq backends |

### Courses and Learning Material
| Resource | URL | Notes |
|---|---|---|
| IBM Qiskit Textbook / Learning | https://learning.quantum.ibm.com | Free, comprehensive, code-along quantum computing course |
| Microsoft Quantum Katas | https://github.com/microsoft/QuantumKatas | Self-paced programming exercises teaching quantum computing via Q# |
| MIT 8.370x / edX Quantum Information Science | https://www.edx.org (search "MIT Quantum Information Science") | University-level rigor, free to audit |
| Quantum Country (Michael Nielsen & Andy Matuschak) | https://quantumcountry.com | Spaced-repetition-based essay on quantum computing fundamentals |
| Qiskit YouTube Channel | https://www.youtube.com/@qiskit | Tutorials, seminar talks, algorithm walkthroughs |

### Communities
| Resource | URL | Notes |
|---|---|---|
| Quantum Computing Stack Exchange | https://quantumcomputing.stackexchange.com | Q&A for conceptual and implementation questions |
| Qiskit Slack/Community forums | https://qisk.it/join-slack (via quantum.ibm.com community links) | Active developer community |
| r/QuantumComputing | https://www.reddit.com/r/QuantumComputing | General discussion, news |

---

## Telecom / 5G / 6G

### Standards Bodies
| Resource | URL | Notes |
|---|---|---|
| 3GPP (official specs) | https://www.3gpp.org | The body defining 4G/5G/6G technical specifications (Releases 15-18+) |
| O-RAN Alliance | https://www.o-ran.org | Open RAN specifications and working group outputs |
| ITU-T | https://www.itu.int/en/ITU-T | UN agency for global telecom standards, defines IMT-2020 (5G) and future IMT frameworks |
| ETSI | https://www.etsi.org | European standards body, home of the MEC (Multi-access Edge Computing) specs and NFV standards |
| GSMA | https://www.gsma.com | Mobile operator industry body, publishes network deployment guidelines and intelligence reports |

### Learning Platforms
| Resource | URL | Notes |
|---|---|---|
| Coursera — 5G courses | https://www.coursera.org (search "5G network" — e.g., Nokia/University-partnered courses) | Structured video courses with certificates |
| Keysight Technologies Education | https://www.keysight.com/view/5geducation (or search "Keysight 5G education") | Test & measurement vendor, strong technical explainer content |
| Ericsson Education / Ericsson.com technical articles | https://www.ericsson.com/en/reports-and-papers | Vendor whitepapers on 5G/6G architecture, generally technically credible |
| Nokia Bell Labs | https://www.bell-labs.com | Research publications on 6G, network architecture |
| Cisco Networking Academy | https://www.netacad.com | Free/low-cost CCNA-aligned networking fundamentals courses |

### Simulators and Open-Source Tools
| Tool | URL | Notes |
|---|---|---|
| ns-3 | https://www.nsnam.org | Widely used open-source discrete-event network simulator; has 4G/5G (NR) and Wi-Fi modules |
| srsRAN (formerly srsLTE) | https://www.srslinux.net / https://github.com/srsran | Open-source 4G/5G software radio stack — can build a real (software) base station + core |
| OpenAirInterface (OAI) | https://openairinterface.org | Open-source 4G/5G RAN and core network software, widely used in academic/industry research |
| free5GC | https://www.free5gc.org | Open-source 5G core network implementation (Go-based) |
| Open5GS | https://open5gs.org | Another popular open-source 5G/4G core network implementation, easier to set up for learning |

### Certifications (Reference)
| Certification | Provider | URL |
|---|---|---|
| CCNA | Cisco | https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html |
| CCNP Service Provider | Cisco | https://www.cisco.com/site/us/en/learn/training-certifications/certifications/service-provider/index.html |
| 5G training programs | Wray Castle | https://www.wraycastle.com |

---

## Cross-Cutting: Post-Quantum Cryptography

| Resource | URL | Notes |
|---|---|---|
| NIST PQC Project | https://csrc.nist.gov/projects/post-quantum-cryptography | Official standardization project page, includes FIPS 203/204/205 documents |
| Open Quantum Safe project | https://openquantumsafe.org | Open-source library (liboqs) implementing PQC algorithms for integration testing |
