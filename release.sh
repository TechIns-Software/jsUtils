# 
# Copyright 2024 Cypriot Free Software Foundation
#
# Permission is hereby granted, free of charge, 
# to any person obtaining a copy of this software and associated documentation files (the “Software”), 
# to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, 
# sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
# subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#

#!/bin/bash


current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

echo -e "You are at branch \033[0;32m$current_branch\033[0m"

if [ $current_branch != "dev" ]; then
  echo "Ommiting version bump because current branch is ${current_branch}"
  echo "Please commit current changes, once done run"
  echo -e "    \033[0;32git checkout dev\033[0m"
  exit 1
fi


echo "Pulling any changes from remote"

git pull origin dev

if [ "$?" != "0" ]; then
  echo "Unable to continue due ti unsucessfull pull"
  exit $?
fi

current_version=$(npm run version -s)

echo "Current version: $current_version"

echo "Keep package-lock.json up to spec"
npm install
npm run generate-exports

git commit -m "[Auto script] Fix exported files upon package.json" package.json package-lock.json

patch_version=$(npx semver $current_version -i patch)
minor_version=$(npx semver $current_version -i minor)
major_version=$(npx semver $current_version -i major)

version_num=""

# Choose the version bump type
PS3="Select the version bump type: "
select bump_type in "patch - Bump into ${patch_version}" "minor - Bump into ${minor_version}" "major - Bump into ${major_version}" "none - Keep Same"; do

  case $bump_type in
    "patch"*)
      # Increment version based on the chosen bump type
      new_version="patch"
      version_num=$patch_version
      break
      ;;
    "minor"*)
        new_version="minor"
        version_num=$minor_version
        break
        ;;
    "major"*)
        new_version="major"
        version_num=$major_version
        break
        ;;
    "none"*)
      echo "No version selected, skipping bump."
      exit 0
      ;;
    *)
      echo "Invalid selection, please choose a valid option."
      ;;
  esac
done <&2


echo "Bumping version to $new_version"

# Update package.json with the new version
new_version=$(npm version ${new_version} --no-git-tag-version --no-commit-hooks --force --silent)

echo "Version bumped to $new_version"

echo "Keep package-lock.json up to spec"
npm install
npm run generate-exports
npm install

git commit -m "[Auto script] AutoBump Version to ${new_version}" package.json package-lock.json

echo "Update Changelog"

echo "# v${new_version}" | cat - CHANGELOG.md > temp && mv temp CHANGELOG.md

echo "Opening editor to edit file"
editor="$VISUAL"
[ -z "$editor" ] && editor="$EDITOR"
[ -z "$editor" ] && which editor >/dev/null && editor=editor
[ -z "$editor" ] && which nano   >/dev/null && editor=nano
[ -z "$editor" ] && which vim     >/dev/null && editor=vim
[ -z "$editor" ] && which vi     >/dev/null && editor=vi
[ -z "$editor" ] && editor=no_editor_found

if [ "$editor" == 'no_editor_found' ]; then
  echo "No editor has been found"
fi

$editor CHANGELOG.md

git add CHANGELOG.md
git commit -m "[Auto script] Updated Changelog"
