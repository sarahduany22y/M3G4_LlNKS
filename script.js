(function() {
  "use strict";

  // ---- DOM references ----
  const categoriesContainer = document.getElementById('categories');
  const searchInput = document.getElementById('searchInput');
  const totalLinksSpan = document.getElementById('totalLinks');
  const totalRodapeSpan = document.getElementById('totalRodape');
  const detalhesCategoriasSpan = document.getElementById('detalhesCategorias');
  const ultimaAtualizacaoSpan = document.getElementById('ultimaAtualizacao');

  // ---- Verificação: a variável 'links' existe? ----
  if (typeof links === 'undefined' || !Array.isArray(links)) {
    console.error('ERRO: A variável "links" não está definida ou não é um array. Verifique o arquivo links.js.');
    // Exibe mensagem amigável na tela
    categoriesContainer.innerHTML = `
      <div style="text-align:center; padding:40px; color:#f85149; background:#161b22; border-radius:12px; border:1px solid #f85149;">
        <strong>⚠️ Erro ao carregar os links.</strong><br>
        Certifique-se de que o arquivo <code>links.js</code> está presente e contém uma variável <code>links</code> com um array de URLs.
      </div>
    `;
    return;
  }

  console.log(`✅ ${links.length} links carregados.`);

  // ---- Mapeamento de categorias ----
  const CATEGORY_MAP = {
    'mega.nz': { nome: 'Mega', icone: '📁' },
    'gofile.io': { nome: 'GoFile', icone: '☁' },
    'pixeldrain.com': { nome: 'PixelDrain', icone: '🖼' },
    'cyberdrop.me': { nome: 'CyberDrop', icone: '📂' },
    'cyberdrop.cr': { nome: 'CyberDrop', icone: '📂' },
  };

  // ---- Detecção de categoria ----
  function detectCategory(url) {
    const lower = url.toLowerCase();

    // Erome (especial)
    if (lower.includes('erome.com')) {
      return { nome: 'Erome', icone: '🎬', especial: 'erome' };
    }

    // CDN Bunkr
    if (/cdn\d*\.bunkr\.ru/.test(lower)) {
      return { nome: 'CDN Bunkr MP4', icone: '🎥' };
    }
    if (/bunkr\.[^\/]+\/a\//.test(lower)) {
      return { nome: 'Bunkr Álbuns', icone: '📦' };
    }
    if (/bunkr\.[^\/]+\/v\//.test(lower)) {
      return { nome: 'Bunkr Vídeos', icone: '🎬' };
    }
    if (/bunkr\.[^\/]+\/f\//.test(lower)) {
      return { nome: 'Bunkr Arquivos', icone: '📄' };
    }
    if (/bunkr\.[^\/]+/.test(lower)) {
      return { nome: 'Bunkr (Genérico)', icone: '📦' };
    }
    if (lower.endsWith('.mp4')) {
      return { nome: 'Vídeos MP4', icone: '🎥' };
    }
    for (const [domain, info] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(domain)) {
        return info;
      }
    }
    return { nome: 'Outros', icone: '🌐' };
  }

  // ---- Processamento ----
  function processLinks(rawLinks) {
    const unique = [...new Set(rawLinks)];
    const groups = new Map();
    unique.forEach(url => {
      const cat = detectCategory(url);
      const key = cat.nome;
      if (!groups.has(key)) {
        groups.set(key, {
          nome: key,
          icone: cat.icone,
          especial: cat.especial || null,
          links: []
        });
      }
      groups.get(key).links.push(url);
    });

    // Ordena links dentro de cada categoria
    for (const [key, group] of groups) {
      group.links.sort((a, b) => a.localeCompare(b));
    }

    // Ordena categorias: Mega primeiro, depois alfabético
    const sortedGroups = Array.from(groups.entries())
      .sort((a, b) => {
        const nomeA = a[0];
        const nomeB = b[0];
        if (nomeA === 'Mega') return -1;
        if (nomeB === 'Mega') return 1;
        return nomeA.localeCompare(nomeB);
      })
      .map(([_, value]) => value);

    return sortedGroups;
  }

  // ---- Renderização ----
  function render(groups, filterText = '') {
    categoriesContainer.innerHTML = '';
    let total = 0;
    const stats = {};

    groups.forEach(group => {
      const links = group.links;
      let filteredLinks = links;
      if (filterText.trim() !== '') {
        const term = filterText.toLowerCase().trim();
        filteredLinks = links.filter(url => url.toLowerCase().includes(term));
      }
      if (filteredLinks.length === 0) return;

      total += filteredLinks.length;
      stats[group.nome] = (stats[group.nome] || 0) + filteredLinks.length;

      const categoriaDiv = document.createElement('div');
      categoriaDiv.className = 'categoria';

      const header = document.createElement('div');
      header.className = 'categoria-header';
      header.dataset.expanded = 'false';

      const tituloSpan = document.createElement('span');
      tituloSpan.className = 'titulo';
      tituloSpan.innerHTML = `${group.icone} ${group.nome} <span class="contador">(${filteredLinks.length})</span>`;

      const setaSpan = document.createElement('span');
      setaSpan.className = 'seta';
      setaSpan.textContent = '▶';

      header.appendChild(tituloSpan);
      header.appendChild(setaSpan);

      const listaDiv = document.createElement('div');
      listaDiv.className = 'categoria-lista fechada';

      filteredLinks.forEach(url => {
        const card = document.createElement('div');
        card.className = 'link-card';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'link-info';
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icone';
        iconSpan.textContent = group.icone;
        const urlSpan = document.createElement('a');
        urlSpan.className = 'url';
        urlSpan.href = url;
        urlSpan.target = '_blank';
        urlSpan.rel = 'noopener noreferrer';
        urlSpan.textContent = url;

        infoDiv.appendChild(iconSpan);
        infoDiv.appendChild(urlSpan);

        const acaoDiv = document.createElement('div');
        acaoDiv.className = 'link-acao';

        // Especial: Erome
        if (group.especial === 'erome') {
          const btn = document.createElement('button');
          btn.textContent = '🎬 Amador - Erome';
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            const width = 1200;
            const height = 800;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            const params = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
            window.open(url, '_blank', params);
          });
          acaoDiv.appendChild(btn);
        } else {
          const linkA = document.createElement('a');
          linkA.href = url;
          linkA.target = '_blank';
          linkA.rel = 'noopener noreferrer';
          linkA.textContent = 'Abrir →';
          acaoDiv.appendChild(linkA);
        }

        card.appendChild(infoDiv);
        card.appendChild(acaoDiv);
        listaDiv.appendChild(card);
      });

      // Toggle
      header.addEventListener('click', function() {
        const isExpanded = this.dataset.expanded === 'true';
        const lista = this.nextElementSibling;
        const seta = this.querySelector('.seta');
        if (isExpanded) {
          lista.classList.add('fechada');
          lista.classList.remove('aberta');
          seta.textContent = '▶';
          this.dataset.expanded = 'false';
        } else {
          lista.classList.remove('fechada');
          lista.classList.add('aberta');
          seta.textContent = '▼';
          this.dataset.expanded = 'true';
        }
      });

      categoriaDiv.appendChild(header);
      categoriaDiv.appendChild(listaDiv);
      categoriesContainer.appendChild(categoriaDiv);
    });

    // Atualiza totais
    totalLinksSpan.textContent = total;
    totalRodapeSpan.textContent = total;

    // Estatísticas detalhadas (com Mega primeiro)
    const statsEntries = Object.entries(stats).sort((a, b) => {
      if (a[0] === 'Mega') return -1;
      if (b[0] === 'Mega') return 1;
      return a[0].localeCompare(b[0]);
    });
    let statsHTML = '';
    statsEntries.forEach(([nome, count]) => {
      statsHTML += `<span>${nome} (${count})</span>`;
    });
    detalhesCategoriasSpan.innerHTML = statsHTML;
  }

  // ---- Expandir / Recolher ----
  function expandirTodos() {
    document.querySelectorAll('.categoria-header').forEach(header => {
      const lista = header.nextElementSibling;
      const seta = header.querySelector('.seta');
      if (lista) {
        lista.classList.remove('fechada');
        lista.classList.add('aberta');
        seta.textContent = '▼';
        header.dataset.expanded = 'true';
      }
    });
  }

  function recolherTodos() {
    document.querySelectorAll('.categoria-header').forEach(header => {
      const lista = header.nextElementSibling;
      const seta = header.querySelector('.seta');
      if (lista) {
        lista.classList.add('fechada');
        lista.classList.remove('aberta');
        seta.textContent = '▶';
        header.dataset.expanded = 'false';
      }
    });
  }

  // ---- Inicialização ----
  function init() {
    const groups = processLinks(links);
    render(groups, '');

    // Data atual
    const now = new Date();
    ultimaAtualizacaoSpan.textContent = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Pesquisa
    searchInput.addEventListener('input', function() {
      render(groups, this.value);
    });

    // Botões
    document.getElementById('expandirTodos').addEventListener('click', expandirTodos);
    document.getElementById('recolherTodos').addEventListener('click', recolherTodos);
  }

  // Executa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
