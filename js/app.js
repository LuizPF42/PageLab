/*
 * Construtor do site pessoal: aparência, importação do Lattes e escolha do conteúdo.
 * Tudo roda no navegador; o progresso fica salvo no localStorage de quem usa.
 */
(function () {
  'use strict';

  const CHAVE = 'construtor-site:v1';
  const MAX_DESTAQUES = 5;
  // Sugestões de tipo para os destaques fora do Lattes (a pessoa pode escrever outro).
  const TIPOS_LIVRES = ['Software', 'Projeto', 'Site', 'Prêmio', 'Curso', 'Podcast', 'Base de dados', 'Grupo de pesquisa'];
  const ITENS_VISIVEIS = 8;
  const LARGURA_PREVIA = 1000; // a prévia é desenhada nesta largura e reduzida para caber na coluna
  const ALTURA_PREVIA = 1300;

  const ETAPAS = [
    { id: 'aparencia', nome: 'Aparência', pronta: true },
    { id: 'lattes', nome: 'Lattes', pronta: true },
    { id: 'conteudo', nome: 'Conteúdo', pronta: true },
    { id: 'revisao', nome: 'Revisão', pronta: true },
    { id: 'publicar', nome: 'Publicar', pronta: true },
  ];

  const DISPOSITIVOS = [
    { nome: 'Celular', largura: 390 },
    { nome: 'Tablet', largura: 768 },
    { nome: 'Computador', largura: 1280 },
  ];
  const LARGURA_MIN = 320;
  const LARGURA_MAX = 1920;
  const BASE_FONTES = new URL('fonts/', location.href).href;

  const LINKS = [
    { id: 'email', nome: 'E-mail', tipo: 'email', exemplo: 'voce@exemplo.com' },
    { id: 'lattes', nome: 'Currículo Lattes', tipo: 'url', exemplo: 'http://lattes.cnpq.br/…' },
    { id: 'orcid', nome: 'ORCID', tipo: 'url', exemplo: 'https://orcid.org/…' },
    { id: 'scholar', nome: 'Google Acadêmico', tipo: 'url', exemplo: 'https://scholar.google.com/…' },
    { id: 'linkedin', nome: 'LinkedIn', tipo: 'url', exemplo: 'https://www.linkedin.com/in/…' },
  ];

  // Seções que já entram marcadas; as demais ficam para a pessoa escolher.
  const SECOES_LIGADAS = /^(FormacaoAcademicaTitulacao|FormacaoAcademicaPosDoutorado|AtuacaoProfissional|ProjetosPesquisa|PremiosTitulos)$/;
  const PRODUCOES_LIGADAS = /artigo|livro|cap[ií]tulo/i;

  const app = document.getElementById('app');
  // temaPrevia: a prévia mostra o site no claro ou no escuro (só faz diferença no modo automático).
  const ui = { erro: '', editando: null, expandidas: new Set(), largura: 1280, temaPrevia: 'claro' };
  let estado = carregar() || novoEstado();

  // ---------- estado ----------

  function novoEstado() {
    return {
      etapa: 'aparencia',
      aparencia: Tema.normalizar({}),
      fonte: null,
      semLattes: false,
      perfil: { nome: '', subtitulo: '', bio: '', bioOriginal: '', foto: '', links: {}, interesses: [], interessesEditados: false },
      secoes: [],
      avisos: [],
      publicacao: { usuario: '' },
    };
  }

  function carregar() {
    try {
      const s = localStorage.getItem(CHAVE);
      if (!s) return null;
      // Completa estados salvos por versões anteriores do construtor.
      const e = Object.assign(novoEstado(), JSON.parse(s));
      e.aparencia = Tema.normalizar(e.aparencia);
      e.perfil = Object.assign(novoEstado().perfil, e.perfil);
      e.publicacao = Object.assign(novoEstado().publicacao, e.publicacao);
      completarProducoes(e.secoes);
      // Progresso salvo antes de existirem os interesses: sugere as áreas de atuação, como numa importação.
      if (!e.perfil.interessesEditados && !e.perfil.interesses.length) e.perfil.interesses = Site.interessesPadrao(e.secoes);
      return e;
    } catch (e) {
      return null;
    }
  }

  // Produções salvas antes de o leitor separar autores, título e veículo: separa agora, a partir
  // da referência, para os destaques e as listas não mostrarem a referência crua do Lattes.
  function completarProducoes(secoes) {
    for (const s of secoes || []) {
      if (s.tipo !== 'producao') continue;
      for (const it of s.itens) {
        if (it.obra || !it.titulo) continue;
        Object.assign(it, Lattes.separarLimpa(it.titulo));
      }
    }
  }

  let timerSalvar;
  function salvar() {
    clearTimeout(timerSalvar);
    timerSalvar = setTimeout(() => {
      try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem armazenamento: segue sem salvar */ }
    }, 250);
  }

  // Importar de novo (currículo atualizado) mantém o que a pessoa já decidiu e editou.
  function aplicarLattes(dados) {
    const anteriores = new Map();
    for (const s of estado.secoes) for (const it of s.itens) anteriores.set(it.id, it);
    const reimportacao = anteriores.size > 0;
    const ocultos = new Set(estado.ocultos || []); // tirados do site antes de reabrir um index.html

    let destaques = 0;
    const secoes = dados.secoes.map(s => {
      const ligada = s.tipo === 'producao' ? PRODUCOES_LIGADAS.test(s.titulo) : SECOES_LIGADAS.test(s.id);
      return Object.assign({}, s, {
        itens: s.itens.map(it => {
          const antes = anteriores.get(it.id);
          if (antes) {
            if (antes.destaque) destaques++;
            return Object.assign({}, it, {
              titulo: antes.titulo, link: antes.link || it.link, manter: antes.manter, destaque: antes.destaque,
              dTitulo: antes.dTitulo, dVeiculo: antes.dVeiculo, dTexto: antes.dTexto, ordem: antes.ordem,
            });
          }
          if (ocultos.has(it.id)) return Object.assign({}, it, { manter: false, destaque: false });
          // As produções que o autor marcou como relevantes no Lattes já vêm como destaque.
          const destaque = !reimportacao && s.tipo === 'producao' && it.relevante && destaques < MAX_DESTAQUES;
          if (destaque) destaques++;
          return Object.assign({}, it, { manter: ligada || destaque, destaque });
        }),
      });
    });

    // Os destaques livres não vêm do Lattes: continuam como estão.
    const livres = estado.secoes.find(s => s.tipo === 'livre');
    if (livres) secoes.push(livres);
    renumerarDestaques(secoes);

    const p = estado.perfil;
    const links = Object.assign({}, p.links);
    for (const [k, v] of Object.entries(dados.perfil.links)) if (v && !links[k]) links[k] = v;
    const bioEditada = p.bio && p.bio !== p.bioOriginal;
    return Object.assign({}, estado, {
      etapa: 'conteudo',
      fonte: dados.fonte,
      perfil: Object.assign({}, p, {
        nome: p.nome || dados.perfil.nome,
        bio: bioEditada ? p.bio : dados.perfil.bio,
        bioOriginal: dados.perfil.bio,
        links,
        // Interesses: as áreas de atuação do Lattes, a menos que a pessoa já tenha mexido na lista.
        interesses: p.interessesEditados ? p.interesses : Site.interessesPadrao(secoes),
      }),
      secoes,
      ocultos: [], // já aplicados: agora todas as produções estão no estado
      avisos: dados.avisos,
    });
  }

  function totais() {
    let itens = 0;
    let destaques = 0;
    for (const s of estado.secoes) for (const it of s.itens) {
      if (it.manter && s.tipo !== 'livre') itens++;
      if (it.destaque) destaques++;
    }
    return { itens, destaques };
  }

  // ---------- telas ----------

  function render() {
    renderEtapas();
    document.body.classList.toggle('larga', estado.etapa === 'aparencia');
    document.body.classList.toggle('total', estado.etapa === 'revisao');
    app.innerHTML =
      estado.etapa === 'aparencia' ? telaAparencia() :
      estado.etapa === 'conteudo' ? telaConteudo() :
      estado.etapa === 'revisao' ? telaRevisao() :
      estado.etapa === 'publicar' ? telaPublicar() :
      telaLattes();
    if (estado.etapa === 'aparencia' || estado.etapa === 'revisao') montarPrevia();
  }

  function podeIr(id) {
    if (id === 'aparencia' || id === 'lattes') return true;
    if (id === 'conteudo' || id === 'revisao' || id === 'publicar') return !!(estado.fonte || estado.semLattes);
    return false;
  }

  function renderEtapas() {
    document.getElementById('etapas').innerHTML = '<ol>' + ETAPAS.map((et, i) => {
      const atual = et.id === estado.etapa;
      const conteudo = `<span class="num">${i + 1}</span>${et.nome}${et.pronta ? '' : ' <small>em breve</small>'}`;
      return `<li class="${atual ? 'atual' : ''}${et.pronta ? '' : ' em-breve'}"${atual ? ' aria-current="step"' : ''}>${
        !atual && et.pronta && podeIr(et.id) ? `<button type="button" data-ir="${et.id}">${conteudo}</button>` : conteudo}</li>`;
    }).join('') + '</ol>';
  }

  function irPara(etapa) {
    estado.etapa = etapa;
    ui.erro = '';
    salvar();
    render();
    window.scrollTo(0, 0);
  }

  // ---------- tela: aparência ----------

  function temConteudo() {
    return !!(estado.fonte || estado.semLattes || estado.perfil.bio);
  }

  // Bolinhas de cor de destaque: usadas na tela de aparência e nos ajustes rápidos da revisão.
  function htmlCores(ap) {
    const personalizada = !Tema.ACENTOS.some(a => a.cor === ap.acento);
    return Tema.ACENTOS.map(a => `
      <label class="opcao-cor" title="${a.nome}">
        <input type="radio" name="acento" value="${a.cor}" data-aparencia="acento" class="invisivel"${ap.acento === a.cor ? ' checked' : ''}>
        <span class="bolinha" style="background:${a.cor}"></span><span class="invisivel">${a.nome}</span>
      </label>`).join('') + `
      <label class="opcao-cor outra${personalizada ? ' selecionada' : ''}" title="Escolher outra cor">
        <input type="color" value="${esc(ap.acento)}" data-aparencia="acento-livre" class="invisivel">
        <span class="bolinha arco-iris"${personalizada ? ` style="background:${esc(ap.acento)}"` : ''}></span>
        <span>Outra cor</span>
      </label>`;
  }

  function telaAparencia() {
    const ap = estado.aparencia;
    return `
      <div class="aparencia">
        <section class="cartao controles">
          <h1>Escolha o visual do seu site</h1>
          <p class="sub">Dá para mudar depois, a qualquer momento.</p>
          ${estado.fonte ? '' : `
          <label class="campo">Seu nome
            <input data-perfil="nome" value="${esc(estado.perfil.nome)}" placeholder="Como você quer aparecer no site" autocomplete="name">
          </label>`}

          <fieldset class="grupo">
            <legend>Fundo</legend>
            <div class="opcoes-fundo">
              ${Tema.FUNDOS.map(f => `
              <label class="opcao-fundo">
                <input type="radio" name="fundo" value="${f.id}" data-aparencia="fundo" class="invisivel"${ap.fundo === f.id ? ' checked' : ''}>
                <span class="amostra" style="background:${f.fundo}"></span>${f.nome}
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>Cor de destaque</legend>
            <div class="opcoes-cor">${htmlCores(ap)}</div>
            <p class="dica" id="aviso-contraste"${acentoAjustado() ? '' : ' hidden'}>Esta cor é clara demais para textos sobre este fundo.
              Nos links e títulos, o site usa uma versão um pouco mais escura dela, para garantir a leitura.</p>
          </fieldset>

          <fieldset class="grupo">
            <legend>Estrutura</legend>
            <div class="opcoes-estrutura">
              ${Tema.ESTRUTURAS.map(e => `
              <label class="opcao-estrutura" title="${esc(e.descricao)}">
                <input type="radio" name="estrutura" value="${e.id}" data-aparencia="estrutura" class="invisivel"${ap.estrutura === e.id ? ' checked' : ''}>
                ${miniatura(e.id)}<span>${e.nome}</span>
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>Foto</legend>
            <div class="foto-aparencia">
              ${htmlFoto()}
              <div class="foto-texto">
                <p>${estado.perfil.foto ? 'Sua foto aparece na prévia ao lado.' : 'Uma foto sua, de preferência quadrada ou em retrato.'}</p>
                ${estado.perfil.foto ? '<button type="button" class="link" data-acao="remover-foto">Tirar a foto</button>' : ''}
              </div>
            </div>
            <div class="opcoes-estrutura">
              ${Tema.FOTOS.map(f => `
              <label class="opcao-estrutura">
                <input type="radio" name="foto" value="${f.id}" data-aparencia="foto" class="invisivel"${ap.foto === f.id ? ' checked' : ''}>
                ${formatoFoto(f.id)}<span>${f.nome}</span>
              </label>`).join('')}
            </div>
            <p class="dica">Na revisão, dá para arrastar o canto da foto para mudar o tamanho.</p>
          </fieldset>

          <fieldset class="grupo">
            <legend>Fontes</legend>
            <div class="opcoes-fonte">
              ${Tema.COMBINACOES.map(c => {
                const t = Tema.familia(c.titulo);
                return `
              <label class="opcao-fonte">
                <input type="radio" name="combinacao" value="${c.id}" data-aparencia="combinacao" class="invisivel"${(Tema.combinacaoAtual(ap) || {}).id === c.id ? ' checked' : ''}>
                <span class="fonte-amostra" style="font-family:${esc(Tema.pilha(c.titulo))};font-weight:${t.peso};letter-spacing:${t.espaco}">${esc(estado.perfil.nome || 'Seu Nome')}</span>
                <span class="fonte-nome" style="font-family:${esc(Tema.pilha(c.texto))}">${c.nome} · ${t.nome}${c.texto !== c.titulo ? ' + ' + Tema.familia(c.texto).nome : ''}</span>
              </label>`;
              }).join('')}
            </div>
            <div class="fontes-livres">
              <span>Ou combine como quiser:</span>
              <label>Títulos ${selectFamilias('fonteTitulo', ap.fonteTitulo, Tema.FAMILIAS)}</label>
              <label>Texto ${selectFamilias('fonteTexto', ap.fonteTexto, Tema.FAMILIAS.filter(f => !f.soTitulos))}</label>
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>Organização</legend>
            <div class="opcoes-layout">
              ${Tema.LAYOUTS.map(l => `
              <label class="opcao-layout">
                <input type="radio" name="layout" value="${l.id}" data-aparencia="layout" class="invisivel"${ap.layout === l.id ? ' checked' : ''}>
                <strong>${l.nome}</strong>
                <span>${l.descricao}</span>
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>Modo escuro</legend>
            <div class="opcoes-layout opcoes-escuro">
              ${Tema.ESCURO.map(e => `
              <label class="opcao-layout">
                <input type="radio" name="escuro" value="${e.id}" data-aparencia="escuro" class="invisivel"${ap.escuro === e.id ? ' checked' : ''}>
                <strong>${e.nome}</strong>
                <span>${e.descricao}</span>
              </label>`).join('')}
            </div>
          </fieldset>
        </section>

        <div class="previa">
          <div class="navegador"><span class="bolinhas" aria-hidden="true"><i></i><i></i><i></i></span><span class="endereco" aria-hidden="true">seu-usuario.github.io</span>${botaoTema()}</div>
          <div class="previa-moldura" id="previa-moldura">
            <iframe id="previa" title="Prévia do seu site" sandbox="allow-same-origin" tabindex="-1"></iframe>
          </div>
          <p class="dica">${temConteudo() ? 'Prévia com o seu conteúdo.' : 'Prévia com textos de exemplo. O seu conteúdo entra nas próximas etapas.'}</p>
        </div>
      </div>

      <div class="barra">
        <span class="dica">Tudo fica salvo neste navegador.</span>
        <span class="barra-acoes"><button type="button" class="botao" data-acao="continuar">Continuar</button></span>
      </div>`;
  }

  // Botão redondo de foto: mostra a atual e abre o seletor de arquivo (aparência e conteúdo).
  function htmlFoto() {
    const foto = estado.perfil.foto;
    return `
        <label class="foto" title="${foto ? 'Trocar foto' : 'Adicionar foto'}">
          <input type="file" accept="image/*" class="invisivel" data-arquivo="foto">
          ${foto ? `<img src="${esc(foto)}" alt="">` : ''}
          <span>${foto ? 'Trocar foto' : 'Adicionar foto'}</span>
        </label>`;
  }

  function selectFamilias(campo, valor, familias) {
    return `<select data-aparencia="${campo}">${familias.map(f =>
      `<option value="${f.id}"${f.id === valor ? ' selected' : ''}>${f.nome}</option>`).join('')}</select>`;
  }

  // Desenhos pequenos de cada estrutura de página, para a escolha ser visual.
  function miniatura(id) {
    const barras = (x, y, larguras) => larguras.map((l, i) => `<rect x="${x}" y="${y + i * 7}" width="${l}" height="3" rx="1.5"/>`).join('');
    const partes = {
      lateral: `<circle cx="13" cy="12" r="6" class="forte"/><rect x="6" y="22" width="14" height="3" rx="1.5" class="forte"/>${barras(6, 30, [11, 9])}${barras(28, 8, [30, 26, 30, 22, 28])}`,
      topo: `<rect x="2" y="2" width="60" height="7" rx="2" class="forte"/><rect x="8" y="15" width="16" height="11" rx="2" class="forte"/>${barras(8, 30, [16, 12])}<rect x="30" y="14" width="1" height="26"/>${barras(35, 15, [24, 20, 24, 16])}`,
      central: `<circle cx="32" cy="10" r="6" class="forte"/><rect x="20" y="19" width="24" height="3" rx="1.5" class="forte"/>${barras(12, 27, [40, 36, 40])}`,
    };
    return `<svg class="miniatura" viewBox="0 0 64 44" aria-hidden="true">${partes[id]}</svg>`;
  }

  function formatoFoto(id) {
    const forma = {
      redonda: '<circle cx="32" cy="22" r="15"/>',
      retangular: '<rect x="10" y="9" width="44" height="28" rx="3"/>',
    }[id];
    return `<svg class="miniatura" viewBox="0 0 64 44" aria-hidden="true"><g class="forte">${forma}</g></svg>`;
  }

  // Só avisa quando o escurecimento é visível; ajustes mínimos passam em silêncio.
  function acentoAjustado() {
    const v = Tema.variaveis(estado.aparencia);
    return Tema.contraste(v['--acento'], v['--fundo']) < 4;
  }

  // A prévia é carregada de um Blob, e não de srcdoc: num srcdoc, o link "#producao" das
  // abas aponta para o endereço do construtor e tiraria a prévia do lugar.
  let urlPrevia = null;
  function montarPrevia() {
    const iframe = document.getElementById('previa');
    if (!iframe) return;
    const d = temConteudo() ? Site.dados(estado) : Site.exemplo(estado.perfil);
    if (urlPrevia) URL.revokeObjectURL(urlPrevia);
    urlPrevia = URL.createObjectURL(new Blob([Site.html(d, estado.aparencia, { previa: true, baseFontes: BASE_FONTES })], { type: 'text/html' }));
    iframe.onload = () => {
      prepararFoto();
      atualizarCores();
      // Trocar de aba na prévia faz o navegador rolar também a página do construtor; desfaz isso.
      let y = 0;
      iframe.contentDocument.addEventListener('click', () => { y = window.scrollY; }, true);
      iframe.contentWindow.addEventListener('hashchange', () => window.scrollTo(window.scrollX, y));
    };
    iframe.src = urlPrevia;
    ajustar();
  }

  function ajustar() {
    if (estado.etapa === 'revisao') ajustarRevisao();
    else ajustarEscala();
  }

  // Troca de cor, fonte ou modo escuro: só refaz o bloco de variáveis CSS da prévia, sem recarregá-la.
  function atualizarCores() {
    const iframe = document.getElementById('previa');
    const doc = iframe && iframe.contentDocument;
    if (!doc || !doc.documentElement) return;
    const estilo = doc.getElementById('tema');
    if (estilo) estilo.textContent = Tema.css(estado.aparencia);
    doc.documentElement.dataset.tema = ui.temaPrevia;
    posicionarAlcaFoto();
  }

  // Botão que alterna a prévia entre claro e escuro; só aparece no modo automático.
  function botaoTema() {
    const escuro = ui.temaPrevia === 'escuro';
    return `<button type="button" class="botao-tema" data-acao="tema-previa" aria-pressed="${escuro}"${estado.aparencia.escuro === 'automatico' ? '' : ' hidden'}>${escuro ? '☀ Ver no claro' : '☾ Ver no escuro'}</button>`;
  }

  function atualizarBotaoTema() {
    app.querySelectorAll('[data-acao="tema-previa"]').forEach(b => {
      const escuro = ui.temaPrevia === 'escuro';
      b.hidden = estado.aparencia.escuro !== 'automatico';
      b.setAttribute('aria-pressed', String(escuro));
      b.textContent = escuro ? '☀ Ver no claro' : '☾ Ver no escuro';
    });
  }

  function atualizarAparencia() {
    atualizarCores();
    atualizarBotaoTema();
    const aviso = document.getElementById('aviso-contraste');
    if (aviso) aviso.hidden = !acentoAjustado();
    const personalizada = !Tema.ACENTOS.some(a => a.cor === estado.aparencia.acento);
    const outra = app.querySelector('.opcao-cor.outra');
    if (outra) {
      outra.classList.toggle('selecionada', personalizada);
      outra.querySelector('.bolinha').style.background = personalizada ? estado.aparencia.acento : '';
    }
    if (personalizada) app.querySelectorAll('input[name="acento"]').forEach(r => { r.checked = false; });

    // Fontes: a combinação pronta marcada e as listas de títulos e texto andam juntas.
    const ap = estado.aparencia;
    const combinacao = Tema.combinacaoAtual(ap);
    app.querySelectorAll('input[name="combinacao"]').forEach(r => { r.checked = !!combinacao && r.value === combinacao.id; });
    const selTitulo = app.querySelector('select[data-aparencia="fonteTitulo"]');
    const selTexto = app.querySelector('select[data-aparencia="fonteTexto"]');
    if (selTitulo) selTitulo.value = ap.fonteTitulo;
    if (selTexto) selTexto.value = ap.fonteTexto;
    const selCombinacao = app.querySelector('select[data-aparencia="combinacao"]');
    if (selCombinacao) selCombinacao.value = combinacao ? combinacao.id : '';
  }

  // No celular, a prévia mostra o site na versão de celular e ocupa menos altura,
  // para os controles logo abaixo continuarem ao alcance.
  function ajustarEscala() {
    const moldura = document.getElementById('previa-moldura');
    const iframe = document.getElementById('previa');
    if (!moldura || !iframe) return;
    const estreito = moldura.clientWidth < 560;
    const largura = estreito ? 400 : LARGURA_PREVIA;
    const k = moldura.clientWidth / largura;
    const alturaMax = estreito ? window.innerHeight * 0.45 : window.innerHeight - 190;
    const altura = Math.min(ALTURA_PREVIA * k, Math.max(260, alturaMax));
    iframe.style.width = largura + 'px';
    iframe.style.height = altura / k + 'px';
    iframe.style.transform = `scale(${k})`;
    moldura.style.height = altura + 'px';
  }

  // ---------- tela: revisão ----------

  function telaRevisao() {
    const ap = estado.aparencia;
    return `
      <div class="revisao-barra">
        <div class="dispositivos" role="group" aria-label="Tamanho da tela">
          ${DISPOSITIVOS.map(d => `<button type="button" data-acao="largura" data-largura="${d.largura}" aria-pressed="${ui.largura === d.largura}">${d.nome}</button>`).join('')}
          <span class="largura-atual" id="largura-atual"></span>
          ${botaoTema()}
        </div>
        <div class="ajustes-rapidos">
          <span class="ajuste" role="radiogroup" aria-label="Fundo">Fundo
            ${Tema.FUNDOS.map(f => `
            <label class="opcao-cor" title="${f.nome}">
              <input type="radio" name="fundo" value="${f.id}" data-aparencia="fundo" class="invisivel"${ap.fundo === f.id ? ' checked' : ''}>
              <span class="bolinha" style="background:${f.fundo}"></span><span class="invisivel">${f.nome}</span>
            </label>`).join('')}
          </span>
          <span class="ajuste ajuste-cores" role="radiogroup" aria-label="Cor de destaque">Cor ${htmlCores(ap)}</span>
          <label class="ajuste">Fonte
            <select data-aparencia="combinacao">
              ${Tema.COMBINACOES.map(c => `<option value="${c.id}"${(Tema.combinacaoAtual(ap) || {}).id === c.id ? ' selected' : ''}>${c.nome}</option>`).join('')}
              <option value="" disabled${Tema.combinacaoAtual(ap) ? '' : ' selected'}>Personalizada</option>
            </select>
          </label>
          <label class="ajuste">Estrutura
            <select data-aparencia="estrutura">${Tema.ESTRUTURAS.map(e => `<option value="${e.id}"${ap.estrutura === e.id ? ' selected' : ''}>${e.nome}</option>`).join('')}</select>
          </label>
          <label class="ajuste">Foto
            <select data-aparencia="foto">${Tema.FOTOS.map(f => `<option value="${f.id}"${ap.foto === f.id ? ' selected' : ''}>${f.nome}</option>`).join('')}</select>
          </label>
          ${estado.perfil.foto ? `
          <span class="ajuste">
            <label for="tamanho-foto">Tamanho</label>
            <input type="range" id="tamanho-foto" data-foto-tamanho min="${Tema.FOTO_LARGURA[0]}" max="480" step="2" value="${ap.fotoLargura || 160}">
            <button type="button" class="link" data-acao="foto-padrao" title="Voltar ao tamanho padrão" aria-label="Voltar ao tamanho padrão da foto">↺</button>
          </span>` : ''}
          <label class="ajuste">Organização
            <select data-aparencia="layout">${Tema.LAYOUTS.map(l => `<option value="${l.id}"${ap.layout === l.id ? ' selected' : ''}>${l.nome}</option>`).join('')}</select>
          </label>
          <label class="ajuste">Referências
            <select data-aparencia="referencias">${Tema.REFERENCIAS.map(r => `<option value="${r.id}"${ap.referencias === r.id ? ' selected' : ''}>${r.nome}</option>`).join('')}</select>
          </label>
          <label class="ajuste">Texto
            <select data-aparencia="alinhamento">${Tema.ALINHAMENTOS.map(a => `<option value="${a.id}"${ap.alinhamento === a.id ? ' selected' : ''}>${a.nome}</option>`).join('')}</select>
          </label>
          <label class="ajuste">Modo escuro
            <select data-aparencia="escuro">${Tema.ESCURO.map(e => `<option value="${e.id}"${ap.escuro === e.id ? ' selected' : ''}>${e.nome}</option>`).join('')}</select>
          </label>
        </div>
      </div>

      <div class="palco" id="palco">
        <div class="quadro">
          <div class="moldura-revisao" id="previa-moldura">
            <iframe id="previa" title="Prévia do seu site" sandbox="allow-same-origin"></iframe>
          </div>
          <div class="alca" id="alca" tabindex="0" role="slider" aria-label="Largura da prévia"
            aria-valuemin="${LARGURA_MIN}" aria-valuemax="${LARGURA_MAX}" aria-valuenow="${ui.largura}" title="Arraste para mudar a largura"></div>
        </div>
      </div>

      <div class="barra">
        <span class="barra-acoes">
          <button type="button" class="link" data-acao="voltar-conteudo">Voltar ao conteúdo</button>
          <button type="button" class="link" data-acao="abrir-site">Abrir numa aba nova</button>
        </span>
        <span class="barra-acoes">
          <button type="button" class="botao" data-acao="continuar">Publicar</button>
        </span>
      </div>`;
  }

  // Mostra o site na largura escolhida; se não couber na tela, reduz (como o modo responsivo do navegador).
  let escalaRevisao = 1;
  function ajustarRevisao() {
    const palco = document.getElementById('palco');
    const moldura = document.getElementById('previa-moldura');
    const iframe = document.getElementById('previa');
    if (!palco || !moldura || !iframe) return;
    const largura = ui.largura;
    const k = Math.min(1, (palco.clientWidth - 40) / largura); // 40: espaço da alça
    const topo = palco.getBoundingClientRect().top + window.scrollY;
    const altura = Math.max(320, window.innerHeight - topo - 90);
    escalaRevisao = k;
    iframe.style.width = largura + 'px';
    iframe.style.height = altura / k + 'px';
    iframe.style.transform = `scale(${k})`;
    moldura.style.width = largura * k + 'px';
    moldura.style.height = altura + 'px';

    document.getElementById('largura-atual').textContent = `${largura} px${k < 1 ? ` · reduzido a ${Math.round(k * 100)}%` : ''}`;
    document.getElementById('alca').setAttribute('aria-valuenow', largura);
    app.querySelectorAll('[data-largura]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.largura) === largura)));
  }

  function mudarLargura(largura) {
    ui.largura = Math.round(Math.min(LARGURA_MAX, Math.max(LARGURA_MIN, largura)));
    ajustarRevisao();
  }

  // ---------- redimensionar a foto na revisão ----------
  // Na prévia da revisão, a foto ganha uma alça no canto: arrastar muda o diâmetro (circular)
  // ou a largura e a altura (retangular). A alça só existe na prévia, nunca no site publicado.

  let posicionarAlcaFoto = () => {};

  function prepararFoto() {
    posicionarAlcaFoto = () => {};
    const iframe = document.getElementById('previa');
    const doc = iframe && iframe.contentDocument;
    const foto = doc && doc.querySelector('.foto');
    if (estado.etapa !== 'revisao' || !foto) return;
    const janela = doc.defaultView;

    const estilo = doc.createElement('style');
    estilo.textContent = `
      .alca-foto{position:absolute;z-index:10;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid var(--acento);border-radius:5px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:nwse-resize;touch-action:none}
      .foto{outline:2px dashed transparent;outline-offset:4px;transition:outline-color .15s}
      .foto:hover,.redimensionando-foto .foto{outline-color:var(--acento)}
      .redimensionando-foto,.redimensionando-foto *{cursor:nwse-resize!important;user-select:none}`;
    doc.head.appendChild(estilo);
    const alca = doc.createElement('span');
    alca.className = 'alca-foto';
    alca.title = 'Arraste para mudar o tamanho da foto';
    doc.body.appendChild(alca);

    posicionarAlcaFoto = () => {
      const r = foto.getBoundingClientRect();
      alca.hidden = !foto.offsetParent; // foto numa aba escondida
      alca.style.left = r.right + janela.scrollX + 'px';
      alca.style.top = r.bottom + janela.scrollY + 'px';
      const controle = document.getElementById('tamanho-foto');
      if (controle && r.width) controle.value = estado.aparencia.fotoLargura || Math.round(r.width);
    };
    janela.addEventListener('resize', posicionarAlcaFoto);
    janela.addEventListener('hashchange', posicionarAlcaFoto);
    doc.fonts.ready.then(posicionarAlcaFoto);
    foto.decode().then(posicionarAlcaFoto, posicionarAlcaFoto);

    let inicio = null;
    alca.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { alca.setPointerCapture(e.pointerId); } catch (err) { /* segue sem captura */ }
      const r = foto.getBoundingClientRect();
      inicio = { x: e.clientX, y: e.clientY, w: r.width, h: r.height };
      doc.documentElement.classList.add('redimensionando-foto');
    });
    alca.addEventListener('pointermove', e => {
      if (!inicio) return;
      const ap = estado.aparencia;
      const [min, max] = Tema.FOTO_LARGURA;
      const w = Math.min(max, Math.max(min, inicio.w + e.clientX - inicio.x));
      ap.fotoLargura = Math.round(w);
      if (ap.foto === 'retangular') {
        const h = Math.max(40, inicio.h + e.clientY - inicio.y);
        ap.fotoProporcao = Math.min(2.5, Math.max(0.4, Math.round((w / h) * 100) / 100));
      }
      atualizarCores();
    });
    const soltar = () => {
      if (!inicio) return;
      inicio = null;
      doc.documentElement.classList.remove('redimensionando-foto');
      salvar();
    };
    alca.addEventListener('pointerup', soltar);
    alca.addEventListener('pointercancel', soltar);
  }

  // Alça de redimensionar: o quadro fica centralizado, então cada pixel arrastado vale por dois.
  let arrasto = null;
  app.addEventListener('pointerdown', e => {
    const alca = e.target.closest('#alca');
    if (!alca) return;
    e.preventDefault();
    alca.setPointerCapture(e.pointerId);
    arrasto = { x: e.clientX, largura: ui.largura, k: escalaRevisao };
    document.body.classList.add('redimensionando');
  });
  app.addEventListener('pointermove', e => {
    if (arrasto) mudarLargura(arrasto.largura + (2 * (e.clientX - arrasto.x)) / arrasto.k);
  });
  app.addEventListener('pointerup', () => {
    arrasto = null;
    document.body.classList.remove('redimensionando');
  });

  // ---------- tela: publicar ----------

  const USUARIO_VALIDO = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i; // regra de nomes do GitHub

  function usuarioAtual() {
    const u = (estado.publicacao.usuario || '').trim().toLowerCase();
    return USUARIO_VALIDO.test(u) ? u : '';
  }

  // Troca {u} pelo usuário do GitHub (ou por "seu-usuario" enquanto não foi preenchido).
  function comUsuario(modelo) {
    return String(modelo || '').replace(/\{u\}/g, usuarioAtual() || 'seu-usuario');
  }

  function telaPublicar() {
    const link = (modelo, conteudo, classe) =>
      `<a class="${classe}" data-href="${modelo}" href="${esc(comUsuario(modelo))}" target="_blank" rel="noopener">${conteudo}</a>`;
    const trecho = modelo => `<span data-texto="${modelo}">${esc(comUsuario(modelo))}</span>`;
    return `
      <section class="cartao">
        <h1>Publicar seu site</h1>
        <p class="sub">O site inteiro é um arquivo só, o <code>index.html</code>. Você baixa aqui e envia para o GitHub, que publica de graça.</p>
        <ol class="passos-publicar">
          <li class="passo">
            <span class="passo-num">1</span>
            <h2>Baixe o seu site</h2>
            <p><button type="button" class="botao" data-acao="baixar">Baixar index.html</button>
              <span id="estado-download" class="dica" role="status"></span></p>
            <p class="dica">O nome precisa ser exatamente <code>index.html</code>. Se o navegador salvar como “index (1).html”, renomeie antes de enviar.</p>
          </li>
          <li class="passo">
            <span class="passo-num">2</span>
            <h2>Seu usuário no GitHub</h2>
            <p>Ainda não tem conta? <a href="https://github.com/signup" target="_blank" rel="noopener">Crie uma de graça</a> e volte aqui.</p>
            <label class="campo-usuario">Nome de usuário
              <input data-publicar="usuario" value="${esc(estado.publicacao.usuario)}" placeholder="seu-usuario" autocomplete="off" spellcheck="false">
            </label>
            <p class="dica" id="aviso-usuario"${estado.publicacao.usuario && !usuarioAtual() ? '' : ' hidden'}>Use o nome exato da sua conta: só letras, números e hífen.</p>
            <p>Seu site vai ficar em <strong>https://${trecho('{u}')}.github.io</strong></p>
          </li>
          <li class="passo">
            <span class="passo-num">3</span>
            <h2>Crie o repositório <small>(só na primeira vez)</small></h2>
            <p>O nome do repositório precisa ser exatamente
              <code class="repo">${trecho('{u}.github.io')}</code>
              <button type="button" class="link" data-acao="copiar" data-copiar="{u}.github.io">Copiar</button></p>
            <p>${link('https://github.com/new?name={u}.github.io&visibility=public', 'Criar o repositório no GitHub ↗', 'botao-secundario')}</p>
            <p class="dica">Deixe como <strong>Public</strong> e clique em <strong>Create repository</strong>. Não precisa marcar mais nada.</p>
          </li>
          <li class="passo">
            <span class="passo-num">4</span>
            <h2>Envie o arquivo</h2>
            <p>${link('https://github.com/{u}/{u}.github.io/upload/main', 'Abrir a página de envio ↗', 'botao-secundario')}</p>
            <p>Arraste o <code>index.html</code> para a página, desça até o fim e clique em <strong>Commit changes</strong>.</p>
            <p class="dica">No repositório recém-criado, se a página de envio não abrir, entre nele e clique em “uploading an existing file”.</p>
          </li>
          <li class="passo">
            <span class="passo-num">5</span>
            <h2>Pronto!</h2>
            <p>Em um ou dois minutos o site aparece em ${link('https://{u}.github.io', trecho('https://{u}.github.io'), 'link-site')}.
              Até lá, o endereço pode mostrar “404”: é o GitHub terminando de publicar.</p>
          </li>
        </ol>
      </section>

      <section class="cartao">
        <h2>Para atualizar depois</h2>
        <p>Neste navegador, tudo fica salvo: volte aqui, ajuste, baixe de novo e repita o passo 4. O arquivo novo substitui o antigo.</p>
        <p>Em outro computador, traga o <code>index.html</code> do seu site na etapa Lattes: ele guarda as suas escolhas para você continuar de onde parou.</p>
      </section>

      <div class="barra">
        <span class="barra-acoes"><button type="button" class="link" data-acao="voltar-revisao">Voltar à revisão</button></span>
        <span></span>
      </div>`;
  }

  function atualizarUsuario() {
    app.querySelectorAll('[data-href]').forEach(a => { a.href = comUsuario(a.dataset.href); });
    app.querySelectorAll('[data-texto]').forEach(s => { s.textContent = comUsuario(s.dataset.texto); });
    const aviso = document.getElementById('aviso-usuario');
    if (aviso) aviso.hidden = !estado.publicacao.usuario || !!usuarioAtual();
  }

  // O que vai dentro do index.html para reabrir o site no construtor depois (em outro computador,
  // por exemplo). Só o que está no site: as produções não escolhidas voltam reimportando o Lattes.
  function dadosParaReabrir() {
    const p = estado.perfil;
    return {
      construtor: 'site-pessoal',
      versao: 1,
      aparencia: estado.aparencia,
      fonte: estado.fonte,
      perfil: { nome: p.nome, subtitulo: p.subtitulo, bio: p.bio, links: p.links, interesses: p.interesses, interessesEditados: p.interessesEditados },
      publicacao: { usuario: usuarioAtual() },
      secoes: estado.secoes
        .map(s => ({ id: s.id, titulo: s.titulo, tipo: s.tipo, itens: s.itens.filter(i => i.manter) }))
        .filter(s => s.itens.length),
      // Só os códigos do que a pessoa tirou do site, para continuar de fora ao reimportar o Lattes.
      ocultos: estado.secoes.flatMap(s => s.itens.filter(i => !i.manter).map(i => i.id)),
    };
  }

  async function gerarArquivoFinal() {
    const fontesCss = await Tema.cssFontesEmbutidas(estado.aparencia, BASE_FONTES);
    return Site.html(Site.dados(estado), estado.aparencia, { fontesCss, dadosConstrutor: dadosParaReabrir() });
  }

  // No Chrome e no Edge, a janela "Salvar como" já vem com o nome index.html (e sobrescreve o antigo),
  // o que evita o "index (1).html". Nos outros navegadores, é um download comum.
  async function baixarSite(botao) {
    const aviso = document.getElementById('estado-download');
    let destino = null;
    botao.disabled = true;
    try {
      if (window.showSaveFilePicker) {
        try {
          destino = await window.showSaveFilePicker({
            suggestedName: 'index.html',
            types: [{ description: 'Página do site', accept: { 'text/html': ['.html'] } }],
          });
        } catch (e) {
          if (e.name === 'AbortError') return; // a pessoa cancelou
          destino = null;
        }
      }
      aviso.textContent = 'Gerando o arquivo…';
      const blob = new Blob([await gerarArquivoFinal()], { type: 'text/html' });
      if (destino) {
        const escrita = await destino.createWritable();
        await escrita.write(blob);
        await escrita.close();
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      }
      const kb = Math.round(blob.size / 1024);
      aviso.textContent = destino ? `Pronto: index.html salvo (${kb} KB).` : `Pronto: index.html baixado (${kb} KB). Confira se o nome ficou index.html.`;
    } catch (e) {
      console.error(e);
      aviso.textContent = 'Não consegui gerar o arquivo. ' + e.message;
    } finally {
      botao.disabled = false;
    }
  }

  // Um index.html feito pelo construtor, trazido de volta para continuar editando.
  function reabrirSite(texto) {
    const doc = new DOMParser().parseFromString(texto, 'text/html');
    let dados = null;
    try { dados = JSON.parse(doc.getElementById('dados-do-construtor').textContent); } catch (e) { /* segue para o erro abaixo */ }
    if (!dados || dados.construtor !== 'site-pessoal' || !Array.isArray(dados.secoes)) {
      throw Object.assign(new Error('Não consegui ler as escolhas guardadas neste index.html.'), { amigavel: true });
    }
    const img = doc.querySelector('img.foto');
    const src = img ? img.getAttribute('src') || '' : '';
    const p = dados.perfil || {};
    const base = novoEstado();
    estado = Object.assign(base, {
      etapa: 'conteudo',
      aparencia: Tema.normalizar(dados.aparencia),
      fonte: dados.fonte || null,
      semLattes: !dados.fonte,
      perfil: Object.assign(base.perfil, {
        nome: String(p.nome || ''),
        subtitulo: String(p.subtitulo || ''),
        bio: String(p.bio || ''),
        links: Object.assign({}, p.links),
        foto: /^data:image\/(png|jpe?g|webp|gif);base64,/.test(src) ? src : '', // a foto vem da própria página
      }),
      secoes: (completarProducoes(dados.secoes), dados.secoes),
      ocultos: Array.isArray(dados.ocultos) ? dados.ocultos.map(String) : [],
      publicacao: Object.assign(base.publicacao, dados.publicacao),
      avisos: dados.fonte ? ['Site reaberto a partir do index.html, que guarda só o que estava publicado. Para ver de novo todas as produções do Lattes, use “Usar outro arquivo” e traga a página do Lattes: suas escolhas continuam.'] : [],
    });
  }

  function telaLattes() {
    return `
      <section class="cartao">
        <h1>Traga seu currículo Lattes</h1>
        <p class="sub">O construtor lê a página pública do seu currículo e monta a base do site. Na próxima tela, você escolhe o que entra.</p>
        <ol class="passos">
          <li>Abra seu currículo na <a href="https://buscatextual.cnpq.br/buscatextual/busca.do" target="_blank" rel="noopener">busca do Lattes</a> e resolva o “Não sou um robô”.</li>
          <li>Com o currículo aberto, aperte <kbd>Ctrl</kbd> + <kbd>S</kbd> (no Mac, <kbd>⌘</kbd> + <kbd>S</kbd>) e salve. No Safari, escolha o formato <em>Código-fonte da página</em>.</li>
          <li>Traga para cá o arquivo <code>.html</code> que foi salvo. A pasta que o navegador cria junto não é necessária.</li>
        </ol>
        <label class="soltar" id="soltar">
          <input type="file" accept=".html,.htm,text/html" class="invisivel" data-arquivo="lattes">
          <strong>Arraste o arquivo aqui</strong>
          <span>ou clique para escolher</span>
        </label>
        <p class="erro" role="alert"${ui.erro ? '' : ' hidden'}>${esc(ui.erro)}</p>
        <p class="privacidade">O arquivo é lido no seu navegador e não sai do seu computador.</p>
        <p class="dica">Já fez seu site aqui e quer continuar editando em outro computador? Traga o <code>index.html</code> do seu site do mesmo jeito.</p>
        <p class="alternativa">${estado.fonte
          ? '<button type="button" class="link" data-acao="voltar-conteudo">Voltar para o conteúdo, sem trocar o arquivo</button>'
          : '<button type="button" class="link" data-acao="sem-lattes">Não tenho Lattes, prefiro preencher à mão</button>'}</p>
      </section>`;
  }

  function telaConteudo() {
    const p = estado.perfil;
    const f = estado.fonte;
    const primeiraProducao = estado.secoes.findIndex(s => s.tipo === 'producao');
    return `
      ${f ? `<p class="origem">Dados do Lattes${f.atualizadoEm ? ` atualizado em ${esc(f.atualizadoEm)}` : ''}.
        <button type="button" class="link" data-acao="trocar-lattes">Usar outro arquivo</button></p>` : ''}
      ${estado.avisos.length ? `<div class="aviso">${estado.avisos.map(a => `<p>${esc(a)}</p>`).join('')}</div>` : ''}

      <section class="cartao perfil">
        ${htmlFoto()}
        <div class="campo-nome">
          <label for="nome">Nome</label>
          <input id="nome" data-perfil="nome" value="${esc(p.nome)}" autocomplete="name">
          <label for="subtitulo">Linha abaixo do nome</label>
          <input id="subtitulo" data-perfil="subtitulo" value="${esc(p.subtitulo)}"
            placeholder="${esc(Site.subtituloPadrao(estado) || 'Ex.: Professora na Universidade X')}">
        </div>
      </section>

      <section class="cartao">
        <h2 id="rotulo-bio">Sobre você</h2>
        <p class="dica">${f ? 'Este é o resumo do seu Lattes, mas aqui o texto é seu: reescreva à vontade.' : 'Conte quem você é e com o que trabalha.'}
          Num site pessoal, a primeira pessoa costuma funcionar melhor: “Sou doutorando em…”, “Pesquiso…”.
          Para transformar um trecho em link, selecione e clique com o botão direito.</p>
        <div id="bio" class="editor-bio" contenteditable="true" role="textbox" aria-multiline="true"
          aria-labelledby="rotulo-bio" spellcheck="true">${htmlEditorBio(p.bio)}</div>
        <div class="rodape-campo">
          <span id="contador">${Site.textoPuro(p.bio).length} caracteres</span>
          <span class="barra-acoes">
            <button type="button" class="link" data-acao="inserir-link" title="Selecione um trecho e clique aqui (ou Ctrl+K)">Inserir link</button>
            <button type="button" class="link" data-acao="restaurar-bio" id="restaurar-bio"${podeRestaurarBio() ? '' : ' hidden'}>Voltar ao texto do Lattes</button>
          </span>
        </div>
      </section>

      <section class="cartao">
        <h2 id="rotulo-interesses">Interesses</h2>
        <p class="dica">Três a seis temas, separados por vírgula. Aparecem no início do site, ao lado da sua formação.${f ? ' Vieram das áreas de atuação do seu Lattes.' : ''}</p>
        <input data-perfil="interesses" aria-labelledby="rotulo-interesses" value="${esc((p.interesses || []).join(', '))}"
          placeholder="Ex.: Direito e Desenvolvimento, Regulação, Métodos empíricos">
      </section>

      <section class="cartao">
        <h2>Links</h2>
        <div class="grade-links">
          ${LINKS.map(l => `<label>${l.nome}
            <input type="${l.tipo}" data-link="${l.id}" value="${esc(p.links[l.id] || '')}" placeholder="${esc(l.exemplo)}"></label>`).join('')}
        </div>
      </section>

      ${telaDestaques()}
      <datalist id="tipos-livres">${TIPOS_LIVRES.map(t => `<option value="${t}">`).join('')}</datalist>

      ${estado.secoes.map((s, si) => (s.tipo === 'livre' ? '' : (si === primeiraProducao ? telaDicaDestaques() : '') + telaSecao(s, si))).join('')}

      <div class="barra">
        <span>
          <span id="resumo-selecao">${resumoSelecao()}</span>
          <span id="aviso-barra" class="aviso-barra" role="status"></span>
        </span>
        <span class="barra-acoes">
          <button type="button" class="link" data-acao="recomecar">Começar de novo</button>
          <button type="button" class="botao" data-acao="continuar">Revisar o site</button>
        </span>
      </div>`;
  }

  // ---------- destaques ----------
  // Cartões no topo do site. Cada destaque tem título, veículo, uma frase escrita pela pessoa e link;
  // os campos d* guardam o que ela editou (sem edição, o site usa o que veio do Lattes).

  function destaquesOrdenados(secoes = estado.secoes) {
    const lista = [];
    secoes.forEach((s, si) => s.itens.forEach((it, ii) => { if (it.destaque) lista.push({ si, ii, it }); }));
    const ordem = x => (typeof x.it.ordem === 'number' ? x.it.ordem : 1e9);
    return lista.sort((a, b) => ordem(a) - ordem(b) || (b.it.periodo || '').localeCompare(a.it.periodo || ''));
  }

  function renumerarDestaques(secoes = estado.secoes) {
    destaquesOrdenados(secoes).forEach(({ it }, n) => { it.ordem = n; });
  }

  function telaDestaques() {
    const lista = destaquesOrdenados();
    return `
      <section class="cartao" id="cartao-destaques">
        <h2>Destaques</h2>
        <p class="dica">Aparecem em cartões no topo do site, nesta ordem. O título e onde saiu vêm do Lattes: ajuste se precisar
          e escreva uma frase sobre cada um, dizendo do que trata, o que mostra ou por que importa.</p>
        ${lista.length
          ? `<ol class="lista-destaques">${lista.map((x, n) => editorDestaque(x, n, lista.length)).join('')}</ol>`
          : `<p class="vazio">Nenhum destaque ainda. Marque com ★ até ${MAX_DESTAQUES} produções nas listas abaixo.</p>`}
        <p class="rodape-campo">
          <span>Algo que não está no Lattes? Um software, um site, um projeto, um prêmio.</span>
          <button type="button" class="link" data-acao="novo-destaque-livre">+ Adicionar destaque livre</button>
        </p>
      </section>`;
  }

  // Seção virtual que guarda os destaques fora do Lattes; fica no fim de estado.secoes.
  function secaoLivres(criar) {
    let s = estado.secoes.find(x => x.tipo === 'livre');
    if (!s && criar) {
      s = { id: 'Livres', titulo: 'Destaques livres', tipo: 'livre', itens: [] };
      estado.secoes.push(s);
    }
    return s;
  }

  function editorDestaque({ si, ii, it }, n, total) {
    const c = Site.camposDestaque(it);
    const chave = `${si}:${ii}`;
    const livre = estado.secoes[si].tipo === 'livre';
    const tipo = livre ? 'Fora do Lattes' : [Site.tipoDe(estado.secoes[si].titulo), it.periodo].filter(Boolean).join(' · ');
    return `
      <li class="editor-destaque${livre ? ' livre' : ''}" data-destaque="${chave}">
        <div class="editor-destaque-topo">
          <span class="editor-destaque-tipo">${n + 1}. ${esc(tipo)}</span>
          <span class="item-acoes">
            <button type="button" class="icone" data-acao="subir-destaque" data-item="${chave}"${n === 0 ? ' disabled' : ''} title="Mover para cima" aria-label="Mover para cima">↑</button>
            <button type="button" class="icone" data-acao="descer-destaque" data-item="${chave}"${n === total - 1 ? ' disabled' : ''} title="Mover para baixo" aria-label="Mover para baixo">↓</button>
            <button type="button" class="icone" data-acao="destaque" data-item="${chave}" title="${livre ? 'Excluir' : 'Tirar dos destaques'}" aria-label="${livre ? 'Excluir este destaque' : 'Tirar dos destaques'}">✕</button>
          </span>
        </div>
        ${livre ? `
        <label>Tipo <input data-destaque-campo="categoria" value="${esc(it.categoria || '')}" placeholder="Software, projeto, prêmio…" list="tipos-livres"></label>
        <label>Ano <input data-destaque-campo="periodo" value="${esc(it.periodo || '')}" placeholder="2025" inputmode="numeric" maxlength="11"></label>` : ''}
        <label class="campo-largo">Título <input data-destaque-campo="dTitulo" value="${esc(c.titulo)}" placeholder="${livre ? 'Nome do software, do projeto…' : 'Título da obra'}"></label>
        <label>${livre ? 'Onde' : 'Onde saiu'} <input data-destaque-campo="dVeiculo" value="${esc(c.veiculo)}" placeholder="${livre ? 'Instituição, grupo, parceria… (opcional)' : 'Revista, livro, evento…'}"></label>
        <label>Link <input type="url" data-destaque-campo="link" value="${esc(it.link || '')}" placeholder="https:// (opcional)"></label>
        <label class="campo-largo">${livre ? 'Sobre' : 'Sobre o trabalho'}
          <textarea data-destaque-campo="dTexto" rows="2" placeholder="Em uma ou duas frases: do que trata e o que mostra.">${esc(c.texto)}</textarea></label>
      </li>`;
  }

  function trocarDestaques() {
    const el = document.getElementById('cartao-destaques');
    if (el) el.outerHTML = telaDestaques();
  }

  function telaDicaDestaques() {
    return `
      <section class="cartao dica-destaques">
        <span class="estrela-exemplo" aria-hidden="true">★</span>
        <p>Marque com a estrela até ${MAX_DESTAQUES} produções para aparecerem em destaque no topo do site.
          As que você já tinha marcado como relevantes no Lattes vêm pré-selecionadas.</p>
      </section>`;
  }

  // Seção sem nada marcado começa recolhida: currículos grandes chegam a ter 50 seções.
  function telaSecao(s, si) {
    const total = s.itens.length;
    const marcados = s.itens.filter(i => i.manter).length;
    const visiveis = ui.expandidas.has(s.id) ? total
      : !marcados ? 0
      : total <= ITENS_VISIVEIS + 2 ? total : ITENS_VISIVEIS;
    return `
      <section class="cartao secao${marcados ? '' : ' vazia'}${visiveis ? '' : ' recolhida'}" data-secao="${si}">
        <header class="secao-topo">
          <h2>${esc(s.titulo)}</h2>
          <span class="contagem" id="contagem-${si}">${contagemSecao(s)}</span>
          <span class="secao-acoes">
            ${visiveis ? '' : `<button type="button" class="link" data-acao="expandir" data-secao="${si}">${total === 1 ? 'Ver o item' : `Ver os ${total} itens`}</button>`}
            ${marcados < total ? `<button type="button" class="link" data-acao="todos" data-secao="${si}">Marcar todos</button>` : ''}
            ${marcados ? `<button type="button" class="link" data-acao="nenhum" data-secao="${si}">Desmarcar todos</button>` : ''}
          </span>
        </header>
        ${visiveis ? `<ul class="itens">${s.itens.slice(0, visiveis).map((it, ii) => telaItem(s, si, it, ii)).join('')}</ul>` : ''}
        ${visiveis && visiveis < total ? `<button type="button" class="mais" data-acao="expandir" data-secao="${si}">Mostrar todos os ${total}</button>` : ''}
      </section>`;
  }

  function telaItem(s, si, it, ii) {
    const chave = `${si}:${ii}`;
    const id = `item-${si}-${ii}`;
    const editando = ui.editando === chave;
    const conteudo = editando ? `
      <div class="editor">
        <textarea data-editor="${chave}" rows="3" aria-label="Texto do item">${esc(it.titulo)}</textarea>
        <label class="editor-link">
          <span>Link <em>(opcional: página do artigo, PDF, vídeo…)</em></span>
          <input type="url" data-editor-link="${chave}" value="${esc(it.link || '')}" placeholder="https://">
        </label>
        <span class="editor-acoes">
          <button type="button" class="botao pequeno" data-acao="salvar-edicao" data-item="${chave}">Salvar</button>
          <button type="button" class="link" data-acao="cancelar-edicao" data-item="${chave}">Cancelar</button>
        </span>
      </div>` : `
      <div class="coluna-texto">
        <label for="${id}" class="texto">
          <span class="titulo">${esc(it.titulo)}</span>
          ${it.detalhe ? `<span class="detalhe">${esc(it.detalhe)}</span>` : ''}
          ${it.obs ? `<span class="obs">${esc(resumir(it.obs, 160))}</span>` : ''}
        </label>
        ${it.link || s.tipo === 'producao' ? `
        <button type="button" class="item-link${it.link ? '' : ' vazio'}" data-acao="editar" data-foco="link" data-item="${chave}"
          title="${it.link ? esc(it.link) : 'Adicionar um link para este item'}">${it.link ? '↗ ' + esc(dominio(it.link)) : '+ link'}</button>` : ''}
      </div>`;
    return `
      <li class="item${it.manter ? '' : ' fora'}${it.destaque ? ' destacado' : ''}" data-li="${chave}">
        <input type="checkbox" id="${id}" data-marcar="${chave}"${it.manter ? ' checked' : ''}${editando ? ' aria-label="Manter no site"' : ''}>
        ${conteudo}
        <span class="periodo">${esc(it.periodo)}</span>
        <span class="item-acoes">
          ${s.tipo === 'producao' ? `<button type="button" class="estrela" data-acao="destaque" data-item="${chave}"
            aria-pressed="${it.destaque}" title="${it.destaque ? 'Tirar dos destaques' : 'Destacar'}" aria-label="Destacar">★</button>` : ''}
          ${editando ? '' : `<button type="button" class="icone" data-acao="editar" data-item="${chave}" title="Editar texto e link" aria-label="Editar texto e link">✎</button>`}
        </span>
      </li>`;
  }

  function contagemSecao(s) {
    return `${s.itens.filter(i => i.manter).length} de ${s.itens.length} no site`;
  }

  function resumoSelecao() {
    const t = totais();
    return `<strong>${t.itens}</strong> ${t.itens === 1 ? 'item' : 'itens'} no site · <strong>${t.destaques}</strong> de ${MAX_DESTAQUES} destaques`;
  }

  function podeRestaurarBio() {
    return !!estado.perfil.bioOriginal && estado.perfil.bio !== estado.perfil.bioOriginal;
  }

  // ---------- atualizações pontuais (sem redesenhar a tela toda) ----------

  function trocarItem(si, ii) {
    const li = app.querySelector(`li[data-li="${si}:${ii}"]`);
    if (li) li.outerHTML = telaItem(estado.secoes[si], si, estado.secoes[si].itens[ii], ii);
  }

  function trocarSecao(si) {
    const el = app.querySelector(`section[data-secao="${si}"]`);
    if (el) el.outerHTML = telaSecao(estado.secoes[si], si);
  }

  function atualizarContadores(si) {
    const c = document.getElementById(`contagem-${si}`);
    if (c) c.textContent = contagemSecao(estado.secoes[si]);
    const sec = app.querySelector(`section[data-secao="${si}"]`);
    if (sec) sec.classList.toggle('vazia', !estado.secoes[si].itens.some(i => i.manter));
    const r = document.getElementById('resumo-selecao');
    if (r) r.innerHTML = resumoSelecao();
  }

  let timerAviso;
  function avisar(msg) {
    const el = document.getElementById('aviso-barra');
    if (!el) return;
    el.textContent = ' · ' + msg;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => { el.textContent = ''; }, 4500);
  }

  // ---------- arquivos ----------

  async function importar(arquivo) {
    ui.erro = '';
    try {
      const texto = Lattes.decodificar(await arquivo.arrayBuffer());
      // O mesmo campo aceita o index.html de um site feito aqui, para continuar editando.
      if (texto.includes('id="dados-do-construtor"')) reabrirSite(texto);
      else estado = aplicarLattes(Lattes.lerHtml(texto));
      ui.expandidas.clear();
      ui.editando = null;
      salvar();
      render();
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      ui.erro = e.amigavel ? e.message : 'Não consegui ler este arquivo. Confira se é a página do currículo salva pelo navegador (arquivo .html).';
      render();
    }
  }

  // Reduz a foto sem recortar: o recorte (redonda, quadrada, retangular) é feito pelo CSS do site,
  // então dá para trocar o formato depois sem mandar a foto de novo.
  function lerFoto(arquivo) {
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * escala);
        canvas.height = Math.round(img.naturalHeight * escala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        ok(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        falha(new Error('Não consegui abrir esta imagem.'));
      };
      img.src = url;
    });
  }

  // ---------- eventos ----------

  app.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const [si, ii] = (b.dataset.item || '').split(':').map(Number);
    const secao = b.dataset.secao !== undefined ? Number(b.dataset.secao) : si;

    switch (b.dataset.acao) {
      case 'continuar':
        if (estado.etapa === 'conteudo') irPara('revisao');
        else if (estado.etapa === 'revisao') irPara('publicar');
        else irPara(podeIr('conteudo') ? 'conteudo' : 'lattes');
        break;

      case 'baixar':
        baixarSite(b);
        break;

      case 'copiar': {
        const texto = comUsuario(b.dataset.copiar);
        navigator.clipboard.writeText(texto).then(() => {
          b.textContent = 'Copiado!';
          setTimeout(() => { b.textContent = 'Copiar'; }, 1800);
        }, () => { b.textContent = 'Selecione e copie'; });
        break;
      }

      case 'largura':
        mudarLargura(Number(b.dataset.largura));
        break;

      case 'tema-previa':
        ui.temaPrevia = ui.temaPrevia === 'escuro' ? 'claro' : 'escuro';
        atualizarCores();
        atualizarBotaoTema();
        break;

      case 'remover-foto':
        estado.perfil.foto = '';
        salvar();
        render();
        break;

      case 'foto-padrao':
        estado.aparencia.fotoLargura = null;
        estado.aparencia.fotoProporcao = null;
        salvar();
        atualizarCores();
        break;

      case 'abrir-site': {
        // Um Blob próprio, que não é revogado quando a prévia é refeita.
        const html = Site.html(Site.dados(estado), estado.aparencia, { previa: true, baseFontes: BASE_FONTES });
        window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank', 'noopener');
        break;
      }

      case 'sem-lattes':
        estado.semLattes = true;
        irPara('conteudo');
        break;

      case 'trocar-lattes':
        irPara('lattes');
        break;

      case 'voltar-conteudo':
        irPara('conteudo');
        break;

      case 'voltar-revisao':
        irPara('revisao');
        break;

      case 'recomecar':
        if (!confirm('Apagar tudo o que foi feito aqui e começar de novo?')) return;
        estado = novoEstado();
        ui.expandidas.clear();
        ui.editando = null;
        try { localStorage.removeItem(CHAVE); } catch (err) { /* nada a limpar */ }
        render();
        window.scrollTo(0, 0);
        break;

      case 'restaurar-bio':
        estado.perfil.bio = estado.perfil.bioOriginal;
        editorBio().innerHTML = htmlEditorBio(estado.perfil.bio);
        atualizarBio();
        break;

      case 'inserir-link':
        if (!pedirLink()) avisar('Selecione um trecho do texto “Sobre você” para virar link.');
        break;

      case 'todos':
      case 'nenhum': {
        const manter = b.dataset.acao === 'todos';
        for (const it of estado.secoes[secao].itens) {
          it.manter = manter;
          if (!manter) it.destaque = false;
        }
        salvar();
        trocarSecao(secao);
        atualizarContadores(secao);
        break;
      }

      case 'expandir':
        ui.expandidas.add(estado.secoes[secao].id);
        trocarSecao(secao);
        break;

      case 'novo-destaque-livre': {
        if (totais().destaques >= MAX_DESTAQUES) {
          avisar(`Já são ${MAX_DESTAQUES} destaques. Tire um para acrescentar outro.`);
          return;
        }
        const s = secaoLivres(true);
        s.itens.push({
          id: 'livre-' + Date.now().toString(36), periodo: '', titulo: '', categoria: '',
          dTitulo: '', dVeiculo: '', dTexto: '', link: '', manter: true, destaque: true, ordem: 1e6,
        });
        renumerarDestaques();
        salvar();
        trocarDestaques();
        atualizarContadores(estado.secoes.indexOf(s));
        const novo = app.querySelector('.editor-destaque.livre:last-of-type input[data-destaque-campo="categoria"]');
        if (novo) novo.focus();
        break;
      }

      case 'destaque': {
        if (estado.secoes[si].tipo === 'livre') { // ✕ num destaque livre: some de vez
          estado.secoes[si].itens.splice(ii, 1);
          renumerarDestaques();
          salvar();
          trocarDestaques();
          atualizarContadores(si);
          break;
        }
        const it = estado.secoes[si].itens[ii];
        if (!it.destaque && totais().destaques >= MAX_DESTAQUES) {
          avisar(`Já são ${MAX_DESTAQUES} destaques. Tire um para escolher outro.`);
          return;
        }
        it.destaque = !it.destaque;
        if (it.destaque) {
          it.manter = true;
          it.ordem = 1e6; // entra no fim da fila de destaques
        }
        renumerarDestaques();
        salvar();
        trocarItem(si, ii);
        atualizarContadores(si);
        trocarDestaques();
        if (b.classList.contains('estrela')) {
          const estrela = app.querySelector(`li[data-li="${si}:${ii}"] .estrela`);
          if (estrela) estrela.focus();
        }
        break;
      }

      case 'subir-destaque':
      case 'descer-destaque': {
        renumerarDestaques();
        const lista = destaquesOrdenados();
        const n = lista.findIndex(x => x.si === si && x.ii === ii);
        const m = n + (b.dataset.acao === 'subir-destaque' ? -1 : 1);
        if (n < 0 || m < 0 || m >= lista.length) break;
        [lista[n].it.ordem, lista[m].it.ordem] = [lista[m].it.ordem, lista[n].it.ordem];
        salvar();
        trocarDestaques();
        const botao = app.querySelector(`[data-destaque="${si}:${ii}"] [data-acao="${b.dataset.acao}"]`);
        if (botao && !botao.disabled) botao.focus();
        break;
      }

      case 'editar': {
        const anterior = ui.editando;
        ui.editando = `${si}:${ii}`;
        if (anterior) {
          const [asi, aii] = anterior.split(':').map(Number);
          trocarItem(asi, aii);
        }
        trocarItem(si, ii);
        const campo = app.querySelector(b.dataset.foco === 'link' ? `[data-editor-link="${si}:${ii}"]` : `[data-editor="${si}:${ii}"]`);
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
        break;
      }

      case 'salvar-edicao':
        salvarEdicao(si, ii);
        break;

      case 'cancelar-edicao':
        ui.editando = null;
        trocarItem(si, ii);
        break;
    }
  });

  function salvarEdicao(si, ii) {
    const it = estado.secoes[si].itens[ii];
    const ta = app.querySelector(`[data-editor="${si}:${ii}"]`);
    const campoLink = app.querySelector(`[data-editor-link="${si}:${ii}"]`);
    const texto = ta ? ta.value.replace(/\s+/g, ' ').trim() : '';
    if (texto) it.titulo = texto;
    if (campoLink) it.link = campoLink.value.trim();
    ui.editando = null;
    salvar();
    trocarItem(si, ii);
  }

  app.addEventListener('keydown', e => {
    if (e.target.id === 'bio' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!pedirLink()) avisar('Selecione um trecho do texto para virar link.');
      return;
    }
    if (e.target.id === 'alca' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const passo = (e.shiftKey ? 100 : 20) * (e.key === 'ArrowLeft' ? -1 : 1);
      mudarLargura(ui.largura + passo);
      return;
    }
    const campo = e.target.closest('[data-editor], [data-editor-link]');
    if (!campo) return;
    const [si, ii] = (campo.dataset.editor || campo.dataset.editorLink).split(':').map(Number);
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); salvarEdicao(si, ii); }
    if (e.key === 'Escape') { ui.editando = null; trocarItem(si, ii); }
  });

  document.getElementById('etapas').addEventListener('click', e => {
    const b = e.target.closest('[data-ir]');
    if (b && podeIr(b.dataset.ir)) irPara(b.dataset.ir);
  });

  function mudarAparencia(t) {
    const campo = t.dataset.aparencia;
    const ap = estado.aparencia;
    if (campo === 'acento-livre') ap.acento = t.value.toLowerCase();
    else if (campo === 'combinacao') {
      const c = Tema.COMBINACOES.find(x => x.id === t.value);
      if (!c) return;
      ap.fonteTitulo = c.titulo;
      ap.fonteTexto = c.texto;
    } else ap[campo] = t.value;
    salvar();
    // Organização, estrutura e foto mudam o HTML; cor e fonte só mudam variáveis CSS.
    if (campo === 'layout' || campo === 'estrutura' || campo === 'foto' || campo === 'referencias') montarPrevia();
    atualizarAparencia();
  }

  app.addEventListener('change', async e => {
    const t = e.target;

    if (t.dataset.aparencia) { mudarAparencia(t); return; }

    if (t.dataset.marcar) {
      const [si, ii] = t.dataset.marcar.split(':').map(Number);
      const it = estado.secoes[si].itens[ii];
      it.manter = t.checked;
      if (!it.manter && it.destaque) {
        it.destaque = false;
        const estrela = t.closest('li').querySelector('.estrela');
        if (estrela) estrela.setAttribute('aria-pressed', 'false');
      }
      const li = t.closest('li');
      li.classList.toggle('fora', !it.manter);
      li.classList.toggle('destacado', it.destaque);
      salvar();
      atualizarContadores(si);
      return;
    }

    if (t.dataset.arquivo === 'lattes' && t.files[0]) importar(t.files[0]);

    if (t.dataset.arquivo === 'foto' && t.files[0]) {
      try {
        estado.perfil.foto = await lerFoto(t.files[0]);
        salvar();
        render();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  let timerPrevia;
  app.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.aparencia === 'acento-livre') { mudarAparencia(t); return; } // atualiza enquanto arrasta
    if (t.dataset.fotoTamanho !== undefined) {
      estado.aparencia.fotoLargura = Number(t.value);
      atualizarCores();
      salvar();
      return;
    }
    if (t.id === 'bio') { atualizarBio(); return; }
    if (t.dataset.publicar === 'usuario') {
      estado.publicacao.usuario = t.value.trim().replace(/^@/, '');
      salvar();
      atualizarUsuario();
      return;
    }
    if (t.dataset.destaqueCampo) {
      const [si, ii] = t.closest('[data-destaque]').dataset.destaque.split(':').map(Number);
      const campo = t.dataset.destaqueCampo;
      estado.secoes[si].itens[ii][campo] = campo === 'link' || campo === 'periodo' || campo === 'categoria' ? t.value.trim() : t.value;
      salvar();
      if (campo === 'link') trocarItem(si, ii); // o link também aparece na lista
      return;
    }
    if (t.dataset.perfil === 'interesses') {
      estado.perfil.interesses = t.value.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
      estado.perfil.interessesEditados = true;
      salvar();
      return;
    }
    if (t.dataset.perfil) {
      estado.perfil[t.dataset.perfil] = t.value;
      if (estado.etapa === 'aparencia') {
        // O nome aparece nas amostras de fonte e na prévia.
        app.querySelectorAll('.fonte-amostra').forEach(el => { el.textContent = t.value || 'Seu Nome'; });
        clearTimeout(timerPrevia);
        timerPrevia = setTimeout(montarPrevia, 300);
      }
      salvar();
    }
    if (t.dataset.link) {
      estado.perfil.links[t.dataset.link] = t.value.trim();
      salvar();
    }
  });

  // Arrastar o arquivo para qualquer lugar da tela do Lattes; fora dela, soltar não faz nada
  // (sem isso, o navegador abriria o arquivo no lugar do construtor).
  window.addEventListener('dragover', e => {
    e.preventDefault();
    const zona = document.getElementById('soltar');
    if (zona) zona.classList.add('arrastando');
  });
  window.addEventListener('dragleave', e => {
    const zona = document.getElementById('soltar');
    if (zona && !e.relatedTarget) zona.classList.remove('arrastando');
  });
  window.addEventListener('drop', e => {
    e.preventDefault();
    const zona = document.getElementById('soltar');
    if (zona) zona.classList.remove('arrastando');
    const arquivo = e.dataTransfer && e.dataTransfer.files[0];
    if (arquivo && estado.etapa === 'lattes') importar(arquivo);
  });

  // ---------- editor do "Sobre você": texto com links, como num editor de documentos ----------
  // O texto fica guardado como texto puro, com os links no formato [trecho](endereço).

  function htmlEditorBio(bio) {
    return Site.textoComLinks(bio || '').replace(/\n/g, '<br>');
  }

  function editorBio() {
    return document.getElementById('bio');
  }

  // Editor -> texto guardado. O navegador cria <div>, <br> e <a> conforme a pessoa digita.
  function serializarBio(raiz) {
    const partes = [];
    const fimDeLinha = () => partes.length && !partes[partes.length - 1].endsWith('\n');
    (function andar(no) {
      for (const n of no.childNodes) {
        if (n.nodeType === 3) partes.push(n.textContent);
        else if (n.nodeName === 'BR') partes.push('\n');
        else if (n.nodeName === 'A') partes.push(`[${n.textContent.replace(/\n/g, ' ')}](${n.getAttribute('href') || ''})`);
        else if (/^(DIV|P)$/.test(n.nodeName)) {
          if (fimDeLinha()) partes.push('\n');
          andar(n);
          if (fimDeLinha()) partes.push('\n');
        } else andar(n);
      }
    })(raiz);
    return partes.join('').replace(/\u00a0/g, ' ') /* espaço rígido que o editor às vezes insere */.replace(/\n{3,}/g, '\n\n').trim();
  }

  function atualizarBio() {
    const ed = editorBio();
    if (!ed) return;
    estado.perfil.bio = serializarBio(ed);
    document.getElementById('contador').textContent = `${Site.textoPuro(estado.perfil.bio).length} caracteres`;
    document.getElementById('restaurar-bio').hidden = !podeRestaurarBio();
    salvar();
  }

  // Aceita "www.site.com" e e-mails; só produz http(s) e mailto.
  function normalizarUrl(url) {
    url = String(url || '').trim();
    if (!url) return '';
    if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
    if (/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(url)) return 'mailto:' + url;
    return 'https://' + url.replace(/^[a-z]+:\/*/i, '').replace(/^\/+/, '');
  }

  const menu = document.createElement('div');
  menu.className = 'menu-contexto';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  const popover = document.createElement('div');
  popover.className = 'popover-link';
  popover.hidden = true;
  popover.innerHTML = `
    <label>Endereço do link <input type="url" placeholder="https://"></label>
    <span class="popover-acoes">
      <button type="button" class="botao pequeno" data-popover="aplicar">Aplicar</button>
      <button type="button" class="link" data-popover="cancelar">Cancelar</button>
    </span>`;
  document.body.append(menu, popover);

  let edicaoLink = null; // { range, link } enquanto o menu ou a caixa do link estão abertos

  function posicionar(el, x, y) {
    const r = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    el.style.top = Math.max(8, Math.min(y, window.innerHeight - r.height - 8)) + 'px';
  }

  function abrirPopover(x, y, valor) {
    popover.hidden = false;
    posicionar(popover, x, y);
    const campo = popover.querySelector('input');
    campo.value = valor || '';
    campo.focus();
    campo.select();
  }

  function fecharEdicaoLink(voltarAoTexto) {
    menu.hidden = true;
    popover.hidden = true;
    edicaoLink = null;
    if (voltarAoTexto && editorBio()) editorBio().focus();
  }

  function linkNaSelecao(ed, sel) {
    if (!sel.rangeCount) return null;
    const no = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
    const a = no && no.closest('a');
    return a && ed.contains(a) ? a : null;
  }

  // Botão "Inserir link" e Ctrl+K: usa o trecho selecionado (ou o link onde está o cursor).
  function pedirLink() {
    const ed = editorBio();
    const sel = window.getSelection();
    if (!ed || !sel.rangeCount || !ed.contains(sel.anchorNode)) return false;
    const link = linkNaSelecao(ed, sel);
    if (!link && sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    const r = (link || range).getBoundingClientRect();
    edicaoLink = { range: range.cloneRange(), link };
    abrirPopover(r.left, r.bottom + 6, link ? link.getAttribute('href') : '');
    return true;
  }

  function aplicarLink() {
    const url = normalizarUrl(popover.querySelector('input').value);
    const { range, link } = edicaoLink || {};
    fecharEdicaoLink(false);
    const ed = editorBio();
    if (!ed) return;
    ed.focus();
    if (link) {
      if (url) link.setAttribute('href', url);
      else removerLink(link);
    } else if (range && url) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('createLink', false, url); // entra no desfazer (Ctrl+Z) do navegador
      sel.collapseToEnd();
    }
    atualizarBio();
  }

  function removerLink(link) {
    const ed = editorBio();
    ed.focus();
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(link);
    sel.removeAllRanges();
    sel.addRange(r);
    document.execCommand('unlink');
    sel.collapseToEnd();
    atualizarBio();
  }

  // Botão direito: com um trecho selecionado ou sobre um link, mostra o menu de link.
  // Sem seleção, fica o menu normal do navegador (com a correção ortográfica).
  app.addEventListener('contextmenu', e => {
    const ed = e.target.closest('#bio');
    if (!ed) return;
    const sel = window.getSelection();
    const link = e.target.closest('a') || linkNaSelecao(ed, sel);
    const temSelecao = sel.rangeCount && !sel.isCollapsed && ed.contains(sel.anchorNode) && ed.contains(sel.focusNode);
    if (!link && !temSelecao) return;
    e.preventDefault();
    edicaoLink = { range: temSelecao ? sel.getRangeAt(0).cloneRange() : null, link };
    const itens = link ? [['editar', 'Editar link'], ['remover', 'Remover link']] : [['criar', 'Adicionar link']];
    menu.innerHTML = itens.map(([acao, rotulo]) => `<button type="button" role="menuitem" data-menu="${acao}">${rotulo}</button>`).join('');
    menu.hidden = false;
    posicionar(menu, e.clientX, e.clientY);
    menu.querySelector('button').focus();
  });

  menu.addEventListener('click', e => {
    const b = e.target.closest('[data-menu]');
    if (!b || !edicaoLink) return;
    const { left, top } = menu.getBoundingClientRect();
    menu.hidden = true;
    if (b.dataset.menu === 'remover') {
      const { link } = edicaoLink;
      edicaoLink = null;
      removerLink(link);
    } else {
      abrirPopover(left, top, edicaoLink.link ? edicaoLink.link.getAttribute('href') : '');
    }
  });

  popover.addEventListener('click', e => {
    const b = e.target.closest('[data-popover]');
    if (b && b.dataset.popover === 'aplicar') aplicarLink();
    else if (b) fecharEdicaoLink(true);
  });

  popover.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); aplicarLink(); }
    if (e.key === 'Escape') fecharEdicaoLink(true);
  });

  menu.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharEdicaoLink(true);
  });

  document.addEventListener('mousedown', e => {
    if (!menu.hidden || !popover.hidden) {
      if (!menu.contains(e.target) && !popover.contains(e.target)) fecharEdicaoLink(false);
    }
    // "Inserir link" não pode tirar a seleção do texto.
    if (e.target.closest('[data-acao="inserir-link"]')) e.preventDefault();
  });

  // Colar: só texto, sem a formatação de onde veio. Colar um endereço sobre um trecho selecionado vira link.
  app.addEventListener('paste', e => {
    if (!e.target.closest('#bio')) return;
    e.preventDefault();
    const texto = e.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel.isCollapsed && /^(https?:\/\/|www\.)\S+$/i.test(texto.trim())) document.execCommand('createLink', false, normalizarUrl(texto.trim()));
    else document.execCommand('insertText', false, texto);
    atualizarBio();
  });

  // ---------- utilidades ----------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function resumir(s, n) {
    return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
  }

  function dominio(url) {
    try {
      return new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url).hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  }

  window.addEventListener('resize', ajustar);
  Tema.carregarFontes(document, BASE_FONTES); // para as amostras de fonte da tela de aparência
  render();
})();
