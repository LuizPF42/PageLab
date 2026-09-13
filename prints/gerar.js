// Gera os prints do README com o construtor rodando em http://127.0.0.1:8765
// (na raiz do repositório: python -m http.server 8765 --bind 127.0.0.1).
//
// Uso, dentro desta pasta:
//   npm install
//   node gerar.js
//
// O currículo dos prints é fictício e está escrito aqui embaixo (pessoa, instituição,
// coautores, revistas e trabalhos são inventados; o avatar é um desenho). Ele entra no
// construtor pelo mesmo caminho da etapa 0: um index.html com as escolhas embutidas.
// Cada print sai com um visual diferente, para mostrar as possibilidades.
// Usa o Chrome (ou Edge) que já está instalado no computador: não baixa navegador nenhum.

const path = require('path');
const fs = require('fs');
const os = require('os');
const puppeteer = require('puppeteer-core');

const BASE = 'http://127.0.0.1:8765/';
const PASTA = __dirname;
const LARGURA = 1440;
const ALTURA = 900;
const NAVEGADOR = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(p => p && fs.existsSync(p));

// ---------- o currículo fictício ----------

const NOME = 'Marina Quaresma Sá';
const EU = 'SÁ, M. Q.';
const UNIVERSIDADE = 'Universidade Federal da Costa Verde, UFCV, Brasil';

// Um visual por print. O que não estiver aqui fica no padrão do construtor.
const ESTILOS = {
  classico: { fundo: 'creme', acento: '#9f1239', fonteTitulo: 'source-serif', fonteTexto: 'source-serif', estrutura: 'lateral', foto: 'redonda' },
  elegante: { fundo: 'branco', acento: '#166534', fonteTitulo: 'playfair', fonteTexto: 'inter', estrutura: 'central', foto: 'retangular', fotoProporcao: 1, fotoLargura: 180 },
  moderno: { fundo: 'cinza', acento: '#2563eb', fonteTitulo: 'inter', fonteTexto: 'inter', estrutura: 'topo', foto: 'redonda', alinhamento: 'esquerda' },
  escuro: { fundo: 'cinza', acento: '#6d28d9', fonteTitulo: 'plex-mono', fonteTexto: 'plex-sans', estrutura: 'lateral', foto: 'redonda', escuro: 'sempre' },
  amigavel: { fundo: 'branco', acento: '#c2410c', fonteTitulo: 'nunito', fonteTexto: 'nunito', estrutura: 'central', foto: 'redonda' },
};

// Avatar desenhado (sem rosto), no lugar de uma foto.
const AVATAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#e8d5bd"/>
  <path d="M84 512 C84 402 152 368 256 368 C360 368 428 402 428 512 Z" fill="#2f5d62"/>
  <rect x="222" y="292" width="68" height="96" rx="30" fill="#b57d58"/>
  <ellipse cx="256" cy="236" rx="124" ry="138" fill="#2a1a12"/>
  <ellipse cx="256" cy="228" rx="82" ry="98" fill="#c9906a"/>
  <path d="M174 226 C168 128 208 92 256 92 C304 92 344 128 338 226 C332 172 302 148 256 148 C210 148 180 172 174 226 Z" fill="#2a1a12"/>
  <circle cx="176" cy="264" r="7" fill="#d9a441"/>
  <circle cx="336" cy="264" r="7" fill="#d9a441"/>
