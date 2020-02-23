#!/bin/bash -eux

set -eux

curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash -eux
mv kustomize /usr/local/bin

cd deployments/production || exit 1
mkdir -p secret
echo -n "$MACKEREL_APIKEY" > secret/MACKEREL_APIKEY
kustomize edit set image "gcr.io/${PROJECT_ID}/martian_imperial_year_table=gcr.io/${PROJECT_ID}/martian_imperial_year_table:${SHORT_SHA}"
kustomize build | \
/builder/kubectl.bash apply \
  -n martian-imperial-year-table-production \
  -l app=martian-imperial-year-table \
  --prune \
  -f -
