import re
import glob

files = [
    'app/admin/dashboard/page.tsx',
    'app/admin/users/page.tsx',
    'app/admin/reservations/page.tsx',
    'app/admin/financials/page.tsx',
    'app/farms/page.tsx'
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace focus:ring-1 focus:ring-[#00a877]
        content = re.sub(r'\s*focus:ring-1\s+focus:ring-\[#00a877\]', '', content)
        # Also check for non-focus ring if it's applied based on state
        content = re.sub(r'\s*ring-1\s+ring-\[#00a877\]', '', content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
    except Exception as e:
        print(f"Error processing {f}: {e}")

print("Done fixing dropdowns")
