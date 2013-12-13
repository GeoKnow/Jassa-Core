targetDir="target/bower-publish/jassa/"

mvn package
mkdir -p "$targetDir"

cp "./target/jassa/webapp/resources/js/jassa.js" "$targetDir"
cp "../README.md" "$targetDir"
cp "src/bower/bower.json" "$targetDir"

cd "$targetDir"

npm publish . "$@"

