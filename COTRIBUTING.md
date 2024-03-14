# Hooks and package.json
In order to contribute you *must* first ensure that hooks do work. If pushing into a branch you must define exports at `package.json`.
In order to do that you must use husky where `pre-push` hook does that. Hooks must runh when pushing code into this reporitory. 


# Pushing into master
Pushing into master means that code is in working state and library is ready to be used. A pre-push hook must run and user may select for a new version to be published. Upon a new version that results that package.json will be modified with new exports and, if user opted to, a new version.