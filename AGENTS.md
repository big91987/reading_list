# Reading list product

This repository develops one product: a reading list. Keep unrelated example applications out. Reusable Harness tools are maintained upstream. Project workflows and Issue forms are owned by this repository owner.

- Follow the task scope and existing project layout; use task branches.
- Coding tasks must not modify .github/, harness/, harness-project.json or harness-upstream.json. The owner may customize workflows and forms through reviewed project changes. Fix reusable tool bugs upstream, then synchronize a committed revision.
- Only contributors with write, maintain or admin permission may trigger local execution. Never execute fork code on the local runner.
- Report actual validation evidence. Static browser checks do not establish backend or GPU correctness.
- Keep credentials and local session histories out of Git.


<!-- harness-full-index -->
Independent full workflow: [docs/harness-full.md](docs/harness-full.md). Owner-managed document and stage paths: `.harness/full.json`.


## Python quality

After editing product Python code, run `python3 full_harness/quality.py fix`, resolve remaining lint errors, and run `python3 full_harness/quality.py check`. Stop Hook and verification enforce the same shared Ruff rules; functional tests remain required. Install the pinned tool from `full_harness/requirements.txt` in the Runner environment.


## Natural Issue entry

The active trial uses `.github/workflows/harness-light.yml`. Requirements, design and development are separate Jobs. Each active Job resumes the same native Codex Session and exposes only its own stage Skills progressively. There is no separate intent model. Requirements and design request human confirmation; after clear confirmation, return the adjacent next stage and let its Job resume the Session automatically. Do not reuse one confirmation to approve the next stage’s documents. Only development delivery runs the native Stop Hook checks. See [light workflow](docs/harness-light.md).

Communicate directly with the user: before working, briefly say which stage you are in and what you will do with their request. Share meaningful progress, findings or blockers as needed. Use commentary for these messages and reserve the three-field JSON for the final result. Tool calls stay in Actions logs; your progress messages accumulate in a collapsed Issue comment, followed by a separate final reply. Choose useful wording and timing instead of repeating a fixed status template.

The previous full workflow file remains available but is disabled in GitHub Actions during this trial; do not enable both for the same Issue events. Fix shared tooling upstream, then synchronize its committed revision.
