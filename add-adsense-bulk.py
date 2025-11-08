#!/usr/bin/env python3
"""
Bulk Add AdSense Sidebar to React Pages
Automatically adds AdSense sidebar layout to specified React pages
"""

import re
import sys
from pathlib import Path

# Pages to modify
PAGES_TO_MODIFY = {
    'RiwayatVersiPage': 'resources/js/react/pages/RiwayatVersiPage.jsx',
    'PageListPage': 'resources/js/react/pages/PageListPage.jsx',
    'TafsirMaudhuiPage': 'resources/js/react/pages/TafsirMaudhuiPage.jsx',
    'ArticlesPage': 'resources/js/react/pages/ArticlesPage.jsx',
    'ArticleDetailPage': 'resources/js/react/pages/ArticleDetailPage.jsx',
    'DonationSupportPage': 'resources/js/react/pages/DonationSupportPage.jsx',
    'MemberBenefitsPage': 'resources/js/react/pages/MemberBenefitsPage.jsx',
}

# Sidebar template
SIDEBAR_TEMPLATE = '''
                    </div>

                    {/* Sidebar dengan Iklan */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-4 space-y-6">
                            {/* Iklan Vertikal */}
                            <Card padding="none">
                                <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100">
                                    Iklan
                                </div>
                                <AdSenseVertical
                                    adSlot="9427110099"
                                    className="min-h-[600px]"
                                />
                            </Card>

                            {/* Info Box */}
                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-3">📖 IndoQuran</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>📚 Al-Quran Digital</p>
                                    <p>🎧 Audio Murottal</p>
                                    <p>🔍 Pencarian Ayat</p>
                                    <p>📝 Bookmark & Catatan</p>
                                </div>
                            </Card>
                        </div>
                    </aside>
                </div>'''

def add_import_if_missing(content: str) -> str:
    """Add AdSenseVertical import if not present"""
    if 'import AdSenseVertical' in content:
        print("  ✅ Import already exists")
        return content
    
    # Find last import statement
    import_pattern = r"(import\s+.+?from\s+['\"].+?['\"];?\n)"
    imports = list(re.finditer(import_pattern, content))
    
    if imports:
        last_import = imports[-1]
        insert_pos = last_import.end()
        new_import = "import AdSenseVertical from '../components/AdSenseVertical';\n"
        content = content[:insert_pos] + new_import + content[insert_pos:]
        print("  ✅ Added import")
    else:
        print("  ⚠️  No imports found, adding at top")
        new_import = "import AdSenseVertical from '../components/AdSenseVertical';\n"
        content = new_import + content
    
    return content

def add_sidebar_layout(content: str, page_name: str) -> str:
    """Add sidebar layout with grid wrapper"""
    
    # Check if already has grid layout
    if 'lg:grid-cols-12' in content:
        print(f"  ⚠️  {page_name} already has grid layout")
        return content
    
    # Find PageContent or similar wrapper
    # Pattern 1: Look for <PageContent> ... content ... </PageContent>
    pagecontent_pattern = r'(<PageContent[^>]*>)(.*?)(</PageContent>)'
    match = re.search(pagecontent_pattern, content, re.DOTALL)
    
    if match:
        before_content = match.group(1)
        page_content = match.group(2)
        after_content = match.group(3)
        
        # Wrap existing content in grid
        new_content = f'''{before_content}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {{/* Main Content */}}
                    <div className="lg:col-span-8">
{page_content.strip()}
{SIDEBAR_TEMPLATE}
{after_content}'''
        
        content = content.replace(match.group(0), new_content)
        print(f"  ✅ Added sidebar layout to {page_name}")
        return content
    
    print(f"  ❌ Could not find PageContent wrapper in {page_name}")
    return content

def process_file(filepath: str, page_name: str):
    """Process a single file"""
    path = Path(filepath)
    
    if not path.exists():
        print(f"❌ File not found: {filepath}")
        return False
    
    print(f"\n📝 Processing {page_name}...")
    
    try:
        content = path.read_text(encoding='utf-8')
        
        # Add import
        content = add_import_if_missing(content)
        
        # Add sidebar layout
        content = add_sidebar_layout(content, page_name)
        
        # Write back
        path.write_text(content, encoding='utf-8')
        
        print(f"✅ Successfully modified {page_name}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {page_name}: {str(e)}")
        return False

def main():
    print("=" * 50)
    print("Bulk Adding AdSense Sidebar to Pages")
    print("=" * 50)
    
    success_count = 0
    total_count = len(PAGES_TO_MODIFY)
    
    for page_name, filepath in PAGES_TO_MODIFY.items():
        if process_file(filepath, page_name):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"Completed: {success_count}/{total_count} pages modified")
    print("=" * 50)
    
    if success_count < total_count:
        print("\n⚠️  Some pages need manual integration")
        print("Refer to ADSENSE_INTEGRATION_TEMPLATE.md for guidance")
    else:
        print("\n✅ All pages successfully modified!")
        print("\nNext steps:")
        print("1. Run: npm run build")
        print("2. Test each page in development")
        print("3. Commit and deploy to production")

if __name__ == '__main__':
    main()
