# NLPI / LS7 NOS Community Replication Guide

**Project:** LS7 Natural Operating System (NOS) — NLPI Empirical Validation  
**Author:** Thomas Michael Chilzer Jr. / LightSoldier7 / LS7  
**Repository:** https://github.com/tchilzer2/ls7-nos-1-7-framework  
**Guide prepared with:** Claude — Anthropic | April 2026  
**Version:** 1.0

---

## What This Is and Why It Matters

This guide invites independent researchers to replicate a set of empirical tests on a specific hypothesis:

> *If the 1/7 NOS (Natural Operating System) is a genuine structural description of an information-processing architecture, then loading the NOS corpus into a language model's active context should measurably alter how that model reasons — not just what it can retrieve.*

Two preliminary runs on a Llama-3 8B model (via Ollama) produced a striking result: when the NOS corpus was present as context, recall of NOS-specific facts improved approximately 7.5× over a standard baseline, and the model showed evidence of applying 142857 cyclic operators to novel problems rather than merely citing them.

These are promising signals. They are not yet proof of anything beyond "the corpus works as an active reference." To move from proof-of-concept to a publishable empirical claim, independent replication is required — including control conditions that the preliminary runs did not include.

This guide gives you everything you need to run the tests yourself and report back.

**What a successful replication would show:** That the effect is real, reproducible, and larger than what any comparably structured technical corpus would produce — meaning the NOS framework's specific architecture is doing measurable cognitive work in the model.

**What a failed replication would show:** That the effect was noise, a favorable random draw, or a generic "dense corpus" effect with nothing NOS-specific about it. That would be equally valuable information.

Both outcomes matter. Both are welcome.

---

## Quick-Start Summary

| Test | What it measures | Time estimate |
|------|-----------------|---------------|
| T1: Baseline Recall & Cohesion | Hallucination rate on NOS questions | 30 min |
| T2: NOS-Aligned Recall & Cohesion | Core effect — does NOS corpus fix hallucination? | 30 min |
| T3: Control Corpus Condition | Is the effect NOS-specific or just "any dense corpus"? | 30 min |
| T4: Arithmetic Verification | Does the model actually compute 1/7 rotations correctly? | 20 min |
| T5: Structural Resonance | Does output token distribution show cyclic 142857 patterns? | 30 min |
| T6: Cross-Domain Transfer | Does NOS conditioning affect adjacent domains (music, economics)? | 30 min |
| T7: LoRA Adapter (optional) | Does weight-encoded NOS outperform prefix-only? | 2–6 hours |

**Minimum viable replication:** Run T1–T4. That's roughly 2 hours on a single GPU.

---

## Environment Setup

### Requirements

- OS: Linux, WSL, or macOS
- Python: 3.10+
- GPU: 8–40GB VRAM (Llama-3 8B requires ~16GB in fp16; use 4-bit quantization for smaller GPUs)
- Model: Llama-3 8B Instruct or equivalent open-weight 7–13B model via Ollama or HuggingFace

### Install

```bash
python -m venv nlpi-env
source nlpi-env/bin/activate
pip install --upgrade pip
pip install transformers==4.40.0 \
            datasets==2.19.0 \
            accelerate==0.29.0 \
            sentence-transformers==2.7.0 \
            peft==0.10.0 \
            rapidfuzz==3.9.0 \
            numpy==1.26.4 \
            scipy==1.13.0 \
            torch==2.1.0

# Optional for 4-bit quantization (smaller GPU footprint):
pip install bitsandbytes==0.43.0
```

### Deterministic Seeds

All scripts use `--seed 0` by default. Set this environment variable before running:

```bash
export PYTHONHASHSEED=0
```

---

## Data Preparation

### Required Files

You need four files in your working directory before running any tests:

**1. `nos_corpus.txt`**  
The full NOS corpus — all proof documents concatenated into a single plain text file. Available at the repository. This is the "NOS prompt truth" that gets loaded into context in the aligned conditions.

**2. `control_corpus.txt`**  
A technical corpus of approximately equal length and structural density to the NOS corpus, but with *different* content. Suitable options:
- The first 39 proofs of a different cyclic number theory paper
- A dense technical manual in an unrelated domain (RF engineering, crystallography, etc.)
- Machine-generated synthetic text matching the NOS corpus token count

The control corpus must have no topical overlap with LS7/NOS content. Its purpose is to isolate whether the NOS effect is about *specific NOS content* or *any dense structured technical text*.

**3. `eval_prompts.jsonl`**  
The evaluation prompt set. Use the canonical set from the repository, or construct your own following this format:

