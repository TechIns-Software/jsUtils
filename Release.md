# Releasing Into NPM guidelines

In case you want to make a new release you must first merge any PR into `dev`. Any new feature or fix myst be based upon the latest commin at `dev` branch as well.

## Release a new version

Run:

```
git checkout dev

# Optional fetch any remote reference
git fetch --all

# Merge any feature branch into dev
git merge ^any_feature_branch^

bash ./release.sh
```
The script `./release.sh` will:

1. Bump the version
2. Commit package.json and package.lock
3. Update CHANGELOG.md with the current version and prompt an editor for updating it.
4. Commit any changed upon `CHANGELOG.md`

## Editor

The editor for the nessesery changes upon `CHANGELOG.md` is used with the following preference order:

1. nano
2. vim
2. vi

In case of the latter press `I` to edit the file once done press `ESC` and type `:wq!`.

## Deploy changes upon npm

```
git checkout master
git merge dev
git push origin dev
git push origin master
```

This will result the trigger of a github actions that does the following:

1. Tagging the version
2. Releasing a new version upon npmjs.

# Version tags

The version tag will be retrieved from `package.json` and the `.github/workflows/release-npm.yml` github action will ctreate it alsongside the nessesary npmjs release.