import os, re

BASE = r"c:\Users\91767\Downloads\rarechocolate"

OLD_PHONE_RAW = "917674931380"
NEW_PHONE_RAW = "918121725892"

OLD_PHONE_FORMATTED = "76749 31380"
NEW_PHONE_FORMATTED = "81217 25892"

OLD_PHONE_PLAIN = "7674931380"
NEW_PHONE_PLAIN = "8121725892"

OLD_EMAIL = "rarecocoa7@gmail.com"
NEW_EMAIL = "contact@rarecocoa.com"

count_files = 0

for root, dirs, files in os.walk(BASE):
    if ".git" in root or ".agents" in root:
        continue
    for fname in files:
        if fname.endswith(('.html', '.js', '.css', '.json', '.xml')):
            fpath = os.path.join(root, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace(OLD_PHONE_RAW, NEW_PHONE_RAW)
            new_content = new_content.replace(OLD_PHONE_FORMATTED, NEW_PHONE_FORMATTED)
            new_content = new_content.replace(OLD_PHONE_PLAIN, NEW_PHONE_PLAIN)
            new_content = new_content.replace(OLD_EMAIL, NEW_EMAIL)
            
            if new_content != content:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count_files += 1
                print(f"Updated contact info in: {fname}")

print(f"Total files updated: {count_files}")
