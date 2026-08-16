import re
import os

html_files = [
    "index.html",
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
        
        new_content = content
        
        # Replace styles.css(?v=...) with styles.css?v=46
        new_content = re.sub(r'styles\.css(?:\?v=\d+)?', 'styles.css?v=46', new_content)
        # Replace pages.css(?v=...) with pages.css?v=46
        new_content = re.sub(r'pages\.css(?:\?v=\d+)?', 'pages.css?v=46', new_content)
        # Replace pages.js(?v=...) with pages.js?v=46
        new_content = re.sub(r'pages\.js(?:\?v=\d+)?', 'pages.js?v=46', new_content)
        # Replace products-db.js(?v=...) with products-db.js?v=46
        new_content = re.sub(r'products-db\.js(?:\?v=\d+)?', 'products-db.js?v=46', new_content)
        # Replace script.js(?v=...) with script.js?v=46
        new_content = re.sub(r'script\.js(?:\?v=\d+)?', 'script.js?v=46', new_content)
        # Replace cart.js(?v=...) with cart.js?v=46
        new_content = re.sub(r'cart\.js(?:\?v=\d+)?', 'cart.js?v=46', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Successfully bumped cache buster to v=46 for {filename}")
        else:
            print(f"No changes needed for {filename}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")
