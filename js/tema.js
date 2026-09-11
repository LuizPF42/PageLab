/*
 * Tema do site pessoal: fundos, cores de destaque, fontes, estrutura da página e formato da foto,
 * e o cálculo das cores com contraste suficiente para leitura (WCAG, 4.5:1).
 */
(function (raiz, fabrica) {
  const I18n = raiz.I18n || (typeof require === 'function' ? require('./i18n.js') : null);
  const api = fabrica(I18n);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Tema = api;
})(typeof self !== 'undefined' ? self : this, function (I18n) {
  'use strict';

  const _ = I18n._;

  // As constantes abaixo ficam em português (são as chaves); quem mostra na tela usa nome()/descricao(),
  // que traduzem no momento do uso.
  I18n.registrar({
    // fundos
    'Branco': 'White', 'Creme': 'Cream', 'Cinza': 'Gray',
    // cores de destaque
    'Azul': 'Blue', 'Petróleo': 'Teal', 'Verde': 'Green', 'Terracota': 'Terracotta', 'Vinho': 'Wine',
    'Rosa': 'Pink', 'Roxo': 'Purple', 'Grafite': 'Graphite',
    // combinações de fontes
    'Moderno': 'Modern', 'Clássico': 'Classic', 'Elegante': 'Elegant', 'Amigável': 'Friendly',
    'Técnico': 'Technical', 'Datilografado': 'Typewritten',
    // estruturas
    'Lateral': 'Sidebar', 'Foto, nome e menu numa coluna à esquerda.': 'Photo, name and menu in a column on the left.',
    'Menu no topo': 'Top menu', 'Barra com seu nome e as abas no alto da página.': 'A bar with your name and the tabs at the top of the page.',
    'Centralizada': 'Centered', 'Tudo numa coluna, com a foto em cima.': 'Everything in one column, with the photo on top.',
    // fotos
    'Circular': 'Round', 'Retangular': 'Rectangular',
    // modo escuro
    'Seguir o sistema': 'Follow the system',
    'Quem usa o computador ou o celular no modo escuro vê o site com fundo escuro.': 'Visitors whose computer or phone is in dark mode see the site with a dark background.',
    'Sempre claro': 'Always light', 'O site fica claro para todo mundo.': 'The site is light for everyone.',
    'Sempre escuro': 'Always dark', 'O site fica escuro para todo mundo.': 'The site is dark for everyone.',
    // alinhamento
    'Justificado': 'Justified', 'À esquerda': 'Left-aligned',
    // referências
    'Simplificadas': 'Simplified', 'Completas (ABNT)': 'Complete (ABNT)',
    // organização
    'Em abas': 'In tabs',
    'Início, Trajetória, Pesquisa, Produção e Orientações, conforme o que você tiver.': 'Home, Background, Research, Publications and Advising, depending on what you have.',
    'Página única': 'Single page', 'Tudo em sequência, rolando a página.': 'Everything in sequence, scrolling down the page.',
    // idioma do site (os nomes das línguas não mudam de idioma para idioma)
    'Português': 'Português', 'English': 'English',
    'Rótulos e textos fixos do site em português.': 'Labels and fixed texts of the site in Portuguese.',
    'Rótulos e textos fixos do site em inglês.': 'Labels and fixed texts of the site in English.',
    'Português e inglês': 'Portuguese and English',
    'O visitante escolhe, com um botão PT/EN. Começa no idioma do navegador dele.': 'Visitors choose with a PT/EN button. It starts in the language of their browser.',
    // fontes: nomes próprios, iguais em qualquer idioma (registrados só para não constarem como faltando)
    'Inter': 'Inter', 'Source Serif': 'Source Serif', 'Playfair Display': 'Playfair Display', 'Nunito': 'Nunito',
    'IBM Plex Sans': 'IBM Plex Sans', 'IBM Plex Mono': 'IBM Plex Mono', 'Inconsolata': 'Inconsolata',
    // erros
    'Não consegui carregar a fonte {familia}.': 'Could not load the font {familia}.',
  });

  // Cada fundo tem a versão escura correspondente (mesma temperatura: neutra, quente, fria),
  // usada quando o visitante prefere o modo escuro.
  const FUNDOS = [
    { id: 'branco', nome: 'Branco', fundo: '#ffffff', superficie: '#f6f6f4', texto: '#1c1c1e', suave: '#5f6368', borda: '#e6e5e1',
      escuro: { fundo: '#151517', superficie: '#1f1f22', texto: '#ececea', suave: '#a3a3a8', borda: '#333338' } },
    { id: 'creme', nome: 'Creme', fundo: '#fbf7ef', superficie: '#f3ecdf', texto: '#29241f', suave: '#6a6157', borda: '#e7dccb',
      escuro: { fundo: '#1a1714', superficie: '#25211c', texto: '#efe9df', suave: '#aea597', borda: '#3a342c' } },
    { id: 'cinza', nome: 'Cinza', fundo: '#f1f2f4', superficie: '#e6e8eb', texto: '#1d2126', suave: '#5a606a', borda: '#d9dce1',
      escuro: { fundo: '#15181c', superficie: '#1f2328', texto: '#e8eaed', suave: '#9aa1ab', borda: '#30363d' } },
  ];

  const ACENTOS = [
    { nome: 'Azul', cor: '#2563eb' },
    { nome: 'Petróleo', cor: '#0f766e' },
    { nome: 'Verde', cor: '#166534' },
    { nome: 'Terracota', cor: '#c2410c' },
    { nome: 'Vinho', cor: '#9f1239' },
    { nome: 'Rosa', cor: '#be185d' },
    { nome: 'Roxo', cor: '#6d28d9' },
    { nome: 'Grafite', cor: '#374151' },
  ];

  const PILHAS = {
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, Consolas, "Liberation Mono", monospace',
  };

  // Todas com licença aberta (SIL OFL), o que permite embutir a fonte no site gerado.
  // O peso e o espaçamento valem para quando a família é usada nos títulos.
  const FAMILIAS = [
    { id: 'inter', nome: 'Inter', familia: 'Inter', tipo: 'sans', peso: 700, espaco: '-0.025em' },
    { id: 'source-serif', nome: 'Source Serif', familia: 'Source Serif 4', tipo: 'serif', peso: 600, espaco: '-0.01em' },
    { id: 'playfair', nome: 'Playfair Display', familia: 'Playfair Display', tipo: 'serif', peso: 700, espaco: '0em', soTitulos: true },
    { id: 'nunito', nome: 'Nunito', familia: 'Nunito', tipo: 'sans', peso: 800, espaco: '-0.01em' },
    { id: 'plex-sans', nome: 'IBM Plex Sans', familia: 'IBM Plex Sans', tipo: 'sans', peso: 600, espaco: '-0.02em' },
    { id: 'plex-mono', nome: 'IBM Plex Mono', familia: 'IBM Plex Mono', tipo: 'mono', peso: 600, espaco: '-0.03em' },
    { id: 'inconsolata', nome: 'Inconsolata', familia: 'Inconsolata', tipo: 'mono', peso: 600, espaco: '0em' },
  ];

  // Combinações prontas; a pessoa também pode escolher títulos e texto separadamente.
  const COMBINACOES = [
    { id: 'moderno', nome: 'Moderno', titulo: 'inter', texto: 'inter' },
    { id: 'classico', nome: 'Clássico', titulo: 'source-serif', texto: 'source-serif' },
    { id: 'elegante', nome: 'Elegante', titulo: 'playfair', texto: 'inter' },
    { id: 'amigavel', nome: 'Amigável', titulo: 'nunito', texto: 'nunito' },
    { id: 'tecnico', nome: 'Técnico', titulo: 'plex-mono', texto: 'plex-sans' },
    { id: 'datilografado', nome: 'Datilografado', titulo: 'inconsolata', texto: 'inconsolata' },
  ];

  const ESTRUTURAS = [
    { id: 'lateral', nome: 'Lateral', descricao: 'Foto, nome e menu numa coluna à esquerda.' },
    { id: 'topo', nome: 'Menu no topo', descricao: 'Barra com seu nome e as abas no alto da página.' },
    { id: 'central', nome: 'Centralizada', descricao: 'Tudo numa coluna, com a foto em cima.' },
  ];

  const FOTOS = [
    { id: 'redonda', nome: 'Circular' },
    { id: 'retangular', nome: 'Retangular' },
  ];

  // Tamanho da foto ajustado na revisão (largura em px e, na retangular, largura/altura).
  const FOTO_LARGURA = [60, 600];
  const FOTO_PROPORCAO = [0.4, 2.5];
  // Zoom da imagem dentro do quadro: 1 = preenche o quadro (cover); menos que 1 mostra a foto inteira, com sobra.
  const FOTO_ZOOM = [0.3, 4];
  // Proporções oferecidas para o quadro retangular (largura/altura); null = 3:2, o padrão do CSS.
  const FOTO_PROPORCOES = [
    { valor: null, nome: '3:2' }, { valor: 1, nome: '1:1' }, { valor: 0.8, nome: '4:5' }, { valor: 0.667, nome: '2:3' }, { valor: 1.778, nome: '16:9' },
  ];

  // Arquivos em fonts/: subconjunto "latin" (cobre o português) baixado do Google Fonts,
  // com as licenças OFL ao lado. Os "variavel" trazem vários pesos num arquivo só.
  const ARQUIVOS = [
    { familia: 'Inter', pesos: '400 700', arquivo: 'inter-variavel.woff2' },
    { familia: 'Source Serif 4', pesos: '400 700', arquivo: 'source-serif-4-variavel.woff2' },
    { familia: 'Playfair Display', pesos: '600 700', arquivo: 'playfair-display-variavel.woff2' },
    { familia: 'Nunito', pesos: '400 800', arquivo: 'nunito-variavel.woff2' },
    { familia: 'IBM Plex Mono', pesos: '400', arquivo: 'ibm-plex-mono-400.woff2' },
    { familia: 'IBM Plex Mono', pesos: '500', arquivo: 'ibm-plex-mono-500.woff2' },
    { familia: 'IBM Plex Mono', pesos: '600', arquivo: 'ibm-plex-mono-600.woff2' },
    { familia: 'IBM Plex Sans', pesos: '400 600', arquivo: 'ibm-plex-sans-variavel.woff2' },
    { familia: 'Inconsolata', pesos: '400 700', arquivo: 'inconsolata-variavel.woff2' },
  ];
  const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

  const PADRAO = { fundo: 'branco', acento: '#0f766e', fonteTitulo: 'inter', fonteTexto: 'inter', layout: 'abas', estrutura: 'lateral', foto: 'redonda', referencias: 'simples', alinhamento: 'justificado', escuro: 'automatico', idioma: 'pt' };

  // Idioma dos rótulos e textos fixos do site gerado (abas, "Destaques", rodapé...). O conteúdo
  // vindo do Lattes ou escrito pela pessoa fica como está. Os nomes das línguas não se traduzem.
  const IDIOMAS = [
    { id: 'pt', nome: 'Português', descricao: 'Rótulos e textos fixos do site em português.' },
    { id: 'en', nome: 'English', descricao: 'Rótulos e textos fixos do site em inglês.' },
    // "ambos": o site sai nas duas línguas, com um botão PT/EN para o visitante; a etapa de conteúdo
    // ganha os campos em inglês (apresentação, linha abaixo do nome, interesses, textos dos destaques).
    { id: 'ambos', nome: 'Português e inglês', descricao: 'O visitante escolhe, com um botão PT/EN. Começa no idioma do navegador dele.' },
  ];

  // Modo escuro do site gerado. "automatico" segue a preferência do sistema do visitante.
  const ESCURO = [
    { id: 'automatico', nome: 'Seguir o sistema', descricao: 'Quem usa o computador ou o celular no modo escuro vê o site com fundo escuro.' },
    { id: 'nunca', nome: 'Sempre claro', descricao: 'O site fica claro para todo mundo.' },
    { id: 'sempre', nome: 'Sempre escuro', descricao: 'O site fica escuro para todo mundo.' },
  ];

  // Alinhamento dos textos corridos (apresentação e textos dos destaques); listas ficam sempre à esquerda.
  const ALINHAMENTOS = [
    { id: 'justificado', nome: 'Justificado' },
    { id: 'esquerda', nome: 'À esquerda' },
  ];

  // Como as produções aparecem nas listas do site.
  const REFERENCIAS = [
    { id: 'simples', nome: 'Simplificadas' },   // título, e embaixo o veículo e os coautores
    { id: 'completas', nome: 'Completas (ABNT)' }, // a referência como está no Lattes
  ];

  const LAYOUTS = [
    { id: 'abas', nome: 'Em abas', descricao: 'Início, Trajetória, Pesquisa, Produção e Orientações, conforme o que você tiver.' },
    { id: 'pagina', nome: 'Página única', descricao: 'Tudo em sequência, rolando a página.' },
  ];

  // ---------- aparência completa e válida ----------

  // Preenche o que faltar, descarta valores desconhecidos e converte o formato antigo
  // (um par de fontes fixo em `fonte`) para títulos e texto separados.
  function normalizar(ap) {
    ap = Object.assign({}, ap);
    if (ap.fonte && !ap.fonteTitulo) {
      const antiga = COMBINACOES.find(c => c.id === ap.fonte);
      if (antiga) Object.assign(ap, { fonteTitulo: antiga.titulo, fonteTexto: antiga.texto });
    }
    delete ap.fonte;
    if (ap.foto === 'quadrada') { // formato antigo: vira retangular na proporção 1:1
      ap.foto = 'retangular';
      if (!ap.fotoProporcao) ap.fotoProporcao = 1;
    }
    const valido = (lista, v) => lista.some(x => x.id === v);
    const texto = FAMILIAS.filter(f => !f.soTitulos);
    const numero = (v, [min, max]) => (typeof v === 'number' && isFinite(v) ? Math.min(max, Math.max(min, v)) : null);
    return {
      fundo: valido(FUNDOS, ap.fundo) ? ap.fundo : PADRAO.fundo,
      acento: corValida(ap.acento) ? ap.acento.toLowerCase() : PADRAO.acento,
      fonteTitulo: valido(FAMILIAS, ap.fonteTitulo) ? ap.fonteTitulo : PADRAO.fonteTitulo,
      fonteTexto: valido(texto, ap.fonteTexto) ? ap.fonteTexto : PADRAO.fonteTexto,
      layout: valido(LAYOUTS, ap.layout) ? ap.layout : PADRAO.layout,
      estrutura: valido(ESTRUTURAS, ap.estrutura) ? ap.estrutura : PADRAO.estrutura,
      foto: valido(FOTOS, ap.foto) ? ap.foto : PADRAO.foto,
      referencias: valido(REFERENCIAS, ap.referencias) ? ap.referencias : PADRAO.referencias,
      alinhamento: valido(ALINHAMENTOS, ap.alinhamento) ? ap.alinhamento : PADRAO.alinhamento,
      escuro: valido(ESCURO, ap.escuro) ? ap.escuro : PADRAO.escuro,
      idioma: valido(IDIOMAS, ap.idioma) ? ap.idioma : PADRAO.idioma,
      fotoLargura: numero(ap.fotoLargura, FOTO_LARGURA),     // null: tamanho padrão da estrutura
      fotoProporcao: numero(ap.fotoProporcao, FOTO_PROPORCAO), // null: 3:2
      // Enquadramento: ponto da imagem que fica no centro do recorte, em % (null: 50% 30%, rosto no alto).
      fotoX: numero(ap.fotoX, [0, 100]),
      fotoY: numero(ap.fotoY, [0, 100]),
      fotoZoom: numero(ap.fotoZoom, FOTO_ZOOM), // null: preenche o quadro
    };
  }

  function familia(id) {
    return FAMILIAS.find(f => f.id === id) || FAMILIAS[0];
  }

  // A combinação pronta que corresponde às fontes escolhidas, se houver.
  function combinacaoAtual(ap) {
    return COMBINACOES.find(c => c.titulo === ap.fonteTitulo && c.texto === ap.fonteTexto) || null;
  }

  // Nome e descrição de uma opção (fundo, estrutura, idioma...) no idioma atual do construtor.
  // Nomes próprios (fontes, "Português", "English") não têm tradução registrada e voltam como estão.
  function nome(obj) {
    return obj && obj.nome ? _(obj.nome) : '';
  }

  function descricao(obj) {
    return obj && obj.descricao ? _(obj.descricao) : '';
  }

  // ---------- variáveis CSS do site ----------

  // `modo` é "claro" ou "escuro": o mesmo tema, sobre o fundo claro ou sobre o escuro correspondente.
  function variaveis(aparencia, modo = 'claro') {
    const ap = normalizar(aparencia);
    const f = FUNDOS.find(x => x.id === ap.fundo);
    const paleta = modo === 'escuro' ? f.escuro : f;
    const titulo = familia(ap.fonteTitulo);
    // No escuro, a cor de destaque também clareia um pouco nos detalhes (barras, bordas), senão some.
    const acento = modo === 'escuro' ? paraTexto(ap.acento, paleta.fundo, 3) : ap.acento;
    return {
      'color-scheme': modo === 'escuro' ? 'dark' : 'light',
      '--fundo': paleta.fundo,
      '--superficie': paleta.superficie,
      '--texto': paleta.texto,
      '--suave': paleta.suave,
      '--borda': paleta.borda,
      '--acento': acento,                               // detalhes decorativos: barras, bordas, preenchimentos
      '--acento-texto': paraTexto(acento, paleta.fundo), // links e textos coloridos sobre o fundo
      '--sobre-acento': sobre(acento),                   // texto em cima de um preenchimento com a cor
      '--acento-fundo': misturar(acento, paleta.fundo, modo === 'escuro' ? 0.16 : 0.09),
      '--fonte-titulo': pilha(titulo.id),
      '--fonte-texto': pilha(ap.fonteTexto),
      '--peso-titulo': String(titulo.peso),
      '--espaco-titulo': titulo.espaco,
      // Justificado com hifenização, para não abrir buracos entre as palavras em telas estreitas.
      '--alinhamento': ap.alinhamento === 'justificado' ? 'justify' : 'start',
      '--hifens': ap.alinhamento === 'justificado' ? 'auto' : 'manual',
      // Vazias quando a pessoa não ajustou: o CSS do site usa o tamanho padrão de cada estrutura.
      '--foto-largura': ap.fotoLargura ? ap.fotoLargura + 'px' : '',
      '--foto-proporcao': ap.fotoProporcao ? String(ap.fotoProporcao) : '',
      '--foto-posicao': ap.fotoX != null || ap.fotoY != null ? `${ap.fotoX != null ? ap.fotoX : 50}% ${ap.fotoY != null ? ap.fotoY : 30}%` : '',
    };
  }

  // CSS das variáveis do site. No modo automático, o escuro entra pela preferência do sistema;
  // html[data-tema="claro"|"escuro"] força um dos dois (é como a prévia do construtor alterna).
  function css(aparencia) {
    const ap = normalizar(aparencia);
    const bloco = modo => Object.entries(variaveis(ap, modo)).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(';');
    if (ap.escuro === 'sempre') return `:root{${bloco('escuro')}}`;
    if (ap.escuro === 'nunca') return `:root{${bloco('claro')}}`;
    const escuro = bloco('escuro');
    return `:root{${bloco('claro')}}@media (prefers-color-scheme:dark){:root:not([data-tema="claro"]){${escuro}}}:root[data-tema="escuro"]{${escuro}}`;
  }

  function pilha(id) {
    const f = familia(id);
    return `"${f.familia}", ${PILHAS[f.tipo]}`;
  }

  // ---------- fontes ----------

  function fontFace(a, src) {
    return `@font-face{font-family:"${a.familia}";font-style:normal;font-weight:${a.pesos};font-display:swap;src:url(${src}) format("woff2");unicode-range:${LATIN}}`;
  }

  // Todas as fontes, apontando para os arquivos em fonts/ (construtor e prévia).
  // `base` precisa ser absoluta: a prévia é um Blob, onde caminhos relativos não funcionam.
  function cssFontes(base) {
    return ARQUIVOS.map(a => fontFace(a, base + a.arquivo)).join('\n');
  }

  // Só as fontes escolhidas, embutidas no CSS: o site final não depende de nada externo.
  async function cssFontesEmbutidas(aparencia, base) {
    const ap = normalizar(aparencia);
    const familias = new Set([familia(ap.fonteTitulo).familia, familia(ap.fonteTexto).familia]);
    const partes = await Promise.all(ARQUIVOS.filter(a => familias.has(a.familia)).map(async a => {
      const resposta = await fetch(base + a.arquivo);
      if (!resposta.ok) throw new Error(_('Não consegui carregar a fonte {familia}.', { familia: a.familia }));
      const dados = base64(await resposta.arrayBuffer());
      return `/* ${a.familia}: SIL Open Font License 1.1 */\n` + fontFace(a, `data:font/woff2;base64,${dados}`);
    }));
    return partes.join('\n');
  }

  function base64(buffer) {
    const bytes = new Uint8Array(buffer);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }

  function carregarFontes(doc, base) {
    if (doc.querySelector('style[data-fontes]')) return;
    const estilo = doc.createElement('style');
    estilo.dataset.fontes = '';
    estilo.textContent = cssFontes(base);
    doc.head.appendChild(estilo);
  }

  // ---------- cor e contraste ----------

  function corValida(c) {
    return typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
  }

  function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function hex(c) {
    return '#' + c.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
  }

  function luminancia(cor) {
    const [r, g, b] = rgb(cor).map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contraste(a, b) {
    const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (claro + 0.05) / (escuro + 0.05);
  }

  // Ajusta a cor, mantendo o matiz, até ela ser legível como texto sobre o fundo:
  // escurece sobre fundo claro, clareia sobre fundo escuro.
  function paraTexto(cor, fundo, minimo = 4.5) {
    let [h, s, l] = hsl(rgb(cor));
    const passo = luminancia(fundo) < 0.18 ? 0.01 : -0.01;
    let atual = cor;
    while (contraste(atual, fundo) < minimo && (passo > 0 ? l < 1 : l > 0)) {
      l = Math.min(1, Math.max(0, l + passo));
      atual = hex(deHsl(h, s, l));
    }
    return atual;
  }

  function sobre(cor) {
    return contraste(cor, '#ffffff') >= contraste(cor, '#1a1a1a') ? '#ffffff' : '#1a1a1a';
  }

  function misturar(a, b, t) {
    const [ca, cb] = [rgb(a), rgb(b)];
    return hex(ca.map((v, i) => v * t + cb[i] * (1 - t)));
  }

  function hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, s, l];
  }

  function deHsl(h, s, l) {
    if (s === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const canal = t => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [canal(h + 1 / 3) * 255, canal(h) * 255, canal(h - 1 / 3) * 255];
  }

  return {
    FUNDOS, ACENTOS, FAMILIAS, COMBINACOES, ESTRUTURAS, FOTOS, FOTO_LARGURA, FOTO_ZOOM, FOTO_PROPORCOES, LAYOUTS, REFERENCIAS, ALINHAMENTOS, ESCURO, IDIOMAS, PADRAO,
    normalizar, combinacaoAtual, familia, nome, descricao, variaveis, css, pilha,
    cssFontes, cssFontesEmbutidas, carregarFontes, corValida, contraste,
  };
});
