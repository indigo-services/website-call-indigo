param(
  [ValidateSet("plan", "audit", "import-test")]
  [string]$Workflow = "plan",
  [switch]$Parallel,
  [string]$Model = "",
  [string]$CodexPath = "codex",
  [string]$TargetRepo = "c:\Users\jaden.black\dev\clients\indigo\repos\indigo-workbench\app-indigo-studio",
  [string]$SourceRepo = "c:\Users\jaden.black\dev\clients\indigo\repos\indigo-workbench\var1-home-landing"
)

$ErrorActionPreference = "Stop"

function Assert-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

function New-RunDirectory {
  param([string]$BasePath)
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $runDir = Join-Path $BasePath $stamp
  New-Item -ItemType Directory -Force -Path $runDir | Out-Null
  return $runDir
}

function Get-WorkflowTasks {
  param(
    [string]$WorkflowName,
    [string]$TargetPath,
    [string]$SourcePath
  )

  $commonContext = @"
Working repo: $TargetPath
Source repo: $SourcePath

Primary docs:
- docs/home-landing-migration/README.md
- docs/home-landing-migration/01-source-audit.md
- docs/home-landing-migration/02-prd-requirements.md
- docs/home-landing-migration/03-technical-spec.md
- docs/home-landing-migration/04-visual-test-and-extraction-plan.md
- docs/home-landing-migration/05-implementation-plan.md

Constraints:
- Prefer local file inspection over web usage.
- Keep changes narrow and evidence-driven.
- Do not touch unrelated files.
- If editing files, use repo-native conventions and leave a concise summary.
"@

  switch ($WorkflowName) {
    "plan" {
      return @(
        @{
          Name = "planner"
          Prompt = @"
$commonContext

Task:
Review the migration packet and produce a concise execution brief for the next implementation slice.

Requirements:
- Focus on the smallest useful slice for first approval.
- Name exact files likely to change in the target repo.
- Call out top 3 risks.
- Write the final answer as markdown with sections:
  - Scope
  - Files
  - Risks
  - Verification
"@
        },
        @{
          Name = "schema-mapper"
          Prompt = @"
$commonContext

Task:
Review the source landing page and current Strapi schema, then propose the minimum schema delta needed for the first migration wave.

Requirements:
- Prefer extending existing dynamic-zone contracts where reasonable.
- Identify which source sections can already map to current Strapi components and which need new components.
- Output a markdown table with:
  - Source section
  - Current fit
  - Proposed target component
  - Needed schema action
"@
        },
        @{
          Name = "asset-auditor"
          Prompt = @"
$commonContext

Task:
Audit the source landing page for migration-critical external dependencies.

Requirements:
- Inventory remote images, fonts, placeholder business data, and prototype-only values.
- State what must be archived locally before production use.
- Output sections:
  - Remote assets
  - Placeholder content
  - Required replacements
  - Recommended archive manifest
"@
        }
      )
    }
    "audit" {
      return @(
        @{
          Name = "source-auditor"
          Prompt = @"
$commonContext

Task:
Inspect the source repo and verify the docs packet is accurate. Update docs/home-landing-migration/01-source-audit.md if important gaps or inaccuracies are found.

Requirements:
- Verify section order, primitive usage, and runtime dependencies.
- Verify current source package.json and env.example.
- If you edit the audit doc, keep the changes narrow.
"@
        },
        @{
          Name = "visual-auditor"
          Prompt = @"
$commonContext

Task:
Inspect docs/home-landing-migration/04-visual-test-and-extraction-plan.md and strengthen it if any validation checkpoints are missing.

Requirements:
- Keep the document concise.
- Add only workflow-critical checks.
- Do not modify unrelated docs.
"@
        }
      )
    }
    "import-test" {
      return @(
        @{
          Name = "import-planner"
          Prompt = @"
$commonContext

Task:
Plan the exact first code slice to import Navbar, Hero, and Footer from the source landing page into the target repo for approval.

Requirements:
- Identify exact target files to create or modify.
- Preserve source visuals as closely as possible.
- Keep scope limited to the first approval slice.
- Output:
  - file plan
  - implementation order
  - validation steps
"@
        },
        @{
          Name = "react-reviewer"
          Prompt = @"
$commonContext

Task:
Review the source Navbar, Hero, and Footer components through a React/Next migration lens.

Requirements:
- Focus on portability to Next 16 + Turbopack.
- Call out client-only risks, asset risks, and primitive mismatches.
- Output a short migration review with prioritized findings.
"@
        }
      )
    }
    default {
      throw "Unsupported workflow: $WorkflowName"
    }
  }
}