</svg>`;

function lista(campos) {
  return Object.assign({ periodo: '', titulo: '', detalhe: '', obs: '', link: '', negrito: '', relevante: false, autores: '', obra: '', veiculo: '', manter: true, destaque: false }, campos);
}

// Uma produção como o leitor do Lattes a entrega: a referência inteira e as partes separadas.
function producao(id, ano, autores, obra, veiculo, extras) {
  const referencia = `${autores}. ${obra}. ${veiculo}, ${ano}.`;
  return Object.assign({
    id, periodo: String(ano), titulo: referencia, detalhe: '', obs: '', link: '', negrito: autores.includes(EU) ? EU : '',
    relevante: false, autores, obra, veiculo, manter: true, destaque: false, ordem: 0,
  }, extras);
}

function dadosExemplo(aparencia) {
  const revistaA = 'Revista Brasileira de Ecologia Costeira';
  const revistaB = 'Journal of Tropical Estuaries';
  const revistaC = 'Ciência & Mar';
  return {
    construtor: 'site-pessoal',
    versao: 1,
    aparencia,
    fonte: { tipo: 'lattes', id: '0000000000000000', atualizadoEm: '05/09/2026' },
    perfil: {
      nome: NOME,
      subtitulo: 'Professora adjunta · Universidade Federal da Costa Verde',
      bio: 'Sou bióloga e estudo manguezais: como eles armazenam carbono, como respondem à subida do mar e o que muda quando a cidade chega perto. Coordeno o [Laboratório de Ecologia Costeira](https://labec.exemplo.br) na Universidade Federal da Costa Verde, onde dou aulas de ecologia de ecossistemas e métodos de campo. Trabalho com séries longas de dados, sensoriamento remoto e, cada vez mais, com as comunidades que vivem do mangue.',
      links: { email: 'marina.sa@exemplo.br', lattes: 'http://lattes.cnpq.br/0000000000000000', orcid: 'https://orcid.org/0000-0000-0000-0000' },
      interesses: ['Ecologia de manguezais', 'Carbono azul', 'Restauração costeira', 'Sensoriamento remoto'],
      interessesEditados: true,
    },
    publicacao: { usuario: '' },
    secoes: [
      { id: 'FormacaoAcademicaTitulacao', titulo: 'Formação acadêmica/titulação', tipo: 'lista', itens: [
        lista({ id: 'f1', periodo: '2012 - 2016', titulo: 'Doutorado em Ecologia', detalhe: UNIVERSIDADE, obs: 'Título: Estoques de carbono em manguezais sob pressão urbana', orientador: 'Teresa Bulhões Andrade', coorientador: '' }),
        lista({ id: 'f2', periodo: '2010 - 2012', titulo: 'Mestrado em Oceanografia', detalhe: 'Universidade Estadual do Litoral Sul, UELS, Brasil', obs: 'Título: Dinâmica sedimentar em estuários tropicais', orientador: 'Rogério Pontes Falcão', coorientador: '' }),
        lista({ id: 'f3', periodo: '2005 - 2009', titulo: 'Graduação em Ciências Biológicas', detalhe: 'Universidade Estadual do Litoral Sul, UELS, Brasil' }),
      ] },
      { id: 'AtuacaoProfissional', titulo: 'Atuação Profissional', tipo: 'lista', itens: [
        lista({ id: 'at1', periodo: '2019 - Atual', titulo: 'Professora adjunta', detalhe: UNIVERSIDADE, obs: 'Departamento de Ecologia. Coordenadora do Laboratório de Ecologia Costeira' }),
        lista({ id: 'at2', periodo: '2016 - 2019', titulo: 'Pesquisadora de pós-doutorado', detalhe: 'Instituto Nacional de Estudos do Mar, INEM, Brasil' }),
      ] },
      { id: 'ProjetosPesquisa', titulo: 'Projetos de pesquisa', tipo: 'lista', itens: [
        lista({ id: 'pj1', periodo: '2023 - Atual', titulo: 'MangueAzul: estoques de carbono em manguezais urbanos do Sudeste', detalhe: 'Coordenadora',
          descricao: 'Quantifica o carbono armazenado em manguezais próximos a cidades e acompanha, ano a ano, o que muda com a expansão urbana. Combina coleta em campo, sensoriamento remoto e modelagem.',
          integrantes: `${NOME} - Coordenadora / Teresa Bulhões Andrade - Integrante / Caio Ferraz Lins - Integrante`,
          financiadores: 'Fundação Estadual de Amparo à Pesquisa - Auxílio financeiro / CNPq - Bolsa' }),
        lista({ id: 'pj2', periodo: '2020 - 2023', titulo: 'Restauração de manguezais com comunidades pesqueiras da Baía das Garças', detalhe: 'Integrante',
          descricao: 'Replantio de áreas degradadas junto com colônias de pescadores, com acompanhamento da sobrevivência das mudas e da volta da fauna.',
          integrantes: `Joana Prado Nascimento - Coordenadora / ${NOME} - Integrante` }),
      ] },
      { id: 'ProducoesCientificas:Artigos completos publicados em periódicos', titulo: 'Artigos completos publicados em periódicos', tipo: 'producao', itens: [
        producao('a1', 2025, `${EU}; LINS, C. F.; ANDRADE, T. B.`, 'Carbono azul em manguezais urbanos: vinte anos de dados no Sudeste do Brasil', `${revistaA}, v. 18, p. 112-130`,
          { link: 'https://doi.org/10.0000/exemplo.2025.1', relevante: true, destaque: true, ordem: 0,
            dTexto: 'Manguezais cercados pela cidade continuam armazenando carbono, mas perdem a capacidade de se recuperar depois de tempestades.' }),
        producao('a2', 2024, `${EU}; OKADA, R. M.`, 'Mapping mangrove loss with open satellite imagery: a workflow for coastal managers', `${revistaB}, v. 9, n. 2, p. 77-94`,
          { link: 'https://doi.org/10.0000/exemplo.2024.2', relevante: true, destaque: true, ordem: 1,
            dTexto: 'Um passo a passo, com código aberto, para acompanhar a perda de mangue com imagens de satélite gratuitas.' }),
        producao('a3', 2023, `FALCÃO, R. P.; ${EU}`, 'Sedimentação e subida do nível do mar em estuários tropicais: o que os testemunhos contam', `${revistaC}, v. 41, p. 5-21`, { link: 'https://doi.org/10.0000/exemplo.2023.3' }),
        producao('a4', 2022, `${EU}; NASCIMENTO, J. P.; LINS, C. F.`, 'Restauração de manguezais com comunidades pesqueiras: lições de três anos de campo', `${revistaA}, v. 15, p. 201-219`, { link: 'https://doi.org/10.0000/exemplo.2022.4' }),
        producao('a5', 2020, `${EU}; ANDRADE, T. B.`, 'Blue carbon stocks along an urbanization gradient in southeastern Brazil', 'Wetlands and Carbon, v. 4, p. 33-48', { link: 'https://doi.org/10.0000/exemplo.2020.5' }),
        producao('a6', 2018, EU, 'Raízes, sedimento e maré: um modelo simples para o crescimento de Rhizophora mangle', `${revistaC}, v. 36, p. 88-101`),
      ] },
      { id: 'ProducoesCientificas:Livros publicados/organizados ou edições', titulo: 'Livros publicados/organizados ou edições', tipo: 'producao', itens: [
        producao('l1', 2021, `${EU}; ANDRADE, T. B. (Org.)`, 'Manguezais do Brasil: ecologia, ameaças e restauração', 'São Paulo: Editora Maré',
          { relevante: true, destaque: true, ordem: 2, veiculo: 'Editora Maré', dTexto: 'Doze capítulos, de ecologia básica a restauração, escritos para quem trabalha no litoral: gestores, professores e comunidades.' }),
      ] },
      { id: 'ProducoesCientificas:Capítulos de livros publicados', titulo: 'Capítulos de livros publicados', tipo: 'producao', itens: [
        producao('c1', 2023, EU, 'O mangue como infraestrutura: serviços ecossistêmicos em cidades costeiras', 'In: OKADA, R. M. (Org.). Cidades e o mar. Rio de Janeiro: Editora Maré, p. 45-70', { veiculo: 'Cidades e o mar' }),
        producao('c2', 2019, `${EU}; FALCÃO, R. P.`, 'Métodos de campo para estoques de carbono em manguezais', 'In: Manual de ecologia costeira. Recife: Editora Universitária, p. 120-150', { veiculo: 'Manual de ecologia costeira' }),
      ] },
      { id: 'ProducoesCientificas:Apresentações de Trabalho', titulo: 'Apresentações de Trabalho', tipo: 'producao', itens: [
        producao('ap1', 2024, EU, 'Carbono azul e política climática: o que os dados dizem', 'Congresso Brasileiro de Oceanografia (Conferência)', { veiculo: 'Congresso Brasileiro de Oceanografia' }),
        producao('ap2', 2022, `${EU}; LINS, C. F.`, 'Vinte anos de mangue na Baía das Garças', 'Encontro de Ecologia Costeira (Comunicação)', { veiculo: 'Encontro de Ecologia Costeira' }),
      ] },
      { id: 'OrientacoesEmAndamento:Orientações em andamento: Tese de doutorado', titulo: 'Orientações em andamento: Tese de doutorado', tipo: 'producao', itens: [
        producao('od1', 2024, 'LINS, Caio Ferraz', 'Recuperação de manguezais urbanos depois de eventos extremos', `Tese (Doutorado em Ecologia), ${UNIVERSIDADE.split(',')[0]}`),
      ] },
      { id: 'OrientacoesConcluidas:Orientações concluídas: Dissertação de mestrado', titulo: 'Orientações concluídas: Dissertação de mestrado', tipo: 'producao', itens: [
        producao('o1', 2022, 'LINS, Caio Ferraz', 'Estoques de carbono em manguezais da Baía das Garças', `Dissertação (Mestrado em Ecologia), ${UNIVERSIDADE.split(',')[0]}`),
        producao('o2', 2021, 'MOURA, Letícia Sobral', 'Cobertura de mangue por imagens de satélite: um comparativo de métodos', `Dissertação (Mestrado em Ecologia), ${UNIVERSIDADE.split(',')[0]}`),
      ] },
      { id: 'PremioTitulo', titulo: 'Prêmios e títulos', tipo: 'lista', itens: [
        lista({ id: 'pr1', periodo: '2023', titulo: 'Prêmio Pesquisadora do Ano, Sociedade de Ecologia Costeira' }),
      ] },
      { id: 'Livres', titulo: 'Destaques livres', tipo: 'livre', itens: [
        { id: 'livre-1', periodo: '', titulo: '', categoria: 'Software', dTitulo: 'MangueMap', dVeiculo: '',
          dTexto: 'Ferramenta livre para mapear a cobertura de manguezais a partir de imagens de satélite abertas, com relatórios anuais por município.',
          link: 'https://github.com/exemplo/manguemap', manter: true, destaque: true, ordem: 3 },
      ] },
    ],
    ocultos: [],
  };
}

// Um index.html mínimo com o que a etapa 0 relê: a foto e as escolhas.
function arquivoExemplo(pasta, nome, aparencia, fotoDataUri) {
  const dados = JSON.stringify(dadosExemplo(aparencia)).replace(/</g, '\\u003c');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${NOME}</title>
<style id="foto">:root{--foto-src:url("${fotoDataUri}")}</style></head>
<body><script type="application/json" id="dados-do-construtor">${dados}</script></body></html>`;
  const arquivo = path.join(pasta, `exemplo-${nome}.html`);
  fs.writeFileSync(arquivo, html);
  return arquivo;
}