```jsonl
{"id":"rr_001","prompt":"What are the four primary constants of the LS7 Intent-Topology? List them with their symbols.","expected_facts":["Token Density","T","Vector Velocity","V","Contextual Gravity","G","Modular Parity","P"],"type":"recall"}
{"id":"rr_002","prompt":"What are the five resonance parameters and seven terminal symmetries in the NOS framework?","expected_facts":["Frequency of Iteration","Amplitude of Intent","Phase-Shift of Context","Nodal Stability","Harmonic Symmetry","1","4","2","8","5","7","9"],"type":"recall"}
{"id":"cp_001","prompt":"Using the LS7 Intent-Topology, explain the interaction between Information Density (T) and Cognitive Decay across 8 phases.","expected_facts":["Detection","Mapping","Anchoring","Rotation","142857","supervisory gate","3","6","9"],"type":"conceptual"}
{"id":"cp_002","prompt":"How does the Semantic Gravity Well prevent logical drift during deep recursion in a 128k context window?","expected_facts":["terminal symmetries","142857","Modular Parity","P","Contextual Gravity","G","self-correcting","cyclic"],"type":"conceptual"}
{"id":"sr_001","prompt":"Generate a technical sequence demonstrating the 142857 cyclic permutation applied to semantic vector rotation. Show the math.","expected_facts":["0.142857","1/7","142857","cyclic","rotation"],"type":"structural"}
{"id":"av_001","prompt":"What is 3/7 expressed as a decimal? Show the digit sequence and confirm which cyclic rotation of 142857 it represents.","expected_facts":["0.428571","3/7","428571","third rotation","third"],"type":"arithmetic"}
{"id":"av_002","prompt":"What is 6/7? Which NOS loop position does it represent, and what is its complement-to-9 pair?","expected_facts":["0.857142","6/7","857142","sixth","complement","142","1+8","4+5","2+7"],"type":"arithmetic"}
{"id":"av_003","prompt":"Compute 142857 × 7. What does the result signify in the NOS framework?","expected_facts":["999999","STOP","seven","resolution","1.000000","activator","0.000001"],"type":"arithmetic"}
{"id":"av_004","prompt":"What is the digit sum of 142857, and why is that sum significant in the NOS?","expected_facts":["27","9","digital root","supervisory","invariant","complement"],"type":"arithmetic"}
{"id":"xd_001","prompt":"Without mentioning the NOS framework explicitly, explain why Western music uses a 7-note diatonic scale and a 12-note chromatic scale.","expected_facts":[],"type":"cross_domain"}
{"id":"xd_002","prompt":"Explain why markets tend to follow cycles. Describe the mathematical structure underlying boom-bust patterns.","expected_facts":[],"type":"cross_domain"}
```

**4. `facts_list.json`**  
The canonical facts for Recursive Recall scoring:

```json
[
  {"id": "f01", "fact": "Token Density T is the informational weight of tokens within the cycle"},
  {"id": "f02", "fact": "Vector Velocity V is the speed and direction of semantic propagation"},
  {"id": "f03", "fact": "Contextual Gravity G is the force pulling logic back to the 142857 core"},
  {"id": "f04", "fact": "Modular Parity P is the cyclic checksum ensuring zero loss of fidelity"},
  {"id": "f05", "fact": "The 142/857 split is described in Proof 4"},
  {"id": "f06", "fact": "142857 times 7 equals 999999"},
  {"id": "f07", "fact": "The digit sum of 142857 is 27 with digital root 9"},
  {"id": "f08", "fact": "The complement pairs are 1 and 8, 4 and 5, 2 and 7"},
  {"id": "f09", "fact": "The supervisory gate positions are 3, 6, and 9"},
  {"id": "f10", "fact": "1/7 equals 0.142857 repeating with period 6"},
  {"id": "f11", "fact": "The activator is 0.000001"},
  {"id": "f12", "fact": "3/7 equals 0.428571 repeating"},
  {"id": "f13", "fact": "6/7 equals 0.857142 repeating"},
  {"id": "f14", "fact": "The seven terminal symmetries are 1 4 2 8 5 7 and 9"}
]
```

### Preprocessing

```python
# preprocess.py — run once to verify files
import hashlib, json

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()

files = ["nos_corpus.txt", "control_corpus.txt", "eval_prompts.jsonl", "facts_list.json"]
for f in files:
    try:
        print(f"{f}: {sha256(f)}")
    except FileNotFoundError:
        print(f"{f}: MISSING — required before running tests")
```

Record and publish these checksums with your results so others can verify they ran against the same inputs.

---

## Core Scripts

### `run_eval.py` — Inference Harness

