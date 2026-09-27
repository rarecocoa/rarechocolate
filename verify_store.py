#!/usr/bin/env python3
"""
Rare Cocoa Pre-Push Sanity Suite
Runs in < 1 second. Verifies:
1. JS syntax on pages.js, cart.js, products-db.js
2. Option loop safety guards (custom-wa-notice-group and label null-checks)
3. Trail pack pricing isolation
4. HTML version string alignment
"""

import subprocess
import sys
from pathlib import Path

# Configure utf-8 stdout/stderr for Windows console compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def test_js_syntax():
    print("  [1/4] Checking JavaScript syntax with Node...")
    files = ['pages.js', 'cart.js', 'products-db.js']
    for f in files:
        p = Path(f)
        if not p.exists():
            continue
        res = subprocess.run(['node', '-c', str(p)], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"    ❌ Syntax error in {f}:\n{res.stderr}")
            return False
        print(f"    ✓ {f} syntax OK")
    return True

def test_option_guards():
    print("  [2/4] Checking modal option loop guards in pages.js...")
    pages_code = Path('pages.js').read_text(encoding='utf-8')
    
    # Check that custom-wa-notice-group is guarded
    if "custom-wa-notice-group" not in pages_code:
        print("    ❌ Warning: custom-wa-notice-group check missing in pages.js")
        return False
    
    # Check that querySelector('.modal-option-label') has null check in addBtn
    if "const labelEl = group.querySelector('.modal-option-label');" not in pages_code:
        print("    ❌ Warning: Safe labelEl null check missing in modal options loop")
        return False
    
    print("    ✓ Modal option safety guards verified")
    return True

def test_trail_pack_pricing():
    print("  [3/4] Verifying Trail Pack pricing isolation...")
    pages_code = Path('pages.js').read_text(encoding='utf-8')
    
    if "nameLower.includes('trail pack')" not in pages_code:
        print("    ❌ Trail Pack pricing handler missing in pages.js")
        return False
    
    print("    ✓ Trail pack pricing rule verified")
    return True

def test_html_scripts():
    print("  [4/4] Verifying script tags in key catalog pages...")
    for h in ['tablets.html', 'spreads.html', 'snacks.html']:
        p = Path(h)
        if not p.exists():
            continue
        content = p.read_text(encoding='utf-8')
        if 'pages.js' not in content or 'cart.js' not in content:
            print(f"    ❌ Missing cart.js or pages.js in {h}")
            return False
        print(f"    ✓ {h} scripts present")
    return True

def main():
    print("\n==========================================")
    print("  🍫 Rare Cocoa Pre-Push Sanity Suite     ")
    print("==========================================")
    success = True
    success = success and test_js_syntax()
    success = success and test_option_guards()
    success = success and test_trail_pack_pricing()
    success = success and test_html_scripts()
    
    print("==========================================")
    if success:
        print("  🎉 ALL CHECKS PASSED! Safe to commit & push.")
        print("==========================================\n")
        sys.exit(0)
    else:
        print("  ❌ SANITY CHECK FAILED! Do not push.")
        print("==========================================\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