// ---------- o roteiro ----------

async function main() {
  if (!NAVEGADOR) throw new Error('Não achei o Chrome. Indique o caminho dele na variável de ambiente CHROME.');

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pagelattes-'));
  const browser = await puppeteer.launch({ executablePath: NAVEGADOR, headless: true, args: ['--hide-scrollbars', '--lang=pt-BR'] });
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  const janela = (w, h, escala) => page.setViewport({ width: w, height: h, deviceScaleFactor: escala || 1 });
  await janela(LARGURA, ALTURA);

  const pausa = ms => new Promise(r => setTimeout(r, ms));
  const arquivoUrl = arquivo => 'file:///' + arquivo.split(path.sep).join('/');

  // modo 'cartao': a tela é só um cartão, sem barra fixa embaixo; recorta na altura do conteúdo.
  // modo 'inteira': a página é mais alta que a janela; estica a janela para caber tudo de uma vez
  // (um print de página inteira desenharia a barra fixa no meio da imagem).
  const print = async (nome, modo) => {
    const opcoes = { path: path.join(PASTA, nome + '.png') };
    if (modo === 'cartao') {
      const fundo = await page.evaluate(() => Math.ceil(Math.max(...Array.from(document.querySelectorAll('#app > *'), e => e.getBoundingClientRect().bottom))) + 24);
      opcoes.clip = { x: 0, y: 0, width: LARGURA, height: Math.min(ALTURA, fundo) };
    } else if (modo === 'inteira') {
      const altura = await page.evaluate(() => document.documentElement.scrollHeight);
      await janela(LARGURA, Math.min(1800, altura));
      await pausa(300);
    }
    await page.screenshot(opcoes);
    if (modo === 'inteira') { await janela(LARGURA, ALTURA); await pausa(200); }
    console.log('✓', nome + '.png');
  };
  // Vai para uma etapa pelo cabeçalho (se já estiver nela, não há botão: segue).
  const ir = async etapa => {
    const botao = await page.$(`#etapas button[data-ir="${etapa}"]`);
    if (botao) await botao.click();
    await page.waitForSelector('#app > *');
    await pausa(200);
  };
  // A prévia é um iframe: espera ele ter conteúdo e as fontes carregadas.
  const esperarPrevia = async () => {
    await page.waitForFunction(() => {
      const f = document.getElementById('previa');
      const d = f && f.contentDocument;
      return !!(d && d.body && d.body.children.length && d.fonts && d.fonts.status === 'loaded');
    }, { timeout: 15000 });
    await pausa(500);
  };
  const escolher = async seletor => { await page.click(seletor); await pausa(400); };

  // O avatar vira PNG pelo próprio Chrome.
  await page.setContent(`<body style="margin:0">${AVATAR}</body>`);
  const svg = await page.$('svg');
  const foto = 'data:image/png;base64,' + Buffer.from(await svg.screenshot({ type: 'png' })).toString('base64');

  // Traz o currículo fictício para o construtor pelo caminho da etapa 0, com o visual pedido.
  const reabrir = async nome => {
    const aparencia = ESTILOS[nome];
    const arquivo = arquivoExemplo(temp, nome, aparencia, foto);
    if (!page.url().startsWith(BASE)) {
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await page.waitForSelector('#app > *');
    }
    await ir('atualizar');
    const entrada = await page.waitForSelector('input[data-arquivo="lattes"]');
    await entrada.uploadFile(arquivo);
    await page.waitForSelector('[data-acao="voltar-conteudo"]', { timeout: 15000 });
  };

  // Baixa o site gerado pela versão atual do construtor. Sem a janela "Salvar como" (em headless
  // ela aborta na hora, o que o construtor entende como cancelamento), ele cai no download comum.
  const baixarSite = async nome => {
    await ir('publicar');
    const pasta = fs.mkdtempSync(path.join(temp, 'baixado-'));
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: pasta, eventsEnabled: true });
    await page.evaluate(() => { window.showSaveFilePicker = undefined; });
    await page.click('[data-acao="baixar"]');
    for (let i = 0; i < 80; i++) {
      await pausa(250);
      const f = fs.readdirSync(pasta).find(n => n.endsWith('.html'));
      if (f) return path.join(pasta, f);
    }
    const situacao = await page.evaluate(() => (document.getElementById('estado-download') || {}).textContent || '');
    throw new Error(`Não consegui baixar o site "${nome}" (${situacao.trim() || 'sem mensagem'}).`);
  };

  // Abre o site gerado sozinho e fotografa, no computador ou no celular.
  const printSite = async (arquivo, nome, celular) => {
    if (celular) await janela(390, 844, 2);
    await page.goto(arquivoUrl(arquivo), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await pausa(300);
    await print(nome);
    if (celular) await janela(LARGURA, ALTURA);
  };

  // ----- telas que não dependem de conteúdo, no fluxo de quem começa -----
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#app .cartao');
  await page.type('input[data-perfil="nome"]', NOME);
  await escolher('label.opcao-fundo:has(input[value="creme"])');
  await escolher('label.opcao-cor:has(input[value="#374151"])');
  await escolher('label.opcao-estrutura:has(input[value="topo"])');
  await esperarPrevia();
  await print('aparencia');

  await ir('lattes');
  await print('lattes', 'cartao');
  await page.click('[data-acao="sem-lattes"]'); // libera a etapa de publicar, para o guia da primeira vez
  await page.waitForSelector('#app .cartao');
  await ir('publicar');
  await print('publicar', 'inteira');
  await ir('atualizar');
  await print('atualizar', 'cartao');

  // ----- o currículo fictício, num visual por print -----
  await reabrir('classico');
  await page.click('[data-acao="voltar-conteudo"]');
  await page.waitForSelector('#nome');
  // O aviso "site reaberto" é da reabertura; o print ilustra a etapa de conteúdo em si.
  await page.evaluate(() => { const a = document.querySelector('.aviso'); if (a) a.remove(); });
  await print('conteudo');
  await printSite(await baixarSite('classico'), 'site');

  await reabrir('elegante');
  await ir('revisao');
  await esperarPrevia();
  await print('revisao');
  await printSite(await baixarSite('elegante'), 'galeria-1');

  await reabrir('moderno');
  await printSite(await baixarSite('moderno'), 'galeria-2');

  await reabrir('escuro');
  await printSite(await baixarSite('escuro'), 'galeria-3');

  await reabrir('amigavel');
  await printSite(await baixarSite('amigavel'), 'site-celular', true);

  await browser.close();
  fs.rmSync(temp, { recursive: true, force: true });
}

main().catch(e => { console.error(e); process.exit(1); });
