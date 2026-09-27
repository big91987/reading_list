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

The active trial uses `.github/workflows/harness-light.yml`. Each authorized Issue message resumes the same native Codex Session once and directly answers or works. There is no separate intent model. Requirements and design request human confirmation; a clear confirmation can advance the stage within that same execution. All three stage Skills are progressively discoverable. Only development delivery runs the native Stop Hook checks. See [light workflow](docs/harness-light.md).

The previous full workflow file remains available but is disabled in GitHub Actions during this trial; do not enable both for the same Issue events. Fix shared tooling upstream, then synchronize its committed revision.
