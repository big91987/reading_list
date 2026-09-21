# Reading list product

This repository develops one product: a reading list. Keep unrelated example applications out. Reusable Harness tools are maintained upstream. Project workflows and Issue forms are owned by this repository owner.

- Follow the task scope and existing project layout; use task branches.
- Coding tasks must not modify .github/, harness/, harness-project.json or harness-upstream.json. The owner may customize workflows and forms through reviewed project changes. Fix reusable tool bugs upstream, then synchronize a committed revision.
- Only the repository owner may trigger local execution. Never execute fork code on the local runner.
- Report actual validation evidence. Static browser checks do not establish backend or GPU correctness.
- Keep credentials and local session histories out of Git.


<!-- harness-full-index -->
Independent full workflow: [docs/harness-full.md](docs/harness-full.md). Owner-managed document and stage paths: `.harness/full.json`.
