import re, os

BASE = r"c:\Users\91767\Downloads\rarechocolate"

# 1. Update cart.js to add floating WhatsApp button
cart_js_path = os.path.join(BASE, "cart.js")
with open(cart_js_path, 'r', encoding='utf-8') as f:
    cart_js = f.read()

wa_injection_code = '''
    // 3. Inject Floating WhatsApp Button
    if (!document.getElementById('floatingWhatsappBtn')) {
      const waBtn = document.createElement('a');
      waBtn.id = 'floatingWhatsappBtn';
      waBtn.href = 'https://wa.me/918121725892';
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
      waBtn.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9998;width:52px;height:52px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.4);transition:transform 0.3s,box-shadow 0.3s;text-decoration:none;';
      waBtn.onmouseover = function(){ this.style.transform = 'scale(1.12)'; };
      waBtn.onmouseout = function(){ this.style.transform = 'scale(1)'; };
      waBtn.innerHTML = '<svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>';
      document.body.appendChild(waBtn);
    }
'''

if 'floatingWhatsappBtn' not in cart_js:
    # Insert right after injectCartMarkup() {
    target = "injectCartMarkup() {"
    new_cart_js = cart_js.replace(target, target + wa_injection_code)
    with open(cart_js_path, 'w', encoding='utf-8') as f:
        f.write(new_cart_js)
    print("Injected floating WhatsApp button into cart.js")


# 2. Add email to footer brand section across all HTML files
EMAIL_HTML = '<p class="footer-email" style="margin-top:8px;font-size:0.85rem;"><a href="mailto:contact@rarecocoa.com" style="color:rgba(255,255,255,0.7);text-decoration:none;transition:color 0.3s;" onmouseover="this.style.color=\'#D4AF37\'" onmouseout="this.style.color=\'rgba(255,255,255,0.7)\'">contact@rarecocoa.com</a></p>'

html_files = [f for f in os.listdir(BASE) if f.endswith('.html')]

for fname in html_files:
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'contact@rarecocoa.com' not in content or '<footer' in content:
        # Check if email is already in footer
        if 'class="footer-brand"' in content and 'contact@rarecocoa.com' not in content[content.find('class="footer-brand"'):content.find('</footer>') if '</footer>' in content else len(content)]:
            # Insert email under footer-tagline inside footer-brand
            tagline_target = '<p class="footer-tagline">Real Chocolate. Real Trust.</p>'
            if tagline_target in content:
                new_content = content.replace(tagline_target, tagline_target + '\n          ' + EMAIL_HTML)
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Added footer email to: {fname}")

print("Done.")
