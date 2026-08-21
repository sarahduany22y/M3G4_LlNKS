(function() {
  "use strict";

  const categoriesContainer = document.getElementById('categories');
  const searchInput = document.getElementById('searchInput');
  const totalLinksSpan = document.getElementById('totalLinks');
  const totalRodapeSpan = document.getElementById('totalRodape');
  const detalhesCategoriasSpan = document.getElementById('detalhesCategorias');
  const ultimaAtualizacaoSpan = document.getElementById('ultimaAtualizacao');

  // ---- Verificação com window.links ----
  if (typeof window.links === 'undefined' || !Array.isArray(window.links)) {
    console.error('ERRO: A variável "window.links" não está definida ou não é um array.');
    categoriesContainer.innerHTML = `
      <div style="text-align:center; padding:40px; color:#f85149; background:#161b22; border-radius:12px; border:1px solid #f85149;">
        <strong>⚠️ Erro ao carregar os links.</strong><br>
        Certifique-se de que o arquivo <code>links.js</code> está presente e contém uma variável <code>window.links</code> com um array de URLs.
      </div>
    `;
    return;
  }

  console.log(`✅ ${window.links.length} links carregados.`);

  // ---- Restante do código usa window.links ----
  // ... (todo o resto igual, mas troque "links" por "window.links" nas chamadas)

  // No processLinks, use window.links
  function processLinks(rawLinks) { ... } // rawLinks será window.links

  // No init, chame processLinks(window.links)
  function init() {
    const groups = processLinks(window.links);
    render(groups, '');
    // ...
  }
})();
