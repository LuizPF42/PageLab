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
  const CONECTIVO = 'de|da|do|dos|das|em';
  const MAIUSCULA = '\\p{Lu}[\\p{L}\\p{N}&-]*';
  const SIGLA = '(?:\\p{Lu}{2,}[\\p{L}\\p{N}]*|\\p{Lu}\\p{Ll}+\\p{Lu}[\\p{L}\\p{N}]*)(?:[-/][\\p{L}\\p{N}]+)?';
  // "Fundação Getulio Vargas", "Laboratório de Dados e Pesquisa Empírica em Direito (LabDados)",
  // "Escola de Direito de São Paulo da Fundação Getúlio Vargas". Um "e" só continua o nome se vier
  // direto uma palavra com maiúscula que não seja outra instituição ("Dados e Pesquisa" sim;
  // "Vargas e da Universidade" e "FGV e Universidade de Y" não).
  const RE_INSTITUICAO = new RegExp(`(?<![\\p{L}\\p{N}])(?:${INSTITUICAO_PALAVRAS})(?:\\s+(?:(?:${CONECTIVO})\\s+)*(?:e\\s+(?!(?:${INSTITUICAO_PALAVRAS})(?![\\p{L}])))?${MAIUSCULA})+(?:\\s*\\(${SIGLA}\\))?`, 'gu');
  // "FGV", "CNPq", "LabDados", "FGV-SP", "PUC/SP" (palavras com duas ou mais maiúsculas)
  const RE_SIGLA = new RegExp(`(?<![\\p{L}\\p{N}])${SIGLA}(?![\\p{L}\\p{N}])`, 'gu');

  // ---------- nomes de instituição em inglês, por regras ----------
  // "Universidade Federal de Minas Gerais" -> "Federal University of Minas Gerais";
  // "Escola de Direito de São Paulo da Fundação Getúlio Vargas" -> "São Paulo Law School of the Getúlio Vargas Foundation".
  // O modelo de tradução não vê esses nomes (viram marcadores); a regra é previsível e revisável.

  // Nomes oficiais em inglês, quando existem. Chave sem acento e em minúsculas.
  const OFICIAIS = {
    'universidade de sao paulo': 'University of São Paulo',
    'fundacao getulio vargas': 'Getulio Vargas Foundation',
    'escola de direito de sao paulo da fundacao getulio vargas': 'FGV São Paulo Law School',
    'escola de direito do rio de janeiro da fundacao getulio vargas': 'FGV Rio de Janeiro Law School',
    'escola de administracao de empresas de sao paulo da fundacao getulio vargas': 'FGV São Paulo School of Business Administration',
    'escola de economia de sao paulo da fundacao getulio vargas': 'FGV São Paulo School of Economics',
    'faculdade de direito da universidade de sao paulo': 'University of São Paulo Law School',
    'faculdade de direito de ribeirao preto da universidade de sao paulo': 'Ribeirão Preto Law School, University of São Paulo',
    'universidade estadual de campinas': 'University of Campinas',
    'universidade federal do rio de janeiro': 'Federal University of Rio de Janeiro',
    'universidade federal de minas gerais': 'Federal University of Minas Gerais',
    'universidade de brasilia': 'University of Brasília',
    'universidade federal do rio grande do sul': 'Federal University of Rio Grande do Sul',
    'universidade federal de santa catarina': 'Federal University of Santa Catarina',
    'universidade federal de pernambuco': 'Federal University of Pernambuco',
    'universidade federal da bahia': 'Federal University of Bahia',
    'universidade federal do parana': 'Federal University of Paraná',
    'universidade federal de sao carlos': 'Federal University of São Carlos',
    'universidade federal fluminense': 'Fluminense Federal University',
    'universidade estadual paulista': 'São Paulo State University',
    'universidade estadual paulista julio de mesquita filho': 'São Paulo State University',
    'universidade federal de sao paulo': 'Federal University of São Paulo',
    'universidade presbiteriana mackenzie': 'Mackenzie Presbyterian University',
    'pontificia universidade catolica de sao paulo': 'Pontifical Catholic University of São Paulo',
    'pontificia universidade catolica do rio de janeiro': 'Pontifical Catholic University of Rio de Janeiro',
    'centro brasileiro de analise e planejamento': 'Brazilian Center for Analysis and Planning',
    'conselho nacional de desenvolvimento cientifico e tecnologico': 'National Council for Scientific and Technological Development',
    'coordenacao de aperfeicoamento de pessoal de nivel superior': 'Coordination for the Improvement of Higher Education Personnel',
    'fundacao de amparo a pesquisa do estado de sao paulo': 'São Paulo Research Foundation',
    'instituto brasileiro de geografia e estatistica': 'Brazilian Institute of Geography and Statistics',
    'instituto de pesquisa economica aplicada': 'Institute for Applied Economic Research',
    'fundacao oswaldo cruz': 'Oswaldo Cruz Foundation',
    'supremo tribunal federal': 'Federal Supreme Court',
    'superior tribunal de justica': 'Superior Court of Justice',
    'tribunal superior do trabalho': 'Superior Labor Court',
    'tribunal superior eleitoral': 'Superior Electoral Court',
    'conselho nacional de justica': 'National Council of Justice',
    'ministerio publico': "Public Prosecutor's Office",
    'ministerio publico federal': "Federal Public Prosecutor's Office",
    'ordem dos advogados do brasil': 'Brazilian Bar Association',
    'defensoria publica': "Public Defender's Office",
    'defensoria publica do estado de sao paulo': "São Paulo State Public Defender's Office",
    'advocacia-geral da uniao': "Office of the Attorney General of the Union",
    'organizacao internacional do trabalho': 'International Labour Organization',
    'organizacao das nacoes unidas': 'United Nations',
    'banco central do brasil': 'Central Bank of Brazil',
    'banco nacional de desenvolvimento economico e social': 'Brazilian Development Bank',
  };

  const CABECAS = {
    Universidade: 'University', Faculdade: 'School', Fundação: 'Foundation', Instituto: 'Institute', Escola: 'School',
    Centro: 'Center', Laboratório: 'Laboratory', Núcleo: 'Center', Grupo: 'Group', Programa: 'Program',
    Departamento: 'Department', Conselho: 'Council', Ministério: 'Ministry', Tribunal: 'Court', Secretaria: 'Department',
    Associação: 'Association', Sociedade: 'Society', Academia: 'Academy', Rede: 'Network', Observatório: 'Observatory',
    Museu: 'Museum', Hospital: 'Hospital', Agência: 'Agency', Banco: 'Bank', Companhia: 'Company', Coordenadoria: 'Office',
    Colégio: 'College', Câmara: 'Chamber', Assembleia: 'Assembly', Prefeitura: 'City Government', Defensoria: "Defender's Office",
    Procuradoria: "Attorney's Office", Ordem: 'Order', Comissão: 'Commission', Editora: 'Publishing House', Revista: 'Journal',
    Cátedra: 'Chair', Clínica: 'Clinic', Superintendência: 'Superintendence', Diretoria: 'Directorate', Reitoria: "Rector's Office",
    'Pró-Reitoria': "Vice-Rector's Office", Cartório: 'Notary Office', Ouvidoria: 'Ombudsman Office',
  };
  // Adjetivos que ficam antes da cabeça em inglês ("Universidade Federal" -> "Federal University").
  const ADJETIVOS = {
    Federal: 'Federal', Estadual: 'State', Nacional: 'National', Municipal: 'Municipal', Regional: 'Regional',
    Católica: 'Catholic', Pontifícia: 'Pontifical', Brasileira: 'Brazilian', Brasileiro: 'Brazilian', Internacional: 'International',
    Superior: 'Superior', Pública: 'Public', Público: 'Public', Presbiteriana: 'Presbyterian', Metodista: 'Methodist',
    Luterana: 'Lutheran', Comunitária: 'Community', Técnica: 'Technical', Técnico: 'Technical', Tecnológica: 'Technological',
    Tecnológico: 'Technological', 'Latino-Americana': 'Latin American', 'Latino-Americano': 'Latin American', Europeia: 'European',
    Europeu: 'European', Rural: 'Rural', Militar: 'Military', Politécnica: 'Polytechnic', Eleitoral: 'Electoral', Cível: 'Civil',
    Criminal: 'Criminal', Trabalhista: 'Labor', Constitucional: 'Constitutional', Administrativa: 'Administrative',
    Administrativo: 'Administrative', Científica: 'Scientific', Científico: 'Scientific', Legislativa: 'Legislative', Geral: 'General',
  };
  // Áreas e palavras dos complementos (as mais longas primeiro, para "Ciência Política" vencer "Ciência").
  // Áreas e termos compostos (os mais longos primeiro, para "Ciência Política" vencer "Ciência").
  const AREAS = [
    ['Direito e Desenvolvimento', 'Law and Development'], ['Direito do Trabalho', 'Labor Law'], ['Direito da Seguridade Social', 'Social Security Law'],
    ['Direitos Humanos', 'Human Rights'], ['Direito Processual Civil', 'Civil Procedure Law'], ['Direito Processual Penal', 'Criminal Procedure Law'],
    ['Economia Política', 'Political Economy'], ['Ciência Política', 'Political Science'], ['Ciências Sociais', 'Social Sciences'],
    ['Ciências Humanas', 'Humanities'], ['Ciências Jurídicas', 'Legal Sciences'], ['Ciências Econômicas', 'Economic Sciences'],
    ['Ciência da Computação', 'Computer Science'], ['Ciências da Saúde', 'Health Sciences'], ['Saúde Pública', 'Public Health'],
    ['Saúde Coletiva', 'Collective Health'], ['Relações Internacionais', 'International Relations'], ['Administração Pública', 'Public Administration'],
    ['Administração de Empresas', 'Business Administration'], ['Gestão Pública', 'Public Management'], ['Políticas Públicas', 'Public Policy'],
    ['Pesquisa Empírica', 'Empirical Research'], ['Serviço Social', 'Social Work'], ['Arquitetura e Urbanismo', 'Architecture and Urbanism'],
    ['Engenharia de Produção', 'Production Engineering'], ['Meio Ambiente', 'Environment'], ['Pós-Graduação', 'Graduate'],
    ['Nível Superior', 'Higher Education'], ['Ensino Superior', 'Higher Education'], ['Amparo à Pesquisa', 'Research Support'],
    ['Letras', 'Language and Literature'], ['Dados', 'Data'], ['Direito', 'Law'], ['Direitos', 'Rights'], ['Economia', 'Economics'],
    ['Sociologia', 'Sociology'], ['Antropologia', 'Anthropology'], ['História', 'History'], ['Filosofia', 'Philosophy'], ['Educação', 'Education'],
    ['Administração', 'Management'], ['Comunicação', 'Communication'], ['Psicologia', 'Psychology'], ['Medicina', 'Medicine'],
    ['Enfermagem', 'Nursing'], ['Odontologia', 'Dentistry'], ['Farmácia', 'Pharmacy'], ['Engenharia', 'Engineering'], ['Matemática', 'Mathematics'],
    ['Estatística', 'Statistics'], ['Física', 'Physics'], ['Química', 'Chemistry'], ['Biologia', 'Biology'], ['Geografia', 'Geography'],
    ['Justiça', 'Justice'], ['Trabalho', 'Labor'], ['Pesquisa', 'Research'], ['Pesquisas', 'Research'], ['Estudos', 'Studies'], ['Estudo', 'Study'],
    ['Ensino', 'Teaching'], ['Extensão', 'Outreach'], ['Inovação', 'Innovation'], ['Tecnologia', 'Technology'], ['Desenvolvimento', 'Development'],
    ['Planejamento', 'Planning'], ['Análise', 'Analysis'], ['Regulação', 'Regulation'], ['Concorrência', 'Competition'], ['Mestrado', "Master's"],
    ['Doutorado', 'Doctoral'], ['Graduação', 'Undergraduate'], ['Ciência', 'Science'], ['Ciências', 'Sciences'], ['Cultura', 'Culture'],
    ['Artes', 'Arts'], ['Arte', 'Art'], ['Cidadania', 'Citizenship'], ['Democracia', 'Democracy'], ['Empresas', 'Business'],
    ['Contabilidade', 'Accounting'], ['Finanças', 'Finance'], ['Fazenda', 'Finance'], ['Segurança', 'Security'], ['Defesa', 'Defense'],
    ['Advogados', 'Lawyers'], ['Advocacia', 'Law Practice'], ['Magistratura', 'Judiciary'], ['Magistrados', 'Judges'], ['Professores', 'Teachers'],
    ['Estudantes', 'Students'], ['Aperfeiçoamento', 'Improvement'], ['Pessoal', 'Personnel'], ['Formação', 'Training'], ['Capacitação', 'Training'],
    ['Reconstrução', 'Reconstruction'], ['Cooperação', 'Cooperation'], ['Integração', 'Integration'], ['Governança', 'Governance'],
    ['Gestão', 'Management'], ['Políticas', 'Policies'], ['Política', 'Politics'], ['Sociedade', 'Society'], ['Instituições', 'Institutions'],
    ['Tribunais', 'Courts'], ['Processo', 'Procedure'], ['Faculdades', 'Colleges'], ['Universidades', 'Universities'], ['Conflitos', 'Conflicts'], ['Acesso', 'Access'], ['Solução', 'Resolution'], ['Meios', 'Means'],
    // Palavras comuns em nome de curso que faltavam (medidas nos currículos reais).
    ['Ciências Contábeis', 'Accounting'], ['Ciências Humanas e Sociais', 'Human and Social Sciences'],
    ['Governo', 'Government'], ['Estado', 'State'], ['Teoria', 'Theory'], ['Teorias', 'Theories'],
    ['Humanidades', 'Humanities'], ['Criminologia', 'Criminology'], ['Contabilidade', 'Accounting'],
    ['Controladoria', 'Controllership'], ['Inglês', 'English'], ['Negócios', 'Business'],
    ['Projetos', 'Projects'], ['Projeto', 'Project'], ['Organizações', 'Organizations'],
    ['Setor', 'Sector'], ['Contratos', 'Contracts'], ['Relações', 'Relations'], ['Mercado', 'Market'],
    ['Mercados', 'Markets'], ['Trabalhos', 'Works'], ['Ciências Contabeis', 'Accounting'],
  ];
  // Adjetivos que, em português, vêm depois do substantivo ("Direito Tributário" -> "Tax Law").
  const ADJ_DEPOIS = [
    [/^tribut[áa]ri[oa]s?$/i, 'Tax'], [/^comparad[oa]s?$/i, 'Comparative'], [/^pena(l|is)$/i, 'Criminal'], [/^civ(il|is)$/i, 'Civil'],
    [/^constituciona(l|is)$/i, 'Constitutional'], [/^administrativ[oa]s?$/i, 'Administrative'], [/^econ[ôo]mic[oa]s?$/i, 'Economic'],
    [/^emp[íi]ric[oa]s?$/i, 'Empirical'], [/^aplicad[oa]s?$/i, 'Applied'], [/^socia(l|is)$/i, 'Social'], [/^ambienta(l|is)$/i, 'Environmental'],
    [/^digita(l|is)$/i, 'Digital'], [/^p[úu]blic[oa]s?$/i, 'Public'], [/^internaciona(l|is)$/i, 'International'], [/^naciona(l|is)$/i, 'National'],
    [/^brasileir[oa]s?$/i, 'Brazilian'], [/^cient[íi]fic[oa]s?$/i, 'Scientific'], [/^tecnol[óo]gic[oa]s?$/i, 'Technological'],
    [/^pol[íi]tic[oa]s?$/i, 'Political'], [/^jur[íi]dic[oa]s?$/i, 'Legal'], [/^human[oa]s?$/i, 'Human'], [/^exat[oa]s?$/i, 'Exact'],
    [/^contempor[âa]ne[oa]s?$/i, 'Contemporary'], [/^regulat[óo]ri[oa]s?$/i, 'Regulatory'], [/^processua(l|is)$/i, 'Procedural'],
    [/^trabalhistas?$/i, 'Labor'], [/^eleitora(l|is)$/i, 'Electoral'], [/^urban[oa]s?$/i, 'Urban'], [/^rura(l|is)$/i, 'Rural'],
    [/^agr[áa]ri[oa]s?$/i, 'Agrarian'], [/^financeir[oa]s?$/i, 'Financial'], [/^banc[áa]ri[oa]s?$/i, 'Banking'], [/^empresaria(l|is)$/i, 'Business'],
    [/^comercia(l|is)$/i, 'Commercial'], [/^sanit[áa]ri[oa]s?$/i, 'Health'], [/^crimina(l|is)$/i, 'Criminal'], [/^latino-american[oa]s?$/i, 'Latin American'],
    [/^europe[ui]a?s?$/i, 'European'], [/^comparativ[oa]s?$/i, 'Comparative'], [/^quantitativ[oa]s?$/i, 'Quantitative'], [/^qualitativ[oa]s?$/i, 'Qualitative'],
    [/^estat[íi]stic[oa]s?$/i, 'Statistical'], [/^computaciona(l|is)$/i, 'Computational'], [/^cr[íi]tic[oa]s?$/i, 'Critical'], [/^te[óo]ric[oa]s?$/i, 'Theoretical'],
    [/^hist[óo]ric[oa]s?$/i, 'Historical'], [/^superior(es)?$/i, 'Higher'], [/^coletiv[oa]s?$/i, 'Collective'], [/^gera(l|is)$/i, 'General'],
    [/^metropolitan[oa]s?$/i, 'Metropolitan'], [/^unid[oa]s?$/i, 'United'], [/^universit[áa]ri[oa]s?$/i, 'University'], [/^acad[êe]mic[oa]s?$/i, 'Academic'],
    [/^alternativ[oa]s?$/i, 'Alternative'], [/^avançad[oa]s?$/i, 'Advanced'], [/^interdisciplinar(es)?$/i, 'Interdisciplinary'],
    [/^cont[áa]be(l|is)$/i, 'Accounting'], [/^contratua(l|is)$/i, 'Contract'], [/^lingu[íi]stic[oa]s?$/i, 'Linguistic'],
    [/^liter[áa]ri[oa]s?$/i, 'Literary'], [/^societ[áa]ri[oa]s?$/i, 'Corporate'], [/^previdenci[áa]ri[oa]s?$/i, 'Social Security'],
  ];
  const CONECTIVOS_EN = { e: 'and', em: 'in', de: 'of', da: 'of', do: 'of', dos: 'of', das: 'of', para: 'for', sobre: 'on', com: 'with', no: 'in', na: 'in', à: 'to', a: 'to' };
  const RE_CONECTIVO = /^(de|da|do|dos|das)$/i;
  // Lugares com conectivo dentro, que não podem ser partidos em "de".
  const LUGARES = ['Rio de Janeiro', 'Minas Gerais', 'Mato Grosso do Sul', 'Mato Grosso', 'Rio Grande do Sul', 'Rio Grande do Norte', 'Nossa Senhora de Sion', 'Nossa Senhora', 'Espírito Santo', 'Juiz de Fora', 'Feira de Santana', 'Mesquita Filho', 'São José dos Campos', 'São João del-Rei', 'Estados Unidos', 'Reino Unido', 'Distrito Federal', 'Campo Grande', 'Santa Catarina', 'Santa Maria', 'Ponta Grossa'];

  const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const NBSP = ' ';

  // Junta termos compostos com espaço rígido, para "de" interno não partir o nome.
  function juntarCompostos(s) {
    for (const t of LUGARES.concat(AREAS.map(([pt]) => pt)).filter(t => /\s/.test(t)).sort((a, b) => b.length - a.length)) {
      s = s.replace(new RegExp(`(?<![\\p{L}])${escapar(t)}(?![\\p{L}])`, 'gu'), t.replace(/ /g, NBSP));
    }
    return s;
  }

  function adjetivoDepois(p) {
    const a = ADJ_DEPOIS.find(([re]) => re.test(p));
    return a ? a[1] : null;
  }

  // Traduz um complemento ("Estudos Econômicos Sociais e Políticos" -> "Economic, Social and Political Studies")
  // termo a termo: compostos e áreas do dicionário, adjetivos pospostos passam para antes do substantivo,
  // o resto (nomes próprios) fica como está.
  function traduzirTermosArea(s) {
    return termosArea(s).texto;
  }

  // Área traduzida por inteiro, ou null quando alguma palavra ficou sem regra. Meia tradução
  // ("Management of Social Projetos and Organizações") parece defeito; o português inteiro parece
  // outra língua. Quem chama decide, e o vocabulário de áreas é aberto demais para fingir que não.
  function areaEmInglesInteira(s) {
    const r = termosArea(s);
    return r.desconhecidas.length ? null : r.texto;
  }

  function termosArea(s) {
    const desconhecidas = [];
    const tokens = juntarCompostos(s).split(/ +/).filter(Boolean).map(t => {
      // A pontuação colada ("Economia,") fica de fora da busca e volta no fim.
      const fim = (t.match(/[,;:]+$/) || [''])[0];
      const pt = t.slice(0, t.length - fim.length).replace(new RegExp(NBSP, 'g'), ' ');
      const area = AREAS.find(([p]) => p === pt) || AREAS.find(([p]) => p.toLowerCase() === pt.toLowerCase());
      if (area) return { en: area[1] + fim };
      if (LUGARES.includes(pt)) return { en: pt + fim, proprio: true }; // nome de lugar fica como está
      const adj = adjetivoDepois(pt);
      if (adj) return { en: adj + fim, adj: true };
      if (CONECTIVOS_EN[pt.toLowerCase()]) return { en: CONECTIVOS_EN[pt.toLowerCase()] + fim, conectivo: true };
      if (/\p{L}/u.test(pt)) desconhecidas.push(pt);
      return { en: pt + fim, proprio: true };
    });
    const saida = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.conectivo || t.adj) { saida.push(t.en); continue; }
      // Substantivo seguido de adjetivos ("Direito Tributário", "Estudos Econômicos e Sociais")
      const adjs = [];
      let j = i + 1;
      while (j < tokens.length && (tokens[j].adj || (tokens[j].en === 'and' && tokens[j + 1] && tokens[j + 1].adj))) {
        if (tokens[j].adj) adjs.push(tokens[j].en);
        j++;
      }
      if (adjs.length) {
        const lista = adjs.length > 1 ? adjs.slice(0, -1).join(', ') + ' and ' + adjs[adjs.length - 1] : adjs[0];
        saida.push(lista + ' ' + t.en);
        i = j - 1;
      } else saida.push(t.en);
    }
    return { texto: saida.join(' ').replace(/\s{2,}/g, ' ').trim(), desconhecidas };
  }

  const ehArea = c => c.split(/ +/).some(p => AREAS.some(([pt]) => pt.toLowerCase() === p.replace(new RegExp(NBSP, 'g'), ' ').toLowerCase()) || adjetivoDepois(p));

  // Um nome de instituição inteiro. Sem regra aplicável, devolve o original.
  function instituicaoEmIngles(nome) {
    if (/ [-–] /.test(nome)) return nome.split(/ [-–] /).map(instituicaoEmIngles).join(' - ');
    const m = nome.match(/^(.*?)(\s*\([^)]*\))?$/);
    const corpo = m[1].trim();
    const sigla = m[2] || '';
    const oficial = OFICIAIS[semAcento(corpo)];
    if (oficial) return oficial + sigla;

    const palavras = juntarCompostos(corpo).split(/ +/); // só espaço comum: o rígido junta os compostos
    const solto = p => p.replace(new RegExp(NBSP, 'g'), ' ');
    // Cabeça: a primeira palavra-chave; adjetivos antes dela ("Pontifícia") e logo depois ("Federal").
    const iCabeca = palavras.findIndex(p => CABECAS[p]);
    if (iCabeca < 0 || palavras.slice(0, iCabeca).some(p => !ADJETIVOS[p])) return nome;
    const adjetivos = palavras.slice(0, iCabeca).map(p => ADJETIVOS[p]);
    let i = iCabeca + 1;
    while (i < palavras.length && (ADJETIVOS[palavras[i]] || adjetivoDepois(palavras[i]))) {
      adjetivos.push(ADJETIVOS[palavras[i]] || adjetivoDepois(palavras[i]));
      i++;
    }
    // Nome próprio colado à cabeça ("Fundação Getulio Vargas", "Universidade Presbiteriana Mackenzie").
    const proprio = [];
    while (i < palavras.length && !RE_CONECTIVO.test(palavras[i])) proprio.push(solto(palavras[i++]));
    // Complementos: cada "de X" até o próximo "de".
    const complementos = [];
    while (i < palavras.length) {
      i++; // pula o conectivo
      const inicio = i;
      while (i < palavras.length && !RE_CONECTIVO.test(palavras[i])) i++;
      complementos.push(palavras.slice(inicio, i).join(' '));
    }
    // Um complemento que começa com cabeça de instituição engole os seguintes ("da Fundação Getúlio Vargas").
    const partes = [];
    for (let k = 0; k < complementos.length; k++) {
      const c = complementos[k];
      const pal = c.split(/ +/);
      if (CABECAS[pal[0]] || (ADJETIVOS[pal[0]] && CABECAS[pal[1]])) {
        partes.push({ tipo: 'instituicao', texto: instituicaoEmIngles(solto(complementos.slice(k).join(' de '))) });
        break;
      }
      // "do Estado de São Paulo": "Estado" fica sozinho entre dois "de"; junta com o próximo.
      const unidade = { Estado: 'the State', Município: 'the Municipality', Cidade: 'the City', Governo: 'the Government', Prefeitura: 'the City Government' }[c];
      if (unidade && complementos[k + 1]) {
        partes.push({ tipo: 'lugar', texto: unidade + ' of ' + solto(complementos[++k]) });
        continue;
      }
      if (ehArea(c)) partes.push({ tipo: 'area', texto: traduzirTermosArea(solto(c)) });
      else {
        const lugar = solto(c).replace(/^Estado (de|do|da) /, 'State of ').replace(/^Município (de|do|da) /, 'Municipality of ').replace(/^Cidade (de|do|da) /, 'City of ');
        partes.push({ tipo: 'lugar', texto: lugar });
      }
    }

    const cabecaPt = palavras[iCabeca];
    let cabeca = CABECAS[cabecaPt];
    const areas = partes.filter(p => p.tipo === 'area');
    const lugares = partes.filter(p => p.tipo === 'lugar');
    const inst = partes.find(p => p.tipo === 'instituicao');
    const escola = /^(Faculdade|Escola)$/.test(cabecaPt);
    let prefixo = '';
    // "Faculdade de Direito" -> "Law School"; "Escola de Medicina" -> "Medical School"; "Programa de Mestrado" -> "Master's Program"
    if (escola && areas.length && /^(Law|Medicine|Business Administration|Economics|Engineering|Education|Nursing|Dentistry|Pharmacy|Management)$/.test(areas[0].texto)) {
      prefixo = ({ Medicine: 'Medical', 'Business Administration': 'Business' }[areas[0].texto] || areas[0].texto) + ' ';
      areas.shift();
    } else if (cabecaPt === 'Programa' && areas.length) {
      // "Programa de Mestrado em Direito" -> "Master's Program in Law"
      const mm = areas[0].texto.match(/^(Master's|Doctoral|Graduate)(?: in (.*))?$/);
      if (mm) {
        prefixo = mm[1] + ' ';
        if (mm[2]) areas[0] = { tipo: 'area', texto: mm[2] };
        else areas.shift();
      }
    }
    // "Escola de Direito de São Paulo" -> "São Paulo Law School": o lugar vem antes quando a escola tem prefixo.
    if (escola && prefixo && lugares.length && !proprio.length) prefixo = lugares.shift().texto + ' ' + prefixo;
    const base = [proprio.join(' '), adjetivos.join(' '), prefixo + cabeca].filter(Boolean).join(' ');
    const saida = [base];
    const liga = cabecaPt === 'Programa' ? 'in ' : 'of ';
    areas.forEach(a => saida.push(liga + a.texto));
    lugares.forEach(l => saida.push('of ' + l.texto));
    if (inst) saida.push('of the ' + inst.texto);
    return saida.join(' ') + sigla;
  }

  // Marcadores que o modelo copia sem mexer (escolhidos por teste): números de cinco dígitos.
  const marcador = i => String(70001 + i);
  const RE_MARCADOR = /7\d{4}/g;

  // Troca nomes e siglas por marcadores; devolve o texto marcado e a lista do que foi tirado.
  function proteger(texto) {
    const nomes = [];
    // A pontuação colada ao fim ("Vargas.") fica fora do nome, no texto.
    const guardar = (m, traduzir) => {
      const fim = (m.match(/[.,;:]+$/) || [''])[0];
      const nome = m.slice(0, m.length - fim.length);
      nomes.push(traduzir ? instituicaoEmIngles(nome) : nome);
      return ' ' + marcador(nomes.length - 1) + fim + ' ';
    };
    let s = texto.replace(RE_INSTITUICAO, m => guardar(m, true));
    s = s.replace(RE_SIGLA, m => (RE_MARCADOR.test(m) ? m : guardar(m, false)));
    return { texto: s.replace(/\s+([,.;:)!?])/g, '$1').replace(/\s{2,}/g, ' ').trim(), nomes };
  }

  // Devolve os nomes no lugar dos marcadores; null se o modelo perdeu algum (aí traduz sem proteção).
  // Nomes traduzidos que pedem artigo em inglês ("at the Federal University of...", "the Getulio Vargas Foundation").
  const RE_PEDE_ARTIGO = /^(?:University of|Institute of|Center of|Laboratory of|Court of|Ministry of|Council of|School of|Department of|Superior|Federal|State|Pontifical|National|Brazilian|International|Central|Fluminense|[\p{Lu}][\p{L}'-]+(?: [\p{Lu}][\p{L}'-]+)* (?:Foundation|Institute|University|Center|Association|Society|Council|Court|Bank|Organization|Academy|Network|Observatory))\b/u;
  const RE_PREPOSICAO_ANTES = /(?:^|\s)(?:at|of|from|for|in|by|with|to|into|within)\s+$/i;

  function devolver(texto, nomes) {
    let faltou = false;
    let s = texto.replace(RE_MARCADOR, (m, pos) => {
      const n = Number(m) - 70001;
      if (n < 0 || n >= nomes.length) return m;
      const nome = nomes[n];
      const antes = texto.slice(0, pos);
      return RE_PEDE_ARTIGO.test(nome) && RE_PREPOSICAO_ANTES.test(antes) ? 'the ' + nome : nome;
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

  return { traduzir, carregar, pronto, jaBaixado, TAMANHO_MB, MODELO, frases, recolocarLinks, proteger, devolver, instituicaoEmIngles, areaEmInglesInteira };
});
