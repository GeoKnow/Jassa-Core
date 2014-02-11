#!/bin/bash
set -e

mvn clean install

targetGitEndpoint='git@github.com:GeoKnow/Jassa-Bower.git'
targetFolder='target/release/repo'

sourceFolder='target/jassa/webapp/resources/js'

version=`xpath -q -e '/project/parent/version/text()' pom.xml`
tag="v$version"


git clone "$targetGitEndpoint" "$targetFolder" || true
( cd "$targetFolder" && git pull )


cp bower.json "$targetFolder"


for source in `cd "$sourceFolder" && ls -1`; do
    target=`echo "$source" | sed -r 's|-[0-9.]+(-SNAPSHOT)?||g'`
 
    cp -v "$sourceFolder/$source" "$targetFolder/$target"
    ( cd "$targetFolder" && git add "$target" ) || true
done



cd "$targetFolder"
git add -A
git commit -m "Updating version $version with tag $tag" --allow-empty
git push
# Delete tag if already present
git tag -d "$tag" || true
git push origin ":refs/tags/$tag" || true
git tag "$tag"
git push --tags

