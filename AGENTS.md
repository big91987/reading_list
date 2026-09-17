# Harness lab

This repository contains application experiments, not the Harness source of truth.

- Business work belongs in app/ and task branches.
- Do not modify files listed in harness-upstream.json during business tasks. Fix Harness bugs in the upstream scaffold repository, then synchronize a committed revision.
- Only the repository owner may trigger local execution. Never execute fork code on the local runner.
- Report actual validation evidence. Static browser checks do not establish backend or GPU correctness.
- Keep credentials and local session histories out of Git.
