#!/usr/bin/env pwsh
# Deploy built app to GitHub Pages (gh-pages branch)
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$env:GIT_AUTHOR_NAME = "m11nic89co"
$env:GIT_COMMITTER_NAME = "m11nic89co"
$env:GIT_AUTHOR_EMAIL = "58000724+m11nic89co@users.noreply.github.com"
$env:GIT_COMMITTER_EMAIL = "58000724+m11nic89co@users.noreply.github.com"

npm run build

$PagesDir = Join-Path $Root "_pages"
if (Test-Path $PagesDir) { Remove-Item -Recurse -Force $PagesDir }
New-Item -ItemType Directory -Path $PagesDir | Out-Null
Copy-Item -Path (Join-Path $Root "dist\*") -Destination $PagesDir -Recurse -Force

Set-Location $PagesDir
if (-not (Test-Path .git)) {
  git init -b gh-pages
  git remote add origin https://github.com/m11nic89co/mindstorm.git
}

git add -A
git commit -m "Deploy GitHub Pages" --allow-empty
if ($LASTEXITCODE -ne 0) {
  git commit -m "Deploy GitHub Pages"
}
git push -f origin gh-pages

Write-Host "Deployed MindStorm: https://m11nic89co.github.io/mindstorm/"
