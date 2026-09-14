/*
 * Inglês por regras, para o site gerado em inglês: prefixo do grau ("Doutorado em X" -> "PhD in X"),
 * países ("Estados Unidos" -> "United States") e nomes de instituição ("Universidade Federal de
 * Minas Gerais" -> "Federal University of Minas Gerais").
 *
 * Não há tradução automática de texto aqui, nem em lugar nenhum do PageLattes: o vocabulário destas
 * regras é fechado (graus, países, palavras que formam nome de instituição e algumas áreas), e o que
 * ficar fora dele volta em português, inteiro. Meia tradução ("Management of Social Projetos") parece
 * defeito; o português inteiro parece outra língua, o que é verdade. O que a pessoa escrever à mão nos
 * campos "Em inglês" do construtor vale sempre acima destas regras.
 *
 * As regras de instituição vieram do tradutor estacionado em parked/traducao.js, medidas em 214
 * currículos reais (ver parked/README.md).
 */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Ingles = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- grau da formação ----------

  // Prefixo do título da formação, como o Lattes escreve. A área vem depois e é traduzida à parte.
  const GRAUS = [
    [/^Doutorado em andamento em\s+/i, 'PhD (in progress) in '],
    [/^Mestrado em andamento em\s+/i, "Master's (in progress) in "],
    [/^Pós-Doutorado(\s+em\s+)?/i, 'Postdoctoral research in '],
    [/^Doutorado em\s+/i, 'PhD in '],
    [/^Mestrado profissional em\s+/i, "Professional master's in "],
    [/^Mestrado em\s+/i, "Master's in "],
    [/^Livre-docência em\s+/i, 'Habilitation in '],
    [/^Especialização em\s+/i, 'Specialization in '],
    [/^Aperfeiçoamento em\s+/i, 'Advanced training in '],
    [/^Graduação em andamento em\s+/i, "Bachelor's (in progress) in "],
    [/^Graduação em\s+/i, "Bachelor's in "],
    // Cursos interrompidos: o Lattes escreve "Graduação interrompida em 2015 em Direito".
    [/^Doutorado interrompido em \d{4} em\s+/i, 'PhD (interrupted) in '],
    [/^Mestrado interrompido em \d{4} em\s+/i, "Master's (interrupted) in "],
    [/^Graduação interrompida em \d{4} em\s+/i, "Bachelor's (interrupted) in "],
    [/^Especialização interrompida em \d{4} em\s+/i, 'Specialization (interrupted) in '],
  ];

  // "Doutorado em Direito" -> "PhD in Law"; "Doutorado em Zootecnia" -> "PhD in Zootecnia" (a área só
  // sai em inglês quando todas as palavras dela têm regra). Um complemento entre parênteses
  // ("Doutorado em Direito (Direito Constitucional)") é traduzido à parte, pela mesma regra.
  // Sem prefixo reconhecido, o título volta como está.
  function grauEmIngles(titulo) {
    const t = String(titulo || '').trim();
    const g = GRAUS.find(([re]) => re.test(t));
    if (!g) return t;
    const area = t.replace(g[0], '').trim();
    const m = area.match(/^(.*?)(?:\s*\(([^)]*)\))?$/);
    const principal = m[1].trim();
    const parentese = m[2] ? m[2].trim() : '';
    const en = (principal ? areaEmInglesInteira(principal) || principal : '') + (parentese ? ` (${areaEmInglesInteira(parentese) || parentese})` : '');
    return (g[1] + en).replace(/\sin $/, '').trim();
  }

  // ---------- países ----------

  // Para a linha de instituição da formação ("Nome, SIGLA, País"). Brasil não aparece no Lattes público
  // (o leitor já tira), mas fica aqui para o caso de vir escrito à mão.
  const PAISES = {
    'Estados Unidos': 'United States', 'França': 'France', 'Alemanha': 'Germany',
    'Holanda': 'Netherlands', 'Países Baixos': 'Netherlands', 'Grécia': 'Greece',
    'Inglaterra': 'England', 'Grã-Bretanha': 'Great Britain', 'Reino Unido': 'United Kingdom',
    'Escócia': 'Scotland', 'Itália': 'Italy', 'Hungria': 'Hungary', 'Colômbia': 'Colombia', 'Canadá': 'Canada',
    'Austrália': 'Australia', 'Áustria': 'Austria', 'Austria': 'Austria', 'Nova Zelândia': 'New Zealand',
    'Suíça': 'Switzerland', 'Suiça': 'Switzerland', 'Finlândia': 'Finland', 'Japão': 'Japan',
    'México': 'Mexico', 'Bélgica': 'Belgium', 'Espanha': 'Spain', 'Brasil': 'Brazil',
    'Dinamarca': 'Denmark', 'Suécia': 'Sweden', 'Noruega': 'Norway', 'Irlanda': 'Ireland',
    'Israel': 'Israel', 'China': 'China', 'Índia': 'India', 'África do Sul': 'South Africa',
    'Rússia': 'Russia', 'Polônia': 'Poland', 'República Tcheca': 'Czech Republic', 'Turquia': 'Turkey',
    'Coreia do Sul': 'South Korea', 'Coréia do Sul': 'South Korea', 'Egito': 'Egypt', 'Marrocos': 'Morocco',
    'Moçambique': 'Mozambique', 'Angola': 'Angola', 'Cabo Verde': 'Cape Verde', 'Guiné-Bissau': 'Guinea-Bissau',
    'Timor-Leste': 'Timor-Leste', 'Cuba': 'Cuba', 'Peru': 'Peru', 'Chile': 'Chile', 'Argentina': 'Argentina',
    'Uruguai': 'Uruguay', 'Paraguai': 'Paraguay', 'Bolívia': 'Bolivia', 'Equador': 'Ecuador', 'Venezuela': 'Venezuela',
  };

  function paisEmIngles(pais) {
    const p = String(pais || '').trim();
    return PAISES[p] || p;
  }

  // ---------- nomes de instituição, por regras ----------
  // "Universidade Federal de Minas Gerais" -> "Federal University of Minas Gerais";
  // "Escola de Direito de São Paulo da Fundação Getúlio Vargas" -> "São Paulo Law School of the Getúlio Vargas Foundation".
  // A regra é previsível e revisável; sem regra aplicável, o nome volta como está.

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
    'advocacia-geral da uniao': 'Office of the Attorney General of the Union',
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
    // Palavras comuns em nome de curso (medidas nos currículos reais).
    ['Ciências Contábeis', 'Accounting'], ['Ciências Humanas e Sociais', 'Human and Social Sciences'],
    ['Governo', 'Government'], ['Estado', 'State'], ['Teoria', 'Theory'], ['Teorias', 'Theories'],
    ['Humanidades', 'Humanities'], ['Criminologia', 'Criminology'],
    ['Controladoria', 'Controllership'], ['Inglês', 'English'], ['Negócios', 'Business'],
    ['Projetos', 'Projects'], ['Projeto', 'Project'], ['Organizações', 'Organizations'],
    ['Setor', 'Sector'], ['Contratos', 'Contracts'], ['Relações', 'Relations'], ['Mercado', 'Market'],
    ['Mercados', 'Markets'], ['Trabalhos', 'Works'], ['Ciências Contabeis', 'Accounting'],
    // As grandes áreas e os cursos mais comuns fora do direito (a tabela de áreas do CNPq é um
    // vocabulário fechado; o que não estiver aqui fica em português, inteiro).
    ['Engenharia Química', 'Chemical Engineering'], ['Engenharia Elétrica', 'Electrical Engineering'], ['Engenharia Mecânica', 'Mechanical Engineering'],
    ['Engenharia Civil', 'Civil Engineering'], ['Engenharia Florestal', 'Forest Engineering'], ['Engenharia Agronômica', 'Agronomic Engineering'],
    ['Engenharia de Software', 'Software Engineering'], ['Engenharia de Alimentos', 'Food Engineering'], ['Engenharia Ambiental', 'Environmental Engineering'],
    ['Medicina Veterinária', 'Veterinary Medicine'], ['Ciências Biológicas', 'Biological Sciences'], ['Ciências Agrárias', 'Agricultural Sciences'],
    ['Ciências Exatas e da Terra', 'Exact and Earth Sciences'], ['Educação Física', 'Physical Education'], ['Sistemas de Informação', 'Information Systems'],
    ['Saúde da Família', 'Family Health'], ['Educação Infantil', 'Early Childhood Education'], ['Zootecnia', 'Animal Science'], ['Agronomia', 'Agronomy'], ['Nutrição', 'Nutrition'],
    ['Fisioterapia', 'Physical Therapy'], ['Fonoaudiologia', 'Speech Therapy'], ['Arquitetura', 'Architecture'], ['Urbanismo', 'Urban Planning'],
    ['Linguística', 'Linguistics'], ['Literatura', 'Literature'], ['Pedagogia', 'Pedagogy'], ['Teologia', 'Theology'], ['Música', 'Music'],
    ['Jornalismo', 'Journalism'], ['Publicidade', 'Advertising'], ['Turismo', 'Tourism'], ['Geologia', 'Geology'], ['Oceanografia', 'Oceanography'],
    ['Astronomia', 'Astronomy'], ['Bioquímica', 'Biochemistry'], ['Biotecnologia', 'Biotechnology'], ['Genética', 'Genetics'], ['Ecologia', 'Ecology'],
    ['Botânica', 'Botany'], ['Zoologia', 'Zoology'], ['Microbiologia', 'Microbiology'], ['Imunologia', 'Immunology'], ['Farmacologia', 'Pharmacology'],
    ['Epidemiologia', 'Epidemiology'], ['Informática', 'Informatics'], ['Computação', 'Computing'], ['Demografia', 'Demography'],
    ['Arqueologia', 'Archaeology'], ['Museologia', 'Museology'], ['Biblioteconomia', 'Library Science'], ['Ciência da Informação', 'Information Science'],
    ['Enfermagem Obstétrica', 'Obstetric Nursing'], ['Saúde Mental', 'Mental Health'], ['Gerontologia', 'Gerontology'], ['Neurociências', 'Neurosciences'],
    ['Oncologia', 'Oncology'], ['Cardiologia', 'Cardiology'], ['Pediatria', 'Pediatrics'], ['Psiquiatria', 'Psychiatry'], ['Cirurgia', 'Surgery'],
    ['Ortodontia', 'Orthodontics'], ['Periodontia', 'Periodontics'], ['Endodontia', 'Endodontics'], ['Radiologia', 'Radiology'], ['Anatomia', 'Anatomy'],
    ['Fisiologia', 'Physiology'], ['Patologia', 'Pathology'], ['Parasitologia', 'Parasitology'], ['Toxicologia', 'Toxicology'], ['Virologia', 'Virology'],
    ['Materiais', 'Materials'], ['Energia', 'Energy'], ['Transportes', 'Transportation'], ['Recursos Hídricos', 'Water Resources'], ['Solos', 'Soils'],
    ['Alimentos', 'Food'], ['Agricultura', 'Agriculture'], ['Aquicultura', 'Aquaculture'], ['Pesca', 'Fisheries'], ['Florestas', 'Forests'],
    ['Linguagem', 'Language'], ['Tradução', 'Translation'], ['Cinema', 'Film'], ['Teatro', 'Theater'], ['Dança', 'Dance'], ['Fotografia', 'Photography'],
    ['Religião', 'Religion'], ['Lógica', 'Logic'], ['Ética', 'Ethics'], ['Epistemologia', 'Epistemology'], ['Metafísica', 'Metaphysics'],
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
    [/^m[ée]dic[oa]s?$/i, 'Medical'], [/^biol[óo]gic[oa]s?$/i, 'Biological'], [/^farmac[êe]utic[oa]s?$/i, 'Pharmaceutical'],
    [/^veterin[áa]ri[oa]s?$/i, 'Veterinary'], [/^el[ée]tric[oa]s?$/i, 'Electrical'], [/^mec[âa]nic[oa]s?$/i, 'Mechanical'],
    [/^florest(al|ais)$/i, 'Forest'], [/^agr[íi]col[oa]s?$/i, 'Agricultural'], [/^agron[ôo]mic[oa]s?$/i, 'Agronomic'],
    [/^cl[íi]nic[oa]s?$/i, 'Clinical'], [/^molecular(es)?$/i, 'Molecular'], [/^celular(es)?$/i, 'Cellular'], [/^f[íi]sic[oa]s?$/i, 'Physical'],
    [/^nuclear(es)?$/i, 'Nuclear'], [/^industria(l|is)$/i, 'Industrial'], [/^mar[íi]tim[oa]s?$/i, 'Maritime'], [/^costeir[oa]s?$/i, 'Coastal'],
    [/^tropica(l|is)$/i, 'Tropical'], [/^orgânic[oa]s?$/i, 'Organic'], [/^anal[íi]tic[oa]s?$/i, 'Analytical'], [/^experimenta(l|is)$/i, 'Experimental'],
    [/^infanti(l|is)$/i, "Children's"], [/^escolar(es)?$/i, 'School'], [/^especia(l|is)$/i, 'Special'], [/^inclusiv[oa]s?$/i, 'Inclusive'],
    [/^portugues[ae]s?$/i, 'Portuguese'], [/^ingles[ae]s?$/i, 'English'], [/^espanhol[ae]?s?$/i, 'Spanish'],
    [/^modern[oa]s?$/i, 'Modern'], [/^antig[oa]s?$/i, 'Ancient'], [/^medieva(l|is)$/i, 'Medieval'], [/^religios[oa]s?$/i, 'Religious'],
    [/^visua(l|is)$/i, 'Visual'], [/^c[êe]nic[oa]s?$/i, 'Performing'], [/^pl[áa]stic[oa]s?$/i, 'Plastic'], [/^gr[áa]fic[oa]s?$/i, 'Graphic'],
  ];
  const CONECTIVOS_EN = { e: 'and', em: 'in', de: 'of', da: 'of', do: 'of', dos: 'of', das: 'of', para: 'for', sobre: 'on', com: 'with', no: 'in', na: 'in', à: 'to', a: 'to' };
  const RE_CONECTIVO = /^(de|da|do|dos|das)$/i;
  // Lugares com conectivo dentro, que não podem ser partidos em "de".
  const LUGARES = ['Rio de Janeiro', 'Minas Gerais', 'Mato Grosso do Sul', 'Mato Grosso', 'Rio Grande do Sul', 'Rio Grande do Norte', 'Nossa Senhora de Sion', 'Nossa Senhora', 'Espírito Santo', 'Juiz de Fora', 'Feira de Santana', 'Mesquita Filho', 'São José dos Campos', 'São João del-Rei', 'Estados Unidos', 'Reino Unido', 'Distrito Federal', 'Campo Grande', 'Santa Catarina', 'Santa Maria', 'Ponta Grossa'];

  const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const NBSP = ' '; // espaço rígido, escrito como escape para não virar espaço comum ao editar
  const COMPOSTOS = LUGARES.concat(AREAS.map(([pt]) => pt)).filter(t => /\s/.test(t)).sort((a, b) => b.length - a.length)
    .map(t => [new RegExp(`(?<![\\p{L}])${escapar(t)}(?![\\p{L}])`, 'gu'), t.replace(/ /g, NBSP)]);

  // Junta termos compostos com espaço rígido, para "de" interno não partir o nome.
  function juntarCompostos(s) {
    for (const [re, junto] of COMPOSTOS) s = s.replace(re, junto);
    return s;
  }

  function adjetivoDepois(p) {
    const a = ADJ_DEPOIS.find(([re]) => re.test(p));
    return a ? a[1] : null;
  }

  // Área traduzida por inteiro, ou null quando alguma palavra ficou sem regra.
  function areaEmInglesInteira(s) {
    const r = termosArea(String(s || ''));
    return r.desconhecidas.length ? null : r.texto;
  }

  // Traduz uma área ou complemento ("Estudos Econômicos e Sociais" -> "Economic and Social Studies")
  // termo a termo: compostos e áreas do dicionário, adjetivos pospostos passam para antes do substantivo,
  // conectivos viram os equivalentes, e o resto (nomes próprios) fica como está e vai para `desconhecidas`.
  function termosArea(s) {
    const desconhecidas = [];
    const tokens = juntarCompostos(s).split(/ +/).filter(Boolean).map(t => {
      // A pontuação colada ("Economia,") fica de fora da busca e volta no fim.
      const fim = (t.match(/[,;:]+$/) || [''])[0];
      const pt = t.slice(0, t.length - fim.length).replace(new RegExp(NBSP, 'g'), ' ');
      const area = AREAS.find(([p]) => p === pt) || AREAS.find(([p]) => p.toLowerCase() === pt.toLowerCase());
      if (area) return { en: area[1], fim };
      if (LUGARES.includes(pt)) return { en: pt, fim, proprio: true }; // nome de lugar fica como está
      const adj = adjetivoDepois(pt);
      if (adj) return { en: adj, fim, adj: true };
      if (CONECTIVOS_EN[pt.toLowerCase()]) return { en: CONECTIVOS_EN[pt.toLowerCase()], fim, conectivo: true };
      if (/\p{L}/u.test(pt)) desconhecidas.push(pt);
      return { en: pt, fim, proprio: true };
    });
    const saida = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.conectivo || t.adj) { saida.push(t.en + t.fim); continue; }
      // Substantivo seguido de adjetivos ("Direito Tributário", "Direito Público Aplicado", "Estudos
      // Econômicos e Sociais"). Uma vírgula fecha o grupo, e a pontuação do último adjetivo passa para
      // depois do substantivo ("Segurança Digital, Governança" -> "Digital Security, Governance").
      const adjs = [];
      let fim = t.fim;
      let comE = false;
      let j = i + 1;
      while (!fim && j < tokens.length && (tokens[j].adj || (tokens[j].en === 'and' && !tokens[j].fim && tokens[j + 1] && tokens[j + 1].adj))) {
        if (tokens[j].adj) { adjs.push(tokens[j].en); fim = tokens[j].fim; } else comE = true;
        j++;
      }
      if (adjs.length) {
        // Com "e" entre os adjetivos, a ordem se mantém ("Economic and Social Studies"); sem, eles
        // empilham e invertem, como em inglês ("Direito Público Aplicado" -> "Applied Public Law").
        const lista = comE
          ? (adjs.length > 1 ? adjs.slice(0, -1).join(', ') + ' and ' + adjs[adjs.length - 1] : adjs[0])
          : adjs.reverse().join(' ');
        saida.push(lista + ' ' + t.en + fim);
        i = j - 1;
      } else saida.push(t.en + t.fim);
    }
    return { texto: saida.join(' ').replace(/\s{2,}/g, ' ').trim(), desconhecidas };
  }

  const ehArea = c => c.split(/ +/).some(p => AREAS.some(([pt]) => pt.toLowerCase() === p.replace(new RegExp(NBSP, 'g'), ' ').toLowerCase()) || adjetivoDepois(p));

  // Um nome de instituição inteiro. Sem regra aplicável, ou com alguma palavra sem regra no meio, devolve
  // o original inteiro: "Sesc School of Teaching Médio" é pior que "Escola Sesc de Ensino Médio". A regra
  // também às vezes deixa um conectivo solto na frente ("e Capodistríaca National University of Atenas"):
  // aí o original é melhor.
  function instituicaoEmIngles(nome) {
    nome = String(nome || '').trim();
    if (!nome) return nome;
    const en = montar(nome);
    return /^\p{Ll}/u.test(en) ? nome : en;
  }

  function montar(nome) {
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
        const interna = solto(complementos.slice(k).join(' de '));
        const en = instituicaoEmIngles(interna);
        if (en === interna) return nome; // a instituição de dentro ficou em português: o nome todo fica
        partes.push({ tipo: 'instituicao', texto: en });
        break;
      }
      // "do Estado de São Paulo": "Estado" fica sozinho entre dois "de"; junta com o próximo.
      const unidade = { Estado: 'the State', Município: 'the Municipality', Cidade: 'the City', Governo: 'the Government', Prefeitura: 'the City Government' }[c];
      if (unidade && complementos[k + 1]) {
        partes.push({ tipo: 'lugar', texto: unidade + ' of ' + solto(complementos[++k]) });
        continue;
      }
      if (ehArea(c)) {
        const r = termosArea(solto(c));
        if (r.desconhecidas.length) return nome; // meia tradução não: o nome inteiro fica em português
        partes.push({ tipo: 'area', texto: r.texto });
      } else {
        const lugar = solto(c).replace(/^Estado (de|do|da) /, 'State of ').replace(/^Município (de|do|da) /, 'Municipality of ').replace(/^Cidade (de|do|da) /, 'City of ');
        partes.push({ tipo: 'lugar', texto: lugar });
      }
    }

    const cabecaPt = palavras[iCabeca];
    const cabeca = CABECAS[cabecaPt];
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

  return { grauEmIngles, paisEmIngles, instituicaoEmIngles, areaEmInglesInteira };
});
