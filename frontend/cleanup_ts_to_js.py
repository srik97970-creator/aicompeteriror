import re
from pathlib import Path

root = Path('src')
jsfiles = [p for p in root.rglob('*') if p.suffix in {'.js', '.jsx'}]

removals = [
    re.compile(r'import\s+\{[^}]*\}\s+from\s+["\']\.\.?/types["\'];?\n'),
    re.compile(r'export\s+type\s+[^\n]+\n'),
    re.compile(r'export\s+interface\s+[^\n]+\{(?:[^\n]*\n)*?\n\}'),
    re.compile(r'type\s+[A-Za-z0-9_]+\s*=\s*[^\n]+\n'),
    re.compile(r'interface\s+[A-Za-z0-9_]+\s*\{(?:[^\n]*\n)*?\n\}'),
]

def remove_type_annotations(text):
    # remove type annotations from params and variables
    # patterns: x: T, x?: T, x: T =, (x: T), const x: T, let x: T, var x: T
    # also handle return type annotations
    # remove `as T` casts
    text = re.sub(r'\s*:\s*(?:React\.[A-Za-z0-9_]+|ReactNode|JSX\.[A-Za-z0-9_]+|[^=,\)\n;]+?)(?=[,\)\n;=])', '', text)
    text = re.sub(r'\s*\?\s*:\s*[^,\)\n;]+', '', text)
    text = re.sub(r'\b(as)\s+[^\s,)]+', '', text)
    return text

for path in jsfiles:
    text = path.read_text(encoding='utf-8')
    orig = text

    # remove type-only declarations
    for pat in removals:
        text = pat.sub('', text)

    # remove specific TS declarations
    text = text.replace('import.meta.env.VITE_API_URL as string', 'import.meta.env.VITE_API_URL')
    text = text.replace('document.getElementById(\'root\')!', "document.getElementById('root')")
    text = re.sub(r'\bRequestInit\b', '', text)
    text = re.sub(r'\bPromise<[^>]+>\b', 'Promise', text)
    text = re.sub(r'const headers\s*:\s*Record<[^>]+>\s*=\s*\{', 'const headers = {', text)
    text = re.sub(r'\(options\.headers as Record<[^>]+>\)', '(options.headers || {})', text)
    text = re.sub(r'private\s+[A-Za-z0-9_]+\s*:\s*[^;]+;', lambda m: m.group(0).split(':')[0].replace('private ', '') + ';', text)
    text = re.sub(r'const \[([^\]]+)\] = useState<[^>]+>\(', r'const [\1] = useState(', text)
    text = re.sub(r'const \[([^\]]+)\] = useRef<[^>]+>\(', r'const [\1] = useRef(', text)
    text = re.sub(r'\buseState<[^>]+>', 'useState', text)
    text = re.sub(r'\buseRef<[^>]+>', 'useRef', text)
    text = re.sub(r'\bcreateContext<[^>]+>', 'createContext', text)
    text = re.sub(r'\buseEffect<[^>]+>', 'useEffect', text)
    text = re.sub(r'\buseMemo<[^>]+>', 'useMemo', text)
    text = re.sub(r'\buseCallback<[^>]+>', 'useCallback', text)
    text = re.sub(r'\bconst\s+[^=]+\s*=\s*useState<[^>]+>\(', lambda m: re.sub(r'<[^>]+>', '', m.group(0)), text)

    text = remove_type_annotations(text)

    # replace SpeechRecognition cast
    text = text.replace('(window as any).SpeechRecognition', 'window.SpeechRecognition')
    text = text.replace('(window as any).webkitSpeechRecognition', 'window.webkitSpeechRecognition')
    text = text.replace('onChange={(e) => setLanguage(e.target.value as any)}', 'onChange={(e) => setLanguage(e.target.value)}')

    # remove leftover multiple spaces from removed annotations
    text = re.sub(r'\s{2,}', ' ', text)
    text = re.sub(r'\(\s+', '(', text)
    text = re.sub(r'\s+\)', ')', text)
    text = re.sub(r'\{\s+\}', '{}', text)
    text = re.sub(r'(\n\s*)+\n', '\n\n', text)

    if text != orig:
        path.write_text(text, encoding='utf-8')

print('cleaned', len(jsfiles), 'files')