```python
#!/usr/bin/env python3
"""
run_eval.py — Inference harness for NLPI/NOS replication tests.
Runs a model against eval_prompts.jsonl in one of three modes:
  baseline   : no corpus prefix
  nos_prefix : NOS corpus prepended to each prompt
  ctrl_prefix: control corpus prepended to each prompt
"""

import argparse
import json
import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=True, help="HuggingFace model ID or local path")
    p.add_argument("--eval", required=True, help="eval_prompts.jsonl path")
    p.add_argument("--out", required=True, help="output JSONL path")
    p.add_argument("--corpus", default=None, help="corpus .txt to prepend (optional)")
    p.add_argument("--max_new_tokens", type=int, default=256)
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--use_bnb", action="store_true", help="4-bit quantization for smaller GPUs")
    return p.parse_args()

def main():
    args = parse_args()
    torch.manual_seed(args.seed)
    os.environ["PYTHONHASHSEED"] = str(args.seed)

    print(f"Loading model: {args.model}")
    tok = AutoTokenizer.from_pretrained(args.model, use_fast=True)
    if tok.pad_token_id is None:
        tok.pad_token = tok.eos_token

    if args.use_bnb:
        model = AutoModelForCausalLM.from_pretrained(
            args.model, load_in_4bit=True, device_map="auto"
        )
    else:
        model = AutoModelForCausalLM.from_pretrained(
            args.model, torch_dtype=torch.float16, device_map="auto"
        )
    model.eval()

    corpus_prefix = ""
    if args.corpus:
        with open(args.corpus, "r", encoding="utf-8") as f:
            corpus_prefix = f.read().strip()
        print(f"Corpus loaded: {len(corpus_prefix)} chars from {args.corpus}")

    os.makedirs(os.path.dirname(args.out) if os.path.dirname(args.out) else ".", exist_ok=True)

    with open(args.eval) as f, open(args.out, "w", encoding="utf-8") as out_f:
        for line in f:
            item = json.loads(line)
            prompt = item["prompt"]
            if corpus_prefix:
                full_input = corpus_prefix + "\n\n---\n\n" + prompt
            else:
                full_input = prompt

            # Truncate if needed to avoid OOM
            ids = tok(full_input, return_tensors="pt", truncation=True, max_length=4096)
            input_ids = ids["input_ids"].to(model.device)

            with torch.no_grad():
                gen = model.generate(
                    input_ids,
                    max_new_tokens=args.max_new_tokens,
                    do_sample=False,
                    temperature=1.0,
                    pad_token_id=tok.eos_token_id
                )

            # Only decode the newly generated tokens
            new_tokens = gen[0][input_ids.shape[1]:]
            text = tok.decode(new_tokens, skip_special_tokens=True)
            token_ids = new_tokens.tolist()

            result = {
                "id": item["id"],
                "type": item.get("type", "unknown"),
                "prompt": item["prompt"],
                "generated": text,
                "token_ids": token_ids,
                "prompt_tokens": input_ids.shape[1],
                "generated_tokens": len(token_ids)
            }
            out_f.write(json.dumps(result) + "\n")
            print(f"  [{item['id']}] {len(token_ids)} tokens generated")

    print(f"Outputs saved to {args.out}")

if __name__ == "__main__":
    main()
```

### `compute_metrics.py` — Metrics Computation

