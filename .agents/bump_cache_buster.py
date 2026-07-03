import re
import os

html_files = [
    "tablets.html",
    "snacks.html",
    "spreads.html",
    "chocolate-slab.html",
    "hot-chocolate-ice-cream.html",
    "make-your-own.html"
]

base_dir = r"c:\Users\91767\Downloads\rarechocolate"

for filename in html_files:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace ?v=4 with ?v=5 for cache busting
        new_content = content
        new_content = re.sub(r'href=["\']pages\.css\?v=4["\']', 'href="pages.css?v=5"', new_content)
        new_content = re.sub(r'src=["\']pages\.js\?v=4["\']', 'src="pages.js?v=5"', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated cache buster to v=5 for {filename}")
        else:
            print(f"No changes for {filename}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")
