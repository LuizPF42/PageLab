/*
 * Tabelas do site gerado em inglês, guardadas aqui quando o recurso foi estacionado.
 * Este arquivo NÃO é carregado pelo construtor: é referência para quem for retomar.
 * O resto do código removido está no histórico, em js/site.js e js/app.js do commit 0edd83d.
 */

// Prefixo do grau em inglês, aplicado ao título da formação ("Doutorado em X" -> "PhD in X").
  const GRAUS_EN = [
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

// Países, para a linha de instituição da formação ("Estados Unidos" -> "United States").
  const PAISES_EN = {
    'Estados Unidos': 'United States', 'França': 'France', 'Alemanha': 'Germany',
    'Holanda': 'Netherlands', 'Países Baixos': 'Netherlands', 'Grécia': 'Greece',
    'Inglaterra': 'England', 'Grã-Bretanha': 'Great Britain', 'Reino Unido': 'United Kingdom',
    'Itália': 'Italy', 'Hungria': 'Hungary', 'Colômbia': 'Colombia', 'Canadá': 'Canada',
    'Austrália': 'Australia', 'Áustria': 'Austria', 'Austria': 'Austria',
    'Suíça': 'Switzerland', 'Suiça': 'Switzerland', 'Finlândia': 'Finland', 'Japão': 'Japan',
    'México': 'Mexico', 'Bélgica': 'Belgium', 'Espanha': 'Spain', 'Brasil': 'Brazil',
    'Dinamarca': 'Denmark', 'Suécia': 'Sweden', 'Noruega': 'Norway', 'Irlanda': 'Ireland',
    'Israel': 'Israel', 'China': 'China', 'Índia': 'India', 'África do Sul': 'South Africa',
  };
