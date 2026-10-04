# Collector and public distribution contract

## Scope / Signatures

`recommendations.py init|validate|run|tick|enable|disable|status|source|uninstall --root ROOT` operates only ROOT/recommendations. `collect(root, trigger="manual", clock=time.time, transport=None)` receives the **subdirectory**, and explicit transport/clock seams are unit-test injection, not network bypasses in the CLI. `local_deploy.server(root)` serves one validated `/__recommendations/catalogue.json`, GET/HEAD and no-store/nosniff, write methods405, other reserved paths404, unavailable503.

Persistent config/source snapshots/state/reports are private to the Owner; only catalogue is public. Revision is SHA256 canonical sorted-key UTF-8 JSON excluding revision itself. `save(path,value)` fsyncs then atomic replaces; flock is process-scoped nonblocking and busy exits3 with no network.

## Validation / Error Matrix

- Fixed HTTPS host/path, no user URLs, credentials, query or private data; every redirect revalidates. DNS addresses must all be globally routable and the actual TLS socket connects to a checked IP with original hostname verification.
- 403/429/robots denial→policy failure, source disabled, no retry; robots404 is not permission.
- Timeout/5xx→at most one retry, minimum one second between request starts, source50 requests/500 records, response2MiB, round300 seconds.
- Limit spacing at the actual `HTTPSConnection.request` dispatch, after DNS/connect/TLS preparation, including retry and redirect. Never measure spacing with response-completion timestamps. Reports distinguish requestedAt, completedAt, startedMonotonic and durationSeconds.
- Every blocking phase uses remaining round budget (no one-second timeout floor), checks before and after I/O, and waits at most min(20 seconds, remaining). DNS uses a bounded daemon worker: late OS resolver results are ignored, not continued into HTTP. Timeout interrupts a duplicated underlying socket, so TLS ownership transfer and response buffering cannot prevent shutdown; abandoned socket results are closed. Do not use an executor context that waits for stalled workers on exit.
- Missing identity/intro evidence or any bad required record→whole source failure, not a truncated successful list. Topic-based original writer synopsis and reviewed library facts do not copy reviews or covers.
- Partial/all failed→last successful records retained; first all failed→no published empty catalogue. Report failure does not roll back valid catalogue. State loss reconciles published timestamps before due checks.
- Successful run→seven-day due; failure→one-hour retry; disabled/not_due tick→zero requests. First readiness requires two organisations/three types; durable initialReady allows restarting after a legal source exit while coverage_insufficient stays visible.
- Removed source→tombstone, rebuild from remaining source snapshots, including summary evidence switch for merged identities; source enable cannot silently revive a removal.

## Good / Base / Bad Cases and Required Tests

Good: identical identities merge unique origins, fixed source priority chooses summary; deleting the preferred source rebuilds the summary from a retained source. Base: installation creates a paused hourly RunAtLoad worker; Owner enables after run/validate/review. Bad: same title/different edition must not merge, pid-file permanence must not replace flock, source HTTP200 must not be described as permission.

Test public request logs/SSL-address boundary, redirects/size/time/request budgets, source schema, complete snapshots, busy locks, interrupted publication/report failure, controlled-clock login recovery, source remove/uninstall and HTTP method/path isolation. Run actual collection separately and retain requested time/status/length/hash and summary-evidence hash. Launchd plist/controlled-clock tests do not claim a installed or seven-day observed service.

QA-100-01/02 regressions must include slow DNS/TLS followed by consecutive dispatch, retries/redirects, deadline crossing during DNS/connect/TLS/request/headers/read/wait, subsecond remaining, real wall-clock stalled operations and socket interruption. Budget failures must preserve source snapshots, release the lock and keep the one-hour due/report contract. Early fetch-entry checks alone are insufficient.

## Wrong vs Correct

Wrong: `root/current` or app releases contain mutable catalogue; removal deletes origins but leaves a removed-source summary; enabling resets due and immediately recrawls a freshly published catalogue.

Correct: `ROOT/recommendations/catalogue.json` is independently atomic; removal uses `merge_records` from retained snapshots; global enable preserves due, while source changes request a new due check. Controller upgrade requires an explicit Owner-reviewed reinstall, separately from app data_change:none.
