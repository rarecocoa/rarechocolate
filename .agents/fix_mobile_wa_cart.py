import os, re

BASE = r"c:\Users\91767\Downloads\rarechocolate"

# 1. Fix cart.js
cart_path = os.path.join(BASE, "cart.js")
with open(cart_path, 'r', encoding='utf-8') as f:
    cart_code = f.read()

# Remove complimentary shipping note line
cart_code = re.sub(r'\s*<p class="cart-shipping-note">.*?</p>', '', cart_code)

# Ensure floating WA button has high z-index and mobile-friendly positioning
old_wa_style = "position:fixed;bottom:24px;left:24px;z-index:9998;width:52px;height:52px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.4);transition:transform 0.3s,box-shadow 0.3s;text-decoration:none;"
new_wa_style = "position:fixed;bottom:20px;left:20px;z-index:99999;width:54px;height:54px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:transform 0.3s;text-decoration:none;-webkit-tap-highlight-color:transparent;"

cart_code = cart_code.replace(old_wa_style, new_wa_style)

with open(cart_path, 'w', encoding='utf-8') as f:
    f.write(cart_code)

print("Updated cart.js (removed shipping note, updated mobile WA floating button)")

# 2. Bump cart.js cache buster to v=26 across all HTML files
html_files = [f for f in os.listdir(BASE) if f.endswith('.html')]

for fname in html_files:
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace any cart.js or cart.js?v=X with cart.js?v=26
    new_html = re.sub(r'cart\.js(?:\?v=\d+)?', 'cart.js?v=26', html)
    
    if new_html != html:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Bumped cart.js cache buster in: {fname}")

print("All tasks completed.")
