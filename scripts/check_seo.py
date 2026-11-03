#!/usr/bin/env python3
"""Offline checks for the site's most important crawl/indexing signals.

Run from repository root: python3 scripts/check_seo.py
This does not verify Google's index, rankings, live redirects, or GA4 collection.
"""
from html.parser import HTMLParser
from pathlib import Path
import json
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
HOST = "angel-telecom.co.uk"
PRIORITY = ["index.html", "business-mobiles.html", "bill-review.html",
            "business-mobile-contracts-guide.html", "repair-shipley.html",
            "repair-halifax.html", "repair-sheffield.html", "repair-bolton.html"]

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.descriptions = []
        self.titles = []
        self.h1 = 0
        self.in_title = False
        self.links = []
        self.json_scripts = []
        self.in_json = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "link" and "canonical" in a.get("rel", "").lower().split():
            self.canonicals.append(a.get("href", ""))
        if tag == "meta" and a.get("name", "").lower() == "description":
            self.descriptions.append(a.get("content", ""))
        if tag == "title": self.in_title = True
        if tag == "h1": self.h1 += 1
        if tag == "a" and a.get("href"): self.links.append(a["href"])
        if tag == "script" and a.get("type") == "application/ld+json":
            self.in_json = True
            self.json_scripts.append("")
    def handle_data(self, data):
        if self.in_title: self.titles.append(data)
        if self.in_json: self.json_scripts[-1] += data
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
        if tag == "script": self.in_json = False

errors = []
def check(condition, message):
    if not condition: errors.append(message)

sitemap = ROOT / "sitemap.xml"
tree = ET.parse(sitemap)
urls = [el.text for el in tree.iter() if el.tag.endswith("}loc") or el.tag == "loc"]
check(len(urls) == len(set(urls)), "Duplicate sitemap URLs")
for url in urls:
    p = urlparse(url)
    check(p.scheme == "https" and p.netloc == HOST, f"Noncanonical sitemap URL: {url}")
    target = ROOT / (unquote(p.path.lstrip("/")) or "index.html")
    check(target.is_file(), f"Sitemap target missing: {url}")

for filename in PRIORITY:
    path = ROOT / filename
    if not path.exists():
        errors.append(f"Priority page missing: {filename}")
        continue
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    expected = f"https://{HOST}/" + ("" if filename == "index.html" else filename)
    check(parser.canonicals == [expected], f"{filename}: expected exactly one canonical {expected}")
    check(bool("".join(parser.titles).strip()), f"{filename}: missing title")
    check(len(parser.descriptions) == 1 and bool(parser.descriptions[0].strip()),
          f"{filename}: missing/duplicate meta description")
    check(parser.h1 == 1, f"{filename}: expected exactly one H1, found {parser.h1}")
    check(expected in urls, f"{filename}: missing from sitemap")
    for raw in parser.json_scripts:
        try: json.loads(raw)
        except json.JSONDecodeError as exc:
            errors.append(f"{filename}: invalid JSON-LD: {exc}")
    for href in parser.links:
        p = urlparse(href)
        if p.scheme or p.netloc or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
            continue
        target = ROOT / (unquote(p.path.lstrip("/")) if p.path.startswith("/") else str(Path(filename).parent / unquote(p.path)))
        if p.path == "/": target = ROOT / "index.html"
        if p.path and not target.exists():
            errors.append(f"{filename}: broken internal link {href}")

print(f"Checked {len(urls)} sitemap URLs and {len(PRIORITY)} priority pages.")
if errors:
    for error in errors: print("FAIL:", error)
    sys.exit(1)
print("PASS: local SEO checks")
