# remove-bom.ps1
$files = @(
    "src/App.tsx",
    "src/index.tsx",
    "src/components/upload/FileUploader.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Remove BOM if present (first 3 bytes are EF BB BF for UTF-8 BOM)
        if ($content[0] -eq 0xFEFF) {
            $content = $content.Substring(1)
        }
        # Save as UTF-8 without BOM
        [System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "Fixed BOM in $file"
    }
}