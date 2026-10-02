import glob
import re

target = '''  <!-- Favicon for Google Search & Browsers -->
  <link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
'''

pattern = re.compile(
    r'[ \t]*<!-- Favicon for Google Search & Browsers -->[\s\S]*?(?=(?:[ \t]*<!-- Geographic|[ \t]*<meta name="geo|[ \t]*<link rel="stylesheet|[ \t]*<!-- Structured Data))',
    re.MULTILINE
)

files = glob.glob('*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    new_content, count = pattern.subn(target, content)
    print(f, count)
    with open(f, 'w', encoding='utf-8') as file:
        file.write(new_content)
