from pathlib import Path

path = Path(r'c:\Users\Pc\Documents\PLATEFORME\beeyondtheworld\src\app\contact\_components\contact-experience.tsx')
text = path.read_text(encoding='utf-8')
start = text.index('const STEP_GALLERY:')
end = text.index('\n\nconst HONEY_GRADIENT', start)
text = text[:start] + text[end+2:]
path.write_text(text, encoding='utf-8')
