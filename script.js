(function() {
  "use strict";

  // ---- DOM references ----
  const categoriesContainer = document.getElementById('categories');
  const searchInput = document.getElementById('searchInput');
  const totalLinksSpan = document.getElementById('totalLinks');
  const totalRodapeSpan = document.getElementById('totalRodape');
  const detalhesCategoriasSpan = document.getElementById('detalhesCategorias');
  const ultimaAtualizacaoSpan = document.getElementById('ultimaAtualizacao');

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
    // Bunkr /a/
    if (/bunkr\.[^\/]+\/a\//.test(lower)) {
      return { nome: 'Bunkr Álbuns', icone: '📦' };
    }
    // Bunkr /v/
    if (/bunkr\.[^\/]+\/v\//.test(lower)) {
      return { nome: 'Bunkr Vídeos', icone: '🎬' };
    }
    // Bunkr /f/
    if (/bunkr\.[^\/]+\/f\//.test(lower)) {
      return { nome: 'Bunkr Arquivos', icone: '📄' };
    }
    // Bunkr genérico
    if (/bunkr\.[^\/]+/.test(lower)) {
      return { nome: 'Bunkr (Genérico)', icone: '📦' };
    }
    // MP4 direto
    if (lower.endsWith('.mp4')) {
      return { nome: 'Vídeos MP4', icone: '🎥' };
    }
    // Domínios conhecidos
    for (const [domain, info] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(domain)) {
        return info;
      }
    }
    // Outros
    return { nome: 'Outros', icone: '🌐' };
  }

  // ---- Processamento dos links ----
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

    // Ordena os links dentro de cada categoria
    for (const [key, group] of groups) {
      group.links.sort((a, b) => a.localeCompare(b));
    }

    // Ordena as categorias: Mega primeiro, depois alfabética
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

        // ---- Especial: Erome ----
        if (group.especial === 'erome') {
          const btn = document.createElement('button');
          btn.textContent = '🎬 Amador - Erome';
          btn.style.background = '#21262d';
          btn.style.border = '1px solid #30363d';
          btn.style.color = '#c9d1d9';
          btn.style.padding = '4px 12px';
          btn.style.borderRadius = '6px';
          btn.style.cursor = 'pointer';
          btn.style.fontSize = '0.85rem';
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Abre em janela pop-up centralizada
            const width = 1200;
            const height = 800;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            const params = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
            window.open(url, '_blank', params);
          });
          acaoDiv.appendChild(btn);
        } else {
          // Comportamento padrão: link "Abrir →"
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

      // Toggle expandir/recolher
      header.addEventListener('click', function(e) {
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

    // Atualiza estatísticas
    totalLinksSpan.textContent = total;
    totalRodapeSpan.textContent = total;

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

  // ---- Expandir / Recolher todos ----
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
    if (typeof links === 'undefined' || !Array.isArray(links)) {
      console.error('Arquivo links.js não carregado ou variável "links" não encontrada.');
      return;
    }
    const groups = processLinks(links);
    render(groups, '');

    // Data de atualização
    const now = new Date();
    ultimaAtualizacaoSpan.textContent = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Evento de pesquisa
    searchInput.addEventListener('input', function() {
      render(groups, this.value);
    });

    // Botões de expandir/recolher
    document.getElementById('expandirTodos').addEventListener('click', expandirTodos);
    document.getElementById('recolherTodos').addEventListener('click', recolherTodos);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
