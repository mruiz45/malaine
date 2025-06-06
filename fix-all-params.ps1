# Fix all route params for Next.js 15 - comprehensive version
$apiFiles = Get-ChildItem -Path "src/app/api" -Recurse -Filter "route.ts" | Where-Object { $_.FullName -match '\[[^\]]+\]' }
$pageFiles = Get-ChildItem -Path "src/app" -Recurse -Filter "page.tsx" | Where-Object { $_.FullName -match '\[[^\]]+\]' }

$allFiles = $apiFiles + $pageFiles

foreach ($file in $allFiles) {
    Write-Host "Processing $($file.FullName)"
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern 1: { params }: { params: { ... } } -> { params }: { params: Promise<{ ... }> }
    $content = $content -replace '\{ params \}: \{ params: \{([^}]+)\} \}', '{ params }: { params: Promise<{$1}> }'
    
    # Pattern 2: params: { ... } -> params: Promise<{ ... }>
    $content = $content -replace 'params: \{([^}]+)\}(?!\s*>)', 'params: Promise<{$1}>'
    
    # Pattern 3: const { param } = params; -> const { param } = await params;
    $content = $content -replace '(\s+)const \{ ([^}]+) \} = params;', '$1const { $2 } = await params;'
    
    # Pattern 4: const param = params.param; -> const { param } = await params;
    $content = $content -replace '(\s+)const (\w+) = params\.(\w+);', '$1const { $3 } = await params;$1const $2 = $3;'
    
    # Pattern 5: params.param -> (await params).param
    $content = $content -replace '(?<!await\s)params\.(\w+)', '(await params).$1'
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "  Fixed $($file.FullName)"
    } else {
        Write-Host "  No changes needed for $($file.FullName)"
    }
}

Write-Host "Done fixing all route params!" 