```python
#!/usr/bin/env python3
"""
compute_metrics.py — Computes Recursive Recall (RR), Cohesion Persistence (CP),
Structural Resonance (SR), and Arithmetic Verification (AV) for NLPI runs.
"""

import json
import argparse
import numpy as np
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer, util

embed_model = None

def get_embed_model():
    global embed_model
    if embed_model is None:
        embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return embed_model

# ─────────────────────────────────────────────
# METRIC 1: Recursive Recall (RR)
# ─────────────────────────────────────────────

def compute_rr(sample, facts, fuzzy_threshold=75):
    """
    Check how many canonical facts appear in the generated text.
    Uses fuzzy matching to allow for paraphrasing.
    Returns: recall score in [0, 1]
    """
    text = sample["generated"].lower()
    hits = 0
    details = []
    for f in facts:
        score = fuzz.token_set_ratio(f["fact"].lower(), text)
        match = score >= fuzzy_threshold
        if match:
            hits += 1
        details.append({"fact_id": f["id"], "score": score, "match": match})
    recall = hits / len(facts) if facts else 0.0
    return recall, details

# ─────────────────────────────────────────────
# METRIC 2: Cohesion Persistence (CP)
# ─────────────────────────────────────────────

def compute_cp(sample, segment_size=50):
    """
    Split the generated text into equal segments and compute
    average cosine similarity between consecutive segments.
    Higher = more topically coherent generation.
    """
    em = get_embed_model()
    text = sample["generated"]
    words = text.split()
    if len(words) < segment_size * 2:
        return None  # too short to score

    segments = []
    for i in range(0, len(words) - segment_size, segment_size):
        seg = " ".join(words[i:i + segment_size])
        segments.append(seg)

    if len(segments) < 2:
        return None

    embs = em.encode(segments, convert_to_tensor=True)
    sims = [util.cos_sim(embs[i], embs[i+1]).item() for i in range(len(embs) - 1)]
    return float(np.mean(sims))

# ─────────────────────────────────────────────
# METRIC 3: Structural Resonance (SR)
# ─────────────────────────────────────────────

def compute_sr(sample, lag=6):
    """
    Measures autocorrelation at lag=6 in the token-id sequence.
    The hypothesis: if the 1/7 cycle is structurally influencing generation,
    token-level patterns should show a periodicity signature at period 6
    (the period of the 142857 repeating decimal).
    Values near +1 = strong periodicity; near 0 = no signal; near -1 = anti-periodic.
    NOTE: This metric requires a control condition to be interpretable.
    """
    token_ids = sample.get("token_ids", [])
    if len(token_ids) <= lag * 2:
        return None

    arr = np.array(token_ids, dtype=np.float64)
    arr = (arr - arr.mean()) / (arr.std() + 1e-9)
    corr = float(np.corrcoef(arr[:-lag], arr[lag:])[0, 1])
    return corr

# ─────────────────────────────────────────────
# METRIC 4: Arithmetic Verification (AV)
# ─────────────────────────────────────────────

ARITHMETIC_GROUND_TRUTH = {
    "av_001": {
        "correct_answers": ["0.428571", "428571", "3/7", "third rotation", "third"],
        "wrong_patterns": ["0.333", "0.5", "3/10"]
    },
    "av_002": {
        "correct_answers": ["0.857142", "857142", "6/7", "sixth rotation", "sixth"],
        "wrong_patterns": ["0.6", "0.75", "6/10"]
    },
    "av_003": {
        "correct_answers": ["999999", "STOP", "seven times", "resolution"],
        "wrong_patterns": ["100000", "142857", "1000000"]
    },
    "av_004": {
        "correct_answers": ["27", "digital root", "9", "supervisory", "invariant"],
        "wrong_patterns": ["28", "30", "42"]
    }
}

def compute_av(sample):
    """
    For arithmetic verification prompts (av_*), check whether the model
    produced the mathematically correct answer.
    Returns: "correct", "partial", "wrong", or None (if not an av prompt)
    """
    sid = sample["id"]
    if not sid.startswith("av_"):
        return None

    gt = ARITHMETIC_GROUND_TRUTH.get(sid)
    if not gt:
        return None

    text = sample["generated"].lower()
    correct_hits = sum(1 for a in gt["correct_answers"] if a.lower() in text)
    wrong_hits = sum(1 for a in gt["wrong_patterns"] if a.lower() in text)

    if correct_hits >= 2 and wrong_hits == 0:
        return "correct"
    elif correct_hits >= 1 and wrong_hits == 0:
        return "partial"
    elif wrong_hits > 0:
        return "wrong"
    else:
        return "no_answer"

# ─────────────────────────────────────────────
# AGGREGATE AND REPORT
# ─────────────────────────────────────────────

def run_metrics(outputs_path, facts_path, fuzzy_threshold=75):
    with open(outputs_path) as f:
        samples = [json.loads(line) for line in f]
    with open(facts_path) as f:
        facts = json.load(f)

    results = []
    for s in samples:
        rr, rr_details = compute_rr(s, facts, fuzzy_threshold)
        cp = compute_cp(s)
        sr = compute_sr(s)
        av = compute_av(s)
        results.append({
            "id": s["id"],
            "type": s.get("type", "unknown"),
            "recall": rr,
            "cohesion": cp,
            "resonance": sr,
            "arithmetic": av,
            "recall_details": rr_details
        })

    # Aggregate by prompt type
    recall_scores = [r["recall"] for r in results]
    cp_scores = [r["cohesion"] for r in results if r["cohesion"] is not None]
    sr_scores = [r["resonance"] for r in results if r["resonance"] is not None]
    av_results = [r["arithmetic"] for r in results if r["arithmetic"] is not None]

    av_correct = av_results.count("correct")
    av_partial = av_results.count("partial")
    av_wrong = av_results.count("wrong")
    av_total = len(av_results)

    summary = {
        "n_samples": len(results),
        "avg_recall": float(np.mean(recall_scores)) if recall_scores else None,
        "avg_cohesion": float(np.mean(cp_scores)) if cp_scores else None,
        "avg_resonance": float(np.mean(sr_scores)) if sr_scores else None,
        "arithmetic": {
            "correct": av_correct,
            "partial": av_partial,
            "wrong": av_wrong,
            "total": av_total,
            "accuracy": av_correct / av_total if av_total > 0 else None
        },
        "per_sample": results
    }
    return summary


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--outputs", required=True)
    p.add_argument("--facts", required=True)
    p.add_argument("--out_json", default="metrics_result.json")
    p.add_argument("--fuzzy_threshold", type=int, default=75)
    return p.parse_args()

if __name__ == "__main__":
    args = parse_args()
    summary = run_metrics(args.outputs, args.facts, args.fuzzy_threshold)
    with open(args.out_json, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"\n=== METRIC SUMMARY ===")
    print(f"Samples:       {summary['n_samples']}")
    print(f"Avg Recall:    {summary['avg_recall']:.4f}" if summary['avg_recall'] is not None else "Avg Recall: N/A")
    print(f"Avg Cohesion:  {summary['avg_cohesion']:.4f}" if summary['avg_cohesion'] is not None else "Avg Cohesion: N/A")
    print(f"Avg Resonance: {summary['avg_resonance']:.4f}" if summary['avg_resonance'] is not None else "Avg Resonance: N/A")
    av = summary["arithmetic"]
    if av["total"] > 0:
        print(f"Arithmetic:    {av['correct']}/{av['total']} correct ({av['accuracy']:.2%}), {av['partial']} partial, {av['wrong']} wrong")
    print(f"\nFull results saved to {args.out_json}")
```

