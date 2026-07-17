import re
files = ['app/admin/properties/create/page.tsx', 'app/admin/properties/[id]/edit/page.tsx']
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    content = re.sub(r' focus:ring-1 focus:ring-\[#00a877\]', '', content)
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print("Done")
