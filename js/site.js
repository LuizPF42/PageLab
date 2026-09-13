/*
 * Gera o HTML do site pessoal a partir do estado do construtor.
 * O mesmo HTML serve para a prévia (fontes vindas do Google) e para o arquivo final.
 */
(function (raiz, fabrica) {
  const Tema = raiz.Tema || (typeof require === 'function' ? require('./tema.js') : null);
  const I18n = raiz.I18n || (typeof require === 'function' ? require('./i18n.js') : null);
  const api = fabrica(Tema, I18n);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Site = api;
})(typeof self !== 'undefined' ? self : this, function (Tema, I18n) {
  'use strict';

  const _ = I18n._;

  const VISIVEIS = 5; // itens por seção antes do "ver todos"

  // Título da seção no Lattes -> título curto no site. A tradução do curto fica no registro abaixo;
  // seções do Lattes fora desta lista aparecem com o título original (em português) em qualquer idioma.
  const TITULOS_CURTOS = {
    'Formação acadêmica/titulação': 'Formação',
    'Formação Complementar': 'Formação complementar',
    'Pós-doutorado': 'Pós-doutorado',
    'Atuação Profissional': 'Atuação profissional',
    'Linhas de pesquisa': 'Linhas de pesquisa',
    'Projetos de pesquisa': 'Projetos de pesquisa',
    'Projetos de extensão': 'Projetos de extensão',
    'Projetos de ensino': 'Projetos de ensino',
    'Outros Projetos': 'Outros projetos',
    'Projetos de desenvolvimento': 'Projetos de desenvolvimento',
    'Áreas de atuação': 'Áreas de atuação',
    'Idiomas': 'Idiomas',
    'Prêmios e títulos': 'Prêmios e títulos',
    'Revisor de periódico': 'Revisor de periódico',
    'Revisor de projeto de fomento': 'Revisor de projeto de fomento',
    'Membro de corpo editorial': 'Membro de corpo editorial',
    'Membro de comitê de assessoramento': 'Membro de comitê de assessoramento',
    'Outras informações relevantes': 'Outras informações relevantes',
    'Artigos completos publicados em periódicos': 'Artigos em periódicos',
    'Artigos aceitos para publicação': 'Artigos aceitos para publicação',
    'Livros publicados/organizados ou edições': 'Livros',
    'Capítulos de livros publicados': 'Capítulos de livros',
    'Textos em jornais de notícias/revistas': 'Textos em jornais e revistas',
    'Trabalhos completos publicados em anais de congressos': 'Trabalhos em anais de congressos',
    'Resumos expandidos publicados em anais de congressos': 'Resumos expandidos em anais de congressos',
    'Resumos publicados em anais de congressos': 'Resumos em anais de congressos',
    'Apresentações de Trabalho': 'Apresentações de trabalho',
    'Outras produções bibliográficas': 'Outras produções bibliográficas',
    'Entrevistas, mesas redondas, programas e comentários na mídia': 'Na mídia',
    'Redes sociais, websites e blogs': 'Redes sociais, websites e blogs',
    'Participação em eventos, congressos, exposições e feiras': 'Participação em eventos',
    'Organização de eventos, congressos, exposições e feiras': 'Organização de eventos',
    'Produção técnica': 'Produção técnica',
    'Softwares': 'Software',
    'Software': 'Software',
    'Trabalhos técnicos': 'Trabalhos técnicos',
    'Assessoria e consultoria': 'Assessoria e consultoria',
    'Cursos de curta duração ministrados': 'Cursos de curta duração ministrados',
    'Demais tipos de produção técnica': 'Outras produções técnicas',
    // Grupos sem subtítulo (com subtítulo, o leitor do Lattes compõe "Orientações concluídas: Mestrado").
    'Orientações e supervisões concluídas': 'Orientações concluídas',
    'Orientações e supervisões em andamento': 'Orientações em andamento',
    'Participação em bancas de trabalhos de conclusão': 'Bancas',
    'Participação em bancas de comissões julgadoras': 'Comissões julgadoras',
  };

  // O site gerado sai só em português, mas a interface do construtor continua em PT/EN e mostra
  // estes rótulos na tela de revisão (títulos de seção e tipo de cada destaque). O resto das
  // traduções do site saiu para parked/ quando o site em inglês foi estacionado.
  I18n.registrar({
    // títulos curtos das seções
    'Formação': 'Education',
    'Formação complementar': 'Other training',
    'Pós-doutorado': 'Postdoctoral research',
    'Atuação profissional': 'Professional experience',
    'Linhas de pesquisa': 'Research lines',
    'Projetos de pesquisa': 'Research projects',
    'Projetos de extensão': 'Outreach projects',
    'Projetos de ensino': 'Teaching projects',
    'Outros projetos': 'Other projects',
    'Projetos de desenvolvimento': 'Development projects',
    // categorias de produção que só aparecem em alguns currículos
    'Outras produções artísticas/culturais': 'Other artistic/cultural works',
    'Programas de computador sem registro': 'Unregistered software',
    'Produtos tecnológicos': 'Technological products',
    'Artes Visuais': 'Visual arts',
    'Artes Cênicas': 'Performing arts',
    'Demais trabalhos': 'Other works',
    'Áreas de atuação': 'Fields',
    'Idiomas': 'Languages',
    'Prêmios e títulos': 'Awards',
    'Revisor de periódico': 'Journal reviewer',
    'Revisor de projeto de fomento': 'Grant reviewer',
    'Membro de corpo editorial': 'Editorial board member',
    'Membro de comitê de assessoramento': 'Advisory committee member',
    'Outras informações relevantes': 'Other information',
    'Artigos em periódicos': 'Journal articles',
    'Artigos aceitos para publicação': 'Articles in press',
    'Livros': 'Books',
    'Capítulos de livros': 'Book chapters',
    'Textos em jornais e revistas': 'Newspaper and magazine articles',
    'Trabalhos em anais de congressos': 'Conference papers',
    'Resumos expandidos em anais de congressos': 'Extended conference abstracts',
    'Resumos em anais de congressos': 'Conference abstracts',
    'Apresentações de trabalho': 'Talks',
    'Outras produções bibliográficas': 'Other publications',
    'Na mídia': 'In the media',
    'Redes sociais, websites e blogs': 'Social media, websites and blogs',
    'Participação em eventos': 'Event participation',
    'Organização de eventos': 'Event organization',
    'Produção técnica': 'Technical output',
    'Software': 'Software',
    'Trabalhos técnicos': 'Technical work',
    'Assessoria e consultoria': 'Consulting',
    'Cursos de curta duração ministrados': 'Short courses taught',
    'Outras produções técnicas': 'Other technical output',
    'Orientações concluídas': 'Completed advising',
    'Orientações em andamento': 'Ongoing advising',
    'Bancas': 'Committees',
    'Comissões julgadoras': 'Selection committees',
    // rótulo curto do tipo, nos cartões de destaque
    'Artigo': 'Article',
    'Artigo no prelo': 'Article in press',
    'Livro': 'Book',
    'Capítulo de livro': 'Book chapter',
    'Na imprensa': 'In the press',
    'Trabalho em anais': 'Conference paper',
    'Resumo expandido': 'Extended abstract',
    'Resumo': 'Abstract',
    'Apresentação': 'Talk',
    // juntadores de coautoria, mostrados também na tela de revisão do construtor
    'com {coautores}': 'with {coautores}',
    '{a} e {b}': '{a} and {b}',
    'e mais {n}': 'and {n} more',
    'e mais outros': 'and others',
  });

  const LINKS = [['email', 'E-mail'], ['lattes', 'Lattes'], ['orcid', 'ORCID'], ['scholar', 'Google Acadêmico'], ['linkedin', 'LinkedIn']];

  // Rótulo curto do tipo de produção, para o cartão de destaque.
  const TIPOS = [
    [/^Artigos completos/i, 'Artigo'],
    [/^Artigos aceitos/i, 'Artigo no prelo'],
    [/^Livros/i, 'Livro'],
    [/^Capítulos/i, 'Capítulo de livro'],
    [/^Textos em jornais/i, 'Na imprensa'],
    [/^Trabalhos completos/i, 'Trabalho em anais'],
    [/^Resumos expandidos/i, 'Resumo expandido'],
    [/^Resumos/i, 'Resumo'],
    [/^Apresenta/i, 'Apresentação'],
    [/^Entrevistas/i, 'Na mídia'],
  ];

  function tipoDe(tituloSecao) {
    const t = TIPOS.find(([re]) => re.test(tituloSecao || ''));
    return t ? t[1] : (TITULOS_CURTOS[tituloSecao] || tituloSecao || '');
  }

  // Abas do layout "em abas", pelo id da seção no Lattes. "Início" (sobre e destaques) vem antes.
  const ABAS = [
    { id: 'trajetoria', nome: 'Trajetória' }, // formação, atuação, prêmios e tudo o que não cair nas outras
    { id: 'pesquisa', nome: 'Pesquisa', secoes: /^(LinhaPesquisa|Projetos|OutrosProjetos)/ },
    { id: 'producao', nome: 'Produção', secoes: /^(ProducoesCientificas|Eventos)/ },
    { id: 'orientacoes', nome: 'Orientações', secoes: /^(Orientacoes|Bancas)/ },
  ];

  function abaDaSecao(id) {
    const aba = ABAS.find(a => a.secoes && a.secoes.test(id || ''));
    return aba ? aba.id : 'trajetoria';
  }

  // ---------- estado do construtor -> dados do site ----------

  function dados(estado) {
    const p = estado.perfil;
    const lista = v => (v || []).map(i => String(i).trim()).filter(Boolean);
    const interesses = lista(p.interesses);
    const secoes = [];
    const destaques = [];
    for (const s of estado.secoes) {
      if (s.id === 'AreasAtuacao' && interesses.length) continue; // já aparecem como interesses, no início
      const itens = s.itens.filter(i => i.manter);
      if (!itens.length) continue;
      // Destaques livres (fora do Lattes: um software, um projeto, um site) só existem como cartões.
      // A categoria é texto da pessoa (categoriaLivre), e não um rótulo do construtor.
      if (s.tipo === 'livre') {
        itens.forEach(i => {
          if (!i.destaque || !(i.dTitulo || '').trim()) return;
          destaques.push(Object.assign({}, i, { categoria: (i.categoria || '').trim(), categoriaLivre: true }));
        });
        continue;
      }
      itens.forEach(i => { if (i.destaque) destaques.push(Object.assign({}, i, { categoria: tipoDe(s.titulo) })); });
      secoes.push({ titulo: TITULOS_CURTOS[s.titulo] || s.titulo, tipo: s.tipo, aba: abaDaSecao(s.id), itens });
    }
    // Na ordem que a pessoa escolheu; sem ordem definida, os mais recentes primeiro.
    destaques.sort((a, b) => ordemDe(a) - ordemDe(b) || (b.periodo || '').localeCompare(a.periodo || ''));
    return {
      nome: p.nome,
      subtitulo: p.subtitulo || subtituloPadrao(estado),
      foto: p.foto,
      fotoProporcao: p.fotoProporcaoNatural || 0, // largura/altura da imagem original
      bio: p.bio,
      interesses,
      formacao: resumoFormacao(estado.secoes),
      links: LINKS.filter(([id]) => p.links && p.links[id]).map(([id, rotulo]) => ({
        rotulo,
        url: id === 'email' ? 'mailto:' + p.links[id].trim() : urlSegura(p.links[id]),
      })),
      destaques,
      secoes,
      atualizadoEm: estado.fonte ? estado.fonte.atualizadoEm : '',
    };
  }

  // Os títulos acadêmicos que a pessoa manteve, resumidos para o início do site:
  // "Doutorado em Direito" / "Universidade X, 2019–2023". Até três, sem ensino médio ou cursos curtos.
  function resumoFormacao(secoes) {
    const s = (secoes || []).find(x => x.id === 'FormacaoAcademicaTitulacao');
    if (!s) return [];
    return s.itens
      .filter(i => i.manter && i.titulo && !/^Ensino (M[ée]dio|Fundamental)|^Curso t[ée]cnico|^Aperfei/i.test(i.titulo))
      .slice(0, 3)
      .map(i => ({
        titulo: capsParaTitulo(i.titulo.replace(/\s*\(.*?\)\s*$/, '')),
        orientador: i.orientador || '',
        bolsa: i.bolsa ? local(i.bolsa) : '',
        onde: [local(i.detalhe), (i.periodo || '').replace(/\s*-\s*/, '–')].filter(Boolean).join(', '),
      }));
  }

  // O Lattes guarda a instituição como "Nome, SIGLA, País" (o país só quando é fora do Brasil).
  // A sigla não diz nada a quem lê o site, então sai; o nome e o país ficam.
  // Uma sigla é uma parte só de maiúsculas, números e pontuação: "USP", "YLS", "PARIS 1".
  // Exceção: o CNPq escreve o próprio nome com "q" minúsculo (também aparece como agência de
  // bolsa, então essa exceção importa tanto para a instituição quanto para o financiamento).
  const SIGLA = /^(?:[A-ZÀ-Ú0-9][A-ZÀ-Ú0-9\s/.-]*|CNPq)$/;

  function local(detalhe) {
    const partes = String(detalhe || '').split(',').map(p => p.trim()).filter(Boolean);
    return partes.filter((p, i) => i === 0 || !SIGLA.test(p)).join(', ');
  }

  // Sugestão de interesses: as áreas de atuação do Lattes, já reduzidas ao termo mais específico.
  function interessesPadrao(secoes) {
    const s = (secoes || []).find(x => x.id === 'AreasAtuacao');
    if (!s) return [];
    const vistos = new Set();
    const lista = [];
    for (const it of s.itens) {
      const t = capsParaTitulo((it.titulo || '').trim());
      const chave = t.toLowerCase();
      if (!t || vistos.has(chave)) continue;
      vistos.add(chave);
      lista.push(t);
      if (lista.length === 6) break;
    }
    return lista;
  }

  // Sugestão para a linha abaixo do nome: o vínculo atual mais "principal".
  function subtituloPadrao(estado) {
    const atuacao = estado.secoes.find(s => s.id === 'AtuacaoProfissional');
    if (!atuacao) return '';
    const atuais = atuacao.itens.filter(i => /atual/i.test(i.periodo) && i.titulo !== 'Vínculo institucional');
    const it = atuais.find(i => /professor/i.test(i.titulo)) || atuais.find(i => /pesquisador/i.test(i.titulo)) || atuais[0];
    return it ? [it.titulo, (it.detalhe || '').split(',')[0]].filter(Boolean).join(' · ') : '';
  }

  // Conteúdo de exemplo para a prévia, antes de a pessoa trazer o Lattes. O site sai em português,
  // qualquer que seja o idioma da interface do construtor.
  function exemplo(perfil) {
    return I18n.com('pt', () => {
      const autoria = _('SOBRENOME, Nome');
      const coautora = _('COAUTORA, Ana');
      const doutorado = _('Doutorado em Área do Conhecimento');
      const mestrado = _('Mestrado em Área do Conhecimento');
      const federal = _('Universidade Federal');
      const estadual = _('Universidade Estadual');
      const artigo = _('Título do seu artigo mais importante');
      const revista = _('Nome da Revista');
      const livro = _('Um livro que você quer mostrar');
      const editora = _('Editora');
      const interesses = perfil.interesses;
      return {
        nome: perfil.nome || _('Seu Nome'),
        subtitulo: perfil.subtitulo || _('Seu cargo · Sua instituição'),
        foto: perfil.foto,
        fotoProporcao: perfil.fotoProporcaoNatural || 0,
        bio: perfil.bio || _('Aqui entra um texto curto sobre você: o que pesquisa, onde trabalha, o que te interessa. Na etapa de conteúdo, ele vem do resumo do seu Lattes, e você reescreve como quiser.'),
        links: [{ rotulo: 'E-mail', url: '#' }, { rotulo: 'Lattes', url: '#' }, { rotulo: 'ORCID', url: '#' }],
        interesses: interesses && interesses.length ? interesses : [_('Um tema de pesquisa'), _('Outro tema'), _('Mais um')],
        formacao: [
          { titulo: doutorado, onde: `${federal}, 2019–2023` },
          { titulo: mestrado, onde: `${estadual}, 2016–2018` },
        ],
        destaques: [
          {
            periodo: '2025', categoria: 'Artigo', negrito: autoria, autores: autoria, link: 'https://doi.org/',
            titulo: `${autoria}. ${artigo}. ${revista}, v. 10, p. 1-20, 2025.`,
            obra: artigo, veiculo: revista,
            dTexto: _('Uma ou duas frases sobre o trabalho: do que trata e o que ele mostra.'),
          },
          {
            periodo: '2023', categoria: 'Livro', negrito: autoria, autores: `${autoria}; ${coautora}`,
            titulo: `${autoria}; ${coautora}. ${livro}. São Paulo: ${editora}, 2023.`,
            obra: livro, veiculo: editora,
          },
        ],
        secoes: [
          { titulo: 'Formação', aba: 'trajetoria', itens: [
            { periodo: '2019 - 2023', titulo: doutorado, detalhe: federal, obs: _('Título da tese') },
            { periodo: '2016 - 2018', titulo: mestrado, detalhe: estadual },
          ] },
          { titulo: 'Projetos de pesquisa', aba: 'pesquisa', itens: [
            { periodo: _('2024 - Atual'), titulo: _('Nome do projeto de pesquisa que você coordena'), detalhe: _('Coordenação') },
          ] },
          { titulo: 'Artigos em periódicos', tipo: 'producao', aba: 'producao', itens: [2025, 2024, 2022, 2021, 2020, 2019, 2018].map((ano, i) => {
            const obra = _('Título de um artigo publicado número {n}', { n: i + 1 });
            return {
              periodo: String(ano), titulo: `${autoria}. ${obra}. ${revista}, v. ${i + 3}, ${ano}.`, negrito: autoria,
              autores: i % 2 ? `${autoria}; ${coautora}` : autoria, obra, veiculo: revista,
            };
          }) },
        ],
        atualizadoEm: '',
      };
    });
  }

  // ---------- dados do site -> HTML ----------

  // O site gerado sai em português: os _() daqui para baixo rodam sempre em pt, e não no idioma
  // da interface do construtor. (O site em inglês foi estacionado; ver parked/README.md.)
  function html(d, aparencia, opcoes = {}) {
    const ap = Tema.normalizar(aparencia);
    return I18n.com('pt', () => gerar(d, ap, opcoes));
  }

  function corpoSite(d, ap, opcoes) {
    const abas = ap.layout === 'abas' ? montarAbas(d, ap.estrutura, ap.referencias === 'completas') : null;
    const alvo = opcoes.previa ? ' target="_self"' : ''; // na prévia, os outros links abrem fora dela
    const nav = abas ? `<nav class="abas" aria-label="${esc(_('Seções do site'))}">${abas.map(a => `<a href="#${a.id}"${alvo}>${esc(a.nome)}</a>`).join('')}</nav>` : '';
    const conteudo = abas
      ? abas.map(a => `<div class="aba aba-${a.id}">${a.html}</div>`).join('')
      : (ap.estrutura === 'topo' ? apresentacao(d) : inicio(d)) + d.secoes.map(s => secao(s, ap.referencias === 'completas', d.nome)).join('');
    const classes = ['site', `estrutura-${ap.estrutura}`, `foto-${ap.foto}`, abas ? 'com-abas' : ''].join(' ');

    let corpo;
    if (ap.estrutura === 'topo') {
      corpo = `
  <header class="barra-topo"><div class="barra-topo-conteudo">
    <a class="marca" href="#${abas ? abas[0].id : ''}"${alvo}>${esc(d.nome)}</a>${nav}
  </div></header>
  <div class="pagina"><main class="principal">${conteudo}</main>${rodape(d)}</div>`;
    } else if (ap.estrutura === 'central') {
      corpo = `
  <div class="pagina">${perfil(d)}${nav}<main class="principal">${conteudo}</main>${rodape(d)}</div>`;
    } else {
      corpo = `
  <div class="pagina">
    <aside class="lateral">${perfil(d)}${nav}</aside>
    <main class="principal">${conteudo}</main>${rodape(d)}
  </div>`;
    }
    return { corpo, abas, classes };
  }

  function gerar(d, ap, opcoes) {
    // Prévia: fontes vindas da pasta fonts/ do construtor. Arquivo final: fontes embutidas (fontesCss).
    const fontes = opcoes.previa ? `<style>${Tema.cssFontes(opcoes.baseFontes)}</style>` : (opcoes.fontesCss ? `<style>${opcoes.fontesCss}</style>` : '');
    const c = corpoSite(d, ap, opcoes);
    const abas = c.abas;
    const foto = d.foto ? `<style id="foto">${cssFoto(d, ap)}</style>` : '';

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.nome)}</title>
${d.bio ? `<meta name="description" content="${esc(resumir(textoPuro(d.bio), 160))}">` : ''}
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(d.nome)}">
${d.subtitulo || d.bio ? `<meta property="og:description" content="${esc(d.subtitulo || resumir(textoPuro(d.bio), 160))}">` : ''}
<link rel="icon" href="${favicon(d.nome, Tema.variaveis(ap)['--acento'])}">
${opcoes.previa ? '<base target="_blank">' : ''}
${fontes}
<style id="tema">${Tema.css(ap)}</style>
${foto}
<style>${CSS}${abas ? cssAbas(abas) : ''}${opcoes.previa ? 'html{scrollbar-width:thin}' : ''}</style>
</head>
<body>
${abas ? abas.map(a => `<span class="alvo" id="${a.id}"></span>`).join('') : ''}
<div class="${c.classes}">${c.corpo}
</div>
${opcoes.dadosConstrutor ? `<script type="application/json" id="dados-do-construtor">${JSON.stringify(opcoes.dadosConstrutor).replace(/</g, '\\u003c')}</script>` : ''}
</body>
</html>`;
  }

  // A foto (uma vez só, como variável) e, se a pessoa ajustou o zoom, o tamanho da imagem dentro do quadro.
  // Zoom 1 equivale a "cover": a largura da imagem em % do quadro é max(100, proporção da foto / proporção do quadro).
  function cssFoto(d, aparencia) {
    if (!d.foto) return '';
    const ap = Tema.normalizar(aparencia || {});
    let tamanho = '';
    if (ap.fotoZoom && d.fotoProporcao > 0) {
      const quadro = ap.foto === 'redonda' ? 1 : ap.fotoProporcao || 1.5;
      const largura = Math.max(100, (d.fotoProporcao / quadro) * 100) * ap.fotoZoom;
      tamanho = `;--foto-tamanho:${Math.round(largura * 10) / 10}% auto`;
    }
    return `:root{--foto-src:url("${String(d.foto).replace(/["\\]/g, '')}")${tamanho}}`;
  }

  // Ícone da aba: as iniciais do nome sobre a cor de destaque.
  function favicon(nome, cor) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    const iniciais = ((partes[0] || '?')[0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${cor}"/>` +
      `<text x="32" y="33" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="${Tema.contraste(cor, '#ffffff') >= 3 ? '#fff' : '#1a1a1a'}">${esc(iniciais)}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function perfil(d) {
    return `
    <header class="perfil">
      ${d.foto ? `<div class="foto" role="img" aria-label="${_('Foto de {nome}', { nome: esc(d.nome) })}"></div>` : ''}
      <div class="perfil-texto">
        <h1>${esc(d.nome)}</h1>
        ${d.subtitulo ? `<p class="subtitulo">${esc(d.subtitulo)}</p>` : ''}
        ${d.links.length ? `<ul class="links">${d.links.map(l => `<li><a href="${esc(l.url)}">${esc(_(l.rotulo))}</a></li>`).join('')}</ul>` : ''}
      </div>
    </header>`;
  }

  // Estrutura "menu no topo": perfil à esquerda e o texto à direita, separados por uma linha.
  function apresentacao(d) {
    return `<div class="apresentacao">${perfil(d)}<div class="apresentacao-texto">${inicio(d)}</div></div>`;
  }

  function rodape(d) {
    const partes = [
      d.atualizadoEm ? _('Informações do Currículo Lattes, atualizado em {data}.', { data: esc(d.atualizadoEm) }) : '',
      _('Construído com {pagelattes}.', { pagelattes: '<a href="https://github.com/LuizPF42/PageLattes">PageLattes</a>' }),
    ].filter(Boolean);
    return `<footer class="rodape">${partes.join(' ')}</footer>`;
  }

  // Sem conteúdo em pelo menos duas abas, o site fica em página única mesmo.
  function montarAbas(d, estrutura, completas) {
    const abas = [];
    const htmlInicio = estrutura === 'topo' ? apresentacao(d) : inicio(d);
    if (htmlInicio.trim()) abas.push({ id: 'inicio', nome: _('Início'), html: htmlInicio });
    for (const a of ABAS) {
      const secoes = d.secoes.filter(s => s.aba === a.id);
      if (secoes.length) abas.push({ id: a.id, nome: _(a.nome), html: secoes.map(s => secao(s, completas, d.nome)).join('') });
    }
    return abas.length >= 2 ? abas : null;
  }

  // As abas funcionam só com CSS (:target), sem JavaScript: cada aba tem um endereço
  // próprio (#producao), o botão "voltar" funciona, e sem CSS tudo aparece em sequência.
  // As âncoras ficam no topo da página, para a troca de aba não pular para o meio dela.
  function cssAbas(abas) {
    const primeira = abas[0].id;
    const cada = sufixo => abas.map(a => `#${a.id}:target~.site ${sufixo(a.id)}`).join(',');
    return `
.com-abas .aba{display:none}
.com-abas .aba-${primeira}{display:block}
.alvo:target~.site .aba-${primeira}{display:none}
${cada(id => `.aba-${id}`)}{display:block}
.abas a[href="#${primeira}"]{color:var(--texto);border-color:var(--acento)}
.alvo:target~.site .abas a[href="#${primeira}"]{color:var(--suave);border-color:transparent}
${cada(id => `.abas a[href="#${id}"]`)}{color:var(--texto);border-color:var(--acento)}`;
  }

  // Logo abaixo da apresentação: interesses e formação lado a lado, como um cartão de visitas.
  function resumoPerfil(d) {
    const interesses = d.interesses && d.interesses.length;
    const formacao = d.formacao && d.formacao.length;
    if (!interesses && !formacao) return '';
    return `
  <div class="resumo-perfil">
    ${interesses ? `<section class="interesses"><h2>${esc(_('Interesses'))}</h2><ul>${d.interesses.map(i => `<li>${esc(i)}</li>`).join('')}</ul></section>` : ''}
    ${formacao ? `<section class="formacao"><h2>${esc(_('Formação'))}</h2><ul>${d.formacao.map(f => `<li><strong>${esc(f.titulo)}</strong>${f.onde ? `<span>${esc(f.onde)}</span>` : ''}${f.orientador ? `<span>${_('Orientação: {nome}', { nome: esc(f.orientador) })}</span>` : ''}${f.bolsa ? `<span>${_('Bolsista: {nome}', { nome: esc(f.bolsa) })}</span>` : ''}</li>`).join('')}</ul></section>` : ''}
  </div>`;
  }

  function inicio(d) {
    return `
  ${d.bio ? `<section class="sobre">${paragrafos(d.bio)}</section>` : ''}
  ${resumoPerfil(d)}
  ${d.destaques.length ? `
  <section>
    <h2>${esc(_('Destaques'))}</h2>
    <ol class="destaques">${d.destaques.map(destaque).join('')}</ol>
  </section>` : ''}`;
  }

  // Cartão de destaque: tipo e ano, título da obra, onde saiu, a frase da pessoa, coautores e link.
  // Sem título separado (produção antiga ou fora do padrão), mostra a referência inteira.
  function destaque(it) {
    const c = camposDestaque(it);
    // A categoria vem de tipoDe() (chave traduzível) ou, nos destaques livres, do texto da pessoa.
    const categoria = it.categoria && !it.categoriaLivre ? _(it.categoria) : it.categoria;
    const topo = [categoria, it.periodo].filter(Boolean).join(' · ');
    return `
      <li class="destaque">
        ${topo ? `<p class="destaque-tipo">${esc(topo)}</p>` : ''}
        ${c.titulo ? `<h3 class="destaque-titulo">${esc(c.titulo)}</h3>` : `<p class="destaque-citacao">${citacao(Object.assign({}, it, { link: '' }))}</p>`}
        ${c.veiculo ? `<p class="destaque-veiculo">${esc(c.veiculo)}</p>` : ''}
        ${c.texto ? `<p class="destaque-texto">${esc(c.texto)}</p>` : ''}
        ${c.coautores ? `<p class="destaque-autores">${_('com {coautores}', { coautores: esc(c.coautores) })}</p>` : ''}
        ${it.link ? `<a class="destaque-link" href="${esc(urlSegura(it.link))}">${rotuloDestaque(it.link)} ↗</a>` : ''}
      </li>`;
  }

  // O que vai no cartão: o que a pessoa escreveu (d*) ou, na falta, o que veio do Lattes, arrumado.
  function camposDestaque(it) {
    return {
      titulo: it.dTitulo != null ? it.dTitulo : aspas(capsParaTitulo(it.obra || '')),
      veiculo: it.dVeiculo != null ? it.dVeiculo : capsParaTitulo(it.veiculo || ''),
      texto: it.dTexto || '',
      coautores: coautores(it),
    };
  }

  // O Lattes troca aspas, travessões e apóstrofos por "?". Só os padrões inequívocos são desfeitos:
  // "?neoliberal polity?" -> “neoliberal polity”; "precedentes ? crítica" -> "precedentes – crítica";
  // "BRAZIL?S" -> "BRAZIL’S". Um "?" colado ao fim de uma palavra é pergunta de verdade e fica.
  function aspas(s) {
    return s
      .replace(/(^|[\s(])\?([^?\s][^?]{0,80}?[^?\s])\?(?=[\s.,;:)]|$)/g, '$1“$2”')
      .replace(/ \? /g, ' – ')
      .replace(/(\p{L})\?([sS])\b/gu, '$1’$2');
  }

  function ordemDe(it) {
    return typeof it.ordem === 'number' ? it.ordem : 1e9;
  }

  function rotuloDestaque(url) {
    if (/doi\.org/i.test(url)) return _('Ler a publicação');
    if (/\.pdf($|[?#])/i.test(url)) return _('Baixar o PDF');
    return _('Acessar');
  }

  // "SILVA FILHO, Ana C.; COSTA, Pedro Henrique" -> "Pedro Henrique Costa" (sem a própria pessoa).
  function coautores(it) {
    if (!it.autores) return '';
    const eu = (it.negrito || '').toLowerCase().replace(/\.$/, '');
    let outros = false;
    const nomes = it.autores.split(/\s*;\s*/)
      .map(a => a.replace(/\((?:Orgs?|Eds?|Coords?)\.?\)/gi, '').trim())
      .filter(a => {
        if (/^et\.?\s?al\.?$/i.test(a)) { outros = true; return false; }
        return a && a.toLowerCase().replace(/\.$/, '') !== eu;
      })
      .map(nomeLegivel);
    if (nomes.length > 4 || (outros && nomes.length)) {
      return nomes.slice(0, 3).join(', ') + ' ' + (nomes.length > 3 ? _('e mais {n}', { n: nomes.length - 3 }) : _('e mais outros'));
    }
    return nomes.length > 1 ? _('{a} e {b}', { a: nomes.slice(0, -1).join(', '), b: nomes[nomes.length - 1] }) : (nomes[0] || '');
  }

  function nomeLegivel(autor) {
    const [sobrenome, nome] = autor.split(',').map(s => s.trim());
    const arruma = s => (/[a-zà-ÿ]/.test(s) && /[A-ZÀ-Ý]/.test(s) ? s : capsParaTitulo(s, true));
    return nome ? `${arruma(nome)} ${arruma(sobrenome)}` : arruma(sobrenome);
  }

  // Textos todos em maiúsculas (ou todos em minúsculas, no caso de nomes) viram "Título Assim".
  function capsParaTitulo(s, tambemMinusculas) {
    const soMaiusculas = /[A-ZÀ-Ý]/.test(s) && !/[a-zà-ÿ]/.test(s);
    const soMinusculas = tambemMinusculas && /[a-zà-ÿ]/.test(s) && !/[A-ZÀ-Ý]/.test(s);
    if (!soMaiusculas && !soMinusculas) return s;
    const pequenas = /^(a|à|ao|as|às|com|da|das|de|do|dos|e|em|na|nas|no|nos|o|os|ou|para|por|sobre|um|uma|and|of|the|in|on|for|to)$/;
    return s.split(/(\s+)/).map((original, i) => {
      if (/^[^a-záéíóúàâêôãõüçA-ZÁÉÍÓÚÀÂÊÔÃÕÜÇ]*[B-DF-HJ-NP-TV-Z]{2,5}[^\p{L}]*$/u.test(original)) return original; // sigla: STF, CNJ, FGV
      const p = original.toLowerCase();
      return (i > 0 && pequenas.test(p)) ? p : p.replace(/^([^\p{L}]*)(\p{L})/u, (m, antes, l) => antes + l.toUpperCase());
    }).join('');
  }

  function secao(s, completas, nome) {
    const modo = s.tipo !== 'producao' ? 'lista' : completas ? 'completa' : 'simples';
    const lista = itens => itens.map(it => item(it, modo, nome)).join('');
    const primeiros = s.itens.slice(0, VISIVEIS);
    const resto = s.itens.slice(VISIVEIS);
    return `
  <section>
    <h2>${esc(_(s.titulo))}</h2>
    <ul class="lista">${lista(primeiros)}</ul>
    ${resto.length ? `<details><summary>${esc(_('Ver todos os {n}', { n: s.itens.length }))}</summary><ul class="lista">${lista(resto)}</ul></details>` : ''}
  </section>`;
  }

  // modo "simples": produção como título e, embaixo, veículo e coautores (texto arrumado, sem a
  // referência crua do Lattes). "completa": a referência ABNT. "lista": formação, atuação etc.
  function item(it, modo, nome) {
    if (modo === 'simples' && it.obra) {
      const c = camposDestaque(it);
      const detalhe = [c.veiculo, c.coautores && _('com {coautores}', { coautores: c.coautores })].filter(Boolean).join(' · ');
      return `
      <li>
        <span class="quando">${esc(it.periodo || '')}</span>
        <div>
          <p class="item-titulo">${esc(c.titulo)}${it.link ? ` <a class="item-link" href="${esc(urlSegura(it.link))}">${rotuloLink(it.link)}</a>` : ''}</p>
          ${detalhe ? `<p class="item-detalhe">${esc(detalhe)}</p>` : ''}
        </div>
      </li>`;
    }
    const texto = modo === 'lista' ? Object.assign({}, it, { titulo: capsParaTitulo(it.titulo || '') }) : it;
    return `
      <li>
        <span class="quando">${esc(it.periodo || '')}</span>
        <div>
          <p class="item-titulo">${citacao(texto)}</p>
          ${it.detalhe ? `<p class="item-detalhe">${esc(it.integrantes ? _(it.detalhe) : capsParaTitulo(it.detalhe))}</p>` : ''}
          ${it.obs && it.obs.length <= 220 ? `<p class="item-obs">${esc(it.obs)}</p>` : ''}
          ${orientacao(it)}
          ${descricao(it.descricao)}
          ${integrantes(it.integrantes, nome)}
          ${financiamento(it.financiadores)}
        </div>
      </li>`;
  }

  // Descrição do projeto por inteiro. Se for longa, o começo fica à vista e o resto abre num
  // "Continuar lendo" (details/summary, sem JavaScript), cortado no fim de uma frase.
  const DESCRICAO_VISIVEL = 400;
  function descricao(texto) {
    if (!texto) return '';
    if (texto.length <= DESCRICAO_VISIVEL + 150) return `<p class="item-descricao">${esc(texto)}</p>`;
    let corte = -1;
    const fimDeFrase = /[.!?;](?=\s)/g;
    let m;
    while ((m = fimDeFrase.exec(texto)) && m.index < DESCRICAO_VISIVEL) corte = m.index + 1;
    if (corte < 150) corte = texto.lastIndexOf(' ', DESCRICAO_VISIVEL);
    const inicio = texto.slice(0, corte).trim();
    const resto = texto.slice(corte).trim();
    return `<p class="item-descricao">${esc(inicio)}</p><details class="item-mais"><summary>${esc(_('Continuar lendo'))}</summary><p class="item-descricao">${esc(resto)}</p></details>`;
  }

  // "Integrantes: Fulana (coordenadora), Você, Beltrano". O papel "Integrante" fica implícito;
  // o nome da própria pessoa vai em negrito, como no Lattes.
  function integrantes(texto, nome) {
    if (!texto) return '';
    const eu = chave(nome);
    const pessoas = texto.split(/\s\/\s/).map(p => {
      const sep = p.lastIndexOf(' - ');
      const pessoa = sep > 0 ? p.slice(0, sep).trim() : p.trim();
      const papel = sep > 0 ? p.slice(sep + 3).trim() : '';
      let html = eu && chave(pessoa) === eu ? `<strong>${esc(pessoa)}</strong>` : esc(pessoa);
      if (papel && !/^integrante$/i.test(papel)) html += ` (${esc(_(papel.toLowerCase()))})`;
      return html;
    });
    return `<p class="item-equipe">${esc(_('Integrantes'))}: ${pessoas.join(', ')}</p>`;
  }

  // "Financiamento: FAPESP, Fundação Ford" (sem a modalidade "Auxílio financeiro"/"Bolsa").
  function financiamento(texto) {
    if (!texto) return '';
    const nomes = texto.split(/\s\/\s/).map(f => { const sep = f.lastIndexOf(' - '); return (sep > 0 ? f.slice(0, sep) : f).trim(); }).filter(Boolean);
    return nomes.length ? `<p class="item-equipe">${esc(_('Financiamento'))}: ${esc(nomes.join(', '))}</p>` : '';
  }

  // Nome comparável: minúsculas, sem acentos nem espaços repetidos.
  function chave(nome) {
    return String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // "Orientação: Nome · Coorientação: Nome · Bolsista: Agência", na formação (quem orientou e
  // quem financiou importam tanto quanto onde: bolsa de mestrado, doutorado ou pós-doutorado é
  // um dado especialmente relevante na ciência brasileira).
  function orientacao(it) {
    if (!it.orientador && !it.bolsa) return '';
    const partes = [];
    if (it.orientador) partes.push(_('Orientação: {nome}', { nome: esc(it.orientador) }));
    if (it.coorientador) partes.push(_('Coorientação: {nome}', { nome: esc(it.coorientador) }));
    if (it.bolsa) partes.push(_('Bolsista: {nome}', { nome: esc(it.bolsa) }));
    return `<p class="item-orientacao">${partes.join(' · ')}</p>`;
  }

  // Texto do item com o nome da pessoa em negrito (como no Lattes) e o link do DOI, se houver.
  function citacao(it) {
    let t = esc(aspas(it.titulo));
    if (it.negrito) t = t.replace(esc(it.negrito), `<strong>${esc(it.negrito)}</strong>`);
    if (it.link) t += ` <a class="item-link" href="${esc(urlSegura(it.link))}">${rotuloLink(it.link)}</a>`;
    return t;
  }

  function rotuloLink(url) {
    if (/doi\.org/i.test(url)) return 'DOI';
    if (/\.pdf($|[?#])/i.test(url)) return 'PDF';
    return _('Acessar');
  }

  function paragrafos(texto) {
    return texto.split(/\n+/).map(t => t.trim()).filter(Boolean).map(t => `<p>${textoComLinks(t)}</p>`).join('');
  }

  // O texto "sobre" guarda links como [trecho](endereço). Só endereços http(s) e mailto viram link;
  // o resto é escapado, então nada além de texto e links chega ao site.
  const LINK_TEXTO = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g;

  function textoComLinks(texto) {
    return esc(texto).replace(LINK_TEXTO, (m, trecho, url) => `<a href="${url}">${trecho}</a>`);
  }

  function textoPuro(texto) {
    return String(texto || '').replace(LINK_TEXTO, '$1');
  }

  function urlSegura(u) {
    u = String(u).trim();
    return /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^[a-z]+:\/*/i, '');
  }

  function resumir(s, n) {
    return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const CSS = `
*{box-sizing:border-box}
html{background:var(--fundo);color:var(--texto);font:17px/1.65 var(--fonte-texto);-webkit-text-size-adjust:100%}
body{margin:0}
a{color:var(--acento-texto);text-decoration-thickness:1px;text-underline-offset:.18em}
a:hover{text-decoration-thickness:2px}
a:focus-visible{outline:2px solid var(--acento);outline-offset:2px;border-radius:3px}
.pagina{max-width:1360px;margin:0 auto;padding:clamp(2rem,6vw,4.5rem) clamp(1.25rem,4vw,3rem) 2.5rem}
h1,h2{font-family:var(--fonte-titulo);font-weight:var(--peso-titulo);letter-spacing:var(--espaco-titulo);line-height:1.15;margin:0}
h1{font-size:clamp(2rem,5vw,2.6rem)}
h2{display:flex;align-items:center;gap:.65rem;margin-bottom:1rem;font-size:1.4rem}
h2::before{content:"";flex:none;width:1rem;height:.22rem;border-radius:2px;background:var(--acento)}
.perfil{display:flex;align-items:center;gap:1.5rem;margin-bottom:2rem}
/* Foto: --foto-largura e --foto-proporcao existem só se a pessoa ajustou o tamanho na revisão;
   senão valem os padrões de cada estrutura. Nunca passa da largura disponível. */
.foto{flex:none;display:block;max-width:100%;height:auto;background:var(--foto-src) var(--foto-posicao,50% 30%)/var(--foto-tamanho,cover) no-repeat var(--superficie)}
.foto-redonda .foto{width:var(--foto-largura,120px);aspect-ratio:1;border-radius:50%;border:4px solid var(--fundo);box-shadow:0 0 0 2px var(--acento)}
.foto-retangular .foto{width:var(--foto-largura,200px);aspect-ratio:var(--foto-proporcao,1.5);border-radius:6px}
.subtitulo{margin:.45rem 0 0;color:var(--suave);font-size:1.05rem}
.links{display:flex;flex-wrap:wrap;gap:.5rem;margin:1.15rem 0 0;padding:0;list-style:none}
.links a{display:inline-block;padding:.35rem .95rem;border:1px solid var(--borda);border-radius:999px;background:var(--fundo);color:var(--acento-texto);font-size:.88rem;font-weight:600;text-decoration:none}
.links a:hover{border-color:var(--acento)}
.links li:first-child a{background:var(--acento);border-color:var(--acento);color:var(--sobre-acento)}
.sobre{max-width:46em;font-size:1.08rem}
.sobre p{margin:0 0 1em}
.sobre p,.destaque-texto{text-align:var(--alinhamento,start);-webkit-hyphens:var(--hifens,manual);hyphens:var(--hifens,manual)}
section{margin-top:3.25rem}
.resumo-perfil{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:1.5rem 3rem;max-width:46em;margin-top:2.25rem}
.resumo-perfil section{margin-top:0}
.resumo-perfil h2{font-size:1.1rem;margin-bottom:.6rem}
.resumo-perfil ul{margin:0;padding:0;list-style:none}
.interesses li{position:relative;padding:.2rem 0 .2rem 1.1rem}
.interesses li::before{content:"";position:absolute;left:0;top:.72em;width:.45rem;height:.45rem;border-radius:50%;background:var(--acento)}
.formacao li{display:flex;flex-direction:column;padding:.3rem 0}
.formacao li strong{font-weight:600}
.formacao li span{color:var(--suave);font-size:.92rem}
.resumo-perfil+section{margin-top:2.5rem}
.principal>section:first-child,.aba>section:first-child,.apresentacao-texto>section:first-child{margin-top:0}
.destaques{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));gap:1rem;margin:0;padding:0;list-style:none}
.destaque{display:flex;flex-direction:column;gap:.45rem;padding:1.2rem 1.35rem;border-left:4px solid var(--acento);border-radius:4px 12px 12px 4px;background:var(--acento-fundo)}
.destaque p{margin:0}
.destaque-tipo{color:var(--acento-texto);font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.destaque-titulo{margin:0;font-family:var(--fonte-titulo);font-size:1.14rem;font-weight:var(--peso-titulo);letter-spacing:var(--espaco-titulo);line-height:1.3}
.destaque-veiculo{color:var(--suave);font-size:.92rem;font-style:italic}
.destaque-texto{font-size:.96rem}
.destaque-autores{color:var(--suave);font-size:.86rem}
.destaque-citacao{font-size:.95rem}
.destaque-link{align-self:flex-start;margin-top:auto;padding-top:.35rem;font-size:.88rem;font-weight:600;text-decoration:none}
.destaque-link:hover{text-decoration:underline}
.lista{margin:0;padding:0;list-style:none}
.lista li{display:grid;grid-template-columns:7.5rem 1fr;gap:1.25rem;padding:.85rem 0;border-top:1px solid var(--borda)}
.lista li:first-child{border-top:0}
details .lista li:first-child{border-top:1px solid var(--borda)}
.quando{padding-top:.1rem;color:var(--suave);font-size:.88rem;font-variant-numeric:tabular-nums}
.item-titulo{margin:0}
a.item-link{display:inline-block;margin-left:.15rem;padding:0 .5rem;border:1px solid var(--borda);border-radius:999px;font-size:.78rem;font-weight:600;line-height:1.6;text-decoration:none;vertical-align:.05em}
a.item-link:hover{border-color:var(--acento)}
.item-detalhe{margin:.15rem 0 0;color:var(--suave);font-size:.93rem}
.item-obs{margin:.25rem 0 0;color:var(--suave);font-size:.9rem;font-style:italic}
.item-orientacao{margin:.25rem 0 0;color:var(--suave);font-size:.9rem}
.item-descricao{margin:.4rem 0 0;font-size:.93rem}
.item-equipe{margin:.3rem 0 0;color:var(--suave);font-size:.88rem}
.item-mais summary{padding:.1rem 0 0;font-size:.88rem}
summary{padding:.7rem 0 .2rem;color:var(--acento-texto);font-size:.93rem;font-weight:600;cursor:pointer;list-style:none}
summary::-webkit-details-marker{display:none}
summary::after{content:" ↓"}
details[open]>summary{display:none}
.alvo{position:absolute;top:0;left:0;width:1px;height:1px}
/* abas: barra horizontal que gruda no topo ao rolar */
.abas{position:sticky;top:0;z-index:2;display:flex;gap:1.6rem;margin:0 0 2.25rem;padding-top:.4rem;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--borda);background:var(--fundo)}
.abas::-webkit-scrollbar{display:none}
.abas a{flex:none;margin-bottom:-1px;padding:.65rem 0;border-bottom:2px solid transparent;color:var(--suave);font-size:.95rem;font-weight:600;text-decoration:none}
.abas a:hover{color:var(--texto)}
.rodape{margin-top:4rem;padding-top:1.5rem;border-top:1px solid var(--borda);color:var(--suave);font-size:.85rem}
.rodape a{color:inherit}
.rodape:empty{display:none}

/* estrutura "lateral": na coluna única, a lateral some como caixa, para a barra de abas grudar na página inteira */
.estrutura-lateral .lateral{display:contents}

/* estrutura "centralizada" */
.estrutura-central .pagina{max-width:920px}
.estrutura-central .perfil{flex-direction:column;text-align:center}
.estrutura-central .links{justify-content:center}
.estrutura-central .abas a:first-child{margin-left:auto}.estrutura-central .abas a:last-child{margin-right:auto}
.estrutura-central.foto-retangular .foto{width:var(--foto-largura,24rem)}

/* estrutura "menu no topo" */
.barra-topo{position:sticky;top:0;z-index:3;border-bottom:1px solid var(--borda);background:var(--fundo)}
.barra-topo-conteudo{display:flex;flex-wrap:wrap;align-items:center;column-gap:2.25rem;max-width:1360px;margin:0 auto;padding:0 clamp(1.25rem,4vw,3rem)}
.marca{padding:.95rem 0;color:var(--texto);font-family:var(--fonte-titulo);font-size:1.2rem;font-weight:var(--peso-titulo);letter-spacing:var(--espaco-titulo);text-decoration:none;white-space:nowrap}
.barra-topo .abas{position:static;margin:0;padding:0;border-bottom:0;background:none}
.barra-topo .abas a{padding:1.05rem 0}
.estrutura-topo .pagina{max-width:1200px}
.estrutura-topo .perfil{flex-direction:column;text-align:center}
.estrutura-topo h1{font-size:clamp(1.6rem,3vw,2rem)} /* o nome já está na barra do topo */
.estrutura-topo .links{justify-content:center}
.apresentacao-texto{min-width:0}

/* Tela larga */
@media (min-width:920px){
  .estrutura-lateral .pagina{display:grid;grid-template-columns:minmax(15rem,18rem) minmax(0,1fr);column-gap:clamp(3rem,6vw,6rem);align-items:start}
  .estrutura-lateral .lateral{display:block}
  .estrutura-lateral .perfil{flex-direction:column;align-items:flex-start;gap:1.25rem}
  .estrutura-lateral h1{font-size:2.2rem}
  .estrutura-lateral.foto-redonda .foto{width:var(--foto-largura,160px)}
  .estrutura-lateral.foto-retangular .foto{width:var(--foto-largura,100%)}
  .estrutura-lateral .abas{position:static;flex-direction:column;gap:.1rem;margin:0;padding:0;overflow:visible;border-bottom:0;background:none}
  .estrutura-lateral .abas a{margin:0;padding:.4rem 0 .4rem 1rem;border-bottom:0;border-left:2px solid transparent;font-size:1rem}
  .estrutura-lateral .rodape{grid-column:2}
  .estrutura-central.foto-redonda .foto{width:var(--foto-largura,150px)}
  .apresentacao{display:grid;grid-template-columns:minmax(16rem,21rem) minmax(0,1fr);align-items:start}
  .apresentacao .perfil{margin:0;padding-right:clamp(2rem,4vw,3.5rem)}
  .apresentacao-texto{padding-left:clamp(2rem,4vw,3.5rem);border-left:1px solid var(--borda)}
  .estrutura-topo.foto-redonda .foto{width:var(--foto-largura,190px)}
  .estrutura-topo.foto-retangular .foto{width:var(--foto-largura,100%)}
}
@media (min-width:920px) and (min-height:640px){
  .estrutura-lateral .lateral{position:sticky;top:clamp(2rem,6vw,4.5rem)}
}
@media (max-width:600px){
  html{font-size:16px}
  .perfil{flex-direction:column;align-items:flex-start;gap:1.25rem}
  .estrutura-central .perfil,.estrutura-topo .perfil{align-items:center}
  .foto-redonda .foto{width:var(--foto-largura,108px)}
  .foto-retangular .foto{width:var(--foto-largura,100%)}
  .barra-topo .abas a{padding:.55rem 0 .7rem}
  .marca{padding:.7rem 0 .2rem}
  .lista li{grid-template-columns:1fr;gap:.1rem}
}`;

  return { dados, exemplo, html, cssFoto, subtituloPadrao, interessesPadrao, textoComLinks, textoPuro, camposDestaque, tipoDe };
});