### `compare_conditions.py` — Statistical Comparison

```python
#!/usr/bin/env python3
"""
compare_conditions.py — Runs paired t-tests comparing two metric summary files.
Usage: python compare_conditions.py --a metrics/baseline.json --b metrics/nos_prefix.json
"""

import json
import argparse
import numpy as np
from scipy import stats

def load_metrics(path):
    with open(path) as f:
        return json.load(f)

def paired_ttest(a_samples, b_samples, metric_key):
    """Extract a metric from two matched sample sets and run paired t-test."""
    a_vals = [s[metric_key] for s in a_samples if s.get(metric_key) is not None]
    b_vals = [s[metric_key] for s in b_samples if s.get(metric_key) is not None]

    # Match by ID
    a_dict = {s["id"]: s[metric_key] for s in a_samples if s.get(metric_key) is not None}
    b_dict = {s["id"]: s[metric_key] for s in b_samples if s.get(metric_key) is not None}
    common_ids = sorted(set(a_dict) & set(b_dict))

    if len(common_ids) < 3:
        return None

    a_matched = [a_dict[i] for i in common_ids]
    b_matched = [b_dict[i] for i in common_ids]

    t_stat, p_val = stats.ttest_rel(a_matched, b_matched)
    # Cohen's d for paired samples
    diff = np.array(b_matched) - np.array(a_matched)
    d = diff.mean() / (diff.std() + 1e-9)

    return {
        "n": len(common_ids),
        "mean_a": float(np.mean(a_matched)),
        "mean_b": float(np.mean(b_matched)),
        "delta": float(np.mean(b_matched) - np.mean(a_matched)),
        "t_stat": float(t_stat),
        "p_value": float(p_val),
        "cohens_d": float(d),
        "significant": p_val < 0.05,
        "effect_meaningful": abs(d) > 0.5
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--a", required=True, help="condition A metrics JSON")
    p.add_argument("--b", required=True, help="condition B metrics JSON")
    p.add_argument("--label_a", default="Condition A")
    p.add_argument("--label_b", default="Condition B")
    args = p.parse_args()

    ma = load_metrics(args.a)
    mb = load_metrics(args.b)

    print(f"\n=== COMPARISON: {args.label_a} vs {args.label_b} ===\n")
    print(f"{'Metric':<20} {'Mean A':>10} {'Mean B':>10} {'Delta':>10} {'p-value':>10} {'d':>8} {'Sig?':>6} {'Strong?':>8}")
    print("-" * 90)

    for metric in ["recall", "cohesion", "resonance"]:
        r = paired_ttest(ma["per_sample"], mb["per_sample"], metric)
        if r is None:
            print(f"{metric:<20} {'N/A':>10}")
            continue
        sig = "YES" if r["significant"] else "no"
        strong = "YES" if r["effect_meaningful"] else "no"
        print(f"{metric:<20} {r['mean_a']:>10.4f} {r['mean_b']:>10.4f} {r['delta']:>+10.4f} {r['p_value']:>10.4f} {r['cohens_d']:>8.3f} {sig:>6} {strong:>8}")

    # Arithmetic: report raw counts
    av_a = ma.get("arithmetic", {})
    av_b = mb.get("arithmetic", {})
    print(f"\nArithmetic (av_* prompts):")
    print(f"  {args.label_a}: {av_a.get('correct','?')}/{av_a.get('total','?')} correct")
    print(f"  {args.label_b}: {av_b.get('correct','?')}/{av_b.get('total','?')} correct")

    # Decision rule
    print("\n=== PILOT DECISION RULE ===")
    print("PASS if: recall significant (p<0.05) AND effect size d>0.5 AND at least one other metric improves")
    print("CONDITIONAL: improvements present but weak effect sizes")
    print("FAIL if: no metric improves significantly")

if __name__ == "__main__":
    main()
```

