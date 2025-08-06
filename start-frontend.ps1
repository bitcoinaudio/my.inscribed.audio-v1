# Bitcoin Royalty Frontend - Network Startup Script (Windows)

param(
    [Parameter(Position=0)]
    [ValidateSet("mainnet", "testnet4", "testnet", "regtest", "signet")]
    [string]$Network = "testnet4"
)

Write-Host "🚀 Starting Bitcoin Royalty Frontend on $Network..." -ForegroundColor Green

# Show network configuration
Write-Host ""
Write-Host "🌐 Frontend Configuration:" -ForegroundColor Cyan
Write-Host "   Network: $Network" -ForegroundColor White
Write-Host "   Mode: Development" -ForegroundColor White
Write-Host "   API: http://localhost:3000" -ForegroundColor White
Write-Host ""

# Warning for mainnet
if ($Network -eq "mainnet") {
    Write-Host "🚨 WARNING: Starting on MAINNET mode!" -ForegroundColor Red
    Write-Host "🚨 Connected to real Bitcoin network!" -ForegroundColor Red
    Write-Host ""
    $confirmation = Read-Host "Are you sure you want to continue? (y/N)"
    if ($confirmation -notmatch '^[Yy]$') {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 1
    }
}

# Start the frontend
Write-Host "🔄 Starting React frontend..." -ForegroundColor Green
switch ($Network) {
    "mainnet" { npm run dev:mainnet }
    "testnet4" { npm run dev:testnet4 }
    "testnet" { npm run dev:testnet }
    "regtest" { npm run dev:regtest }
    "signet" { npm run dev:testnet4 }  # Use testnet4 for signet
}
