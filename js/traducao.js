/*
 * Tradução português -> inglês dentro do navegador, com o Transformers.js e o modelo
 * Opus-MT (Xenova/opus-mt-ROMANCE-en, ~108 MB quantizado). A biblioteca vem do jsDelivr e o
 * modelo do Hugging Face, só quando a pessoa pede; depois ficam no cache do navegador.
 * O texto nunca sai do computador: o modelo roda aqui, num Web Worker, para a tela não travar.
 *
 * Nomes de instituição ("Fundação Getulio Vargas", "Laboratório de ... (LabDados)") e siglas
 * ("FGV", "CNPq") são trocados por marcadores antes de traduzir e devolvidos depois: o modelo
 * inventa traduções para eles ("Getulio Foundation in Venezuela"). Os links [trecho](endereço)
 * da apresentação são traduzidos à parte e recolocados na frase.
 */
(function (raiz, fabrica) {
  const I18n = raiz.I18n || (typeof require === 'function' ? require('./i18n.js') : null);
  const api = fabrica(I18n);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Traducao = api;
})(typeof self !== 'undefined' ? self : this, function (I18n) {
  'use strict';

  const _ = I18n._;
  I18n.registrar({
    'Não consegui carregar o tradutor. Confira a conexão e tente de novo.': 'Could not load the translator. Check your connection and try again.',
    'Este navegador não consegue rodar o tradutor.': 'This browser cannot run the translator.',
  });

  // Versão 2 de propósito: os arquivos quantizados deste modelo foram convertidos para ela. Nas versões
  // 3 e 4, o mesmo modelo não abre (runtime novo) ou gera texto sem fim (testado em 2026-09-11).
  const BIBLIOTECA = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
  const MODELO = 'Xenova/opus-mt-ROMANCE-en';
  const TAMANHO_MB = 108; // encoder + decoder quantizados em 8 bits
  const CHAVE = 'pagelab:tradutor'; // marca que o modelo já foi baixado uma vez neste navegador

  // ---------- motor: um Web Worker com a biblioteca e o modelo ----------

  const CODIGO_WORKER = `
let tradutor = null;
self.onmessage = async e => {
  const { id, tipo, textos, biblioteca, modelo } = e.data;
  try {
    if (tipo === 'carregar') {
      if (!tradutor) {
        const lib = await import(biblioteca);
        lib.env.allowLocalModels = false;
        tradutor = await lib.pipeline('translation', modelo, {
          quantized: true,
          progress_callback: p => self.postMessage({ id, tipo: 'progresso', p: { status: p.status, file: p.file, loaded: p.loaded, total: p.total } }),
        });
      }
      self.postMessage({ id, tipo: 'ok' });
    } else if (tipo === 'traduzir') {
      const saida = await tradutor(textos, { max_new_tokens: 200 });
      self.postMessage({ id, tipo: 'ok', textos: (Array.isArray(saida) ? saida : [saida]).map(s => String(s.translation_text || '').trim()) });
    }
  } catch (err) {
    self.postMessage({ id, tipo: 'erro', mensagem: String((err && err.message) || err) });
  }
};`;

  let worker = null;
  let carregado = false;
  let carregando = null;
  let contador = 0;
  const pendentes = new Map(); // id -> { resolver, rejeitar, progresso }

  function motor() {
    if (worker) return worker;
    const url = URL.createObjectURL(new Blob([CODIGO_WORKER], { type: 'text/javascript' }));
    worker = new Worker(url, { type: 'module' });
    worker.onmessage = e => {
      const m = e.data;
      const p = pendentes.get(m.id);
      if (!p) return;
      if (m.tipo === 'progresso') { if (p.progresso) p.progresso(m.p); return; }
      pendentes.delete(m.id);
      if (m.tipo === 'erro') p.rejeitar(new Error(m.mensagem));
      else p.resolver(m.textos);
    };
    worker.onerror = e => {
      for (const p of pendentes.values()) p.rejeitar(new Error(e.message || 'worker'));
      pendentes.clear();
      worker = null;
      carregado = false;
      carregando = null;
    };
    return worker;
  }

  function pedir(tipo, dados, progresso) {
    return new Promise((resolver, rejeitar) => {
      const id = ++contador;
      pendentes.set(id, { resolver, rejeitar, progresso });
      motor().postMessage(Object.assign({ id, tipo, biblioteca: BIBLIOTECA, modelo: MODELO }, dados));
    });
  }

  function jaBaixado() {
    try { return localStorage.getItem(CHAVE) === 'sim'; } catch (e) { return false; }
  }

  function pronto() {
    return carregado;
  }

  // Carrega biblioteca e modelo uma vez; `progresso(fracao, etapa)` recebe 0..1 do download.
  function carregar(progresso) {
    if (carregado) return Promise.resolve();
    if (carregando) return carregando;
    if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
      return Promise.reject(Object.assign(new Error(_('Este navegador não consegue rodar o tradutor.')), { amigavel: true }));
    }
    const arquivos = {}; // progresso por arquivo, para somar
    carregando = pedir('carregar', {}, p => {
      if (!progresso) return;
      if (p.status === 'progress' && p.file) {
        arquivos[p.file] = [p.loaded || 0, p.total || 0];
        const somas = Object.values(arquivos).reduce((s, [l, t]) => [s[0] + l, s[1] + t], [0, 0]);
        progresso(somas[1] ? somas[0] / somas[1] : 0, 'baixando');
      } else if (p.status === 'ready') progresso(1, 'pronto');
    }).then(() => {
      carregado = true;
      try { localStorage.setItem(CHAVE, 'sim'); } catch (e) { /* sem armazenamento */ }
    }, e => {
      carregando = null;
      throw Object.assign(new Error(_('Não consegui carregar o tradutor. Confira a conexão e tente de novo.')), { amigavel: true, causa: e });
    });
    return carregando;
  }

  async function traduzirLista(textos) {
    if (!textos.length) return [];
    return pedir('traduzir', { textos });
  }

  // ---------- nomes protegidos ----------

  const INSTITUICAO_PALAVRAS = 'Universidade|Faculdade|Fundação|Instituto|Escola|Centro|Laboratório|Núcleo|Grupo|Programa|Departamento|Conselho|Ministério|Tribunal|Secretaria|Associação|Sociedade|Academia|Rede|Observatório|Museu|Hospital|Agência|Banco|Companhia|Coordenadoria|Pontifícia|Colégio|Câmara|Assembleia|Prefeitura|Defensoria|Procuradoria|Ordem|Comissão|Editora|Revista|Cátedra|Clínica|Superintendência|Diretoria|Pró-Reitoria|Reitoria|Cartório|Ouvidoria|Câmara';
  const CONECTIVO = 'de|da|do|dos|das|e|em|para|of|the|and|for|in';
  const MAIUSCULA = '\\p{Lu}[\\p{L}\\p{N}&-]*';
  const SIGLA = '(?:\\p{Lu}{2,}[\\p{L}\\p{N}]*|\\p{Lu}\\p{Ll}+\\p{Lu}[\\p{L}\\p{N}]*)(?:[-/][\\p{L}\\p{N}]+)?';
  // "Fundação Getulio Vargas", "Laboratório de Dados e Pesquisa Empírica em Direito (LabDados)",
  // "Escola de Direito de São Paulo da Fundação Getúlio Vargas"
  const RE_INSTITUICAO = new RegExp(`(?<![\\p{L}\\p{N}])(?:${INSTITUICAO_PALAVRAS})(?:\\s+(?:(?:${CONECTIVO})\\s+)*${MAIUSCULA})+(?:\\s*\\(${SIGLA}\\))?`, 'gu');
  // "FGV", "CNPq", "LabDados", "FGV-SP", "PUC/SP" (palavras com duas ou mais maiúsculas)
  const RE_SIGLA = new RegExp(`(?<![\\p{L}\\p{N}])${SIGLA}(?![\\p{L}\\p{N}])`, 'gu');

  // Marcadores que o modelo copia sem mexer (escolhidos por teste): números de cinco dígitos.
  const marcador = i => String(70001 + i);
  const RE_MARCADOR = /7\d{4}/g;

  // Troca nomes e siglas por marcadores; devolve o texto marcado e a lista do que foi tirado.
  function proteger(texto) {
    const nomes = [];
    // A pontuação colada ao fim ("Vargas.") fica fora do nome, no texto.
    const guardar = m => {
      const fim = (m.match(/[.,;:]+$/) || [''])[0];
      nomes.push(m.slice(0, m.length - fim.length));
      return ' ' + marcador(nomes.length - 1) + fim + ' ';
    };
    let s = texto.replace(RE_INSTITUICAO, guardar);
    s = s.replace(RE_SIGLA, m => (RE_MARCADOR.test(m) ? m : guardar(m)));
    return { texto: s.replace(/\s+([,.;:)!?])/g, '$1').replace(/\s{2,}/g, ' ').trim(), nomes };
  }

  // Devolve os nomes no lugar dos marcadores; null se o modelo perdeu algum (aí traduz sem proteção).
  function devolver(texto, nomes) {
    let faltou = false;
    let s = texto.replace(RE_MARCADOR, m => {
      const n = Number(m) - 70001;
      if (n < 0 || n >= nomes.length) return m;
      return nomes[n];
    });
    nomes.forEach(n => { if (!s.includes(n)) faltou = true; });
    if (faltou) return null;
    // Espaços em volta dos marcadores e pontuação colada
    s = s.replace(/\s+([,.;:)!?])/g, '$1').replace(/\(\s+/g, '(').replace(/\s{2,}/g, ' ').trim();
    return s;
  }

  // Traduz frases protegendo os nomes; as que perderem marcador voltam sem proteção.
  async function traduzirFrases(frases) {
    const protegidas = frases.map(proteger);
    const saida = await traduzirLista(protegidas.map(p => p.texto));
    const resultado = saida.map((t, i) => (protegidas[i].nomes.length ? devolver(t, protegidas[i].nomes) : t));
    const refazer = resultado.map((r, i) => (r === null ? i : -1)).filter(i => i >= 0);
    if (refazer.length) {
      const denovo = await traduzirLista(refazer.map(i => frases[i]));
      refazer.forEach((i, k) => { resultado[i] = denovo[k]; });
    }
    return resultado;
  }

  // ---------- texto ----------

  const LINK = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g;

  function frases(paragrafo) {
    // Quebra em frases no ponto final, interrogação ou exclamação seguidos de espaço e maiúscula;
    // abreviações comuns ("Dr.", "Prof.", "et al.", iniciais) não quebram.
    const partes = [];
    let atual = '';
    const pedacos = paragrafo.split(/(?<=[.!?])\s+(?=[“"(]?\p{Lu})/u);
    for (const p of pedacos) {
      atual = atual ? atual + ' ' + p : p;
      if (/(?:^|\s)(?:Dr|Dra|Prof|Profa|Sr|Sra|et al|vs|n|p|v|ed|org|orgs|cf|ex|[A-Z])\.$/i.test(atual)) continue;
      partes.push(atual);
      atual = '';
    }
    if (atual) partes.push(atual);
    return partes;
  }

  // Um texto corrido (parágrafos separados por linha em branco), com links preservados.
  async function traduzirTexto(texto) {
    const paragrafos = String(texto || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
    const resultado = [];
    for (const paragrafo of paragrafos) {
      const links = [];
      const limpo = paragrafo.replace(LINK, (m, trecho, url) => { links.push({ trecho, url }); return trecho; });
      const originais = frases(limpo);
      const trechos = links.map(l => l.trecho);
      const [traduzidas, trechosEn] = await Promise.all([traduzirFrases(originais), traduzirFrases(trechos)]);
      resultado.push(recolocarLinks(traduzidas.join(' '), links, trechosEn));
    }
    return resultado.join('\n\n');
  }

  // Recoloca cada link na frase traduzida. O trecho traduzido sozinho raramente sai igual ao que
  // saiu dentro da frase ("Data and Empirical Research in Law" vs. "Data and Empirical Law Research"),
  // então procura, em ordem, do primeiro ao último termo significativo do trecho. Sem achar, o link
  // vai para o fim do parágrafo, com o trecho traduzido, em vez de sumir.
  function recolocarLinks(junto, links, trechosEn) {
    links.forEach((l, i) => {
      const en = trechosEn[i] || l.trecho;
      const faixa = exato(junto, en) || exato(junto, l.trecho) || aproximado(junto, en) || aproximado(junto, l.trecho);
      if (faixa) junto = junto.slice(0, faixa[0]) + `[${junto.slice(faixa[0], faixa[1])}](${l.url})` + junto.slice(faixa[1]);
      else junto += ` [${en}](${l.url})`;
    });
    return junto;
  }

  function exato(texto, trecho) {
    const pos = trecho ? texto.toLowerCase().indexOf(trecho.toLowerCase()) : -1;
    return pos < 0 ? null : [pos, pos + trecho.length];
  }

  // Do primeiro termo significativo ao último, na ordem, dentro de uma janela de tamanho razoável.
  function aproximado(texto, trecho) {
    const termos = (trecho.match(/[\p{L}\p{N}]{3,}/gu) || []).filter(t => !/^(the|and|for|with|from|of|in|on|at|de|da|do|dos|das|em|para|com)$/i.test(t));
    if (termos.length < 2) return null;
    const baixo = texto.toLowerCase();
    const acha = (t, de) => {
      const re = new RegExp(`(?<![\\p{L}\\p{N}])${t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u');
      const m = re.exec(baixo.slice(de));
      return m ? de + m.index : -1;
    };
    const inicio = acha(termos[0], 0);
    if (inicio < 0) return null;
    // Do fim para o começo, o último termo que aparece depois do primeiro, perto o bastante.
    for (let k = termos.length - 1; k > 0; k--) {
      const pos = acha(termos[k], inicio + termos[0].length);
      if (pos < 0 || pos - inicio > trecho.length * 2 + 20) continue;
      let fim = pos + termos[k].length;
      if (baixo[fim] === ')') fim++; // "(LabDados)"
      return [inicio, fim];
    }
    return null;
  }

  // Lista curta de termos (interesses): cada um traduzido por si, com a inicial maiúscula.
  async function traduzirTermos(termos) {
    const en = await traduzirFrases(termos.map(t => String(t).trim()).filter(Boolean));
    return en.map(t => t.replace(/\.$/, '').replace(/^\p{Ll}/u, c => c.toUpperCase()));
  }

  async function traduzir(entrada, progresso) {
    await carregar(progresso);
    return Array.isArray(entrada) ? traduzirTermos(entrada) : traduzirTexto(entrada);
  }

  return { traduzir, carregar, pronto, jaBaixado, TAMANHO_MB, MODELO, frases, recolocarLinks, proteger, devolver };
});
