import re

# 1. Update Farm Model
model_file = 'models/Farm.ts'
with open(model_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'isActive' not in content:
    content = content.replace("category: { type: String, default: 'Farmhouse' },", "category: { type: String, default: 'Farmhouse' },\n  isActive: { type: Boolean, default: true },")
    with open(model_file, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Update Admin Properties List Page
prop_list = 'app/admin/properties/page.tsx'
with open(prop_list, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("category?: string;", "category?: string;\n isActive?: boolean;")
content = content.replace("""  <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 text-[12px] font-bold text-[#00a877] flex items-center gap-1.5 shadow-sm">
  <span className="h-1.5 w-1.5 rounded-full bg-[#00a877]"></span>
  Active
  </div>""", """  <div className={`absolute top-4 left-4 bg-white/95 px-3 py-1.5 text-[12px] font-bold flex items-center gap-1.5 shadow-sm ${farm.isActive !== false ? 'text-[#00a877]' : 'text-gray-500'}`}>
  <span className={`h-1.5 w-1.5 rounded-full ${farm.isActive !== false ? 'bg-[#00a877]' : 'bg-gray-500'}`}></span>
  {farm.isActive !== false ? 'Active' : 'Inactive'}
  </div>""")
with open(prop_list, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Update Create Page
create_page = 'app/admin/properties/create/page.tsx'
with open(create_page, 'r', encoding='utf-8') as f:
    content = f.read()

if 'const [isActive, setIsActive]' not in content:
    content = content.replace('const [propertyType, setPropertyType] = useState(\'farmhouse\');', 'const [propertyType, setPropertyType] = useState(\'farmhouse\');\n const [isActive, setIsActive] = useState(true);')
    content = content.replace('category: propertyType,', 'category: propertyType,\n      isActive,')
    
    toggle_html = """
 <div className="space-y-2 md:col-span-2 pt-2">
 <label className="flex items-center gap-2 text-[13px] font-bold text-[#1B2A22] cursor-pointer w-max">
 <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#00a877] rounded" />
 <span>Is Active (Visible to users)</span>
 </label>
 </div>
 """
    content = content.replace('</form>', f'{toggle_html}\n </form>')
    with open(create_page, 'w', encoding='utf-8') as f:
        f.write(content)

# 4. Update Edit Page
edit_page = 'app/admin/properties/[id]/edit/page.tsx'
with open(edit_page, 'r', encoding='utf-8') as f:
    content = f.read()

if 'const [isActive, setIsActive]' not in content:
    content = content.replace('const [propertyType, setPropertyType] = useState(\'farmhouse\');', 'const [propertyType, setPropertyType] = useState(\'farmhouse\');\n const [isActive, setIsActive] = useState(true);')
    content = content.replace('setPropertyType(farm.category || \'farmhouse\');', 'setPropertyType(farm.category || \'farmhouse\');\n        if (farm.isActive !== undefined) setIsActive(farm.isActive);')
    content = content.replace('category: propertyType,', 'category: propertyType,\n      isActive,')
    
    content = content.replace('</form>', f'{toggle_html}\n </form>')
    with open(edit_page, 'w', encoding='utf-8') as f:
        f.write(content)

# 5. Update farms page to filter inactive
farms_page = 'app/farms/page.tsx'
with open(farms_page, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('if (data && data.length > 0) {', 'if (data && data.length > 0) {\n data = data.filter((f: any) => f.isActive !== false);')
with open(farms_page, 'w', encoding='utf-8') as f:
    f.write(content)

# 6. Update home page to filter inactive
home_page = 'app/page.tsx'
try:
    with open(home_page, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'data.filter((f: any) => f.isActive !== false)' not in content:
        content = content.replace('setFarms(data || []);', 'setFarms((data || []).filter((f: any) => f.isActive !== false));')
        with open(home_page, 'w', encoding='utf-8') as f:
            f.write(content)
except Exception as e:
    print(f"Failed to update home page: {e}")

print("Done updating active status logic")
