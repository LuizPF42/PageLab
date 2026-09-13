// Gera os prints do README com o construtor rodando em http://127.0.0.1:8765
// (na raiz do repositório: python -m http.server 8765 --bind 127.0.0.1).
//
// Uso, dentro desta pasta:
//   npm install
//   node gerar.js
//
// O currículo dos prints é uma homenagem a César Lattes (1924–2005), o físico que dá nome
// à Plataforma Lattes, montado no formato de um currículo de hoje. Só entram fatos públicos,
// conferidos em 2026-09-13: a trajetória nos artigos da Wikipédia em português e em inglês
// (só o que os dois confirmam) e as publicações, com os DOIs, no Crossref. Onde as fontes
// divergem (a volta ao Brasil, os anos na USP, o número de indicações ao Nobel), o item ficou
// de fora. O texto de apresentação vai em primeira pessoa, como num site pessoal, mas só
// reescreve esses mesmos fatos. O Lattes aparece atualizado em 08/03/2005, o dia em que ele
// morreu, como homenagem. Não há foto: o avatar é um desenho que só lembra a figura, com um
// rastro de méson pi decaindo em múon ao fundo.
//
// Ele entra no construtor pelo mesmo caminho da etapa 0: um index.html com as escolhas
// embutidas. Cada print sai com um visual diferente, para mostrar as possibilidades.
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

// ---------- o currículo de demonstração ----------

const NOME = 'César Lattes';
const EU = 'LATTES, C. M. G.';
const CBPF = 'https://www.gov.br/cbpf';

// Um visual por print. O que não estiver aqui fica no padrão do construtor.
const ESTILOS = {
  classico: { fundo: 'creme', acento: '#8a4b16', fonteTitulo: 'source-serif', fonteTexto: 'source-serif', estrutura: 'lateral', foto: 'redonda' },
  datilografado: { fundo: 'branco', acento: '#374151', fonteTitulo: 'inconsolata', fonteTexto: 'inconsolata', estrutura: 'central', foto: 'retangular', fotoProporcao: 0.8, fotoLargura: 170, alinhamento: 'esquerda' },
  moderno: { fundo: 'cinza', acento: '#2563eb', fonteTitulo: 'inter', fonteTexto: 'inter', estrutura: 'topo', foto: 'redonda', alinhamento: 'esquerda' },
  escuro: { fundo: 'cinza', acento: '#6d28d9', fonteTitulo: 'plex-mono', fonteTexto: 'plex-sans', estrutura: 'lateral', foto: 'redonda', escuro: 'sempre' },
  amigavel: { fundo: 'branco', acento: '#c2410c', fonteTitulo: 'nunito', fonteTexto: 'nunito', estrutura: 'central', foto: 'redonda' },
};

