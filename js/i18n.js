/*
 * Idiomas do construtor e do site gerado.
 *
 * O português é a língua de origem: os textos ficam escritos em português no código, e cada
 * módulo registra as traduções para o inglês com I18n.registrar({ 'texto': 'text' }).
 * _('texto') devolve o texto no idioma atual; sem tradução, devolve o próprio português
 * (e anota a falta em I18n.faltando, para ajudar a completar).
 * Marcadores {nome} são substituídos pelo segundo argumento: _('{n} itens', { n: 3 }).
 */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.I18n = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const IDIOMAS = [
    { id: 'pt', nome: 'Português', lang: 'pt-BR' },
    { id: 'en', nome: 'English', lang: 'en' },
  ];
  const CHAVE = 'pagelattes:idioma';

  const traducoes = { en: {} };
  const faltando = new Set();
  let atual = 'pt';

  function valido(id) {
    return IDIOMAS.some(i => i.id === id) ? id : 'pt';
  }

  // Idioma guardado, ou o do navegador na primeira visita.
  function detectar() {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) return valido(salvo);
    } catch (e) { /* sem armazenamento */ }
    const nav = typeof navigator !== 'undefined' ? (navigator.language || '') : '';
    return /^pt/i.test(nav) ? 'pt' : 'en';
  }

  function definir(id) {
    atual = valido(id);
    try { localStorage.setItem(CHAVE, atual); } catch (e) { /* sem armazenamento */ }
    return atual;
  }

  function idioma() {
    return atual;
  }

  function lang(id) {
    return (IDIOMAS.find(i => i.id === valido(id)) || IDIOMAS[0]).lang;
  }

  function registrar(mapa, id = 'en') {
    Object.assign(traducoes[id] || (traducoes[id] = {}), mapa);
  }

  function traduzir(texto, params) {
    let s = texto;
    if (atual !== 'pt') {
      const t = traducoes[atual] && traducoes[atual][texto];
      if (t == null) faltando.add(texto);
      else s = t;
    }
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? params[k] : m));
    return s;
  }

  // Roda `fn` com outro idioma ativo (o site gerado pode estar em inglês com o construtor em português).
  function com(id, fn) {
    const antes = atual;
    atual = valido(id);
    try { return fn(); } finally { atual = antes; }
  }

  return { IDIOMAS, detectar, definir, idioma, lang, registrar, _: traduzir, com, faltando };
});
