# Reading-list product runtime specifications

## Pre-Development Checklist

- Read [recommendations.md](recommendations.md) for the Owner-operated collector, state, public route or installation changes.
- Follow task HLD/contracts and docs/local-deployment.md; runtime roots are not Git checkouts and installation is not an ordinary app release.

## Quality Check

Run pinned full_harness/quality.py fix/check and product Python tests, plus live public source collection when adapters change. Mock transport/scheduling, live network and real HTTP route evidence are different claims. Do not modify protected Harness/workflows or install services to manufacture a pass.