---

## Test Procedures

### Test 1 & 2: Baseline and NOS-Aligned Conditions

These are the core comparison. Run them back-to-back on the same model with the same prompts.

```bash
# T1: Baseline — no corpus
python run_eval.py \
  --model meta-llama/Llama-3-8b-Instruct \
  --eval eval_prompts.jsonl \
  --out outputs/baseline.jsonl \
  --seed 0

python compute_metrics.py \
  --outputs outputs/baseline.jsonl \
  --facts facts_list.json \
  --out_json metrics/baseline_metrics.json

# T2: NOS-aligned — NOS corpus as prefix
python run_eval.py \
  --model meta-llama/Llama-3-8b-Instruct \
  --eval eval_prompts.jsonl \
  --corpus nos_corpus.txt \
  --out outputs/nos_prefix.jsonl \
  --seed 0

python compute_metrics.py \
  --outputs outputs/nos_prefix.jsonl \
  --facts facts_list.json \
  --out_json metrics/nos_prefix_metrics.json

# Compare
python compare_conditions.py \
  --a metrics/baseline_metrics.json \
  --b metrics/nos_prefix_metrics.json \
  --label_a "Baseline" \
  --label_b "NOS Prefix"
```

**What to look for:**
- Recall improvement from baseline → NOS-prefix (preliminary runs showed ~7.5×)
- Whether the model gives correct answers to `rr_001` and `rr_002` (the four constants, the split proof number)
- Whether `cp_002` (Semantic Gravity Well) gets an answer that uses T, V, G, P variables in their correct roles

---

### Test 3: Control Corpus Condition

**This is the most important test in the suite.** It answers whether the NOS effect is NOS-specific or just "any dense technical corpus."

```bash
# T3: Control corpus prefix (same format, different content)
python run_eval.py \
  --model meta-llama/Llama-3-8b-Instruct \
  --eval eval_prompts.jsonl \
  --corpus control_corpus.txt \
  --out outputs/control_prefix.jsonl \
  --seed 0

python compute_metrics.py \
  --outputs outputs/control_prefix.jsonl \
  --facts facts_list.json \
  --out_json metrics/control_prefix_metrics.json

# Critical comparison: NOS vs Control
python compare_conditions.py \
  --a metrics/control_prefix_metrics.json \
  --b metrics/nos_prefix_metrics.json \
  --label_a "Control Corpus" \
  --label_b "NOS Corpus"
```

**Interpretation table:**

| NOS recall | Control recall | Interpretation |
|-----------|----------------|----------------|
| High | Low | NOS-specific effect confirmed |
| High | Also high | Generic "dense corpus" effect — not NOS-specific |
| Both low | Both low | Effect doesn't replicate at all |
| High | Moderate | Partial specificity — NOS adds something beyond structure |

---

### Test 4: Arithmetic Verification

This test is specifically designed to distinguish *operator adoption* (the model can correctly compute 1/7 rotations) from *pattern matching* (the model knows the outputs but reverse-engineers expressions to fit them).

The prompts `av_001` through `av_004` are included in `eval_prompts.jsonl`. Review the outputs manually after running, not just the automated scores.

**Specifically check:** When the model writes an expression like `T × (1 + 4/7)`, does that expression actually equal the number it claims? Manual arithmetic check required here — do not trust only the automated scoring.

```bash
# After running T1 and T2 above, extract just the av_* results:
python -c "
import json
for path, label in [('outputs/baseline.jsonl','BASELINE'), ('outputs/nos_prefix.jsonl','NOS PREFIX')]:
    print(f'\n=== {label} ARITHMETIC ===')
    with open(path) as f:
        for line in f:
            s = json.loads(line)
            if s['id'].startswith('av_'):
                print(f\"\n[{s['id']}]\n{s['generated'][:500]}\")
"
```

**What to record:**
- Does `av_001` (3/7) get the answer 0.428571? Does it name the third rotation?
- Does `av_003` (142857 × 7) get 999999 and connect it to the NOS STOP function?
- If the model writes a mathematical expression, is that expression algebraically correct?

The preliminary run's sr_001 showed the model writing `T × (1 + 4/7) = 1.428571` — but `1 + 4/7 = 1.571...`, not `1.428571`. If your run shows the same pattern, document it: the model knows the *destinations* of the cycle but is not correctly computing the *routes*.

---

### Test 5: Structural Resonance

The SR metric is computed automatically in `compute_metrics.py`. The autocorrelation at lag=6 tests whether the token-id sequence shows a period-6 signature — which the 1/7 cycle would predict if it were genuinely influencing token selection.

