import glob
import re

clean_block = """
  <!-- Google Search & Browser Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">"""

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    
    # 1. Remove existing favicon comments and link tags
    c = re.sub(r'\s*<!-- Google Search & Browser Favicon.*?-->', '', c, flags=re.IGNORECASE)
    c = re.sub(r'\s*<link\s+[^>]*rel=["\'][^"\']*(?:icon|apple-touch-icon|manifest)[^"\']*["\'][^>]*>', '', c, flags=re.IGNORECASE)
    
    # 2. Insert clean block right below canonical tag (or title if canonical not found)
    m = re.search(r'(<link\s+rel=["\']canonical["\'][^>]*>)', c, flags=re.IGNORECASE)
    if m:
        c = c[:m.end()] + clean_block + c[m.end():]
    else:
        tm = re.search(r'(</title>)', c, flags=re.IGNORECASE)
        if tm:
            c = c[:tm.end()] + clean_block + c[tm.end():]
            
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(c)
    print("Updated:", f)

print("All HTML files processed.")