// Avatar desenhado, sem rosto: cabelo penteado para trás, testa alta, camisa branca de gola
// aberta, tons de foto antiga. Ao fundo, o rastro pontilhado de um píon que decai em múon.
const AVATAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#dccdb0"/>
  <g fill="none" stroke="#9c8762" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.5 11">
    <path d="M28 300 L118 196 L66 58"/>
    <path d="M492 238 L424 150 L478 34"/>
  </g>
  <circle cx="118" cy="196" r="7" fill="#9c8762"/>
  <circle cx="424" cy="150" r="7" fill="#9c8762"/>
  <g transform="translate(256 512) scale(1.1) translate(-256 -512)">
    <path d="M62 512 C74 414 146 376 256 372 C366 376 438 414 450 512 Z" fill="#f4f0e6"/>
    <rect x="222" y="292" width="68" height="104" rx="30" fill="#d9b08c"/>
    <path d="M222 380 L256 446 L290 380 Z" fill="#d9b08c"/>
    <path d="M256 446 L206 350 L178 404 Z M256 446 L306 350 L334 404 Z" fill="#fbf8f1" stroke="#c9bda3" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="172" cy="236" rx="15" ry="24" fill="#d9b08c"/>
    <ellipse cx="340" cy="236" rx="15" ry="24" fill="#d9b08c"/>
    <ellipse cx="256" cy="224" rx="84" ry="106" fill="#e4bf9a"/>
    <path d="M176 196 C160 122 198 74 256 72 C314 74 352 122 336 196 C332 160 312 146 292 148 C272 134 240 134 220 148 C200 146 180 160 176 196 Z" fill="#2b2118"/>
    <path d="M212 110 C236 96 276 96 300 110" fill="none" stroke="#4a3a2c" stroke-width="4" stroke-linecap="round"/>
  </g>
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
  return {
    construtor: 'site-pessoal',
    versao: 1,
    aparencia,
    // 08/03/2005: o dia em que ele morreu, como homenagem.
    fonte: { tipo: 'lattes', id: '0000000000000000', atualizadoEm: '08/03/2005' },
    perfil: {
      nome: NOME,
      subtitulo: 'Físico · Professor emérito da Unicamp',
      bio: `Físico experimental. Em 1947, no H. H. Wills Physics Laboratory da Universidade de Bristol, participei da descoberta do méson pi (píon), registrado em emulsões nucleares expostas aos raios cósmicos, inclusive no alto do Monte Chacaltaya, na Bolívia. No ano seguinte, com Eugene Gardner, detectei a produção artificial de píons no cíclotron de Berkeley. Fui um dos fundadores do [Centro Brasileiro de Pesquisas Físicas](${CBPF}) e ajudei a criar o CNPq, que deu meu nome à Plataforma Lattes. De 1967 a 1986, fui professor titular do Instituto de Física Gleb Wataghin, na Unicamp.`,
      links: { lattes: 'https://lattes.cnpq.br/' },
      interesses: ['Raios cósmicos', 'Física de partículas', 'Emulsões nucleares', 'Física de altas energias'],
      interessesEditados: true,
    },
    publicacao: { usuario: '' },
    secoes: [
      { id: 'FormacaoAcademicaTitulacao', titulo: 'Formação acadêmica/titulação', tipo: 'lista', itens: [
        lista({ id: 'f1', periodo: '1986', titulo: 'Doutor honoris causa', detalhe: 'Universidade Estadual de Campinas, UNICAMP, Brasil' }),
        lista({ id: 'f2', periodo: '1965', titulo: 'Doutor honoris causa', detalhe: 'Universidade de São Paulo, USP, Brasil' }),
        lista({ id: 'f3', periodo: '1943', titulo: 'Graduação em Física', detalhe: 'Universidade de São Paulo, USP, Brasil' }),
      ] },
      { id: 'AtuacaoProfissional', titulo: 'Atuação Profissional', tipo: 'lista', itens: [
        lista({ id: 'at1', periodo: '1967 - 1986', titulo: 'Professor titular', detalhe: 'Universidade Estadual de Campinas, UNICAMP, Brasil', obs: 'Instituto de Física Gleb Wataghin, que ajudei a fundar. Dirigi o departamento de raios cósmicos. Professor emérito desde 1986' }),
        lista({ id: 'at2', periodo: '1955 - 1957', titulo: 'Pesquisador visitante', detalhe: 'University of Chicago, Estados Unidos' }),
        lista({ id: 'at3', periodo: '1949', titulo: 'Cofundador e diretor científico', detalhe: 'Centro Brasileiro de Pesquisas Físicas, CBPF, Brasil' }),
        lista({ id: 'at4', periodo: '1948', titulo: 'Pesquisador', detalhe: 'University of California, Berkeley, Estados Unidos', obs: 'Com Eugene Gardner, no cíclotron de 184 polegadas' }),
        lista({ id: 'at5', periodo: '1946 - 1947', titulo: 'Pesquisador', detalhe: 'University of Bristol, Reino Unido', obs: 'H. H. Wills Physics Laboratory, no grupo de Cecil Powell' }),
      ] },
      { id: 'ProjetosPesquisa', titulo: 'Projetos de pesquisa', tipo: 'lista', itens: [
        lista({ id: 'pj1', periodo: '', titulo: 'Câmaras de emulsão no Monte Chacaltaya', detalhe: 'Coordenador',
          descricao: 'Câmaras de emulsão nuclear expostas a mais de 5 mil metros de altitude, nos Andes bolivianos, para observar eventos nucleares de energia extremamente alta produzidos por raios cósmicos. Em 1969, o grupo determinou a massa das chamadas bolas de fogo, formadas nessas colisões.' }),
      ] },
      { id: 'ProducoesCientificas:Artigos completos publicados em periódicos', titulo: 'Artigos completos publicados em periódicos', tipo: 'producao', itens: [
        producao('a1', 1947, `${EU}; MUIRHEAD, H.; OCCHIALINI, G. P. S.; POWELL, C. F.`, 'Processes involving charged mesons', 'Nature, v. 159, n. 4047, p. 694-697',
          { link: 'https://doi.org/10.1038/159694a0', relevante: true, destaque: true, ordem: 0,
            dTexto: 'O artigo que anunciou o méson pi: rastros em emulsões fotográficas de uma partícula que decai em outra, o múon.' }),
        producao('a2', 1947, `${EU}; OCCHIALINI, G. P. S.; POWELL, C. F.`, 'Observations on the tracks of slow mesons in photographic emulsions', 'Nature, v. 160, n. 4066, p. 453-456',
          { link: 'https://doi.org/10.1038/160453a0' }),
        producao('a3', 1948, `GARDNER, E.; ${EU}`, 'Production of mesons by the 184-inch Berkeley cyclotron', 'Science, v. 107, n. 2776, p. 270-271',
          { link: 'https://doi.org/10.1126/science.107.2776.270', relevante: true, destaque: true, ordem: 1,
            dTexto: 'A primeira detecção de píons produzidos em laboratório, bombardeando carbono com partículas alfa.' }),
        producao('a4', 1948, `${EU}; OCCHIALINI, G. P. S.; POWELL, C. F.`, 'A determination of the ratio of the masses of pi- and mu-mesons by the method of grain-counting', 'Proceedings of the Physical Society, v. 61, n. 2, p. 173-183',
          { link: 'https://doi.org/10.1088/0959-5309/61/2/308' }),
        producao('a5', 1963, `${EU}; ORSINI, C. Q.; PACCA, I. G.; CRUZ, M. T.; OKUNO, E.; FUJIMOTO, Y.; YOKOI, K.`, 'Observation on extremely-high energy nuclear events with emulsion chambers exposed on Mt. Chacaltaya', 'Il Nuovo Cimento, v. 28, n. 3, p. 614-620',
          { link: 'https://doi.org/10.1007/BF02828877' }),
        producao('a6', 1980, `${EU}; FUJIMOTO, Y.; HASEGAWA, S.`, 'Hadronic interactions of high energy cosmic-ray observed by emulsion chambers', 'Physics Reports, v. 65, n. 3, p. 151-229',
          { link: 'https://doi.org/10.1016/0370-1573(80)90165-9', relevante: true, destaque: true, ordem: 2,
            dTexto: 'Um balanço dos eventos de altíssima energia registrados nas câmaras de emulsão, escrito com colegas japoneses.' }),
      ] },
      { id: 'PremiosTitulos', titulo: 'Prêmios e títulos', tipo: 'lista', itens: [
        lista({ id: 'pr1', periodo: '1987', titulo: 'Prêmio em Física, Academia de Ciências do Terceiro Mundo (TWAS)' }),
        lista({ id: 'pr2', periodo: '1986', titulo: 'Professor emérito, Universidade Estadual de Campinas' }),
        lista({ id: 'pr3', periodo: '1978', titulo: 'Prêmio Bernardo Houssay, Organização dos Estados Americanos' }),
        lista({ id: 'pr5', periodo: '1951', titulo: 'Prêmio Einstein, Academia Brasileira de Ciências' }),
      ] },
      { id: 'Livres', titulo: 'Destaques livres', tipo: 'livre', itens: [
        { id: 'livre-1', periodo: '', titulo: '', categoria: 'Homenagem', dTitulo: 'Plataforma Lattes', dVeiculo: '',
          dTexto: 'O sistema de currículos do CNPq leva o meu nome, pelo papel que tive na criação do conselho. É de lá que vêm os dados deste site.',
          link: 'https://lattes.cnpq.br/', manter: true, destaque: true, ordem: 3 },
        { id: 'livre-2', periodo: '', titulo: '', categoria: 'Instituição', dTitulo: 'Centro Brasileiro de Pesquisas Físicas', dVeiculo: '',
          dTexto: 'Cofundado em 1949, no Rio de Janeiro, quando eu tinha 25 anos.',
          link: CBPF, manter: true, destaque: true, ordem: 4 },
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

  // Traz o currículo de demonstração para o construtor pelo caminho da etapa 0, com o visual pedido.
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

  // ----- o currículo de demonstração, num visual por print -----
  await reabrir('classico');
  await page.click('[data-acao="voltar-conteudo"]');
  await page.waitForSelector('#nome');
  // O aviso "site reaberto" é da reabertura; o print ilustra a etapa de conteúdo em si.
  await page.evaluate(() => { const a = document.querySelector('.aviso'); if (a) a.remove(); });
  await print('conteudo');
  await printSite(await baixarSite('classico'), 'site');

  await reabrir('datilografado');
  await ir('revisao');
  await esperarPrevia();
  await print('revisao');
  await printSite(await baixarSite('datilografado'), 'galeria-1');

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
