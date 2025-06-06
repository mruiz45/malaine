# Fix page route params for Next.js 15
$files = @(
    "src/app/pattern-viewer/[sessionId]/page.tsx",
    "src/app/showcase/[id]/page.tsx",
    "src/app/stitch-patterns/[id]/page.tsx",
    "src/app/yarn-profiles/[id]/page.tsx",
    "src/app/yarn-profiles/[id]/edit/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file"
        $content = Get-Content $file -Raw
        
        # Pattern 1: params: { id: string } or similar
        $content = $content -replace 'params: \{([^}]+)\}', 'params: Promise<{$1}>'
        
        # Pattern 2: const { param } = params;
        $content = $content -replace '(\s+)const \{ ([^}]+) \} = params;', '$1const { $2 } = await params;'
        
        # Pattern 3: params.id or similar direct access
        $content = $content -replace 'params\.([a-zA-Z_][a-zA-Z0-9_]*)', '(await params).$1'
        
        Set-Content $file $content -NoNewline
    }
}

Write-Host "Done fixing page route params!" 