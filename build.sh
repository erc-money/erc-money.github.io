#!/usr/bin/env sh

SCRIPT_DIR=$(cd `dirname "$0"` && pwd)
COMMIT_MSG=$1

if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="New build"
fi

echo "Build Dapp"
cd "$SCRIPT_DIR/vapp" && npm run build

cd "$SCRIPT_DIR/docs"
mkdir docs
cd ./docs

echo "Include Solidity Metrics"
cp ../../solidity-metrics.html ./

echo "Include Coverage Report"
cp -R ../../coverage ./

cd "$SCRIPT_DIR"
read -r -p "Would you like to push changes to Github >> '$COMMIT_MSG'? [Y/n] " _response

if [ "$_response" = "Y" ] || [ "$_response" = "y" ] || [ -z "$_response" ]; then
  echo "Push changes to Github"
  git add . && git commit -a -m"$COMMIT_MSG" && git push origin master
fi

echo "Done."
