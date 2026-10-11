# Practical Exercises

Hands-on exercises to reinforce the crash course and deep dive material. Do them roughly in order.

---

## Exercise 1: Create and Measure a Bell State, Verify Correlation Statistically

**Goal**: Install Qiskit, build an entangled pair, run many shots, and statistically confirm the `00`/`11` correlation (and absence of `01`/`10`).

**Setup:**
```bash
pip install qiskit qiskit-aer
```

**Code:**
```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

sim = AerSimulator()
result = sim.run(qc, shots=10000).result()
counts = result.get_counts()

print("Raw counts:", counts)

total = sum(counts.values())
correlated = counts.get('00', 0) + counts.get('11', 0)
uncorrelated = counts.get('01', 0) + counts.get('10', 0)

print(f"Correlated outcomes (00 or 11): {correlated} ({100*correlated/total:.2f}%)")
print(f"Uncorrelated outcomes (01 or 10): {uncorrelated} ({100*uncorrelated/total:.2f}%)")
```

**Expected result**: correlated outcomes should be ~99-100% (small deviations only due to simulator noise model if enabled; on an ideal simulator it should be ~exactly 50/50 split between `00` and `11`, with `01`/`10` at 0%). Write a short note on what this proves about entanglement vs a classical "two coins secretly agreed in advance" explanation.

---

## Exercise 2: Implement Grover's Algorithm for a 2-Qubit Search Problem

**Goal**: Build a working Grover's search over a 2-qubit space (4 possible states) to find a single marked state, e.g., `|11⟩`.

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np

def grover_2qubit(marked_state="11"):
    qc = QuantumCircuit(2, 2)

    # Step 1: Equal superposition
    qc.h([0, 1])

    # Step 2: Oracle - flips phase of the marked state
    # For |11>, a CZ gate flips the phase exactly when both qubits are 1
    if marked_state == "11":
        qc.cz(0, 1)
    # (For other marked states, apply X gates before/after CZ to remap which
    #  state gets the phase flip - left as an extension exercise.)

    # Step 3: Diffusion operator (inversion about the mean)
    qc.h([0, 1])
    qc.x([0, 1])
    qc.cz(0, 1)
    qc.x([0, 1])
    qc.h([0, 1])

    # For N=4, only 1 Grover iteration is needed (optimal for this small case)
    qc.measure([0, 1], [0, 1])
    return qc

qc = grover_2qubit("11")
print(qc.draw())

sim = AerSimulator()
result = sim.run(qc, shots=1000).result()
counts = result.get_counts()
print("Results:", counts)
# Expect the marked state '11' to dominate the counts (ideally ~100% for N=4, 1 iteration)
```

**Extension**: Modify the oracle to mark a different 2-qubit state (e.g., `01`) by adding X gates on the qubit(s) that should be `0` before and after the CZ gate, so the phase flip triggers on the correct bit pattern. Verify the new target state dominates the measurement counts.

---

## Exercise 3: Run a Circuit on Real IBM Quantum Hardware and Compare to Simulator

**Goal**: Use IBM Quantum's free tier to execute your Bell-state circuit from Exercise 1 on actual quantum hardware, then compare results to the ideal simulator.

**Steps:**
1. Create a free account at https://quantum.ibm.com
2. Generate an API token from your account dashboard
3. Install the provider package: `pip install qiskit-ibm-runtime`
4. Use the following pattern (API surface may shift slightly with Qiskit Runtime versions — check current docs):

```python
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager

# Save your credentials once (run this separately, one time):
# QiskitRuntimeService.save_account(channel="ibm_quantum", token="YOUR_API_TOKEN")

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"Using backend: {backend.name}")

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
isa_circuit = pm.run(qc)

sampler = Sampler(backend)
job = sampler.run([isa_circuit], shots=1000)
result = job.result()
counts = result[0].data.c.get_counts()
print("Real hardware counts:", counts)
```

5. Compare the real-hardware distribution to your Exercise 1 simulator result. **Expected difference**: real hardware will show some non-trivial `01`/`10` counts (a few percent) due to gate errors, decoherence, and readout errors — the simulator result is "too perfect." Write a short note quantifying the error rate you observed (uncorrelated counts / total counts) and compare it to published coherence/gate-fidelity specs for that backend.

---

## Exercise 4: Simulate a Basic 5G Network Slice Scenario (Conceptual + Diagram)

**Goal**: Design (on paper or in a diagramming tool) a 3-slice 5G deployment for a hypothetical smart factory, and justify your resource allocation choices.

**Task:**
1. Draw a diagram with: UE devices (robots, sensors, AR headsets) → RAN (gNB) → three logical slices → respective core network function sets → appropriate destinations (local edge server vs internet).
2. For each slice (eMBB, URLLC, mMTC — see deep dive doc), specify:
   - Target latency and throughput
   - Whether UPF is placed at the edge (MEC) or centrally
   - Expected device count and traffic pattern
3. Write a one-paragraph justification: why would putting the URLLC slice's UPF at the edge reduce latency, and what happens if you don't?

**Suggested diagram format** (ASCII, Mermaid, or any diagramming tool):
```
          ┌─────────────┐
 Robots → │             │ → URLLC Slice → Edge UPF → Local Controller
          │    gNB       │
