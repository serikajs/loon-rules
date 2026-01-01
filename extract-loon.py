#!/usr/bin/env python3
import re
import json
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

# 获取脚本所在目录
script_dir = Path(__file__).parent.resolve()
public_dir = script_dir / "public"
output_path = public_dir / "loon-rules.json"

# 从远程 URL 获取 README.md 文件
readme_url = "https://raw.githubusercontent.com/luestr/ShuntRules/main/README.md"
try:
    with urlopen(readme_url) as response:
        readme = response.read().decode("utf-8")
except (URLError, HTTPError) as e:
    print(f"Error fetching README from {readme_url}: {e}")
    exit(1)

# 正则表达式模式：匹配 | 数字 | [[Loon] 名称](URL)
pattern = r'\|\s*\d+\s*\|\s*\[\[Loon\]\s*([^\]]+)\]\(([^)]+)\)'
seen = set()
items = []

# 查找所有匹配项
for match in re.finditer(pattern, readme):
    name = match.group(1).strip()
    url = match.group(2).strip()
    key = f"{name}|{url}"
    if key in seen:
        continue
    seen.add(key)
    items.append({"name": name, "url": url})

# 写入 JSON 文件
output_path.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

print(f"Extracted {len(items)} Loon entries to {output_path.name}")

