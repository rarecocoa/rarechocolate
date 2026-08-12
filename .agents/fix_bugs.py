import re, os

BASE = r"c:\Users\91767\Downloads\rarechocolate"

# Fix #story and #compare to index.html#story in footer Explore columns
COLLECTION_PAGES = [
    "tablets.html",
    "snacks.html",
    "spreads.html",
    "hot-chocolate-ice-cream.html",
    "make-your-own.html",
]

for fname in COLLECTION_PAGES:
    path = os.path.join(BASE, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Only replace href="#story" and href="#compare" inside the footer
    # We do it globally since these anchors don't exist on collection pages anyway
    new_content = content.replace('href="#story"', 'href="index.html#story"')
    new_content = new_content.replace('href="#compare"', 'href="index.html#compare"')
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed anchor links in: {fname}")
    else:
        print(f"No change needed in: {fname}")


# Fix cart.js version on policy pages (remove v=6, use no version like other pages)
POLICY_PAGES = [
    "privacy-policy.html",
    "terms.html",
    "refund-policy.html",
    "shipping-policy.html",
]

for fname in POLICY_PAGES:
    path = os.path.join(BASE, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace('cart.js?v=6', 'cart.js')
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed cart.js version in: {fname}")
    else:
        print(f"No cart.js change needed in: {fname}")

print("Done.")
