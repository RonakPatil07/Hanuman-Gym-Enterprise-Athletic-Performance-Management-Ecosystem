import os
import re

base_dir = r"c:\xampp\htdocs\PS-miniproject"
files = [
    r"login_register\index.html",
    r"login_register\dashboard.html",
    r"admin\index.html"
]

forbidden_patterns = [
    r"<\?php",
    r"<\?=",
    r"\$_SESSION",
    r"session_start",
    r"session_destroy",
    r"PHPSESSID",
    r"mysqli",
    r"PDO",
    r"mysql_",
    r"\.php[\"\'\?]"
]

all_clean = True
for f in files:
    path = os.path.join(base_dir, f)
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()
    
    print(f"Checking {f} (size: {len(content)} bytes)...")
    for pat in forbidden_patterns:
        matches = list(re.finditer(pat, content, re.IGNORECASE))
        if matches:
            all_clean = False
            for m in matches:
                print(f"  [FOUND FORBIDDEN PATTERN]: '{pat}' at line: {content[:m.start()].count(chr(10))+1}")

if all_clean:
    print("SUCCESS: ALL 3 NEW HTML FILES ARE 100% CLEAN OF PHP/SESSION/MYSQL PATTERNS!")
else:
    print("WARNING: Forbidden patterns detected!")
