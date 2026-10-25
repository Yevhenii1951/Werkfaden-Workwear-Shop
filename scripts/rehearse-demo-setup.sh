#!/usr/bin/env bash
# Seed the throwaway rehearsal database twice and report the row counts.
# Used as the WW-023 reproducibility check; not part of the app.
set -euo pipefail

export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"
cd "$(dirname "$0")/.."

read -r BASE_URL PG_PASSWORD <<<"$(python3 - <<'PY'
import re, urllib.parse
env = {}
for line in open("apps/backend/.env"):
    match = re.match(r"^([A-Z_]+)=(.*)$", line.strip())
    if match:
        env[match.group(1)] = match.group(2).strip('"')
url = urllib.parse.urlparse(env["DATABASE_URL"])
base = env["DATABASE_URL"].rsplit("/", 1)[0] + "/werkfaden_rehearsal"
print(base, url.password)
PY
)"

export DATABASE_URL="$BASE_URL"
export DB_NAME=werkfaden_rehearsal
export SETUP_WRITE_STOREFRONT_KEY=false
export PGPASSWORD="$PG_PASSWORD"

counts() {
  psql -h 127.0.0.1 -p 5544 -U werkfaden -d werkfaden_rehearsal -At -F' ' -c "
    select
      (select count(*) from product) as products,
      (select count(*) from product_variant) as variants,
      (select count(*) from product_category) as categories,
      (select count(*) from promotion) as promotions,
      (select count(*) from inventory_level) as levels,
      (select count(*) from region) as regions,
      (select count(*) from shipping_option) as shipping_options"
}

psql -h 127.0.0.1 -p 5544 -U werkfaden -d postgres -q -c "drop database if exists werkfaden_rehearsal" -c "create database werkfaden_rehearsal"
echo "rehearsal database recreated"

npm run db:migrate >/tmp/opencode/ww023-rehearsal-migrate.log 2>&1
echo "migrated"

npm run setup:demo >/tmp/opencode/ww023-rehearsal-run1.log 2>&1
echo "run 1: $(counts)"

npm run setup:demo >/tmp/opencode/ww023-rehearsal-run2.log 2>&1
echo "run 2: $(counts)"

echo "errors in run 1: $(grep -c 'error' /tmp/opencode/ww023-rehearsal-run1.log || true)"
echo "errors in run 2: $(grep -c 'error' /tmp/opencode/ww023-rehearsal-run2.log || true)"
