import glob
import os
import re

base_dir = r"c:\Users\91767\Downloads\rarechocolate"
html_files = glob.glob(os.path.join(base_dir, "*.html"))

clean_favicon_block = """  <!-- Google Search & Browser Favicon Configuration -->
  <link rel="icon" type="image/png" sizes="48x48" href="https://rarecocoa.com/favicon-48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="https://rarecocoa.com/favicon-96.png">
  <link rel="icon" type="image/png" sizes="192x192" href="https://rarecocoa.com/favicon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="https://rarecocoa.com/favicon.png">
  <link rel="icon" type="image/x-icon" href="https://rarecocoa.com/favicon.ico">
  <link rel="shortcut icon" href="https://rarecocoa.com/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="https://rarecocoa.com/apple-touch-icon.png">
  <link rel="apple-touch-icon" href="https://rarecocoa.com/favicon.png">
  <link rel="manifest" href="/site.webmanifest">"""

for f in html_files:
    with open(f, "r", encoding="utf-8") as fp:
        c = fp.read()

    # Remove anti-cache headers that block Googlebot-Image & Google favicon proxy caching
    c = re.sub(r'\s*<meta\s+http-equiv=["\']Cache-Control["\'][^>]*>', '', c, flags=re.IGNORECASE)
    c = re.sub(r'\s*<meta\s+http-equiv=["\']Pragma["\'][^>]*>', '', c, flags=re.IGNORECASE)
    c = re.sub(r'\s*<meta\s+http-equiv=["\']Expires["\'][^>]*>', '', c, flags=re.IGNORECASE)

    # Remove all existing icon and manifest link tags cleanly
    c = re.sub(r'\s*<link\s+[^>]*rel=["\'][^"\']*(?:icon|apple-touch-icon|manifest)[^"\']*["\'][^>]*>', '', c, flags=re.IGNORECASE)

    # Insert clean standard favicon block directly before </head>
    c = c.replace('</head>', '\n' + clean_favicon_block + '\n</head>', 1)

    with open(f, "w", encoding="utf-8") as fp:
        fp.write(c)

    print("Updated:", os.path.basename(f))

print("All HTML files updated successfully.")
