/*
 * Tradução dos títulos de orientações e bancas do site gerado. Estava em js/lattes.js e saiu
 * quando o site em inglês foi estacionado. Este arquivo NÃO é carregado pelo construtor.
 * O que ficou em js/lattes.js é a lista GRUPOS, agora sem o terceiro campo (a tradução).
 * ESTE BLOCO VOLTOU INTEIRO para js/lattes.js: a tela de revisão do construtor mostra estes
 * títulos ("Bancas: Mestrado"), e a interface continua em PT/EN. Fica aqui como registro.
 */
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
    'Monografias de conclusão de curso de aperfeiçoamento/especialização': 'Specialization monographs',
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

