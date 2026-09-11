/*
 * Tema do site pessoal: fundos, cores de destaque, fontes, estrutura da página e formato da foto,
 * e o cálculo das cores com contraste suficiente para leitura (WCAG, 4.5:1).
 */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Tema = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const FUNDOS = [
    { id: 'branco', nome: 'Branco', fundo: '#ffffff', superficie: '#f6f6f4', texto: '#1c1c1e', suave: '#5f6368', borda: '#e6e5e1' },
    { id: 'creme', nome: 'Creme', fundo: '#fbf7ef', superficie: '#f3ecdf', texto: '#29241f', suave: '#6a6157', borda: '#e7dccb' },
    { id: 'cinza', nome: 'Cinza', fundo: '#f1f2f4', superficie: '#e6e8eb', texto: '#1d2126', suave: '#5a606a', borda: '#d9dce1' },
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

  const PADRAO = { fundo: 'branco', acento: '#0f766e', fonteTitulo: 'inter', fonteTexto: 'inter', layout: 'abas', estrutura: 'lateral', foto: 'redonda', referencias: 'simples', alinhamento: 'justificado' };

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
      fotoLargura: numero(ap.fotoLargura, FOTO_LARGURA),     // null: tamanho padrão da estrutura
      fotoProporcao: numero(ap.fotoProporcao, FOTO_PROPORCAO), // null: 3:2
    };
  }

  function familia(id) {
    return FAMILIAS.find(f => f.id === id) || FAMILIAS[0];
  }

  // A combinação pronta que corresponde às fontes escolhidas, se houver.
  function combinacaoAtual(ap) {
    return COMBINACOES.find(c => c.titulo === ap.fonteTitulo && c.texto === ap.fonteTexto) || null;
  }

  // ---------- variáveis CSS do site ----------

  function variaveis(aparencia) {
    const ap = normalizar(aparencia);
    const f = FUNDOS.find(x => x.id === ap.fundo);
    const titulo = familia(ap.fonteTitulo);
    const acento = ap.acento;
    return {
      '--fundo': f.fundo,
      '--superficie': f.superficie,
      '--texto': f.texto,
      '--suave': f.suave,
      '--borda': f.borda,
      '--acento': acento,                          // detalhes decorativos: barras, bordas, preenchimentos
      '--acento-texto': paraTexto(acento, f.fundo), // links e textos coloridos sobre o fundo
      '--sobre-acento': sobre(acento),              // texto em cima de um preenchimento com a cor
      '--acento-fundo': misturar(acento, f.fundo, 0.09),
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
    };
  }

  function css(ap) {
    return ':root{' + Object.entries(variaveis(ap)).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(';') + '}';
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
      if (!resposta.ok) throw new Error(`Não consegui carregar a fonte ${a.familia}.`);
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

  // Escurece a cor, mantendo o matiz, até ela ser legível como texto sobre o fundo.
  function paraTexto(cor, fundo, minimo = 4.5) {
    let [h, s, l] = hsl(rgb(cor));
    let atual = cor;
    while (contraste(atual, fundo) < minimo && l > 0) {
      l = Math.max(0, l - 0.01);
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
    FUNDOS, ACENTOS, FAMILIAS, COMBINACOES, ESTRUTURAS, FOTOS, FOTO_LARGURA, LAYOUTS, REFERENCIAS, ALINHAMENTOS, PADRAO,
    normalizar, combinacaoAtual, familia, variaveis, css, pilha,
    cssFontes, cssFontesEmbutidas, carregarFontes, corValida, contraste,
  };
});