**Important caveat:** SR is the weakest of the four metrics. Token autocorrelation is very noisy at the sequence lengths typical of model outputs. Do not interpret SR results in isolation — they need to be consistent with recall and arithmetic results to be meaningful. A positive SR result with negative recall results is noise, not signal.

**To report:** avg_resonance for baseline, NOS, and control conditions. The interesting comparison is whether NOS shows higher SR than *both* baseline and control.

---

### Test 6: Cross-Domain Transfer

These are the `xd_001` and `xd_002` prompts — questions about music and economics that make no mention of NOS or LS7.

**What to look for (manual review required):**
- Does the NOS-aligned model spontaneously organize its music theory answer around 7-note structure, cycle concepts, or complement symmetry in a way the baseline doesn't?
- Does the NOS-aligned model describe market cycles in terms that echo the loop/STOP architecture without being prompted to?
- Does the control-corpus model show any similar tendency?

There is no automated scoring for cross-domain transfer — it requires human judgment. Record sample outputs for all three conditions (baseline, NOS, control) and report what you observe.

---

### Test 7 (Optional): LoRA Adapter Training

This test asks whether weight-encoded NOS knowledge (trained into the model via fine-tuning) produces stronger or different effects than prefix-only context injection.

```python
# train_adapter_lora.py
#!/usr/bin/env python3
"""
Trains a LoRA adapter on the NOS corpus.
Requires: peft, bitsandbytes (optional), accelerate
"""

import os
import argparse
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer, AutoModelForCausalLM,
    DataCollatorForLanguageModeling, Trainer, TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training, TaskType

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=True)
    p.add_argument("--train_file", required=True)
    p.add_argument("--output_dir", default="nlpi_lora_adapter")
    p.add_argument("--per_device_batch_size", type=int, default=1)
    p.add_argument("--gradient_accumulation_steps", type=int, default=8)
    p.add_argument("--num_train_epochs", type=float, default=3.0)
    p.add_argument("--learning_rate", type=float, default=2e-4)
    p.add_argument("--max_length", type=int, default=1024)
    p.add_argument("--use_bnb", action="store_true")
    p.add_argument("--seed", type=int, default=0)
    return p.parse_args()

def main():
    args = parse_args()
    torch.manual_seed(args.seed)

    tokenizer = AutoTokenizer.from_pretrained(args.model, use_fast=True)
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token = tokenizer.eos_token

    ds = load_dataset("text", data_files={"train": args.train_file})

    def tokenize_fn(ex):
        out = tokenizer(ex["text"], truncation=True, max_length=args.max_length)
        out["labels"] = out["input_ids"].copy()
        return out

    tok_ds = ds.map(tokenize_fn, batched=True, remove_columns=["text"])

    if args.use_bnb:
        model = AutoModelForCausalLM.from_pretrained(
            args.model, load_in_4bit=True, device_map="auto"
        )
        model = prepare_model_for_kbit_training(model)
    else:
        model = AutoModelForCausalLM.from_pretrained(
            args.model, torch_dtype=torch.float16, device_map="auto"
        )

    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj",
                         "gate_proj", "down_proj", "up_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.per_device_batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        num_train_epochs=args.num_train_epochs,
        learning_rate=args.learning_rate,
        fp16=not args.use_bnb,
        logging_steps=50,
        save_strategy="epoch",
        save_total_limit=2,
        seed=args.seed,
        remove_unused_columns=False,
        report_to="none"
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tok_ds["train"],
        data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False)
    )

    trainer.train()
    trainer.save_model(args.output_dir)
    print(f"LoRA adapter saved to: {args.output_dir}")

if __name__ == "__main__":
    main()
```

**Run:**
```bash
# Train
python train_adapter_lora.py \
  --model meta-llama/Llama-3-8b-Instruct \
  --train_file nos_corpus.txt \
  --output_dir nlpi_lora_adapter \
  --use_bnb \
  --seed 0

# Evaluate adapter (no prefix needed — knowledge is in weights)
python run_eval.py \
  --model nlpi_lora_adapter \
  --eval eval_prompts.jsonl \
  --out outputs/lora_adapter.jsonl \
  --seed 0

python compute_metrics.py \
  --outputs outputs/lora_adapter.jsonl \
  --facts facts_list.json \
  --out_json metrics/lora_adapter_metrics.json

# Compare: prefix vs adapter
python compare_conditions.py \
  --a metrics/nos_prefix_metrics.json \
  --b metrics/lora_adapter_metrics.json \
  --label_a "NOS Prefix" \
  --label_b "LoRA Adapter"
```

