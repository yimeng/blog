#!/usr/bin/env node
/**
 * 生成每篇文章的 OG 分享图（1200×630 PNG）
 *
 * 为什么需要：微信/飞书/Telegram 分享链接时，没有 og:image 就是一条光秃秃的链接。
 * 这里用无头 Chromium 把文章标题渲染成一张卡片图，产物提交到 static/og/<slug>.png。
 *
 * 用法：
 *   node scripts/gen-og.mjs                # 重新生成全部
 *   node scripts/gen-og.mjs <slug> [...]   # 只生成指定文章
 *
 * 依赖：chromium（本机 /usr/bin/chromium）
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_DIRS = [path.join(ROOT, 'content/posts'), path.join(ROOT, 'content/post')];
const OUT = path.join(ROOT, 'static/og');

fs.mkdirSync(OUT, { recursive: true });

function parseFrontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].replace(/^["「]|["」]$/g, '').trim();
  }
  return fm;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function html({ title, date, cats }) {
  // 标题超过 28 字时降字号，避免溢出
  const len = [...title].length;
  const size = len > 34 ? 50 : len > 26 ? 56 : len > 18 ? 64 : 72;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;box-sizing:border-box}
    body{
      width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between;
      padding:72px 78px 64px 96px;background:#07110c;color:#edf4ee;overflow:hidden;position:relative;
      font-family:"Noto Serif CJK SC","Songti SC",serif;
    }
    .accent{position:absolute;left:0;top:0;bottom:0;width:6px;background:#b8f05a}
    .top{display:flex;align-items:center;gap:12px;font-family:ui-monospace,monospace;
         font-size:19px;color:#6ee7c8;letter-spacing:.14em}
    .dot{width:9px;height:9px;border-radius:50%;background:#b8f05a}
    h1{font-size:${size}px;line-height:1.3;letter-spacing:-.02em;font-weight:600;color:#e6f0e7;
       display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;margin-top:26px}
    .bottom{display:flex;align-items:flex-end;justify-content:space-between;
            font-family:ui-monospace,monospace;font-size:19px;color:#8fa294}
    .cats{display:flex;gap:10px}
    .cat{padding:6px 13px;border:1px solid #2c4a38;border-radius:999px;color:#6ee7c8;font-size:16px}
  </style></head><body>
    <div class="accent"></div>
    <div>
      <div class="top"><span class="dot"></span><span>git.yimeng.ch</span></div>
      <h1>${esc(title)}</h1>
    </div>
    <div class="bottom">
      <div class="cats">${cats.map((c) => `<span class="cat">${esc(c)}</span>`).join('')}</div>
      <div>${esc(date)}</div>
    </div>
  </body></html>`;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md') && !e.name.startsWith('_')) out.push(p);
  }
  return out;
}

const only = process.argv.slice(2);
const files = POSTS_DIRS.flatMap(walk)
  .filter((f) => (only.length ? only.includes(path.basename(f).replace(/\.md$/, '')) : true));

let n = 0;
for (const file of files) {
  const slug = path.basename(file).replace(/\.md$/, '');
  const text = fs.readFileSync(file, 'utf8');
  const fm = parseFrontMatter(text);
  if (!fm.title) continue;
  const cats = (fm.categories || '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.replace(/["「」\s]/g, ''))
    .filter(Boolean);
  const tmp = path.join('/tmp', `og-${slug}.html`);
  fs.writeFileSync(tmp, html({ title: fm.title, date: fm.date || '', cats }));
  const out = path.join(OUT, `${slug}.png`);
  execFileSync(
    'chromium',
    [
      '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--screenshot=${out}`,
      '--window-size=1200,630',
      `file://${tmp}`,
    ],
    { stdio: 'ignore' }
  );
  fs.unlinkSync(tmp);
  n++;
}
console.log(`generated ${n} OG images -> static/og/`);
