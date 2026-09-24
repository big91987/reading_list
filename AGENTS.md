# Reading list product

This repository develops one product: a reading list. Keep unrelated example applications out. Reusable Harness tools are maintained upstream. Project workflows and Issue forms are owned by this repository owner.

- Follow the task scope and existing project layout; use task branches.
- Coding tasks must not modify .github/, harness/, harness-project.json or harness-upstream.json. The owner may customize workflows and forms through reviewed project changes. Fix reusable tool bugs upstream, then synchronize a committed revision.
- Only the repository owner may trigger local execution. Never execute fork code on the local runner.
- Report actual validation evidence. Static browser checks do not establish backend or GPU correctness.
- Keep credentials and local session histories out of Git.


<!-- harness-full-index -->
Independent full workflow: [docs/harness-full.md](docs/harness-full.md). Owner-managed document and stage paths: `.harness/full.json`.


## Python quality

After editing product Python code, run `python3 full_harness/quality.py fix`, resolve remaining lint errors, and run `python3 full_harness/quality.py check`. Stop Hook and verification enforce the same shared Ruff rules; functional tests remain required. Install the pinned tool from `full_harness/requirements.txt` in the Runner environment.


## Natural Issue entry

Repository write/maintain/admin contributors can open Issues and comment without commands. The hosted permission gate and Python controller both verify access. Comments first enter a read-only conversation; questions do not approve or invalidate a stage. Explicit approval remains bound to the current pending artifact revision. Bots do not trigger execution. The legacy workflow is manual-only.
