import re

files_to_clean = [
    r"c:\Users\91767\Downloads\rarechocolate\snacks.html",
    r"c:\Users\91767\Downloads\rarechocolate\make-your-own.html",
    r"c:\Users\91767\Downloads\rarechocolate\spreads.html",
    r"c:\Users\91767\Downloads\rarechocolate\chocolate-slab.html"
]

for filepath in files_to_clean:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace (+₹1/g) and (+₹2/g) and similar variations
        new_content = content
        new_content = new_content.replace('Coconut Sugar (+₹1/g)', 'Coconut Sugar')
        new_content = new_content.replace('Monk Fruit (+₹2/g)', 'Monk Fruit')
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned: {filepath}")
        else:
            print(f"No changes needed: {filepath}")
    except Exception as e:
        print(f"Error cleaning {filepath}: {e}")
