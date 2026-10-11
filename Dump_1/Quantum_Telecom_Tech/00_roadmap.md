# Roadmap: Quantum Computing & Telecom Technology

This file contains two parallel learning roadmaps for two related deep-tech career tracks. Both are emerging fields that rely heavily on physics/EE fundamentals, both have active hardware races, and both show up together in next-gen "quantum-safe networks" and "6G" discussions — hence one knowledge base.

---

## Part A — Quantum Computing Roadmap

### Stage 0: Mathematical Foundations (2-4 weeks)
- Linear algebra: vectors, matrices, eigenvalues/eigenvectors, unitary matrices, tensor products (Kronecker product)
- Complex numbers: modulus, conjugate, Euler's formula (e^{iθ} = cosθ + i sinθ) — essential for phase
- Probability basics: probability amplitudes vs probabilities, normalization
- Dirac (bra-ket) notation: `|ψ⟩`, `⟨ψ|`, inner products `⟨φ|ψ⟩`

**Resources:** 3Blue1Brown "Essence of Linear Algebra" (YouTube), MIT 18.06.

### Stage 1: Quantum Mechanics Basics (2-3 weeks)
- Superposition — a system existing in a combination of basis states until measured
- Entanglement — correlated states between two or more qubits that can't be described independently
- Measurement and collapse — probabilistic outcome, Born rule (P = |amplitude|²)
- No-cloning theorem — you cannot copy an unknown quantum state exactly

### Stage 2: Qubits and Quantum Gates (3-4 weeks)
- Bloch sphere representation of a single qubit
- Single-qubit gates: X, Y, Z (Pauli gates), H (Hadamard), S, T (phase gates)
- Multi-qubit gates: CNOT, CZ, SWAP, Toffoli (CCNOT)
- Reversibility of quantum gates (all quantum gates are unitary ⇒ reversible)

### Stage 3: Quantum Circuits (2-3 weeks)
- Circuit diagrams, gate composition, circuit depth
- Building entangled states (Bell states, GHZ states)
- Measurement in different bases

### Stage 4: Key Quantum Algorithms (4-6 weeks)
| Algorithm | Purpose | Speedup |
|---|---|---|
| Deutsch-Jozsa | Determine if a function is constant or balanced | Exponential (toy problem, mostly pedagogical) |
| Grover's | Unstructured search | Quadratic (O(√N) vs O(N)) |
| Shor's | Integer factorization | Exponential (breaks RSA) |
| Quantum Fourier Transform (QFT) | Building block for Shor's, phase estimation | Exponential vs classical DFT |
| VQE / QAOA | Near-term optimization & chemistry | Heuristic, NISQ-era usable |

### Stage 5: Quantum Programming (4-6 weeks, ongoing)
- **Qiskit** (IBM, Python) — most widely taught, large community
- **Cirq** (Google, Python) — close to Google hardware primitives
- **PennyLane** (Xanadu) — quantum machine learning focus
- Practice: build circuits, run on simulators, then real hardware via free cloud access

### Stage 6: Quantum Error Correction Basics (3-4 weeks)
- Why qubits decohere (interaction with environment, noise)
- Physical qubits vs logical qubits
- Basic code families: bit-flip code, phase-flip code, Shor code, surface codes (conceptual, not full derivation)
- Error thresholds and why they matter for fault tolerance

### Stage 7: Current Hardware Landscape (ongoing awareness)
| Company | Approach | Notable Milestone (as of general knowledge) |
|---|---|---|
| IBM | Superconducting qubits | Roadmap toward 1000+ qubit chips (Condor, Heron lines), modular scaling |
| Google | Superconducting qubits | Claimed "quantum supremacy" (2019, Sycamore), Willow chip error-correction demo |
| IonQ | Trapped-ion qubits | High gate fidelity, cloud-accessible via AWS/Azure |
| Rigetti | Superconducting qubits | Cloud access, hybrid classical-quantum focus |
| PsiQuantum | Photonic qubits | Targeting fault-tolerant, utility-scale systems |
| D-Wave | Quantum annealing (not gate-based) | Optimization-specific, different computing model |

