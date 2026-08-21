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
    // Ordem de prioridade: específicos primeiro, depois padrões
    // Domínios conhecidos
    'mega.nz': { nome: 'Mega', icone: '📁' },
    'gofile.io': { nome: 'GoFile', icone: '☁' },
    'pixeldrain.com': { nome: 'PixelDrain', icone: '🖼' },
    'cyberdrop.me': { nome: 'CyberDrop', icone: '📂' },
    'cyberdrop.cr': { nome: 'CyberDrop', icone: '📂' },
  };

  // Função para detectar categoria com base na URL
  function detectCategory(url) {
    const lower = url.toLowerCase();

    // 1. CDN Bunkr (cdn.bunkr.ru, cdn8.bunkr.ru, etc.)
    if (/cdn\d*\.bunkr\.ru/.test(lower)) {
      return { nome: 'CDN Bunkr MP4', icone: '🎥' };
    }

    // 2. Bunkr com /a/ (álbuns)
    if (/bunkr\.[^\/]+\/a\//.test(lower)) {
      return { nome: 'Bunkr Álbuns', icone: '📦' };
    }
    // Bunkr com /v/ (vídeos)
    if (/bunkr\.[^\/]+\/v\//.test(lower)) {
      return { nome: 'Bunkr Vídeos', icone: '🎬' };
    }
    // Bunkr com /f/ (arquivos)
    if (/bunkr\.[^\/]+\/f\//.test(lower)) {
      return { nome: 'Bunkr Arquivos', icone: '📄' };
    }
    // Qualquer outro bunkr (sem /a/, /v/, /f/) - pode ser álbum padrão? Mas já pega os de cima.
    // Se for bunkr.xxx sem subpasta, considerar como álbum? Vamos tratar como Outros? Melhor como Bunkr genérico.
    if (/bunkr\.[^\/]+/.test(lower)) {
      return { nome: 'Bunkr (Genérico)', icone: '📦' };
    }

    // 3. Vídeos .mp4 (qualquer domínio, exceto se já capturado como CDN Bunkr)
    if (lower.endsWith('.mp4')) {
      return { nome: 'Vídeos MP4', icone: '🎥' };
    }

    // 4. Domínios conhecidos (Mega, GoFile, etc.)
    for (const [domain, info] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(domain)) {
        return info;
      }
    }

    // 5. Outros
    return { nome: 'Outros', icone: '🌐' };
  }

  // ---- Processamento dos links ----
  function processLinks(rawLinks) {
    // 1. Remover duplicatas (usando Set)
    const unique = [...new Set(rawLinks)];

    // 2. Agrupar por categoria
    const groups = new Map();
    unique.forEach(url => {
      const cat = detectCategory(url);
      const key = cat.nome;
      if (!groups.has(key)) {
        groups.set(key, { nome: key, icone: cat.icone, links: [] });
      }
      groups.get(key).links.push(url);
    });

    // 3. Ordenar links dentro de cada categoria (alfabético)
    for (const [key, group] of groups) {
      group.links.sort((a, b) => a.localeCompare(b));
    }

    // 4. Ordenar categorias por nome
    const sortedGroups = Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
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
      // Filtrar links pelo texto (busca)
      let filteredLinks = links;
      if (filterText.trim() !== '') {
        const term = filterText.toLowerCase().trim();
        filteredLinks = links.filter(url => url.toLowerCase().includes(term));
      }

      if (filteredLinks.length === 0) {
        // Se não houver links após filtro, não exibe a categoria (a menos que queira mostrar vazio?)
        return;
      }

      total += filteredLinks.length;
      stats[group.nome] = (stats[group.nome] || 0) + filteredLinks.length;

      // Criar elemento da categoria
      const categoriaDiv = document.createElement('div');
      categoriaDiv.className = 'categoria';

      // Cabeçalho (clique para expandir)
      const header = document.createElement('div');
      header.className = 'categoria-header';
      header.dataset.expanded = 'false'; // inicialmente fechado

      const tituloSpan = document.createElement('span');
      tituloSpan.className = 'titulo';
      tituloSpan.innerHTML = `${group.icone} ${group.nome} <span class="contador">(${filteredLinks.length})</span>`;

      const setaSpan = document.createElement('span');
      setaSpan.className = 'seta';
      setaSpan.textContent = '▶';

      header.appendChild(tituloSpan);
      header.appendChild(setaSpan);

      // Lista de links
      const listaDiv = document.createElement('div');
      listaDiv.className = 'categoria-lista fechada'; // começa fechada

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
        const linkA = document.createElement('a');
        linkA.href = url;
        linkA.target = '_blank';
        linkA.rel = 'noopener noreferrer';
        linkA.textContent = 'Abrir →';
        acaoDiv.appendChild(linkA);

        card.appendChild(infoDiv);
        card.appendChild(acaoDiv);
        listaDiv.appendChild(card);
      });

      // Evento de toggle no header
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

    // Atualizar estatísticas e rodapé
    totalLinksSpan.textContent = total;
    totalRodapeSpan.textContent = total;

    // Detalhes por categoria (apenas as que aparecem após filtro)
    const statsEntries = Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0]));
    let statsHTML = '';
    statsEntries.forEach(([nome, count]) => {
      statsHTML += `<span>${nome} (${count})</span>`;
    });
    detalhesCategoriasSpan.innerHTML = statsHTML;
  }

  // ---- Expansão/Recolhimento global ----
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
    // Verificar se a variável 'links' existe (do links.js)
    if (typeof links === 'undefined' || !Array.isArray(links)) {
      console.error('Arquivo links.js não carregado ou variável "links" não encontrada.');
      return;
    }

    // Processar links
    const groups = processLinks(links);

    // Renderizar
    render(groups, '');

    // Atualizar data
    const now = new Date();
    ultimaAtualizacaoSpan.textContent = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Evento de pesquisa
    searchInput.addEventListener('input', function() {
      const filter = this.value;
      render(groups, filter);
    });

    // Botões expandir/recolher
    document.getElementById('expandirTodos').addEventListener('click', expandirTodos);
    document.getElementById('recolherTodos').addEventListener('click', recolherTodos);

    // Iniciar com todas as categorias fechadas (padrão já aplicado)
  }

  // Executar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
