/* 站点交互：阅读进度、回到顶部、搜索弹窗、主题切换 */
(function () {
  'use strict';

  /* ---------- 阅读进度条 ---------- */
  var bar = document.getElementById('reading-progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
      var top = document.getElementById('to-top');
      if (top) top.classList.toggle('visible', (h.scrollTop || document.body.scrollTop) > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 回到顶部 ---------- */
  var toTop = document.getElementById('to-top');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 主题：URL 参数优先（?theme=light|dark，便于分享与测试） ---------- */
  (function () {
    var m = location.search.match(/[?&]theme=(light|dark)/);
    if (m) {
      document.documentElement.setAttribute('data-theme', m[1]);
      try { localStorage.setItem('theme', m[1]); } catch (e) {}
    }
  })();

  /* ---------- 主题切换 ---------- */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      // 主题变化后重载 mermaid（若存在）
      if (window.mermaid && document.querySelector('.mermaid')) {
        location.reload();
      }
    });
  }

  /* ---------- 搜索弹窗（Pagefind） ---------- */
  var modal = document.getElementById('search-modal');
  var openBtn = document.getElementById('search-toggle');
  var closeBtn = document.getElementById('search-close');
  var mounted = false;

  function openSearch() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-open');
    if (!mounted) {
      mounted = true;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/pagefind/pagefind-ui.css';
      document.head.appendChild(link);
      var s = document.createElement('script');
      s.src = '/pagefind/pagefind-ui.js';
      s.onload = function () {
        if (window.PagefindUI) {
          new window.PagefindUI({
            element: '#search',
            showSubResults: true,
            showImages: false,
            translations: {
              placeholder: '搜索文章…',
              zero_results: '没有找到「[SEARCH_TERM]」',
              many_results: '找到 [COUNT] 条结果',
              one_result: '找到 1 条结果',
              searching: '搜索中…'
            }
          });
        }
      };
      document.head.appendChild(s);
    }
    var input = modal.querySelector('input');
    if (input) setTimeout(function () { input.focus(); }, 120);
  }

  function closeSearch() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-open');
  }

  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ---------- 代码块复制按钮 ---------- */
  document.querySelectorAll('.page article pre, .about-page article pre').forEach(function (pre) {
    if (pre.classList.contains('mermaid')) return; // mermaid 源码不能插入按钮
    var btn = document.createElement('button');
    btn.className = 'copy-code';
    btn.type = 'button';
    btn.textContent = '复制';
    btn.addEventListener('click', function () {
      var text = pre.querySelector('code') ? pre.querySelector('code').innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = '复制'; }, 1500);
      });
    });
    pre.appendChild(btn);
  });

  /* ---------- 外链新窗口打开 ---------- */
  document.querySelectorAll('.page article a[href^="http"]').forEach(function (a) {
    if (a.hostname && a.hostname !== location.hostname) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
})();
