#!/bin/bash -eux

set -eux

curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash -ex
mv kustomize /usr/local/bin

cd deployments/staging || exit 1
mkdir -p secret
echo -n "$MACKEREL_APIKEY" > secret/MACKEREL_APIKEY
kustomize edit set image "gcr.io/${PROJECT_ID}/martian_imperial_year_table=gcr.io/${PROJECT_ID}/martian_imperial_year_table:${SHORT_SHA}"
kustomize build | \
/builder/kubectl.bash apply \
  -n martian-imperial-year-table-staging \
  -l app=martian-imperial-year-table \
  --prune \
  -f -
