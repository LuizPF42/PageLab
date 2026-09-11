/*
 * Tradução português -> inglês dentro do navegador, com o Transformers.js e o modelo
 * Opus-MT (Xenova/opus-mt-ROMANCE-en, ~108 MB quantizado). A biblioteca vem do jsDelivr e o
 * modelo do Hugging Face, só quando a pessoa pede; depois ficam no cache do navegador.
 * O texto nunca sai do computador: o modelo roda aqui.
 *
 * Os links [trecho](endereço) da apresentação são preservados: o trecho é traduzido à parte
 * e recolocado no lugar dentro da frase traduzida.
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

  let carregando = null;
  let tradutor = null;

  function jaBaixado() {
    try { return localStorage.getItem(CHAVE) === 'sim'; } catch (e) { return false; }
  }

  function pronto() {
    return !!tradutor;
  }

  // Carrega biblioteca e modelo uma vez; `progresso(fracao, etapa)` recebe 0..1 do download.
  function carregar(progresso) {
    if (tradutor) return Promise.resolve(tradutor);
    if (carregando) return carregando;
    carregando = (async () => {
      let lib;
      try {
        lib = await import(/* webpackIgnore: true */ BIBLIOTECA);
      } catch (e) {
        throw Object.assign(new Error(_('Não consegui carregar o tradutor. Confira a conexão e tente de novo.')), { amigavel: true });
      }
      if (typeof WebAssembly === 'undefined') {
        throw Object.assign(new Error(_('Este navegador não consegue rodar o tradutor.')), { amigavel: true });
      }
      lib.env.allowLocalModels = false;
      const arquivos = {}; // progresso por arquivo, para somar
      try {
        tradutor = await lib.pipeline('translation', MODELO, {
          quantized: true,
          progress_callback: p => {
            if (!progresso) return;
            if (p.status === 'progress' && p.file) {
              arquivos[p.file] = [p.loaded || 0, p.total || 0];
              const somas = Object.values(arquivos).reduce((s, [l, t]) => [s[0] + l, s[1] + t], [0, 0]);
              progresso(somas[1] ? somas[0] / somas[1] : 0, 'baixando');
            } else if (p.status === 'ready') progresso(1, 'pronto');
          },
        });
      } catch (e) {
        carregando = null;
        throw Object.assign(new Error(_('Não consegui carregar o tradutor. Confira a conexão e tente de novo.')), { amigavel: true, causa: e });
      }
      try { localStorage.setItem(CHAVE, 'sim'); } catch (e) { /* sem armazenamento */ }
      return tradutor;
    })();
    return carregando;
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
      if (/(?:^|\s)(?:Dr|Dra|Prof|Profa|Sr|Sra|et al|vs|n|p|v|ed|org|orgs|cf|ex|ex\.|[A-Z])\.$/i.test(atual)) continue;
      partes.push(atual);
      atual = '';
    }
    if (atual) partes.push(atual);
    return partes;
  }

  async function traduzirLista(textos) {
    if (!textos.length) return [];
    const saida = await tradutor(textos, { max_new_tokens: 200 });
    return (Array.isArray(saida) ? saida : [saida]).map(s => String(s.translation_text || '').trim());
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
      const [traduzidas, trechosEn] = await Promise.all([traduzirLista(originais), traduzirLista(trechos)]);
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
    const en = await traduzirLista(termos.map(t => String(t).trim()).filter(Boolean));
    return en.map(t => t.replace(/\.$/, '').replace(/^\p{Ll}/u, c => c.toUpperCase()));
  }

  async function traduzir(entrada, progresso) {
    await carregar(progresso);
    return Array.isArray(entrada) ? traduzirTermos(entrada) : traduzirTexto(entrada);
  }

  return { traduzir, carregar, pronto, jaBaixado, TAMANHO_MB, MODELO, frases, recolocarLinks };
});
