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

  git fetch $remoteName $branchName --depth=1 2>$null
  git subtree push --prefix next $remoteName $branchName
}
finally {
  Pop-Location
}
