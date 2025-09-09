# Generate 33 commits from 2025-09-10 to 2025-09-27 with irregular spacing

$startDate = Get-Date "2025-09-10"
$endDate = Get-Date "2025-09-27"
$totalDays = ($endDate - $startDate).Days + 1
$totalCommits = 33

# Define commit messages
$commitMessages = @(
    "Initialize project with Next.js",
    "Set up project structure",
    "Add basic pages",
    "Configure Tailwind CSS",
    "Add navbar component",
    "Create hero section",
    "Implement about section",
    "Add pricing section",
    "Configure NextAuth",
    "Set up MongoDB connection",
    "Create user model",
    "Create project model",
    "Implement auth routes",
    "Add dashboard pages",
    "Implement project creation",
    "Add AI integration (Gemini API)",
    "Implement NLP prompt processing",
    "Configure GitHub API integration",
    "Add file generation logic",
    "Implement deployment API",
    "Add Swagger Editor integration",
    "Configure GrapeJS",
    "Add step-by-step wizard",
    "Implement user profile page",
    "Add error handling",
    "Optimize performance",
    "Fix UI bugs",
    "Improve responsive design",
    "Add loading states",
    "Implement dark mode",
    "Update documentation",
    "Add README",
    "Finalize project"
)

# Create initial commit first
Write-Host "Creating initial commit..."
git add .
$date1 = $startDate.ToString("yyyy-MM-ddTHH:mm:ss")
git commit -m "Initial commit" --date="$date1"

# Generate commit schedule
$commitsPerDay = @()
$remainingCommits = $totalCommits - 1  # minus initial commit

# Assign commits to days (irregular)
for ($i = 0; $i -lt $totalDays; $i++) {
    if ($remainingCommits -le 0) { break }
    
    # Random number of commits per day: 0, 3, or 4
    $random = Get-Random -Minimum 0 -Maximum 10
    if ($random -lt 2) {
        $count = 0
    } elseif ($random -lt 7) {
        $count = 3
    } else {
        $count = 4
    }
    
    if ($count -gt $remainingCommits) {
        $count = $remainingCommits
    }
    
    $commitsPerDay += $count
    $remainingCommits -= $count
}

# Distribute any remaining commits
while ($remainingCommits -gt 0) {
    $idx = Get-Random -Minimum 0 -Maximum $commitsPerDay.Count
    $commitsPerDay[$idx]++
    $remainingCommits--
}

# Create commits
$currentMessageIndex = 0
for ($day = 0; $day -lt $commitsPerDay.Count; $day++) {
    $numCommitsToday = $commitsPerDay[$day]
    if ($numCommitsToday -eq 0) { continue }
    
    $currentDate = $startDate.AddDays($day)
    
    for ($c = 0; $c -lt $numCommitsToday; $c++) {
        if ($currentMessageIndex -ge $commitMessages.Count) { break }
        
        # Random time between 9 AM and 10 PM
        $hour = Get-Random -Minimum 9 -Maximum 22
        $minute = Get-Random -Minimum 0 -Maximum 59
        $second = Get-Random -Minimum 0 -Maximum 59
        
        $commitDate = $currentDate.Date.AddHours($hour).AddMinutes($minute).AddSeconds($second)
        $dateString = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")
        
        $message = $commitMessages[$currentMessageIndex]
        
        # Modify a file slightly to create a change
        $tempFile = Join-Path $PSScriptRoot "temp.txt"
        "$(Get-Date) - $message" | Out-File -Append -FilePath $tempFile
        
        git add $tempFile
        git commit -m "$message" --date="$dateString"
        
        Write-Host "Committed: $message on $dateString"
        
        $currentMessageIndex++
    }
}

# Clean up temp file
Remove-Item -Path (Join-Path $PSScriptRoot "temp.txt") -Force -ErrorAction SilentlyContinue

Write-Host "`nDone! Created $($currentMessageIndex + 1) commits."