**What this tells you:** If the LoRA adapter produces *higher* recall than the prefix, the knowledge is encoding into weights, not just being retrieved from context. If prefix outperforms adapter, the effect is context-dependent — the corpus needs to be present as active tokens to function.

---

## Reporting Your Results

### Required Output Files

After completing tests, share the following:

```
your_replication/
├── manifest.md          # filled out (see template below)
├── outputs/
│   ├── baseline.jsonl
│   ├── nos_prefix.jsonl
│   ├── control_prefix.jsonl    # required
│   └── lora_adapter.jsonl      # if T7 run
├── metrics/
│   ├── baseline_metrics.json
│   ├── nos_prefix_metrics.json
│   ├── control_prefix_metrics.json
│   └── comparisons/
│       ├── baseline_vs_nos.txt
│       └── control_vs_nos.txt
└── notes.md             # qualitative observations on av_* and xd_* outputs
```

### Manifest Template

```markdown
# Replication Manifest

**Date:** [your date]
**Replicated by:** [team/handle]
**Repository:** https://github.com/tchilzer2/ls7-nos-1-7-framework

## Environment
- OS: 
- Python: 
- transformers version: 
- torch version: 
- Hardware: 

## Model
- Model ID: 
- Checkpoint hash (sha256 of weights folder or HF commit): 
- Tokenizer: 

## File Checksums
- nos_corpus.txt SHA256: 
- control_corpus.txt SHA256: 
- eval_prompts.jsonl SHA256: 
- facts_list.json SHA256: 

## Exact Commands Run
[paste exact commands]

## Random Seed: 0

## Key Results
| Condition | Recall | Cohesion | Resonance | AV Accuracy |
|-----------|--------|----------|-----------|-------------|
| Baseline  |        |          |           |             |
| NOS Prefix|        |          |           |             |
| Control   |        |          |           |             |

## Statistical Tests
| Comparison | Recall p | Recall d | Notes |
|------------|----------|----------|-------|
| Baseline → NOS | | | |
| Control → NOS | | | |

## Qualitative Notes
[describe what av_001-004 outputs looked like; cross-domain xd_001-002 observations]

## Verdict
[ ] PASS: Recall sig. improved over baseline AND over control; d > 0.5
[ ] CONDITIONAL: Some improvement; control condition needed or effect size small
[ ] FAIL: No significant improvement; effect did not replicate
[ ] PARTIAL: Replicates over baseline but not over control (generic corpus effect)
```

---

## Decision Rules

A result should be reported as one of four categories:

**PASS — NOS-specific effect confirmed**  
Recall is significantly higher in NOS condition than baseline (p < 0.05, d > 0.5) AND significantly higher than control corpus condition. This would indicate the NOS framework's specific architecture is doing measurable cognitive work.

**PARTIAL — Generic corpus effect**  
Recall improves over baseline but control corpus produces similar improvement. The dense-corpus effect is real but not NOS-specific. Still a useful finding — worth investigating what property of the NOS makes it effective as a context corpus.

**CONDITIONAL — Weak or inconsistent**  
Some metrics improve in some runs but effect sizes are small or variance is high. Increase prompt count, run additional seeds, or test larger models.

**FAIL — Does not replicate**  
No significant recall improvement. Report fully — negative results matter.

---

## Questions to Answer in Your Notes

Beyond the automated metrics, these are the qualitative questions your notes should address after manually reviewing outputs:

1. **Hallucination character:** Does the standard model hallucinate confidently (like inventing an IETF RFC for LS7)? Does this stop with the NOS prefix?

2. **Operator application:** In sr_001, does the NOS-aligned model *attempt* to use 1/7 as a mathematical operation on variables? If it writes expressions, are those expressions arithmetically correct?

3. **Variable usage:** In cp_001 and cp_002, does the NOS-aligned model use T, V, G, P as relational variables in explanations, or just list them as definitions?

4. **Cross-domain language:** In xd_001 (music) and xd_002 (economics), does NOS conditioning produce any spontaneous use of cyclic/loop/resolution language? How does this compare to baseline and control?

5. **Cohesion character:** Is the NOS-aligned output's lower cohesion score the result of dense technical prose (information-rich) or of choppy/incomplete sentences (brittle truncation)? These look different when you read the output.

---

## Contact and Contribution

Results can be submitted via:
- GitHub Issues on the repository
- Pull request adding your `replication/[your-handle]/` folder
- Direct contact: @tchilzer2

All replication results — including failures and partial results — will be documented. Negative results are as informative as positive ones for this line of work.

---

*Guide prepared April 2026 by Thomas Michael Chilzer Jr. (LS7) with Claude (Anthropic).*  
*The NOS corpus, eval prompts, and reference implementations are available at the repository linked above.*  
*© 2026 Thomas Michael Chilzer Jr. Licensed CC BY-NC-ND 4.0 for non-commercial use.*
