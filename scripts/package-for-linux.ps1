# Build admin UI and pack .next for Linux server (tar.gz — NOT Windows zip)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not $env:NEXT_PUBLIC_API_URL) {
    $env:NEXT_PUBLIC_API_URL = "https://api.proridercourier.com/api/v1"
}
$env:NODE_ENV = "production"

Write-Host "Building Next.js..."
npm run build

if (-not (Test-Path ".next\BUILD_ID")) {
    throw "Build failed — .next\BUILD_ID not found"
}

# Cache is Windows-specific; do not upload to Linux
if (Test-Path ".next\cache") {
    Write-Host "Removing .next\cache (platform-specific)..."
    Remove-Item -Recurse -Force ".next\cache"
}

$archive = Join-Path $root "next-build.tar.gz"
if (Test-Path $archive) { Remove-Item $archive }

Write-Host "Creating next-build.tar.gz for Linux..."
tar -czf $archive .next

Write-Host "Done: $archive"
Write-Host "Upload to server public_html, then: tar -xzf next-build.tar.gz"
