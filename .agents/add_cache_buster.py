import re
import os

html_files = [
    "tablets.html",
    "snacks.html",
    "spreads.html",
    "chocolate-slab.html",
    "hot-chocolate-ice-cream.html",
    "make-your-own.html",
    "manufacturing.html"
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
        
        # Replace pages.css and pages.js link and script tags to add ?v=4 cache buster
        new_content = content
        
        # Matches pages.css with or without query param
        new_content = re.sub(r'href=["\']pages\.css(?:\?v=\d+)?["\']', 'href="pages.css?v=22"', new_content)
        # Matches pages.js with or without query param
        new_content = re.sub(r'src=["\']pages\.js(?:\?v=\d+)?["\']', 'src="pages.js?v=22"', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Added cache buster to {filename}")
        else:
            print(f"No match/changes for {filename}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")
