import os, glob

favicon_tags = (
    '  <link rel="icon" type="image/png" sizes="512x512" href="favicon.png">\n'
    '  <link rel="icon" type="image/x-icon" href="favicon.ico">\n'
    '  <link rel="apple-touch-icon" href="favicon.png">\n'
)

html_files = glob.glob(r'C:\Users\91767\Downloads\rarechocolate\*.html')
updated = []
for f in html_files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'favicon' not in content:
        content = content.replace('</head>', favicon_tags + '</head>', 1)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        updated.append(os.path.basename(f))

print('Updated:', updated)
print('Already had favicon:', [os.path.basename(f) for f in html_files if f not in updated])
