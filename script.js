/* =========================================================
   AGROVISION — INTERATIVIDADE DA LANDING PAGE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── 1. MENU MOBILE ──────────────────────────────────── */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ─── 2. SIMULADOR DE CLASSIFICAÇÃO IA (DONUT SVG) ────── */
  const SCENARIOS = {
    solo: {
      name: 'Solo Limpo',
      confidence: 97,
      icon: '🟤',
      status: 'Terreno limpo — nenhuma pulverização necessária',
      color: '#4ade80',
      healthyPct: 100,
      weedPct: 0
    },
    daninha: {
      name: 'Erva Daninha',
      confidence: 94,
      icon: '⚠️',
      status: 'Alerta Crítico — aplicação localizada recomendada',
      color: '#f59e0b',
      healthyPct: 68,
      weedPct: 32
    },
    arvore: {
      name: 'Árvore Saudável',
      confidence: 98,
      icon: '🌳',
      status: 'Cultura monitorada com vigor vegetativo normal',
      color: '#4ade80',
      healthyPct: 100,
      weedPct: 0
    }
  };

  const CIRCUMFERENCE = 2 * Math.PI * 42; // r = 42 => ~263.89
  const donutCircle = document.getElementById('sim-donut-circle');
  const simIcon = document.getElementById('sim-icon');
  const simClassName = document.getElementById('sim-class-name');
  const simConfidence = document.getElementById('sim-confidence');
  const simStatusText = document.getElementById('sim-status-text');
  const barHealthy = document.getElementById('bar-healthy');
  const barHealthyVal = document.getElementById('bar-healthy-val');
  const barWeed = document.getElementById('bar-weed');
  const barWeedVal = document.getElementById('bar-weed-val');

  function applyScenario(key) {
    const data = SCENARIOS[key];
    if (!data) return;

    if (simIcon) simIcon.textContent = data.icon;
    if (simClassName) simClassName.textContent = data.name;
    if (simConfidence) {
      simConfidence.textContent = `${data.confidence}%`;
      simConfidence.style.color = data.color;
    }
    if (simStatusText) simStatusText.textContent = data.status;

    if (donutCircle) {
      const offset = CIRCUMFERENCE - (data.confidence / 100) * CIRCUMFERENCE;
      donutCircle.style.strokeDasharray = `${CIRCUMFERENCE}`;
      donutCircle.style.strokeDashoffset = `${offset}`;
      donutCircle.style.stroke = data.color;
    }

    if (barHealthy) barHealthy.style.width = `${data.healthyPct}%`;
    if (barHealthyVal) barHealthyVal.textContent = `${data.healthyPct}%`;
    if (barWeed) barWeed.style.width = `${data.weedPct}%`;
    if (barWeedVal) barWeedVal.textContent = `${data.weedPct}%`;
  }

  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyScenario(btn.dataset.scenario);
    });
  });

  applyScenario('solo');

  /* ─── 3. SIMULADOR DO ORTOMOSAICO 3x4 (12 QUADRANTES) ─── */
  const mosaicGrid = document.getElementById('mosaic-grid');
  const tileInspector = document.getElementById('tile-inspector');
  const scanStatusLabel = document.getElementById('scan-status-label');
  const scanPctLabel = document.getElementById('scan-pct-label');
  const scanProgressBar = document.getElementById('scan-progress-bar');
  const btnRunScan = document.getElementById('btn-run-scan');
  const btnResetScan = document.getElementById('btn-reset-scan');

  const TILE_PRESETS = [
    { x: 0, y: 0, label: 'Solo Limpo', conf: 97, weed: false },
    { x: 1, y: 0, label: 'Erva Daninha', conf: 93, weed: true },
    { x: 2, y: 0, label: 'Solo Limpo', conf: 98, weed: false },
    { x: 3, y: 0, label: 'Árvore', conf: 96, weed: false },
    { x: 0, y: 1, label: 'Solo Limpo', conf: 92, weed: false },
    { x: 1, y: 1, label: 'Erva Daninha', conf: 97, weed: true },
    { x: 2, y: 1, label: 'Árvore', conf: 95, weed: false },
    { x: 3, y: 1, label: 'Solo Limpo', conf: 97, weed: false },
    { x: 0, y: 2, label: 'Árvore', conf: 95, weed: false },
    { x: 1, y: 2, label: 'Solo Limpo', conf: 94, weed: false },
    { x: 2, y: 2, label: 'Erva Daninha', conf: 96, weed: true },
    { x: 3, y: 2, label: 'Árvore', conf: 98, weed: false }
  ];

  let scanTimer = null;

  function renderInitialGrid() {
    if (!mosaicGrid) return;
    mosaicGrid.innerHTML = '';

    TILE_PRESETS.forEach((tile, idx) => {
      const cell = document.createElement('div');
      cell.className = 'tile-cell';
      cell.dataset.index = idx;
      cell.innerHTML = `
        <span class="tile-coord">X:${tile.x} Y:${tile.y}</span>
        <span class="tile-badge">—</span>
      `;

      cell.addEventListener('click', () => {
        document.querySelectorAll('.tile-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        if (tileInspector) {
          const status = tile.weed ? 'CRÍTICO (Erva Daninha)' : `OK (${tile.label})`;
          tileInspector.textContent = `Ponto X:${tile.x} Y:${tile.y} | Classe: ${tile.label} | Confiança: ${tile.conf}% | Status MySQL: ${status}`;
        }
      });

      mosaicGrid.appendChild(cell);
    });
  }

  function resetScan() {
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    renderInitialGrid();
    if (scanStatusLabel) scanStatusLabel.textContent = 'Aguardando início da missão...';
    if (scanPctLabel) scanPctLabel.textContent = '0% (0/12)';
    if (scanProgressBar) scanProgressBar.style.width = '0%';
    if (tileInspector) {
      tileInspector.textContent = 'Clique em "Iniciar Varredura" ou selecione qualquer quadrante para inspecionar os dados capturados.';
    }
  }

  function startScan() {
    resetScan();
    let current = 0;
    const cells = mosaicGrid.querySelectorAll('.tile-cell');

    if (scanStatusLabel) scanStatusLabel.textContent = 'Drone em voo — capturando quadrantes...';

    scanTimer = setInterval(() => {
      if (current >= TILE_PRESETS.length) {
        clearInterval(scanTimer);
        scanTimer = null;
        if (scanStatusLabel) scanStatusLabel.textContent = 'Ortomosaico 3×4 concluído com sucesso!';
        return;
      }

      const data = TILE_PRESETS[current];
      const cell = cells[current];
      if (cell) {
        cell.classList.add(data.weed ? 'scanned-weed' : 'scanned-clean');
        cell.querySelector('.tile-badge').textContent = `${data.label} (${data.conf}%)`;
      }

      current++;
      const pct = Math.round((current / TILE_PRESETS.length) * 100);
      if (scanPctLabel) scanPctLabel.textContent = `${pct}% (${current}/12)`;
      if (scanProgressBar) scanProgressBar.style.width = `${pct}%`;

      if (tileInspector) {
        tileInspector.textContent = `Registrado Ponto X:${data.x} Y:${data.y} -> ${data.label} (${data.conf}% de confiança)`;
      }
    }, 260);
  }

  if (btnRunScan) btnRunScan.addEventListener('click', startScan);
  if (btnResetScan) btnResetScan.addEventListener('click', resetScan);

  renderInitialGrid();

  /* ─── 4. BOTÃO DE COPIAR GIT CLONE ────────────────────── */
  const btnCopyClone = document.getElementById('btn-copy-clone');
  const cloneCommand = document.getElementById('clone-command');

  if (btnCopyClone && cloneCommand) {
    btnCopyClone.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cloneCommand.textContent.trim());
        const originalText = btnCopyClone.textContent;
        btnCopyClone.textContent = 'Copiado! ✓';
        setTimeout(() => {
          btnCopyClone.textContent = originalText;
        }, 2000);
      } catch {
        btnCopyClone.textContent = 'Erro ao copiar';
      }
    });
  }
});