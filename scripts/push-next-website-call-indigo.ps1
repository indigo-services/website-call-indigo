$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$remoteName = 'website-call-indigo'
$remoteUrl = 'https://github.com/indigo-services/website-call-indigo.git'
$branchName = 'main'

Push-Location $repoRoot
try {
  $existingRemote = git remote get-url $remoteName 2>$null
  if (-not $existingRemote) {
    git remote add $remoteName $remoteUrl
  }

  $remoteBranch = git ls-remote --heads $remoteName $branchName
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect remote branch '$branchName' on '$remoteName'."
  }

  if ($remoteBranch) {
    git fetch $remoteName $branchName --depth=1
  }

  git subtree push --prefix next $remoteName $branchName
}
finally {
  Pop-Location
}
