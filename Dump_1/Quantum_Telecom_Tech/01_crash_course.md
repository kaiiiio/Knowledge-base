# Crash Course: Quantum Computing + Telecom

A dense, math-included crash course. Read this after skimming the roadmap.

---

## 1. Qubit vs Classical Bit

A classical bit is either `0` or `1`. A **qubit** is a vector in a 2-dimensional complex vector space, written in Dirac notation as a superposition of the two basis states:

```
|ψ⟩ = α|0⟩ + β|1⟩
```

Where:
- `|0⟩ = [1, 0]ᵀ` and `|1⟩ = [0, 1]ᵀ` (basis vectors, analogous to classical 0 and 1)
- `α, β` are **complex probability amplitudes**
- Normalization constraint: `|α|² + |β|² = 1`
- Upon **measurement**, you get `0` with probability `|α|²` and `1` with probability `|β|²` — the superposition collapses to one classical outcome

This is the core difference: a classical bit holds one value; a qubit holds a weighted complex combination of both, and that combination can interfere (amplitudes can cancel or reinforce) — this interference is what gives quantum algorithms their power, not "trying both at once" in a naive sense.

A system of `n` qubits lives in a `2ⁿ`-dimensional space — this exponential state space is the resource quantum algorithms exploit.

---

## 2. Four Fundamental Quantum Gates

Quantum gates are unitary matrices (U†U = I) acting on qubit state vectors.

### Pauli-X (NOT gate)
```
X = [0 1]
    [1 0]
```
Flips `|0⟩ ↔ |1⟩`. Classical NOT analog.

### Hadamard (H)
```
H = 1/√2 [1  1]
         [1 -1]
```
Creates equal superposition: `H|0⟩ = (|0⟩ + |1⟩)/√2`, `H|1⟩ = (|0⟩ − |1⟩)/√2`. This is how superposition is typically initialized in circuits.

### CNOT (Controlled-NOT, 2-qubit gate)
```
CNOT = [1 0 0 0]
       [0 1 0 0]
       [0 0 0 1]
       [0 0 1 0]
```
Flips the target qubit **if and only if** the control qubit is `|1⟩`. This is the primary gate used to create entanglement.

### Pauli-Z (phase flip)
```
Z = [1  0]
    [0 -1]
```
Leaves `|0⟩` unchanged, flips the sign (phase) of `|1⟩`. Phase gates like Z and the related S/T gates don't change measurement probabilities of a single qubit alone but matter enormously once combined with H and entanglement (interference effects).

---

## 3. Walkthrough: Building a Bell State (Entanglement) in Qiskit

The Bell state `(|00⟩ + |11⟩)/√2` is the simplest entangled state — measuring one qubit instantly tells you the other's value, regardless of distance.

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram

# Build a 2-qubit, 2-classical-bit circuit
qc = QuantumCircuit(2, 2)

# Step 1: Hadamard on qubit 0 -> puts it into superposition
qc.h(0)

# Step 2: CNOT with qubit 0 as control, qubit 1 as target -> entangles them
qc.cx(0, 1)

# Step 3: Measure both qubits
qc.measure([0, 1], [0, 1])

print(qc.draw())

# Run on a local simulator
simulator = AerSimulator()
compiled = simulator.run(qc, shots=1000)
result = compiled.result()
counts = result.get_counts()
print(counts)
# Expected output: roughly {'00': ~500, '11': ~500}
# Note: '01' and '10' should essentially never appear -> this is the entanglement signature
```

Why this matters: before measurement, the two qubits are in a joint state that cannot be factored into independent single-qubit states. The correlation (`00` or `11`, never mixed) persists no matter how the qubits are later separated — this is the basis of quantum teleportation, quantum key distribution, and many quantum algorithms' building blocks.

---

## 4. Why Quantum Computers Threaten Current Encryption

Modern public-key cryptography (RSA, and Diffie-Hellman/ECC) relies on problems that are *hard for classical computers* but *easy to state*:
- **RSA** security relies on the difficulty of factoring large integers (`N = p × q` for large primes `p, q`)
- Classically, the best known factoring algorithms are sub-exponential (e.g., General Number Field Sieve) — factoring a 2048-bit RSA key is considered infeasible with classical computers for the foreseeable future

**Shor's algorithm** (1994) is a quantum algorithm that factors integers in **polynomial time** on a sufficiently large, fault-tolerant quantum computer. If such a machine existed at scale:
- RSA, Diffie-Hellman, and elliptic-curve cryptography (ECDSA/ECDH) would all be broken
- This is why it's called the "quantum apocalypse" scenario in security circles

**Important caveat (tie back to NISQ reality):** Breaking RSA-2048 is estimated to require on the order of thousands of *logical* (error-corrected) qubits with very deep circuits — translating to possibly millions of *physical* noisy qubits with current error-correction overhead. Current hardware (2020s) has at most a few thousand noisy physical qubits and no demonstrated large-scale fault tolerance. Most serious estimates put a cryptographically-relevant quantum computer at a decade or more away — but "harvest now, decrypt later" attacks (adversaries storing encrypted data today to decrypt once quantum computers mature) are why migration is urgent *now*, not later.

---

## 5. Post-Quantum Cryptography (PQC) Basics

In 2024, **NIST finalized its first set of post-quantum cryptography standards** — algorithms believed to be secure against both classical and quantum attacks because they rely on different hard math problems (lattice-based, hash-based) instead of factoring/discrete log.

| Standard | Algorithm Family | Based On | Use Case |
|---|---|---|---|
| FIPS 203 | ML-KEM (CRYSTALS-Kyber) | Lattice (Module-LWE) | Key encapsulation (key exchange) |
| FIPS 204 | ML-DSA (CRYSTALS-Dilithium) | Lattice (Module-LWE/SIS) | Digital signatures |
| FIPS 205 | SLH-DSA (SPHINCS+) | Hash-based | Digital signatures (conservative, stateless, larger signatures) |

These are being rolled into TLS, VPNs, and signing infrastructure gradually ("crypto agility" migration), and telecom standards bodies (3GPP, GSMA) are actively studying PQC migration paths for 5G/6G signaling.

---

## 6. How a Mobile Call/Data Session Works End-to-End

```
[UE: your phone]
     │  (radio signal, uplink/downlink)
     ▼
