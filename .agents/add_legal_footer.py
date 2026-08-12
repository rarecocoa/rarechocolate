import re, os

files = [
    "index.html",
    "tablets.html",
    "snacks.html",
    "spreads.html",
    "hot-chocolate-ice-cream.html",
    "make-your-own.html",
    "manufacturing.html",
]

base = r"c:\Users\91767\Downloads\rarechocolate"

LEGAL_COL = '''          <div class="footer-col">
            <h4>Legal</h4>
            <a href="privacy-policy.html">Privacy Policy</a>
            <a href="terms.html">Terms &amp; Conditions</a>
            <a href="refund-policy.html">Refund Policy</a>
            <a href="shipping-policy.html">Shipping Policy</a>
          </div>'''

for f in files:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        print(f"Not found: {f}")
        continue
    with open(path, 'r', encoding='utf-8') as fh:
        content = fh.read()
    # Already has legal? skip
    if 'privacy-policy.html' in content:
        print(f"Already has legal links: {f}")
        continue
    # Find footer-col containing "Explore" and insert Legal after it
    # Pattern: find the closing </div> of footer-col that has "Explore"
    pattern = r'(          <div class="footer-col">\s*<h4>Explore</h4>.*?</div>)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        new_content = content[:match.end()] + "\n" + LEGAL_COL + content[match.end():]
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        print(f"Added legal column to: {f}")
    else:
        print(f"Could not find Explore column in: {f}")
