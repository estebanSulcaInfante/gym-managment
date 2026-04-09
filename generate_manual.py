import re
import base64
import os
import markdown

md_path = r"C:\Users\esteb\.gemini\antigravity\brain\8f1be74c-aed1-49ef-99f4-cc9252ba9fb1\manual_de_usuario.md"

with open(md_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace images with base64
def replace_img(match):
    alt = match.group(1)
    url = match.group(2)
    # clean url
    if url.startswith('/C:/'):
        url = url[1:] # remove first slash
    url = url.replace('/', '\\')
    
    if os.path.exists(url):
        with open(url, 'rb') as imgf:
            b64 = base64.b64encode(imgf.read()).decode('utf-8')
        ext = url.split('.')[-1]
        return f'![{alt}](data:image/{ext};base64,{b64})'
    return match.group(0)

text = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_img, text)

# GitHub-style blockquotes (Alerts)
text = text.replace('> [!TIP]', '>**¡Tip!**')
text = text.replace('> [!WARNING]', '>**¡Atención!**')
text = text.replace('> [!IMPORTANT]', '>**¡Importante!**')

html_content = markdown.markdown(text, extensions=['tables'])

css = """
<style>
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
h1, h2, h3 { color: #111; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-bottom: 16px;}
img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; }
table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
th { background-color: #f6f8fa; font-weight: bold; }
blockquote { border-left: 4px solid #dfe2e5; padding: 0 15px; color: #6a737d; background: #f9f9f9; padding-top: 10px; padding-bottom: 10px; margin-left: 0; }
code { background: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
</style>
"""

final_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>Manual de Usuario - Sport Gym</title>{css}</head><body>{html_content}</body></html>"

out_path = r"C:\Users\esteb\gitprojects\gym-managment\Manual_SportGym.html"
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(final_html)

print("HTML generado en:", out_path)
