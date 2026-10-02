import glob
import re

gtag_snippet = '''  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1JV7729L9T"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-1JV7729L9T');
  </script>
'''

files = glob.glob('*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'G-1JV7729L9T' in content:
        print(f, 'already has tag')
        continue
    new_content = re.sub(r'(<head>\s*)', r'\1' + gtag_snippet + '\n', content, count=1)
    with open(f, 'w', encoding='utf-8') as file:
        file.write(new_content)
    print(f, 'injected tag')
