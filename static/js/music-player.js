(() => {
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) heroTitle.innerHTML = '把家和健康变成一套<span>可靠的系统。</span>';
  const heroLead = document.querySelector('.hero .lead');
  if (heroLead) heroLead.textContent = '我在云端守护生产系统，也用技术为家人营造一个懂得体贴的空间：它记得作息与习惯，关心健康与心境，在需要时安静地提供便利，而不打扰生活本身。';

  const rootsImage = document.querySelector('.roots-visual img');
  if (rootsImage) {
    rootsImage.src = '/images/roots-routes-v2.png';
    rootsImage.alt = '黑土、海风、北京借居与键盘构成的四联画';
  }
  const rootDetails = [
    ['黑土', '出生在北大荒，祖父母是开发北大荒的第一代。'],
    ['海风', '十六岁离开黑土地，在大连看见白云与海。'],
    ['借居', '住址已经在北京，归属仍在路上。'],
    ['键盘', '钢琴的练习，延续为今天的工作与未完。'],
  ];
  document.querySelectorAll('.root-list > div').forEach((item, index) => {
    const detail = rootDetails[index];
    if (!detail) return;
    const label = item.querySelector('b');
    const copy = item.querySelector('span');
    if (label) label.textContent = detail[0];
    if (copy) copy.textContent = detail[1];
  });

  const technicalCards = [
    ['工程实践', '/categories/工程实践/'],
    ['智能家居', '/categories/智能家居/'],
    ['家庭实验室', '/categories/家庭实验室/'],
  ];
  document.querySelectorAll('.cards .card').forEach((card, index) => {
    const [label, href] = technicalCards[index] || [];
    if (!href || card.querySelector('.tech-card-link')) return;
    card.classList.add('tech-card');
    const link = document.createElement('a');
    link.className = 'tech-card-link';
    link.href = href;
    link.setAttribute('aria-label', `查看${label}的文章`);
    card.appendChild(link);
  });

  const labSection = document.querySelector('#lab');
  if (labSection && !labSection.querySelector('.remote-status-link')) {
    const statusLink = document.createElement('a');
    statusLink.className = 'remote-status-link';
    statusLink.href = 'https://status.yimeng.ch/zh';
    statusLink.target = '_blank';
    statusLink.rel = 'noopener noreferrer';
    statusLink.innerHTML = '<span class="remote-status-dot" aria-hidden="true"></span><span><b>远程状态</b><small>家庭实验室 · Better Stack</small></span><strong>↗</strong>';
    labSection.querySelector('.section-head')?.appendChild(statusLink);
  }

  const terminal = document.querySelector('.musical-terminal');
  const overlay = terminal?.querySelector('.score-overlay');
  if (!terminal || !overlay) return;

  const heroCopy = document.querySelector('.hero > div:first-child');
  const heroCta = heroCopy?.querySelector('.cta');
  if (heroCopy && heroCta) {
    const homeLog = document.createElement('div');
    homeLog.className = 'home-log';
    homeLog.innerHTML = `
      <div class="log-item" tabindex="0"><span class="log-command">$ home tune</span><span>rest: <b>good</b> · minds: <b>clear</b></span><span>tempo: <b>easy</b></span><small class="log-note"># 愿休息充足，心绪清明，日子不必太赶。</small></div>
      <div class="log-item" tabindex="0"><span class="log-command">$ home presence</span><span>someone: <b>expected</b> · someone: <b>remembered</b></span><small class="log-note"># 有人被期待，也有人被记得。</small></div>
      <div class="log-item" tabindex="0"><span class="log-command">$ home archive --today</span><span>moments: <b>kept</b> · tomorrow: <b>unwritten</b></span><small class="log-note"># 把今天的片刻留住，让明天慢慢展开。</small></div>
      <p class="log-item" tabindex="0"><i>●</i> home: no alert is good news<small class="log-note"># 最好的系统，不争夺你的注意力，让你把这份注意力还给家人。</small></p>`;
    heroCopy.insertBefore(homeLog, heroCta);

    const homeMoments = heroCopy.querySelector('.home-moments');
    heroCta.remove();
    homeMoments?.remove();
  }

  const stats = document.querySelector('.stats');
  if (stats && !stats.parentElement?.classList.contains('home-summary')) {
    const summary = document.createElement('section');
    summary.className = 'home-summary';
    summary.innerHTML = `
      <div class="summary-copy"><span>HOME / QUIETLY</span><h2>让日常被照顾，<br>而不被打扰。</h2></div>
      <div class="summary-side"><p>它在不被看见的地方持续运行，<br>把便利留在需要的时候，把注意力还给生活。</p><a class="summary-link" href="#lab">走进家庭实验室 <span>→</span></a></div>`;
    stats.parentNode.insertBefore(summary, stats);
    summary.appendChild(stats);

    const lifeMarks = [
      ['来处', '45°N', '黑土的坐标，也是归属的疑问。', '/life/origin/'],
      ['相伴', '彼此照应', '把便利留给生活，把注意力还给家人。', '/life/together/'],
      ['成长', '重新看见', '陪着孩子，也陪自己学习世界。', '/life/growing/'],
      ['日常', '三餐四季', '把身体与日子，慢慢安顿好。', '/life/everyday/'],
    ];
    stats.querySelectorAll('.stat').forEach((stat, index) => {
      const [category, value, label, href] = lifeMarks[index];
      stat.innerHTML = `<a class="life-mark" href="${href}"><small>${category}</small><b>${value}</b><span>${label}</span><i aria-hidden="true">↗</i></a>`;
    });
  }

  const terminalCopy = terminal.querySelector('.terminal-copy');
  if (terminalCopy) terminalCopy.innerHTML = `
    <div class="dots"><i></i><i></i><i></i></div>
    <div><span class="dos-prompt">C:\\&gt;</span> cd GAME</div>
    <div><span class="dos-prompt">C:\\GAME&gt;</span> cd BETWEEN-LINES</div>
    <div><span class="dos-prompt">C:\\GAME\\BETWEEN-LINES&gt;</span> play.bat</div>
    <div class="muted">谱面: <strong>G 大调小步舞曲</strong></div>
    <div class="muted">听见: <strong>另一段故事</strong></div>
    <div class="muted">来处: <strong>黑土 · 海风</strong></div>
    <div class="muted">住址: <strong>北京 · 借居</strong></div>
    <div class="muted">键盘: <strong>练习 · 未完</strong></div>
    <div class="warm-status"><span>♬</span> hover to read · click to listen</div>`;

  const caption = overlay.querySelector('p');
  if (caption) caption.textContent = '识得的谱子，未必写着我听见的故事。';
  const scoreMeta = overlay.querySelector('.score-meta small');
  const defaultMeta = scoreMeta?.textContent;

  const audio = new Audio('/audio/schumann-kinderszenen-op15-no1.mp3');
  audio.preload = 'metadata';
  const button = document.createElement('button');
  button.className = 'listen-button';
  button.type = 'button';
  button.innerHTML = '<span aria-hidden="true">♬</span> 聆听';
  button.title = '聆听未写在谱上的部分';
  overlay.insertBefore(button, overlay.querySelector('svg'));

  const reset = () => {
    audio.pause();
    audio.currentTime = 0;
    terminal.classList.remove('is-playing');
    button.innerHTML = '<span aria-hidden="true">♬</span> 聆听';
    if (scoreMeta) scoreMeta.textContent = defaultMeta;
  };

  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (!audio.paused) return reset();
    try {
      await audio.play();
      terminal.classList.add('is-playing');
      button.innerHTML = '<span aria-hidden="true">Ⅱ</span> 正在聆听';
      if (scoreMeta) scoreMeta.textContent = '舒曼《童年情景》· I. 异国和异国的人们';
    } catch {
      button.textContent = '播放未能开始';
    }
  });

  audio.addEventListener('ended', reset);
})();
