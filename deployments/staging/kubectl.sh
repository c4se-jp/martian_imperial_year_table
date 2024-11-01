#!/bin/bash

set -eux

curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash -ex
mv kustomize /usr/local/bin

cd deployments/staging || exit 1

set +x
mkdir -p secret
echo -n "$MACKEREL_APIKEY" > secret/MACKEREL_APIKEY
set -x

kustomize edit set image "asia-docker.pkg.dev/${PROJECT_ID}/asia.gcr.io/martian_imperial_year_table=asia-docker.pkg.dev/${PROJECT_ID}/asia.gcr.io/martian_imperial_year_table:${SHORT_SHA}"
kustomize build | \
/builder/kubectl.bash apply \
  -l app=martian-imperial-year-table \
  -n martian-imperial-year-table-staging \
  --prune \
  -f -