### Stage 8: Career Paths
- **Quantum software engineer** — SDK/algorithm development (Qiskit, Cirq contributions, application layer)
- **Quantum algorithm researcher** — usually requires PhD-level physics/CS background
- **Quantum hardware engineer** — cryogenics, control electronics, photonics (EE/physics background)
- **Quantum-safe security engineer** — post-quantum cryptography migration (very hireable right now, doesn't require deep quantum physics)
- **Quantum applications consultant** — chemistry, materials science, optimization, finance use cases

### Reality Check: The NISQ Era
We are in the **Noisy Intermediate-Scale Quantum (NISQ)** era. Key caveats:
- Current devices have tens to low thousands of physical qubits, high error rates, short coherence times
- No large-scale fault-tolerant quantum computer exists yet; logical (error-corrected) qubits are still being demonstrated in small numbers
- Practical quantum advantage for real-world business problems (vs contrived benchmarks) is rare and narrow today
- Most near-term value is in hybrid classical-quantum algorithms (VQE, QAOA) for chemistry/optimization, not in breaking cryptography (Shor's algorithm at cryptographically relevant scale is still years to over a decade away, estimates vary widely)
- The field rewards patience — it's a long-horizon bet, not a "learn X get hired in 3 months" track for most roles except quantum-safe security

---

## Part B — Telecom Technology Roadmap

### Stage 0: Networking Fundamentals (2-4 weeks)
- OSI 7-layer model vs TCP/IP 4-layer model
- IP addressing, subnetting, routing basics
- TCP vs UDP, ports, sockets
- DNS, NAT, basic switching/VLANs

**Resources:** CCNA-aligned material (Cisco Networking Academy, free), "Computer Networking: A Top-Down Approach" (Kurose & Ross)

### Stage 1: Mobile Network Generations (2-3 weeks)
| Gen | Era | Key Tech | Peak Data Rate (typical) |
|---|---|---|---|
| 2G | 1990s | GSM, circuit-switched voice, SMS | ~0.1 Mbps |
| 3G | 2000s | UMTS/CDMA2000, packet data begins | ~2 Mbps |
| 4G (LTE) | 2010s | All-IP, OFDMA, flat core (EPC) | ~100 Mbps–1 Gbps (LTE-A) |
| 5G | 2019+ | NR air interface, network slicing, MEC | ~1-10 Gbps (mmWave peak) |
| 6G | Research (2030s target) | THz spectrum, AI-native RAN, integrated sensing | Theoretical, Tbps-class targets |

### Stage 2: 5G Architecture Deep Dive (4-6 weeks)
- **RAN (Radio Access Network)**: gNodeB (gNB), beamforming, massive MIMO
- **Core Network (5GC)**: Service-Based Architecture (SBA), AMF, SMF, UPF, NRF
- **Network slicing**: logically isolated virtual networks on shared physical infrastructure
- **Edge computing (MEC)**: compute pushed to network edge to cut latency

### Stage 3: Telecom Protocols (3-4 weeks)
| Protocol | Purpose |
|---|---|
| SIP (Session Initiation Protocol) | Call/session setup & teardown (VoIP, VoLTE) |
| RTP (Real-time Transport Protocol) | Carries actual voice/video media packets |
| Diameter | AAA (Authentication, Authorization, Accounting) in 4G core |
| GTP (GPRS Tunneling Protocol) | Tunneling user data between RAN and core |
| HTTP/2 (in 5G SBA) | Inter-network-function communication in 5G core |

### Stage 4: SDN and NFV (3-4 weeks)
- **SDN (Software-Defined Networking)**: separation of control plane and data plane, centralized control (OpenFlow, controllers)
- **NFV (Network Functions Virtualization)**: running network functions (firewalls, routers, core network elements) as software on commodity hardware instead of dedicated appliances
- Why telecoms adopted both: agility, cost reduction, faster service rollout, enabling network slicing

### Stage 5: Career Paths
- **RF Engineer** — antenna design, link budgets, spectrum planning, site surveys
- **Core Network Engineer** — 5GC deployment, AMF/SMF/UPF configuration, interconnect
- **Telecom Software Developer** — building OSS/BSS systems, orchestration, network automation (often Python/Go, Kubernetes-heavy now)
- **Network Security Engineer (Telecom)** — SS7/Diameter security, 5G core hardening
- **Systems/Solutions Architect** — designing end-to-end network deployments for carriers

### Stage 6: Certifications
| Certification | Body | Focus |
|---|---|---|
| CCNA | Cisco | General networking fundamentals |
| CCNP Service Provider | Cisco | Carrier-grade networking |
| 5G Certified Network Specialist | Various (e.g., Wray Castle, Ericsson) | 5G-specific |
| Nokia 5G Fundamentals / Nokia Bell Labs certs | Nokia | Vendor-specific 5G |
| O-RAN related training | O-RAN Alliance / Linux Foundation | Open RAN concepts |

---

## How the Two Tracks Intersect
- **Post-quantum cryptography migration** is a near-term, highly employable skill relevant to telecom security (protecting 5G/6G signaling and data).
- **Quantum networking / Quantum Key Distribution (QKD)** is an active research area combining both fields — relevant for long-horizon telecom security roadmaps.
- **6G research explicitly discusses** AI-native networks and some labs explore quantum-enhanced sensing/communication, though this is early-stage and speculative.