[RAN: gNodeB / eNodeB — cell tower]
     │  (backhaul, fiber/microwave)
     ▼
[Core Network]
   4G: eNodeB → MME (mobility/signaling) → SGW (serving gateway) → PGW (packet gateway, internet anchor)
   5G: gNB → AMF (Access & Mobility Mgmt) → SMF (Session Mgmt) → UPF (User Plane Function, data anchor)
     │
     ▼
[Internet / Application Servers]
```

Step by step (5G, simplified):
1. **Attach/Registration**: UE powers on, authenticates with the network via AMF (using SIM credentials, AKA protocol)
2. **Session establishment**: SMF sets up a PDU (Packet Data Unit) session, UPF is selected as the data-plane anchor
3. **Data transfer**: User traffic flows UE → gNB (radio) → UPF → internet, staying mostly on the **user plane** (fast path, no signaling overhead per packet)
4. **Signaling** (control plane: AMF, SMF, PCF for policy) happens separately and less frequently — this separation of control and user plane (CUPS) is a deliberate 5G design choice for scalability and low latency
5. **Mobility**: as the UE moves between cells, AMF handles handover, keeping the session alive

For a **voice call**, VoLTE/VoNR adds an IMS (IP Multimedia Subsystem) layer on top, using **SIP** for call signaling and **RTP** for the actual voice media stream.

---

## 7. What Makes 5G Different From 4G (Technically)

| Feature | 4G LTE | 5G NR |
|---|---|---|
| Peak theoretical speed | ~1 Gbps (LTE-A) | Up to ~10-20 Gbps (mmWave) |
| Latency target | ~30-50 ms | ~1 ms (URLLC use cases) |
| Spectrum | Sub-6 GHz | Sub-6 GHz + mmWave (24-100 GHz) |
| MIMO | Up to 4x4/8x8 | Massive MIMO (64-256+ antenna elements) |
| Core architecture | EPC (flatter but still monolithic-ish) | Fully service-based architecture (SBA), cloud-native, containerized |
| Network slicing | Not natively supported | Native — logically separate virtual networks per use case |
| Key enabler | OFDMA | Flexible numerology OFDM, beamforming, mmWave |

**mmWave**: millimeter-wave spectrum (24 GHz+) offers huge bandwidth but very short range and poor wall penetration — requires dense small-cell deployment.

**Massive MIMO**: using large antenna arrays at the base station to serve many users simultaneously via spatial multiplexing and beamforming, dramatically increasing capacity.

**Network slicing**: partitioning one physical 5G network into multiple virtual, isolated logical networks tuned for different needs (see deep dive doc for a worked example).

---

## 8. What 6G Research Is Exploring (Pre-Standardization, Speculative)

- **Terahertz (THz) spectrum** (above 100 GHz) for even higher bandwidth, very short range
- **AI-native RAN**: machine learning embedded directly into radio resource management, not bolted on
- **Integrated sensing and communication (ISAC)**: using the same radio signals for both communication and environment sensing/radar-like functions
- **Non-terrestrial network (NTN) integration**: seamless fallback/integration with LEO satellite constellations
- **Sub-millisecond latency targets** for extreme real-time applications (holographic communication, tactile internet)
- Standardization bodies (3GPP) expect 6G specification work through the late 2020s, with commercial rollout targeted around 2030