function Invoke-CodexTask {
  param(
    [string]$Exe,
    [hashtable]$Task,
    [string]$RunDir,
    [string]$WorkingDir,
    [string]$SourcePath,
    [string]$SelectedModel
  )

  $name = $Task.Name
  $promptPath = Join-Path $RunDir "$name.prompt.md"
  $outputPath = Join-Path $RunDir "$name.output.md"
  $jsonPath = Join-Path $RunDir "$name.events.jsonl"

  Set-Content -LiteralPath $promptPath -Value $Task.Prompt -Encoding UTF8

  $args = @(
    "exec"
    "--cd", $WorkingDir
    "--add-dir", $SourcePath
    "--sandbox", "workspace-write"
    "--skip-git-repo-check"
    "--json"
    "--output-last-message", $outputPath
  )

  if ($SelectedModel) {
    $args += @("--model", $SelectedModel)
  }

  $args += "-"

  Write-Host "Running task: $name"
  Get-Content -LiteralPath $promptPath -Raw |
    & $Exe @args 2>&1 |
    Tee-Object -FilePath $jsonPath | Out-Null

  return [pscustomobject]@{
    Name = $name
    Prompt = $promptPath
    Output = $outputPath
    Events = $jsonPath
  }
}

Assert-Command $CodexPath

if (-not (Test-Path -LiteralPath $TargetRepo)) {
  throw "Target repo not found: $TargetRepo"
}

if (-not (Test-Path -LiteralPath $SourceRepo)) {
  throw "Source repo not found: $SourceRepo"
}

$runsBase = Join-Path $TargetRepo "docs\home-landing-migration\runs"
$runDir = New-RunDirectory -BasePath $runsBase
$tasks = Get-WorkflowTasks -WorkflowName $Workflow -TargetPath $TargetRepo -SourcePath $SourceRepo

$results = @()

if ($Parallel) {
  $jobs = @()
  foreach ($task in $tasks) {
    $job = Start-Job -ScriptBlock {
      param($Exe, $TaskDef, $OutputDir, $WorkDir, $SrcDir, $SelectedModel)
      $ErrorActionPreference = "Stop"
      $promptPath = Join-Path $OutputDir "$($TaskDef.Name).prompt.md"
      $outputPath = Join-Path $OutputDir "$($TaskDef.Name).output.md"
      $jsonPath = Join-Path $OutputDir "$($TaskDef.Name).events.jsonl"
      Set-Content -LiteralPath $promptPath -Value $TaskDef.Prompt -Encoding UTF8
      $args = @(
        "exec"
        "--cd", $WorkDir
        "--add-dir", $SrcDir
        "--sandbox", "workspace-write"
        "--skip-git-repo-check"
        "--json"
        "--output-last-message", $outputPath
      )
      if ($SelectedModel) {
        $args += @("--model", $SelectedModel)
      }
      $args += "-"
      Get-Content -LiteralPath $promptPath -Raw |
        & $Exe @args 2>&1 |
        Tee-Object -FilePath $jsonPath | Out-Null
      [pscustomobject]@{
        Name = $TaskDef.Name
        Prompt = $promptPath
        Output = $outputPath
        Events = $jsonPath
      }
    } -ArgumentList $CodexPath, $task, $runDir, $TargetRepo, $SourceRepo, $Model
    $jobs += $job
  }
  $results = $jobs | Receive-Job -Wait -AutoRemoveJob
} else {
  foreach ($task in $tasks) {
    $results += Invoke-CodexTask -Exe $CodexPath -Task $task -RunDir $runDir -WorkingDir $TargetRepo -SourcePath $SourceRepo -SelectedModel $Model
  }
}

$summaryPath = Join-Path $runDir "SUMMARY.md"
$summary = @(
  "# Home Landing Subagent Run"
  ""
  "- Workflow: $Workflow"
  "- Timestamp: $(Get-Date -Format s)"
  "- Target repo: $TargetRepo"
  "- Source repo: $SourceRepo"
  "- Parallel: $Parallel"
  ""
  "## Outputs"
)

foreach ($result in $results) {
  $summary += "- $($result.Name): $($result.Output)"
}

Set-Content -LiteralPath $summaryPath -Value ($summary -join [Environment]::NewLine) -Encoding UTF8

Write-Host ""
Write-Host "Run complete."
Write-Host "Summary: $summaryPath"
foreach ($result in $results) {
  Write-Host "$($result.Name): $($result.Output)"
}
