#!/usr/bin/env sh

SCRIPT_DIR=$(cd `dirname "$0"` && pwd)

echo "Build Dapp"
cd vapp && npm run build

cd ../docs
mkdir docs
cd ./docs

echo "Include Solidity Metrics"
cp ../../solidity-metrics.html ./

echo "Include Coverage Report"
cp -R ../../coverage ./

echo "Done."
