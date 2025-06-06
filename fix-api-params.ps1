# Fix API route params for Next.js 15
$files = @(
    "src/app/api/ease-preferences/[id]/route.ts",
    "src/app/api/gauge-profiles/[id]/route.ts",
    "src/app/api/measurement-guides/[measurementKey]/route.ts",
    "src/app/api/measurement-sets/[id]/route.ts",
    "src/app/api/pattern-definition-sessions/[id]/route.ts",
    "src/app/api/pattern-definition-sessions/[id]/color-scheme/route.ts",
    "src/app/api/pattern-definition-sessions/[id]/colorwork-assignments/[stitchPatternId]/route.ts",
    "src/app/api/pattern-definition-sessions/[id]/components/[componentId]/route.ts",
    "src/app/api/pattern-definition-sessions/[id]/outline/route.ts",
    "src/app/api/patterns/[patternId]/schematics/route.ts",
    "src/app/api/showcase/patterns/[id]/route.ts",
    "src/app/api/sizes/charts/[chartId]/sizes/route.ts",
    "src/app/api/sizes/[sizeId]/measurements/route.ts",
    "src/app/api/stitch-patterns/[id]/route.ts",
    "src/app/api/yarn-profiles/[id]/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file"
        $content = Get-Content $file -Raw
        
        # Pattern 1: { params }: { params: { id: string } }
        $content = $content -replace '\{ params \}: \{ params: \{ ([^}]+) \} \}', '{ params }: { params: Promise<{ $1 }> }'
        
        # Pattern 2: const { param } = params;
        $content = $content -replace '(\s+)const \{ ([^}]+) \} = params;', '$1const { $2 } = await params;'
        
        Set-Content $file $content -NoNewline
    }
}

Write-Host "Done fixing API route params!" 