Sensors → │  (shared RAN)│ → mMTC Slice  → Central UPF → IoT Platform (cloud)
          │             │
AR HMDs → │             │ → eMBB Slice  → Central UPF → Internet/CDN
          └─────────────┘
```

---

## Exercise 5: Model Latency Differences Between 4G and 5G Parameters

**Goal**: Use ns-3 (or a simpler back-of-envelope Python model if ns-3 setup is too heavy for a first pass) to compare end-to-end latency between representative 4G and 5G parameter sets.

**Simple Python model (if skipping full ns-3 setup):**
```python
# Simplified latency budget model (not a full simulator, but illustrates the components)

def latency_budget(air_interface_ms, backhaul_ms, core_processing_ms, propagation_ms):
    return air_interface_ms + backhaul_ms + core_processing_ms + propagation_ms

# Representative 4G LTE parameters
lte_latency = latency_budget(
    air_interface_ms=10,      # radio frame/TTI scheduling overhead
    backhaul_ms=5,
    core_processing_ms=15,    # EPC processing (MME/SGW/PGW hops)
    propagation_ms=5
)

# Representative 5G URLLC-tuned parameters
nr_latency = latency_budget(
    air_interface_ms=0.5,     # shorter TTI / mini-slots
    backhaul_ms=2,
    core_processing_ms=1,     # edge UPF, local breakout, CUPS architecture
    propagation_ms=1          # MEC placement reduces physical distance
)

print(f"4G LTE estimated latency: {lte_latency} ms")
print(f"5G URLLC estimated latency: {nr_latency} ms")
print(f"Improvement: {lte_latency - nr_latency:.1f} ms ({100*(1 - nr_latency/lte_latency):.0f}% reduction)")
```

**Full ns-3 path (more rigorous)**:
1. Install ns-3 (https://www.nsnam.org/docs/release/3.40/tutorial/) and the `nr` module (open-source 5G NR module for ns-3, maintained by CTTC)
2. Configure two scenarios: one with LTE module defaults, one with NR module using short TTI / numerology settings matching 5G
3. Run both, extract end-to-end packet delay statistics (ns-3 FlowMonitor is useful here), and plot a comparison.

---

## Exercise 6: Research Exercise — Compare 3 NIST Post-Quantum Cryptography Algorithms

**Goal**: Research and summarize CRYSTALS-Kyber (ML-KEM), CRYSTALS-Dilithium (ML-DSA), and SPHINCS+ (SLH-DSA).

**Produce a short comparison table covering:**

| Criterion | Kyber (ML-KEM) | Dilithium (ML-DSA) | SPHINCS+ (SLH-DSA) |
|---|---|---|---|
| Primary use case | ? (hint: key exchange/encapsulation) | ? (hint: signatures) | ? (hint: signatures) |
| Underlying hard problem | ? (hint: lattice — Module-LWE) | ? (hint: lattice — Module-LWE/SIS) | ? (hint: hash functions) |
| Relative key/signature size | ? | ? | ? (hint: notably larger signatures) |
| Relative speed | ? | ? | ? (hint: slower, but very conservative security assumptions) |
| NIST FIPS number | FIPS 203 | FIPS 204 | FIPS 205 |

**Research questions to answer in your own words:**
1. Why does NIST recommend having both a lattice-based option (Dilithium) and a hash-based option (SPHINCS+) for signatures, rather than just picking the fastest one?
2. Kyber is for key exchange, not signatures — why can't the same algorithm do both jobs, conceptually?
3. If you were migrating a telecom core network's TLS infrastructure to be quantum-safe today, which combination of these algorithms would you pick for (a) performance-sensitive internal signaling, and (b) long-term archival signatures that must remain trustworthy for decades? Justify your answer.

Start research at the official NIST PQC project page (https://csrc.nist.gov/projects/post-quantum-cryptography) and cross-reference with the Open Quantum Safe project docs (https://openquantumsafe.org) for implementation-level detail.
