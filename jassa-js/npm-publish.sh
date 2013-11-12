targetDir="target/npm-publish/jassa/"

mvn package
mkdir -p "$targetDir"

cp "./target/jassa/webapp/resources/js/jassa.js" "$targetDir"
cp "../README.md" "$targetDir"
cp "src/npm/package.json" "$targetDir"

cd "$targetDir"

npm publish . "$@"


