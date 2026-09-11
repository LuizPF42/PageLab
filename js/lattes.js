/*
 * Leitor da página pública do Currículo Lattes, salva pelo navegador (Ctrl+S).
 *
 * Extrai apenas os campos que o site pessoal usa. A página pública já traz só
 * o que o autor marcou como público, e mesmo assim nada fora desta lista sai daqui.
 * Funciona no navegador (DOMParser nativo) e no Node (com linkedom, nos testes).
 */
(function (raiz, fabrica) {
  const I18n = raiz.I18n || (typeof require === 'function' ? require('./i18n.js') : null);
  const api = fabrica(I18n);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Lattes = api;
})(typeof self !== 'undefined' ? self : this, function (I18n) {
  'use strict';

  const _ = I18n._;

  const MENSAGENS = {
    pdf: 'Esse é o PDF do currículo. O construtor precisa da página do currículo salva pelo navegador (arquivo .html).',
    webarchive: 'O Safari salvou a página como “Arquivo da Web”. Salve de novo escolhendo o formato “Código-fonte da página”.',
    mhtml: 'A página foi salva como “arquivo único” (.mhtml). Salve de novo escolhendo “Página da Web, completa”.',
    'nao-lattes': 'Não reconheci este arquivo como uma página do Currículo Lattes. Confira se você salvou a página do currículo já aberto, com seu nome e suas produções.',
  };

  I18n.registrar({
    [MENSAGENS.pdf]: 'This is the PDF of the CV. The builder needs the CV page saved by the browser (an .html file).',
    [MENSAGENS.webarchive]: 'Safari saved the page as a “Web Archive”. Save it again choosing the “Page Source” format.',
    [MENSAGENS.mhtml]: 'The page was saved as a “single file” (.mhtml). Save it again choosing “Webpage, complete”.',
    [MENSAGENS['nao-lattes']]: 'This file does not look like a Lattes CV page. Check that you saved the CV page while it was open, showing your name and your publications.',
    'Não consegui ler a seção “{titulo}”.': 'Could not read the “{titulo}” section.',
  });

  // "Educação e Popularização de C&T" e "Inovação" só repetem itens já listados em outras seções.
  const IGNORADAS = /^(Endereco|EducacaoPopularizacaoCTA|PotencialInovacao)$/;

  // Em orientações e bancas, o subtítulo sozinho ("Mestrado") não diz nada; junta com o grupo.
  // O terceiro campo é a tradução do prefixo, para o site em inglês.
  const GRUPOS = [
    [/^Orientações e supervisões em andamento/i, 'Orientações em andamento', 'Ongoing advising'],
    [/^Orientações e supervisões concluídas/i, 'Orientações concluídas', 'Completed advising'],
    [/^Participação em bancas de trabalhos de conclusão/i, 'Bancas', 'Committees'],
    [/^Participação em bancas de comissões julgadoras/i, 'Comissões julgadoras', 'Selection committees'],
  ];

  // Subtítulos que o Lattes usa nesses grupos. Os títulos compostos ("Bancas: Mestrado") são os
  // que o site exibe; um subtítulo fora desta lista fica em português no site em inglês.
  const SUBTITULOS = {
    // orientações
    'Tese de doutorado': 'Doctoral dissertation',
    'Dissertação de mestrado': "Master's thesis",
    'Monografia de conclusão de curso de aperfeiçoamento/especialização': 'Specialization monograph',
    'Trabalho de conclusão de curso de graduação': 'Undergraduate thesis',
    'Iniciação científica': 'Undergraduate research',
    'Supervisão de pós-doutorado': 'Postdoctoral supervision',
    'Orientações de outra natureza': 'Other advising',
    // bancas de trabalhos de conclusão
    'Mestrado': "Master's",
    'Teses de doutorado': 'Doctoral dissertations',
    'Qualificações de Doutorado': 'Doctoral qualifying exams',
    'Qualificações de Mestrado': "Master's qualifying exams",
    'Monografias de cursos de aperfeiçoamento/especialização': 'Specialization monographs',
    'Trabalhos de conclusão de curso de graduação': 'Undergraduate theses',
    // comissões julgadoras
    'Concurso público': 'Faculty hiring',
    'Professor titular': 'Full professorship',
    'Livre docência': 'Habilitation',
    'Avaliação de cursos': 'Program evaluation',
    'Outras participações': 'Other',
  };
  I18n.registrar(Object.fromEntries(GRUPOS.flatMap(([, rotulo, en]) =>
    [[rotulo, en]].concat(Object.entries(SUBTITULOS).map(([sub, subEn]) => [`${rotulo}: ${sub}`, `${en}: ${subEn}`])))));

  function erro(codigo) {
    const e = new Error(_(MENSAGENS[codigo]));
    e.codigo = codigo;
    e.amigavel = true;
    return e;
  }

  // ---------- arquivo -> texto ----------

  // A página do Lattes vem em windows-1252; alguns navegadores regravam em UTF-8.
  // Por isso o charset é lido do próprio arquivo.
  function decodificar(buffer) {
    const bytes = new Uint8Array(buffer);
    const inicio = String.fromCharCode.apply(null, bytes.subarray(0, 4096));
    if (inicio.startsWith('%PDF')) throw erro('pdf');
    if (inicio.startsWith('bplist')) throw erro('webarchive');
    if (/^\s*(From:|MIME-Version:)/i.test(inicio) || /multipart\/related/i.test(inicio.slice(0, 800))) throw erro('mhtml');

    let charset = 'windows-1252';
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) charset = 'utf-8';
    else {
      const m = inicio.match(/<meta[^>]+charset=["']?\s*([\w-]+)/i);
      if (m) charset = m[1];
    }
    try {
      return new TextDecoder(charset).decode(bytes);
    } catch (e) {
      return new TextDecoder('windows-1252').decode(bytes);
    }
  }

  function lerHtml(html, DOMParserImpl) {
    const P = DOMParserImpl || DOMParser;
    return ler(new P().parseFromString(html, 'text/html'));
  }

  // ---------- documento -> dados ----------

  function ler(doc) {
    const nomeEl = doc.querySelector('.infpessoa .nome');
    const blocos = [...doc.querySelectorAll('.title-wrapper')];
    if (!nomeEl || !blocos.length) throw erro('nao-lattes');

    doc.querySelectorAll('.tooltip-oasis, .icons-aviso, script, style, noscript').forEach(n => n.remove());

    const nome = limpa(nomeEl.textContent);
    const info = limpa((doc.querySelector('.informacoes-autor') || {}).textContent || '');
    const id = (info.match(/ID Lattes:\s*(\d{16})/) || [])[1] || '';
    const atualizadoEm = (info.match(/atualização do currículo em\s*([\d/]+)/i) || [])[1] || '';
    const urlLattes = (info.match(/https?:\/\/lattes\.cnpq\.br\/\d+/) || [])[0] || (id ? 'http://lattes.cnpq.br/' + id : '');

    let bio = '';
    const resumoEl = doc.querySelector('p.resumo');
    if (resumoEl) {
      const c = resumoEl.cloneNode(true);
      c.querySelectorAll('.texto').forEach(n => n.remove()); // "(Texto informado pelo autor)"
      bio = limpa(c.textContent);
    }

    const secoes = [];
    const avisos = [];
    let orcid = '';

    for (const bloco of blocos) {
      const ancora = bloco.querySelector('a[name]');
      if (!ancora) continue;
      const idSecao = ancora.getAttribute('name');
      const titulo = limpa((bloco.querySelector('h1') || {}).textContent || idSecao);

      if (idSecao === 'Identificacao') {
        const a = bloco.querySelector('a[href*="orcid.org/"]');
        if (a) orcid = a.getAttribute('href');
        continue;
      }
      if (IGNORADAS.test(idSecao)) continue; // o e-mail público é lido abaixo; endereço e telefone, não

      if (bloco.querySelector('.layout-cell-11')) {
        for (const cat of producoes(bloco, titulo)) {
          secoes.push({ id: idSecao + ':' + cat.titulo, titulo: cat.titulo, tipo: 'producao', itens: cat.itens });
        }
        continue;
      }

      const itens =
        /^FormacaoAcademica/.test(idSecao) ? formacao(bloco) :
        idSecao === 'AtuacaoProfissional' ? atuacao(bloco) :
        generico(bloco, nome);

      if (itens.length) secoes.push({ id: idSecao, titulo, tipo: 'lista', itens });
      else if (limpa(bloco.textContent).length > titulo.length + 20) avisos.push(_('Não consegui ler a seção “{titulo}”.', { titulo }));
    }

    for (const s of secoes) for (const it of s.itens) it.id = hash([s.id, it.periodo, it.titulo, it.detalhe].join('|'));

    // O HTML dessa parte é malformado; pega o elemento mais interno que contém o e-mail.
    const emailEl = [...doc.querySelectorAll('div, span, li, p, td')].filter(el => /E-mail para contato/i.test(el.textContent)).pop();
    const email = ((emailEl ? limpa(emailEl.textContent) : '').match(/E-mail para contato\s*:\s*([^\s<>]+@[^\s<>]+)/i) || [])[1] || '';

    return {
      fonte: { tipo: 'lattes', id, atualizadoEm },
      perfil: { nome, bio, links: { email: semPonto(email), lattes: urlLattes, orcid } },
      secoes,
      avisos,
    };
  }

  // ---------- seções em pares "rótulo | conteúdo" ----------

  // Percorre, em ordem, os títulos de instituição e as células de rótulo (3) e conteúdo (9).
  function sequencia(bloco) {
    const out = [];
    for (const el of bloco.querySelectorAll('.inst_back, .layout-cell-3, .layout-cell-9')) {
      if (el.matches('.inst_back')) out.push({ tipo: 'inst', texto: limpa(el.textContent) });
      else if (el.matches('.layout-cell-3')) out.push({ tipo: 'rotulo', texto: limpa(el.textContent), sub: el.matches('.subtit-1') });
      else out.push({ tipo: 'conteudo', linhas: linhas(el.querySelector('.layout-cell-pad-5') || el) });
    }
    return out;
  }

  function pares(bloco) {
    const seq = sequencia(bloco);
    const out = [];
    seq.forEach((e, i) => {
      if (e.tipo !== 'rotulo') return;
      const prox = seq[i + 1];
      out.push({ rotulo: e.texto, sub: e.sub, linhas: prox && prox.tipo === 'conteudo' ? prox.linhas : [] });
    });
    return out;
  }

  function formacao(bloco) {
    return pares(bloco).filter(p => p.linhas.length).map(p => {
      const [grau = '', inst = '', ...resto] = p.linhas;
      const tese = resto.find(l => /^Título:/i.test(l)) || '';
      return item({
        periodo: p.rotulo,
        titulo: semPonto(semCargaHoraria(grau)),
        detalhe: instituicao(inst),
        obs: semPonto(tese.replace(/^Título:\s*/i, '').replace(/,?\s*Ano de Obtenção:.*$/i, '')),
      });
    });
  }

  function atuacao(bloco) {
    const itens = [];
    const seq = sequencia(bloco);
    let inst = '';
    let atual = null;
    let ignorar = false;

    seq.forEach((e, i) => {
      if (e.tipo === 'inst') { inst = instituicao(e.texto); atual = null; ignorar = false; return; }
      if (e.tipo !== 'rotulo') return;
      const prox = seq[i + 1];
      const conteudo = prox && prox.tipo === 'conteudo' ? prox.linhas.join(' ') : '';

      // Subtítulos: "Vínculo institucional" abre um vínculo; "Atividades" e afins ficam de fora.
      if (e.sub) { ignorar = !/^Vínculo institucional/i.test(e.texto); atual = null; return; }
      if (ignorar) return;

      if (/\d{4}/.test(e.texto)) {
        const cargo = limpa((conteudo.match(/Enquadramento Funcional:\s*([^,]*)/i) || [])[1]);
        const vinculo = limpa((conteudo.match(/Vínculo:\s*([^,]*)/i) || [])[1]);
        atual = item({ periodo: e.texto, titulo: semPonto(cargo || vinculo || (/Vínculo:/i.test(conteudo) ? '' : conteudo)), detalhe: inst });
        itens.push(atual);
      } else if (/^Outras informações/i.test(e.texto) && atual) {
        atual.obs = semPonto(conteudo);
      }
    });

    // Vínculo sem cargo preenchido no Lattes: usa a descrição, se houver.
    for (const it of itens) {
      if (it.titulo) continue;
      it.titulo = it.obs || 'Vínculo institucional';
      if (it.titulo === it.obs) it.obs = '';
    }
    return itens;
  }

  // Projetos, linhas de pesquisa, formação complementar, revisor de periódico, áreas,
  // idiomas, prêmios e seções desconhecidas. Uma linha com rótulo vazio continua o item anterior.
  function generico(bloco, nome) {
    const pre = bloco.querySelector('pre');
    if (pre && !bloco.querySelector('.layout-cell-3')) return [item({ titulo: limpa(pre.textContent) })]; // texto livre

    const itens = [];
    let atual = null;
    for (const p of pares(bloco)) {
      const [l0 = '', l1 = ''] = p.linhas;
      if (!p.rotulo && atual) { complementar(atual, p.linhas, nome); continue; }
      if (!p.rotulo && !p.linhas.length) continue;

      if (!p.rotulo || /^\d{1,3}\.$/.test(p.rotulo)) atual = item({ titulo: tituloGenerico(l0), detalhe: instituicao(l1) });
      else if (/\d{4}/.test(p.rotulo)) atual = item({ periodo: p.rotulo, titulo: tituloGenerico(l0), detalhe: instituicao(l1) });
      else atual = item({ titulo: p.rotulo, detalhe: semPonto(p.linhas.join(' ')) });

      if (atual.titulo) itens.push(atual);
    }
    return itens;
  }

  function complementar(it, linhas, nome) {
    for (const l of linhas) {
      const texto = l.match(/^(?:(?:Descrição|Objetivo):\s*)+(.*)$/i);
      if (texto && !it.obs) { it.obs = semPonto(texto[1]); continue; }
      const integrantes = l.match(/^Integrantes:\s*(.*)$/i);
      if (integrantes) {
        // Guarda só o papel da própria pessoa no projeto, não a lista de integrantes.
        const eu = integrantes[1].split('/').map(limpa).find(s => s.startsWith(nome + ' - '));
        if (eu) it.detalhe = semPonto(eu.slice(nome.length + 3));
      }
    }
  }

  function tituloGenerico(s) {
    s = semCargaHoraria(s).replace(/^(Periódico|Agência de fomento):\s*/i, '');
    if (/^Grande área:/i.test(s)) s = s.slice(s.lastIndexOf(':') + 1); // fica só a área mais específica
    return semPonto(limpa(s));
  }

  function semCargaHoraria(s) {
    return s.replace(/\s*\(Carga horária:[^)]*\)\.?/i, '');
  }

  // ---------- seções de produção (listas numeradas) ----------

  function producoes(bloco, tituloSecao) {
    const cats = [];
    let grupo = '';
    let sub = '';
    let cat = null;
    for (const el of bloco.querySelectorAll('.inst_back, .cita-artigos, .layout-cell-11')) {
      if (el.matches('.inst_back')) { grupo = limpa(el.textContent); sub = ''; cat = null; continue; }
      if (el.matches('.cita-artigos')) { sub = limpa(el.textContent); cat = null; continue; }
      if (!cat) {
        cat = { titulo: sub ? tituloCategoria(sub, grupo) : grupo || tituloSecao, itens: [] };
        cats.push(cat);
      }
      const it = producao(el);
      if (it) cat.itens.push(it);
    }
    return cats.filter(c => c.itens.length);
  }

  function tituloCategoria(sub, grupo) {
    for (const [re, rotulo] of GRUPOS) if (re.test(grupo)) return `${rotulo}: ${sub}`;
    return sub;
  }

  function producao(el) {
    const c = el.cloneNode(true);
    const relevante = !!c.querySelector('img[src*="ico_relevante"]'); // marcado pelo autor no Lattes
    const anoEl = c.querySelector('.informacao-artigo[data-tipo-ordenacao="ano"]');
    const doiEl = c.querySelector('a[href*="doi.org/"]');
    const negritoEl = c.querySelector('b');
    const citadoEl = c.querySelector('.citado');
    const cvuri = citadoEl ? citadoEl.getAttribute('cvuri') || '' : '';
    c.querySelectorAll('.informacao-artigo, .citado, img, a.icone-producao').forEach(n => n.remove());

    const texto = limpaCitacao(c.textContent);
    if (!texto) return null;
    const negrito = negritoEl ? limpa(negritoEl.textContent) : '';
    const anos = texto.match(/\b(19|20)\d{2}\b/g);
    return item(Object.assign({
      periodo: anoEl ? limpa(anoEl.textContent) : (anos ? anos[anos.length - 1] : ''),
      titulo: texto,
      link: doiEl ? doiEl.getAttribute('href') : '',
      negrito,
      relevante,
    }, separarCitacao(limpa(c.textContent), negrito, cvuri)));
  }

  // Separa a referência do Lattes em autores, título da obra e veículo (revista, livro, evento),
  // para os cartões de destaque. Usa o texto ainda sem limpeza, onde o Lattes separa autores e
  // título com " . " (ou ".." quando o último autor termina com ponto abreviado).
  function separarCitacao(bruto, negrito, cvuri) {
    const vazio = { autores: '', obra: '', veiculo: '' };
    let autores;
    let resto;
    // Vale o separador que aparece primeiro: depois do título pode haver outro " . ", o da lista
    // de organizadores de um livro ("In: VIEIRA, O. V.; DIMOULIS, D. (Org.) . Título do livro").
    const candidatos = [];
    const espacoPonto = bruto.indexOf(' . ');
    if (espacoPonto >= 0) candidatos.push([espacoPonto, espacoPonto, espacoPonto + 3]);
    const pontoPonto = bruto.indexOf('.. ');
    if (pontoPonto >= 0) candidatos.push([pontoPonto, pontoPonto + 1, pontoPonto + 3]);
    const n = negrito ? bruto.indexOf(negrito) : -1;
    if (n >= 0 && bruto.slice(n + negrito.length, n + negrito.length + 2) === '. ') {
      candidatos.push([n + negrito.length, n + negrito.length, n + negrito.length + 2]);
    }
    candidatos.sort((a, b) => a[0] - b[0]);
    if (candidatos.length) {
      autores = bruto.slice(0, candidatos[0][1]);
      resto = bruto.slice(candidatos[0][2]).trim();
    } else {
      // Registro malformado ("AUTOR; AUTOR; Título. ..."): o título começa no primeiro trecho
      // que não tem cara de nome de autor ("SOBRENOME, Nome").
      const partes = bruto.split(/\s*;\s*/);
      const j = partes.findIndex(p => !/^[^,;]{2,60},\s?[^,;]{1,60}$/.test(p));
      if (j <= 0) return vazio;
      autores = partes.slice(0, j).join('; ');
      resto = partes.slice(j).join('; ');
    }
    return separarResto(limpaCitacao(autores), resto, cvuri);
  }

  // Para referências já limpas (progresso salvo antes de o leitor separar as partes): o " . " entre
  // autores e título sumiu na limpeza, então a lista de autores é lida autor por autor, pelo formato
  // "SOBRENOME, Nome" (nomes e iniciais até o ";" do próximo autor ou até o ponto que encerra a lista).
  function separarLimpa(texto) {
    texto = limpa(texto);
    const inicial = t => /^(\p{L}\.)+;?$/u.test(t) || /^\((?:Orgs?|Eds?|Coords?)\.\)/.test(t);
    // "SOBRENOME, Nome" ou um nome sem vírgula, com todas as palavras em maiúscula ("Maria Souza Lima").
    const pareceNome = t => t.includes(',') || /^et\.?\s?al\.?$/i.test(t) ||
      t.replace(/[.;]$/, '').split(/\s+/).every(p => /^\p{Lu}/u.test(p) || /^(de|da|do|dos|das|e|van|von|del|di)$/i.test(p));
    const autores = [];
    let pos = 0;
    for (;;) {
      // Cada autor: até 9 palavras, terminando no ";" do próximo autor ou no ponto que fecha a lista.
      const palavras = /\S+/g;
      palavras.lastIndex = pos;
      let fim = -1;
      let fimLista = false;
      for (let n = 0, m; n < 9 && (m = palavras.exec(texto)); n++) {
        const p = m[0];
        if (p.endsWith(';')) { fim = m.index + p.length - 1; break; }
        if (!p.endsWith('.')) continue;
        const seguinte = texto.slice(palavras.lastIndex).match(/\S+/);
        if (inicial(p) && seguinte && inicial(seguinte[0])) continue; // "L. C." ou "L. C. (Org.)"
        fim = m.index + p.length - 1;
        fimLista = true;
        break;
      }
      if (fim < 0) break;
      const trecho = texto.slice(pos, fim + 1).trim();
      // O trecho que fecha a lista precisa ter cara de nome; senão já é o título (registro malformado).
      // Seguido de "2009. (Apresentação...)", também é o título, mesmo com cara de nome.
      if (fimLista && (!pareceNome(trecho) || /^\s*(?:19|20)\d{2}\.\s*\(/.test(texto.slice(fim + 1)))) break;
      // O ponto final fica só quando é de uma inicial ("Ana C."), que a limpeza juntou ao separador.
      const ultima = trecho.split(/\s+/).pop();
      autores.push(trecho.endsWith(';') || !/^\p{L}\.$/u.test(ultima) ? trecho.slice(0, -1).trim() : trecho);
      pos = fim + 1;
      if (fimLista) break;
    }
    if (!autores.length) return { autores: '', obra: '', veiculo: '' };
    return separarResto(autores.join('; '), texto.slice(pos).trim(), '');
  }

  // Depois dos autores: título da obra e veículo.
  function separarResto(autores, resto, cvuri) {
    // Artigos: o Lattes traz título e periódico exatos num atributo da página.
    const tituloCv = limpa((cvuri.match(/[?&]titulo=(.*?)&sequencial=/) || [])[1]);
    const periodicoCv = limpa((cvuri.match(/&nomePeriodico=(.*)$/) || [])[1]);
    if (tituloCv && resto.startsWith(tituloCv)) return { autores, obra: semPonto(tituloCv), veiculo: periodicoCv };

    // Capítulos e anais: "Título. In: ..."
    const emIn = resto.match(/^(.+?)\.\s+In:\s+(.*)$/);
    if (emIn) return { autores, obra: semPonto(emIn[1]), veiculo: veiculoIn(emIn[2]) };

    // Apresentações e afins: "Título. 2026. (Apresentação de Trabalho/Congresso)."
    const comAno = resto.match(/^(.+?)\.\s+(?:19|20)\d{2}\.\s+\(/);
    if (comAno) return { autores, obra: semPonto(comAno[1]), veiculo: '' };

    // Livros ("Título. 1. ed. Cidade: Editora, 2024.") e textos em jornais ("Título. Jornal, Cidade, data.")
    const fim = fimDoTitulo(resto);
    if (fim < 0) return { autores, obra: semPonto(resto), veiculo: '' };
    const depois = resto.slice(fim + 1).trim();
    const editora = depois.match(/^\d+\.?\s*ed\.\s*[^:]*:\s*([^,]+),/);
    const veiculo = editora ? editora[1] : depois.split(/,\s|\.\s+(?=\d)|\.?\s?\d+\s?ed\./)[0];
    return { autores, obra: semPonto(resto.slice(0, fim + 1)), veiculo: semPonto(veiculo) };
  }

  // Posição do ponto que encerra o título: ". " seguido de maiúscula ou número,
  // pulando abreviações de uma ou duas letras (n., v., p., U.S., Vs.).
  function fimDoTitulo(s) {
    const re = /([^\s.]*)\.\s+(?=[A-ZÀ-Ý0-9"“'])/g;
    let m;
    while ((m = re.exec(s))) {
      if (m.index < 8 || /^[A-Za-zº]{1,2}$/.test(m[1])) continue;
      return m.index + m[1].length;
    }
    return -1;
  }

  // Depois do "In:": o título do livro (capítulos) ou o nome do evento (anais).
  function veiculoIn(s) {
    const livro = s.match(/\((?:Orgs?|Eds?|Coords?)\.?\)\.?\s*(.+)$/i);
    if (livro) return limpa(livro[1].split(/\.\s|\s?\d+\s?ed\./)[0]);
    return limpa(s.split(/,\s*(?:19|20)\d{2}\b/)[0]);
  }

  // ---------- utilidades ----------

  // O id é calculado no fim de ler(), depois que todos os campos estão preenchidos.
  function item(campos) {
    return Object.assign({ id: '', periodo: '', titulo: '', detalhe: '', obs: '', link: '', negrito: '', relevante: false, autores: '', obra: '', veiculo: '' }, campos);
  }

  function linhas(el) {
    const out = [];
    let atual = '';
    for (const n of el.childNodes) {
      if (n.nodeName === 'BR') { out.push(atual); atual = ''; }
      else atual += n.textContent;
    }
    out.push(atual);
    return out.map(limpa).filter(Boolean);
  }

  function limpa(s) {
    return String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // "SILVA FILHO, Ana C.. Título. REVISTA , v. 1" -> "SILVA FILHO, Ana C. Título. REVISTA, v. 1"
  function limpaCitacao(s) {
    return limpa(s).replace(/\s+([.,;:])/g, '$1').replace(/\.{2,}/g, '.');
  }

  function semPonto(s) {
    return limpa(s).replace(/\s*\.$/, '');
  }

  function instituicao(s) {
    return semPonto(s).replace(/,\s*Brasil$/, '');
  }

  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  return { decodificar, lerHtml, ler, separarLimpa };
});
