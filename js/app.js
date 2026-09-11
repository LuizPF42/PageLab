/*
 * Construtor do site pessoal: aparência, importação do Lattes e escolha do conteúdo.
 * Tudo roda no navegador; o progresso fica salvo no localStorage de quem usa.
 */
(function () {
  'use strict';

  // Traduções da interface do construtor para o inglês (o português é a chave).
  I18n.registrar({
    // etapas e cabeçalho
    'Monte seu site pessoal': 'Build your personal site',
    'Aparência': 'Appearance',
    'Lattes': 'Lattes',
    'Conteúdo': 'Content',
    'Revisão': 'Review',
    'Publicar': 'Publish',
    'em breve': 'coming soon',
    // dispositivos
    'Celular': 'Phone',
    'Tablet': 'Tablet',
    'Computador': 'Desktop',
    // links do perfil
    'E-mail': 'Email',
    'Currículo Lattes': 'Lattes CV',
    'ORCID': 'ORCID',
    'Google Acadêmico': 'Google Scholar',
    'LinkedIn': 'LinkedIn',
    'voce@exemplo.com': 'you@example.com',
    // tipos de destaque livre
    'Software': 'Software',
    'Projeto': 'Project',
    'Site': 'Website',
    'Prêmio': 'Award',
    'Curso': 'Course',
    'Podcast': 'Podcast',
    'Base de dados': 'Dataset',
    'Grupo de pesquisa': 'Research group',
    // aparência
    'Escolher outra cor': 'Pick another color',
    'Outra cor': 'Other color',
    'Escolha o visual do seu site': 'Choose the look of your site',
    'Dá para mudar depois, a qualquer momento.': 'You can change it later, at any time.',
    'Seu nome': 'Your name',
    'Como você quer aparecer no site': 'How you want to appear on the site',
    'Fundo': 'Background',
    'Cor de destaque': 'Accent color',
    'Esta cor é clara demais para textos sobre este fundo. Nos links e títulos, o site usa uma versão um pouco mais escura dela, para garantir a leitura.':
      'This color is too light for text on this background. In links and headings, the site uses a slightly darker version of it, so it stays readable.',
    'Estrutura': 'Structure',
    'Foto': 'Photo',
    'Sua foto aparece na prévia ao lado.': 'Your photo appears in the preview beside this.',
    'Uma foto sua, de preferência quadrada ou em retrato.': 'A photo of you, ideally square or portrait.',
    'Tirar a foto': 'Remove the photo',
    'Na revisão, dá para arrastar o canto da foto para mudar o tamanho.': 'In the review step, you can drag the corner of the photo to resize it.',
    'Fontes': 'Fonts',
    'Seu Nome': 'Your Name',
    'Ou combine como quiser:': 'Or mix and match:',
    'Títulos': 'Headings',
    'Texto': 'Text',
    'Organização': 'Layout',
    'Modo escuro': 'Dark mode',
    'Idioma do site': 'Site language',
    'Prévia do seu site': 'Preview of your site',
    'Prévia com o seu conteúdo.': 'Preview with your content.',
    'Prévia com textos de exemplo. O seu conteúdo entra nas próximas etapas.': 'Preview with sample text. Your content comes in the next steps.',
    'Tudo fica salvo neste navegador.': 'Everything is saved in this browser.',
    'Continuar': 'Continue',
    'Trocar foto': 'Change photo',
    'Adicionar foto': 'Add photo',
    '☀ Ver no claro': '☀ View in light',
    '☾ Ver no escuro': '☾ View in dark',
    // revisão
    'Tamanho da tela': 'Screen size',
    'Cor': 'Color',
    'Fonte': 'Font',
    'Personalizada': 'Custom',
    'Tamanho': 'Size',
    'Voltar ao tamanho padrão': 'Back to the default size',
    'Voltar ao tamanho padrão da foto': 'Back to the default photo size',
    'Referências': 'References',
    'Idioma': 'Language',
    'Largura da prévia': 'Preview width',
    'Arraste para mudar a largura': 'Drag to change the width',
    'Voltar ao conteúdo': 'Back to content',
    'Abrir numa aba nova': 'Open in a new tab',
    'reduzido a {p}%': 'scaled to {p}%',
    'Arraste para mudar o tamanho da foto': 'Drag to resize the photo',
    // publicar
    'seu-usuario': 'your-username',
    'Publicar seu site': 'Publish your site',
    'O site inteiro é um arquivo só, o <code>index.html</code>. Você baixa aqui e envia para o GitHub, que publica de graça.':
      'The whole site is a single file, <code>index.html</code>. You download it here and upload it to GitHub, which publishes it for free.',
    'Baixe o seu site': 'Download your site',
    'Baixar index.html': 'Download index.html',
    'O nome precisa ser exatamente <code>index.html</code>. Se o navegador salvar como “index (1).html”, renomeie antes de enviar.':
      'The name must be exactly <code>index.html</code>. If the browser saves it as “index (1).html”, rename it before uploading.',
    'Seu usuário no GitHub': 'Your GitHub username',
    'Ainda não tem conta? {link} e volte aqui.': 'Don’t have an account yet? {link} and come back here.',
    'Crie uma de graça': 'Create one for free',
    'Nome de usuário': 'Username',
    'Use o nome exato da sua conta: só letras, números e hífen.': 'Use the exact name of your account: only letters, numbers and hyphens.',
    'Seu site vai ficar em': 'Your site will be at',
    'Crie o repositório': 'Create the repository',
    '(só na primeira vez)': '(first time only)',
    'O nome do repositório precisa ser exatamente': 'The repository name must be exactly',
    'Copiar': 'Copy',
    'Criar o repositório no GitHub ↗': 'Create the repository on GitHub ↗',
    'Deixe como <strong>Public</strong> e clique em <strong>Create repository</strong>. Não precisa marcar mais nada.':
      'Leave it as <strong>Public</strong> and click <strong>Create repository</strong>. No need to check anything else.',
    'Envie o arquivo': 'Upload the file',
    'Abrir a página de envio ↗': 'Open the upload page ↗',
    'Arraste o <code>index.html</code> para a página, desça até o fim e clique em <strong>Commit changes</strong>.':
      'Drag <code>index.html</code> onto the page, scroll to the bottom and click <strong>Commit changes</strong>.',
    'No repositório recém-criado, se a página de envio não abrir, entre nele e clique em “uploading an existing file”.':
      'If the upload page does not open in the newly created repository, open the repository and click “uploading an existing file”.',
    'Pronto!': 'Done!',
    'Em um ou dois minutos o site aparece em {link}. Até lá, o endereço pode mostrar “404”: é o GitHub terminando de publicar.':
      'In a minute or two the site appears at {link}. Until then, the address may show “404”: that is GitHub finishing the publication.',
    'Para atualizar depois': 'To update it later',
    'Neste navegador, tudo fica salvo: volte aqui, ajuste, baixe de novo e repita o passo 4. O arquivo novo substitui o antigo.':
      'In this browser, everything is saved: come back here, adjust, download again and repeat step 4. The new file replaces the old one.',
    'Em outro computador, traga o <code>index.html</code> do seu site na etapa Lattes: ele guarda as suas escolhas para você continuar de onde parou.':
      'On another computer, bring the <code>index.html</code> of your site in the Lattes step: it keeps your choices so you can pick up where you left off.',
    'Voltar à revisão': 'Back to review',
    'Página do site': 'Site page',
    'Gerando o arquivo…': 'Generating the file…',
    'Pronto: index.html salvo ({kb} KB).': 'Done: index.html saved ({kb} KB).',
    'Pronto: index.html baixado ({kb} KB). Confira se o nome ficou index.html.': 'Done: index.html downloaded ({kb} KB). Check that the name is still index.html.',
    'Não consegui gerar o arquivo.': 'Could not generate the file.',
    'Não consegui ler as escolhas guardadas neste index.html.': 'Could not read the choices stored in this index.html.',
    'Site reaberto a partir do index.html, que guarda só o que estava publicado. Para ver de novo todas as produções do Lattes, use “Usar outro arquivo” e traga a página do Lattes: suas escolhas continuam.':
      'Site reopened from index.html, which keeps only what was published. To see all your Lattes works again, use “Use another file” and bring the Lattes page: your choices are kept.',
    // lattes
    'Traga seu currículo Lattes': 'Bring your Lattes CV',
    'O construtor lê a página pública do seu currículo e monta a base do site. Na próxima tela, você escolhe o que entra.':
      'The builder reads the public page of your CV and builds the base of the site. On the next screen, you choose what goes in.',
    'Abra seu currículo na {busca} e resolva o “Não sou um robô”.': 'Open your CV in the {busca} and solve the “I’m not a robot” check.',
    'busca do Lattes': 'Lattes search',
    'Com o currículo aberto, aperte <kbd>Ctrl</kbd> + <kbd>S</kbd> (no Mac, <kbd>⌘</kbd> + <kbd>S</kbd>) e salve. No Safari, escolha o formato <em>Código-fonte da página</em>.':
      'With the CV open, press <kbd>Ctrl</kbd> + <kbd>S</kbd> (on a Mac, <kbd>⌘</kbd> + <kbd>S</kbd>) and save. In Safari, choose the <em>Page Source</em> format.',
    'Traga para cá o arquivo <code>.html</code> que foi salvo. A pasta que o navegador cria junto não é necessária.':
      'Bring the saved <code>.html</code> file here. The folder the browser creates alongside it is not needed.',
    'Arraste o arquivo aqui': 'Drag the file here',
    'ou clique para escolher': 'or click to choose',
    'O arquivo é lido no seu navegador e não sai do seu computador.': 'The file is read in your browser and never leaves your computer.',
    'Já fez seu site aqui e quer continuar editando em outro computador? Traga o <code>index.html</code> do seu site do mesmo jeito.':
      'Already made your site here and want to keep editing on another computer? Bring the <code>index.html</code> of your site the same way.',
    'Voltar para o conteúdo, sem trocar o arquivo': 'Back to content, without changing the file',
    'Não tenho Lattes, prefiro preencher à mão': 'I don’t have a Lattes CV, I’d rather fill it in by hand',
    'Não consegui ler este arquivo. Confira se é a página do currículo salva pelo navegador (arquivo .html).':
      'Could not read this file. Check that it is the CV page saved by the browser (.html file).',
    'Não consegui abrir esta imagem.': 'Could not open this image.',
    // conteúdo
    'Dados do Lattes atualizado em {data}.': 'Data from Lattes, updated on {data}.',
    'Dados do Lattes.': 'Data from Lattes.',
    'Usar outro arquivo': 'Use another file',
    'Nome': 'Name',
    'Linha abaixo do nome': 'Line below the name',
    'Ex.: Professora na Universidade X': 'E.g.: Professor at University X',
    'Sobre você': 'About you',
    'Este é o resumo do seu Lattes, mas aqui o texto é seu: reescreva à vontade.': 'This is the summary from your Lattes, but here the text is yours: rewrite it as you like.',
    'Conte quem você é e com o que trabalha.': 'Tell who you are and what you work on.',
    'Num site pessoal, a primeira pessoa costuma funcionar melhor: “Sou doutorando em…”, “Pesquiso…”. Para transformar um trecho em link, selecione e clique com o botão direito.':
      'On a personal site, the first person usually works better: “I am a PhD student in…”, “I research…”. To turn a passage into a link, select it and right-click.',
    '{n} caracteres': '{n} characters',
    'Selecione um trecho e clique aqui (ou Ctrl+K)': 'Select a passage and click here (or Ctrl+K)',
    'Inserir link': 'Insert link',
    'Voltar ao texto do Lattes': 'Back to the Lattes text',
    'Interesses': 'Interests',
    'Três a seis temas, separados por vírgula. Aparecem no início do site, ao lado da sua formação.':
      'Three to six topics, separated by commas. They appear at the top of the site, next to your education.',
    'Vieram das áreas de atuação do seu Lattes.': 'They came from the areas of expertise in your Lattes.',
    'Ex.: Direito e Desenvolvimento, Regulação, Métodos empíricos': 'E.g.: Law and Development, Regulation, Empirical methods',
    'Links': 'Links',
    'Começar de novo': 'Start over',
    'Revisar o site': 'Review the site',
    // destaques
    'Destaques': 'Highlights',
    'Aparecem em cartões no topo do site, nesta ordem. O título e onde saiu vêm do Lattes: ajuste se precisar e escreva uma frase sobre cada um, dizendo do que trata, o que mostra ou por que importa.':
      'They appear as cards at the top of the site, in this order. The title and where it was published come from Lattes: adjust if needed and write a sentence about each one, saying what it is about, what it shows or why it matters.',
    'Nenhum destaque ainda. Marque com ★ até {max} produções nas listas abaixo.': 'No highlights yet. Mark up to {max} works with ★ in the lists below.',
    'Algo que não está no Lattes? Um software, um site, um projeto, um prêmio.': 'Something that is not in Lattes? A piece of software, a website, a project, an award.',
    '+ Adicionar destaque livre': '+ Add a custom highlight',
    // site em dois idiomas
    'Em inglês': 'In English',
    'Ex.: Professor at University X': 'E.g.: Professor at University X',
    'A versão que o visitante vê ao escolher EN. Se ficar vazia, o site mostra o texto em português.': 'What visitors see when they choose EN. If left empty, the site shows the Portuguese text.',
    'Ex.: Law and Development, Regulation, Empirical methods': 'E.g.: Law and Development, Regulation, Empirical methods',
    'Tipo em inglês': 'Type in English',
    'Software, project, award…': 'Software, project, award…',
    'The same sentence in English (optional).': 'The same sentence in English (optional).',
    'Ver em inglês': 'View in English',
    'Ver em português': 'View in Portuguese',
    'Fora do Lattes': 'Outside Lattes',
    'Mover para cima': 'Move up',
    'Mover para baixo': 'Move down',
    'Excluir': 'Delete',
    'Tirar dos destaques': 'Remove from highlights',
    'Excluir este destaque': 'Delete this highlight',
    'Tipo': 'Type',
    'Software, projeto, prêmio…': 'Software, project, award…',
    'Ano': 'Year',
    'Título': 'Title',
    'Nome do software, do projeto…': 'Name of the software, the project…',
    'Título da obra': 'Title of the work',
    'Onde': 'Where',
    'Onde saiu': 'Where it was published',
    'Instituição, grupo, parceria… (opcional)': 'Institution, group, partnership… (optional)',
    'Revista, livro, evento…': 'Journal, book, event…',
    'Link': 'Link',
    'https:// (opcional)': 'https:// (optional)',
    'Sobre': 'About',
    'Sobre o trabalho': 'About the work',
    'Em uma ou duas frases: do que trata e o que mostra.': 'In one or two sentences: what it is about and what it shows.',
    'Marque com a estrela até {max} produções para aparecerem em destaque no topo do site. As que você já tinha marcado como relevantes no Lattes vêm pré-selecionadas.':
      'Star up to {max} works to feature them at the top of the site. The ones you had already marked as relevant in Lattes come pre-selected.',
    'Já são {n} destaques. Tire um para acrescentar outro.': 'There are already {n} highlights. Remove one to add another.',
    'Já são {n} destaques. Tire um para escolher outro.': 'There are already {n} highlights. Remove one to choose another.',
    // seções e itens
    'Ver o item': 'Show the item',
    'Ver os {n} itens': 'Show the {n} items',
    'Marcar todos': 'Select all',
    'Desmarcar todos': 'Deselect all',
    'Mostrar todos os {n}': 'Show all {n}',
    'Texto do item': 'Item text',
    '(opcional: página do artigo, PDF, vídeo…)': '(optional: article page, PDF, video…)',
    'Salvar': 'Save',
    'Cancelar': 'Cancel',
    'Adicionar um link para este item': 'Add a link to this item',
    '+ link': '+ link',
    'Manter no site': 'Keep on the site',
    'Destacar': 'Highlight',
    'Editar texto e link': 'Edit text and link',
    '{n} de {total} no site': '{n} of {total} on the site',
    '<strong>{n}</strong> {itens} no site · <strong>{d}</strong> de {max} destaques': '<strong>{n}</strong> {itens} on the site · <strong>{d}</strong> of {max} highlights',
    'item': 'item',
    'itens': 'items',
    // ações e avisos
    'Copiado!': 'Copied!',
    'Selecione e copie': 'Select and copy',
    'Apagar tudo o que foi feito aqui e começar de novo?': 'Erase everything done here and start over?',
    'Selecione um trecho do texto “Sobre você” para virar link.': 'Select a passage of the “About you” text to turn it into a link.',
    'Selecione um trecho do texto para virar link.': 'Select a passage of the text to turn it into a link.',
    // editor de links da bio
    'Endereço do link': 'Link address',
    'Aplicar': 'Apply',
    'Editar link': 'Edit link',
    'Remover link': 'Remove link',
    'Adicionar link': 'Add link',
  });

  const _ = I18n._;
  I18n.definir(I18n.detectar());

  const CHAVE = 'construtor-site:v1';
  const MAX_DESTAQUES = 5;
  // Sugestões de tipo para os destaques fora do Lattes (a pessoa pode escrever outro).
  const TIPOS_LIVRES = ['Software', 'Projeto', 'Site', 'Prêmio', 'Curso', 'Podcast', 'Base de dados', 'Grupo de pesquisa'];
  const ITENS_VISIVEIS = 8;
  const LARGURA_PREVIA = 1000; // a prévia é desenhada nesta largura e reduzida para caber na coluna
  const ALTURA_PREVIA = 1300;

  const ETAPAS = [
    { id: 'aparencia', nome: 'Aparência', pronta: true },
    { id: 'lattes', nome: 'Lattes', pronta: true },
    { id: 'conteudo', nome: 'Conteúdo', pronta: true },
    { id: 'revisao', nome: 'Revisão', pronta: true },
    { id: 'publicar', nome: 'Publicar', pronta: true },
  ];

  const DISPOSITIVOS = [
    { nome: 'Celular', largura: 390 },
    { nome: 'Tablet', largura: 768 },
    { nome: 'Computador', largura: 1280 },
  ];
  const LARGURA_MIN = 320;
  const LARGURA_MAX = 1920;
  const BASE_FONTES = new URL('fonts/', location.href).href;

  const LINKS = [
    { id: 'email', nome: 'E-mail', tipo: 'email', exemplo: 'voce@exemplo.com' },
    { id: 'lattes', nome: 'Currículo Lattes', tipo: 'url', exemplo: 'http://lattes.cnpq.br/…' },
    { id: 'orcid', nome: 'ORCID', tipo: 'url', exemplo: 'https://orcid.org/…' },
    { id: 'scholar', nome: 'Google Acadêmico', tipo: 'url', exemplo: 'https://scholar.google.com/…' },
    { id: 'linkedin', nome: 'LinkedIn', tipo: 'url', exemplo: 'https://www.linkedin.com/in/…' },
  ];

  // Seções que já entram marcadas; as demais ficam para a pessoa escolher.
  const SECOES_LIGADAS = /^(FormacaoAcademicaTitulacao|FormacaoAcademicaPosDoutorado|AtuacaoProfissional|ProjetosPesquisa|PremiosTitulos)$/;
  const PRODUCOES_LIGADAS = /artigo|livro|cap[ií]tulo/i;

  const app = document.getElementById('app');
  // temaPrevia: a prévia mostra o site no claro ou no escuro (só faz diferença no modo automático).
  // idiomaPrevia: idem para o idioma, quando o site sai em português e inglês. bioAtivo: qual editor
  // de apresentação (pt ou en) recebeu o foco por último, para os links e o menu de contexto.
  const ui = { erro: '', editando: null, expandidas: new Set(), largura: 1280, temaPrevia: 'claro', idiomaPrevia: 'pt', bioAtivo: 'bio' };
  let estado = carregar() || novoEstado();

  // ---------- estado ----------

  function novoEstado() {
    return {
      etapa: 'aparencia',
      aparencia: Tema.normalizar({}),
      fonte: null,
      semLattes: false,
      // Os campos *En são a versão em inglês, usados quando o site sai nos dois idiomas.
      perfil: { nome: '', subtitulo: '', subtituloEn: '', bio: '', bioEn: '', bioOriginal: '', foto: '', links: {}, interesses: [], interessesEn: [], interessesEditados: false },
      secoes: [],
      avisos: [],
      publicacao: { usuario: '' },
    };
  }

  function carregar() {
    try {
      const s = localStorage.getItem(CHAVE);
      if (!s) return null;
      // Completa estados salvos por versões anteriores do construtor.
      const e = Object.assign(novoEstado(), JSON.parse(s));
      e.aparencia = Tema.normalizar(e.aparencia);
      e.perfil = Object.assign(novoEstado().perfil, e.perfil);
      e.publicacao = Object.assign(novoEstado().publicacao, e.publicacao);
      completarProducoes(e.secoes);
      // Progresso salvo antes de existirem os interesses: sugere as áreas de atuação, como numa importação.
      if (!e.perfil.interessesEditados && !e.perfil.interesses.length) e.perfil.interesses = Site.interessesPadrao(e.secoes);
      return e;
    } catch (e) {
      return null;
    }
  }

  // Produções salvas antes de o leitor separar autores, título e veículo: separa agora, a partir
  // da referência, para os destaques e as listas não mostrarem a referência crua do Lattes.
  function completarProducoes(secoes) {
    for (const s of secoes || []) {
      if (s.tipo !== 'producao') continue;
      for (const it of s.itens) {
        if (it.obra || !it.titulo) continue;
        Object.assign(it, Lattes.separarLimpa(it.titulo));
      }
    }
  }

  let timerSalvar;
  function salvar() {
    clearTimeout(timerSalvar);
    timerSalvar = setTimeout(() => {
      try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem armazenamento: segue sem salvar */ }
    }, 250);
  }

  // Importar de novo (currículo atualizado) mantém o que a pessoa já decidiu e editou.
  function aplicarLattes(dados) {
    const anteriores = new Map();
    for (const s of estado.secoes) for (const it of s.itens) anteriores.set(it.id, it);
    const reimportacao = anteriores.size > 0;
    const ocultos = new Set(estado.ocultos || []); // tirados do site antes de reabrir um index.html

    let destaques = 0;
    const secoes = dados.secoes.map(s => {
      const ligada = s.tipo === 'producao' ? PRODUCOES_LIGADAS.test(s.titulo) : SECOES_LIGADAS.test(s.id);
      return Object.assign({}, s, {
        itens: s.itens.map(it => {
          const antes = anteriores.get(it.id);
          if (antes) {
            if (antes.destaque) destaques++;
            return Object.assign({}, it, {
              titulo: antes.titulo, link: antes.link || it.link, manter: antes.manter, destaque: antes.destaque,
              dTitulo: antes.dTitulo, dVeiculo: antes.dVeiculo, dTexto: antes.dTexto, ordem: antes.ordem,
            });
          }
          if (ocultos.has(it.id)) return Object.assign({}, it, { manter: false, destaque: false });
          // As produções que o autor marcou como relevantes no Lattes já vêm como destaque.
          const destaque = !reimportacao && s.tipo === 'producao' && it.relevante && destaques < MAX_DESTAQUES;
          if (destaque) destaques++;
          return Object.assign({}, it, { manter: ligada || destaque, destaque });
        }),
      });
    });

    // Os destaques livres não vêm do Lattes: continuam como estão.
    const livres = estado.secoes.find(s => s.tipo === 'livre');
    if (livres) secoes.push(livres);
    renumerarDestaques(secoes);

    const p = estado.perfil;
    const links = Object.assign({}, p.links);
    for (const [k, v] of Object.entries(dados.perfil.links)) if (v && !links[k]) links[k] = v;
    const bioEditada = p.bio && p.bio !== p.bioOriginal;
    return Object.assign({}, estado, {
      etapa: 'conteudo',
      fonte: dados.fonte,
      perfil: Object.assign({}, p, {
        nome: p.nome || dados.perfil.nome,
        bio: bioEditada ? p.bio : dados.perfil.bio,
        bioOriginal: dados.perfil.bio,
        links,
        // Interesses: as áreas de atuação do Lattes, a menos que a pessoa já tenha mexido na lista.
        interesses: p.interessesEditados ? p.interesses : Site.interessesPadrao(secoes),
      }),
      secoes,
      ocultos: [], // já aplicados: agora todas as produções estão no estado
      avisos: dados.avisos,
    });
  }

  function totais() {
    let itens = 0;
    let destaques = 0;
    for (const s of estado.secoes) for (const it of s.itens) {
      if (it.manter && s.tipo !== 'livre') itens++;
      if (it.destaque) destaques++;
    }
    return { itens, destaques };
  }

  // ---------- telas ----------

  function render() {
    renderIdiomas();
    renderEtapas();
    popover.innerHTML = htmlPopover();
    document.body.classList.toggle('larga', estado.etapa === 'aparencia');
    document.body.classList.toggle('total', estado.etapa === 'revisao');
    app.innerHTML =
      estado.etapa === 'aparencia' ? telaAparencia() :
      estado.etapa === 'conteudo' ? telaConteudo() :
      estado.etapa === 'revisao' ? telaRevisao() :
      estado.etapa === 'publicar' ? telaPublicar() :
      telaLattes();
    if (estado.etapa === 'aparencia' || estado.etapa === 'revisao') montarPrevia();
  }

  function podeIr(id) {
    if (id === 'aparencia' || id === 'lattes') return true;
    if (id === 'conteudo' || id === 'revisao' || id === 'publicar') return !!(estado.fonte || estado.semLattes);
    return false;
  }

  function renderEtapas() {
    document.getElementById('etapas').innerHTML = '<ol>' + ETAPAS.map((et, i) => {
      const atual = et.id === estado.etapa;
      const conteudo = `<span class="num">${i + 1}</span>${_(et.nome)}${et.pronta ? '' : ` <small>${_('em breve')}</small>`}`;
      return `<li class="${atual ? 'atual' : ''}${et.pronta ? '' : ' em-breve'}"${atual ? ' aria-current="step"' : ''}>${
        !atual && et.pronta && podeIr(et.id) ? `<button type="button" data-ir="${et.id}">${conteudo}</button>` : conteudo}</li>`;
    }).join('') + '</ol>';
  }

  // Seletor de idioma do construtor (PT / EN), no cabeçalho, ao lado das etapas.
  function renderIdiomas() {
    const el = document.getElementById('idiomas');
    if (!el) return;
    document.documentElement.lang = I18n.lang(I18n.idioma());
    document.title = 'PageLab · ' + _('Monte seu site pessoal');
    el.innerHTML = I18n.IDIOMAS.map(i =>
      `<button type="button" data-idioma="${i.id}" lang="${i.lang}" title="${esc(i.nome)}" aria-pressed="${I18n.idioma() === i.id}">${i.id.toUpperCase()}</button>`).join('');
  }

  function irPara(etapa) {
    estado.etapa = etapa;
    ui.erro = '';
    salvar();
    render();
    window.scrollTo(0, 0);
  }

  // ---------- tela: aparência ----------

  function temConteudo() {
    return !!(estado.fonte || estado.semLattes || estado.perfil.bio);
  }

  // Bolinhas de cor de destaque: usadas na tela de aparência e nos ajustes rápidos da revisão.
  function htmlCores(ap) {
    const personalizada = !Tema.ACENTOS.some(a => a.cor === ap.acento);
    return Tema.ACENTOS.map(a => `
      <label class="opcao-cor" title="${esc(_(a.nome))}">
        <input type="radio" name="acento" value="${a.cor}" data-aparencia="acento" class="invisivel"${ap.acento === a.cor ? ' checked' : ''}>
        <span class="bolinha" style="background:${a.cor}"></span><span class="invisivel">${esc(_(a.nome))}</span>
      </label>`).join('') + `
      <label class="opcao-cor outra${personalizada ? ' selecionada' : ''}" title="${esc(_('Escolher outra cor'))}">
        <input type="color" value="${esc(ap.acento)}" data-aparencia="acento-livre" class="invisivel">
        <span class="bolinha arco-iris"${personalizada ? ` style="background:${esc(ap.acento)}"` : ''}></span>
        <span>${_('Outra cor')}</span>
      </label>`;
  }

  function telaAparencia() {
    const ap = estado.aparencia;
    const idiomasSite = Tema.IDIOMAS || I18n.IDIOMAS;
    return `
      <div class="aparencia">
        <section class="cartao controles">
          <h1>${_('Escolha o visual do seu site')}</h1>
          <p class="sub">${_('Dá para mudar depois, a qualquer momento.')}</p>
          ${estado.fonte ? '' : `
          <label class="campo">${_('Seu nome')}
            <input data-perfil="nome" value="${esc(estado.perfil.nome)}" placeholder="${esc(_('Como você quer aparecer no site'))}" autocomplete="name">
          </label>`}

          <fieldset class="grupo">
            <legend>${_('Fundo')}</legend>
            <div class="opcoes-fundo">
              ${Tema.FUNDOS.map(f => `
              <label class="opcao-fundo">
                <input type="radio" name="fundo" value="${f.id}" data-aparencia="fundo" class="invisivel"${ap.fundo === f.id ? ' checked' : ''}>
                <span class="amostra" style="background:${f.fundo}"></span>${esc(_(f.nome))}
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Cor de destaque')}</legend>
            <div class="opcoes-cor">${htmlCores(ap)}</div>
            <p class="dica" id="aviso-contraste"${acentoAjustado() ? '' : ' hidden'}>${_('Esta cor é clara demais para textos sobre este fundo. Nos links e títulos, o site usa uma versão um pouco mais escura dela, para garantir a leitura.')}</p>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Estrutura')}</legend>
            <div class="opcoes-estrutura">
              ${Tema.ESTRUTURAS.map(e => `
              <label class="opcao-estrutura" title="${esc(_(e.descricao))}">
                <input type="radio" name="estrutura" value="${e.id}" data-aparencia="estrutura" class="invisivel"${ap.estrutura === e.id ? ' checked' : ''}>
                ${miniatura(e.id)}<span>${esc(_(e.nome))}</span>
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Foto')}</legend>
            <div class="foto-aparencia">
              ${htmlFoto()}
              <div class="foto-texto">
                <p>${estado.perfil.foto ? _('Sua foto aparece na prévia ao lado.') : _('Uma foto sua, de preferência quadrada ou em retrato.')}</p>
                ${estado.perfil.foto ? `<button type="button" class="link" data-acao="remover-foto">${_('Tirar a foto')}</button>` : ''}
              </div>
            </div>
            <div class="opcoes-estrutura">
              ${Tema.FOTOS.map(f => `
              <label class="opcao-estrutura">
                <input type="radio" name="foto" value="${f.id}" data-aparencia="foto" class="invisivel"${ap.foto === f.id ? ' checked' : ''}>
                ${formatoFoto(f.id)}<span>${esc(_(f.nome))}</span>
              </label>`).join('')}
            </div>
            <p class="dica">${_('Na revisão, dá para arrastar o canto da foto para mudar o tamanho.')}</p>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Fontes')}</legend>
            <div class="opcoes-fonte">
              ${Tema.COMBINACOES.map(c => {
                const t = Tema.familia(c.titulo);
                return `
              <label class="opcao-fonte">
                <input type="radio" name="combinacao" value="${c.id}" data-aparencia="combinacao" class="invisivel"${(Tema.combinacaoAtual(ap) || {}).id === c.id ? ' checked' : ''}>
                <span class="fonte-amostra" style="font-family:${esc(Tema.pilha(c.titulo))};font-weight:${t.peso};letter-spacing:${t.espaco}">${esc(estado.perfil.nome || _('Seu Nome'))}</span>
                <span class="fonte-nome" style="font-family:${esc(Tema.pilha(c.texto))}">${esc(_(c.nome))} · ${t.nome}${c.texto !== c.titulo ? ' + ' + Tema.familia(c.texto).nome : ''}</span>
              </label>`;
              }).join('')}
            </div>
            <div class="fontes-livres">
              <span>${_('Ou combine como quiser:')}</span>
              <label>${_('Títulos')} ${selectFamilias('fonteTitulo', ap.fonteTitulo, Tema.FAMILIAS)}</label>
              <label>${_('Texto')} ${selectFamilias('fonteTexto', ap.fonteTexto, Tema.FAMILIAS.filter(f => !f.soTitulos))}</label>
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Organização')}</legend>
            <div class="opcoes-layout">
              ${Tema.LAYOUTS.map(l => `
              <label class="opcao-layout">
                <input type="radio" name="layout" value="${l.id}" data-aparencia="layout" class="invisivel"${ap.layout === l.id ? ' checked' : ''}>
                <strong>${esc(_(l.nome))}</strong>
                <span>${esc(_(l.descricao))}</span>
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Modo escuro')}</legend>
            <div class="opcoes-layout opcoes-escuro">
              ${Tema.ESCURO.map(e => `
              <label class="opcao-layout">
                <input type="radio" name="escuro" value="${e.id}" data-aparencia="escuro" class="invisivel"${ap.escuro === e.id ? ' checked' : ''}>
                <strong>${esc(_(e.nome))}</strong>
                <span>${esc(_(e.descricao))}</span>
              </label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="grupo">
            <legend>${_('Idioma do site')}</legend>
            <div class="opcoes-layout opcoes-escuro">
              ${idiomasSite.map(i => `
              <label class="opcao-layout">
                <input type="radio" name="idioma" value="${i.id}" data-aparencia="idioma" class="invisivel"${(ap.idioma || 'pt') === i.id ? ' checked' : ''}>
                <strong>${esc(i.nome)}</strong>
                ${i.descricao ? `<span>${esc(_(i.descricao))}</span>` : ''}
              </label>`).join('')}
            </div>
          </fieldset>
        </section>

        <div class="previa">
          <div class="navegador"><span class="bolinhas" aria-hidden="true"><i></i><i></i><i></i></span><span class="endereco" aria-hidden="true">${_('seu-usuario')}.github.io</span>${botaoTema()}</div>
          <div class="previa-moldura" id="previa-moldura">
            <iframe id="previa" title="${esc(_('Prévia do seu site'))}" sandbox="allow-same-origin" tabindex="-1"></iframe>
          </div>
          <p class="dica">${temConteudo() ? _('Prévia com o seu conteúdo.') : _('Prévia com textos de exemplo. O seu conteúdo entra nas próximas etapas.')}</p>
        </div>
      </div>

      <div class="barra">
        <span class="dica">${_('Tudo fica salvo neste navegador.')}</span>
        <span class="barra-acoes"><button type="button" class="botao" data-acao="continuar">${_('Continuar')}</button></span>
      </div>`;
  }

  // Botão redondo de foto: mostra a atual e abre o seletor de arquivo (aparência e conteúdo).
  function htmlFoto() {
    const foto = estado.perfil.foto;
    const rotulo = foto ? _('Trocar foto') : _('Adicionar foto');
    return `
        <label class="foto" title="${esc(rotulo)}">
          <input type="file" accept="image/*" class="invisivel" data-arquivo="foto">
          ${foto ? `<img src="${esc(foto)}" alt="">` : ''}
          <span>${esc(rotulo)}</span>
        </label>`;
  }

  function selectFamilias(campo, valor, familias) {
    return `<select data-aparencia="${campo}">${familias.map(f =>
      `<option value="${f.id}"${f.id === valor ? ' selected' : ''}>${esc(f.nome)}</option>`).join('')}</select>`;
  }

  // Desenhos pequenos de cada estrutura de página, para a escolha ser visual.
  function miniatura(id) {
    const barras = (x, y, larguras) => larguras.map((l, i) => `<rect x="${x}" y="${y + i * 7}" width="${l}" height="3" rx="1.5"/>`).join('');
    const partes = {
      lateral: `<circle cx="13" cy="12" r="6" class="forte"/><rect x="6" y="22" width="14" height="3" rx="1.5" class="forte"/>${barras(6, 30, [11, 9])}${barras(28, 8, [30, 26, 30, 22, 28])}`,
      topo: `<rect x="2" y="2" width="60" height="7" rx="2" class="forte"/><rect x="8" y="15" width="16" height="11" rx="2" class="forte"/>${barras(8, 30, [16, 12])}<rect x="30" y="14" width="1" height="26"/>${barras(35, 15, [24, 20, 24, 16])}`,
      central: `<circle cx="32" cy="10" r="6" class="forte"/><rect x="20" y="19" width="24" height="3" rx="1.5" class="forte"/>${barras(12, 27, [40, 36, 40])}`,
    };
    return `<svg class="miniatura" viewBox="0 0 64 44" aria-hidden="true">${partes[id]}</svg>`;
  }

  function formatoFoto(id) {
    const forma = {
      redonda: '<circle cx="32" cy="22" r="15"/>',
      retangular: '<rect x="10" y="9" width="44" height="28" rx="3"/>',
    }[id];
    return `<svg class="miniatura" viewBox="0 0 64 44" aria-hidden="true"><g class="forte">${forma}</g></svg>`;
  }

  // Só avisa quando o escurecimento é visível; ajustes mínimos passam em silêncio.
  function acentoAjustado() {
    const v = Tema.variaveis(estado.aparencia);
    return Tema.contraste(v['--acento'], v['--fundo']) < 4;
  }

  // A prévia é carregada de um Blob, e não de srcdoc: num srcdoc, o link "#producao" das
  // abas aponta para o endereço do construtor e tiraria a prévia do lugar.
  let urlPrevia = null;
  function montarPrevia() {
    const iframe = document.getElementById('previa');
    if (!iframe) return;
    const d = conteudoSite();
    if (urlPrevia) URL.revokeObjectURL(urlPrevia);
    urlPrevia = URL.createObjectURL(new Blob([Site.html(d, estado.aparencia, { previa: true, baseFontes: BASE_FONTES })], { type: 'text/html' }));
    iframe.onload = () => {
      prepararFoto();
      atualizarCores();
      // Trocar de aba na prévia faz o navegador rolar também a página do construtor; desfaz isso.
      let y = 0;
      iframe.contentDocument.addEventListener('click', () => { y = window.scrollY; }, true);
      iframe.contentWindow.addEventListener('hashchange', () => window.scrollTo(window.scrollX, y));
    };
    iframe.src = urlPrevia;
    ajustar();
  }

  function ajustar() {
    if (estado.etapa === 'revisao') ajustarRevisao();
    else ajustarEscala();
  }

  // Troca de cor, fonte ou modo escuro: só refaz o bloco de variáveis CSS da prévia, sem recarregá-la.
  function atualizarCores() {
    const iframe = document.getElementById('previa');
    const doc = iframe && iframe.contentDocument;
    if (!doc || !doc.documentElement) return;
    const estilo = doc.getElementById('tema');
    if (estilo) estilo.textContent = Tema.css(estado.aparencia);
    doc.documentElement.dataset.tema = ui.temaPrevia;
    // O script do botão PT/EN não roda na prévia (iframe sem scripts): o construtor faz o papel dele.
    doc.documentElement.dataset.idioma = ui.idiomaPrevia;
    doc.querySelectorAll('.idioma-site button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.idioma === ui.idiomaPrevia)));
    posicionarAlcaFoto();
  }

  // Conteúdo do site para a prévia e para o arquivo final: um idioma, ou os dois quando o site sai em ambos.
  function conteudoSite() {
    const ap = estado.aparencia;
    const um = id => (temConteudo() ? Site.dados(estado, id) : Site.exemplo(estado.perfil, id));
    return ap.idioma === 'ambos' ? { pt: um('pt'), en: um('en') } : um(ap.idioma);
  }

  // Botões que alternam a prévia: claro/escuro (só no modo automático) e PT/EN (só no site em ambos).
  function botaoTema() {
    const escuro = ui.temaPrevia === 'escuro';
    const en = ui.idiomaPrevia === 'en';
    return `<button type="button" class="botao-tema" data-acao="tema-previa" aria-pressed="${escuro}"${estado.aparencia.escuro === 'automatico' ? '' : ' hidden'}>${escuro ? _('☀ Ver no claro') : _('☾ Ver no escuro')}</button>` +
      `<button type="button" class="botao-tema" data-acao="idioma-previa" aria-pressed="${en}"${estado.aparencia.idioma === 'ambos' ? '' : ' hidden'}>${en ? _('Ver em português') : _('Ver em inglês')}</button>`;
  }

  function atualizarBotaoTema() {
    app.querySelectorAll('[data-acao="tema-previa"]').forEach(b => {
      const escuro = ui.temaPrevia === 'escuro';
      b.hidden = estado.aparencia.escuro !== 'automatico';
      b.setAttribute('aria-pressed', String(escuro));
      b.textContent = escuro ? _('☀ Ver no claro') : _('☾ Ver no escuro');
    });
    app.querySelectorAll('[data-acao="idioma-previa"]').forEach(b => {
      const en = ui.idiomaPrevia === 'en';
      b.hidden = estado.aparencia.idioma !== 'ambos';
      b.setAttribute('aria-pressed', String(en));
      b.textContent = en ? _('Ver em português') : _('Ver em inglês');
    });
  }

  function atualizarAparencia() {
    atualizarCores();
    atualizarBotaoTema();
    const aviso = document.getElementById('aviso-contraste');
    if (aviso) aviso.hidden = !acentoAjustado();
    const personalizada = !Tema.ACENTOS.some(a => a.cor === estado.aparencia.acento);
    const outra = app.querySelector('.opcao-cor.outra');
    if (outra) {
      outra.classList.toggle('selecionada', personalizada);
      outra.querySelector('.bolinha').style.background = personalizada ? estado.aparencia.acento : '';
    }
    if (personalizada) app.querySelectorAll('input[name="acento"]').forEach(r => { r.checked = false; });

    // Fontes: a combinação pronta marcada e as listas de títulos e texto andam juntas.
    const ap = estado.aparencia;
    const combinacao = Tema.combinacaoAtual(ap);
    app.querySelectorAll('input[name="combinacao"]').forEach(r => { r.checked = !!combinacao && r.value === combinacao.id; });
    const selTitulo = app.querySelector('select[data-aparencia="fonteTitulo"]');
    const selTexto = app.querySelector('select[data-aparencia="fonteTexto"]');
    if (selTitulo) selTitulo.value = ap.fonteTitulo;
    if (selTexto) selTexto.value = ap.fonteTexto;
    const selCombinacao = app.querySelector('select[data-aparencia="combinacao"]');
    if (selCombinacao) selCombinacao.value = combinacao ? combinacao.id : '';
  }

  // No celular, a prévia mostra o site na versão de celular e ocupa menos altura,
  // para os controles logo abaixo continuarem ao alcance.
  function ajustarEscala() {
    const moldura = document.getElementById('previa-moldura');
    const iframe = document.getElementById('previa');
    if (!moldura || !iframe) return;
    const estreito = moldura.clientWidth < 560;
    const largura = estreito ? 400 : LARGURA_PREVIA;
    const k = moldura.clientWidth / largura;
    const alturaMax = estreito ? window.innerHeight * 0.45 : window.innerHeight - 190;
    const altura = Math.min(ALTURA_PREVIA * k, Math.max(260, alturaMax));
    iframe.style.width = largura + 'px';
    iframe.style.height = altura / k + 'px';
    iframe.style.transform = `scale(${k})`;
    moldura.style.height = altura + 'px';
  }

  // ---------- tela: revisão ----------

  function telaRevisao() {
    const ap = estado.aparencia;
    const idiomasSite = Tema.IDIOMAS || I18n.IDIOMAS;
    return `
      <div class="revisao-barra">
        <div class="dispositivos" role="group" aria-label="${esc(_('Tamanho da tela'))}">
          ${DISPOSITIVOS.map(d => `<button type="button" data-acao="largura" data-largura="${d.largura}" aria-pressed="${ui.largura === d.largura}">${_(d.nome)}</button>`).join('')}
          <span class="largura-atual" id="largura-atual"></span>
          ${botaoTema()}
        </div>
        <div class="ajustes-rapidos">
          <span class="ajuste" role="radiogroup" aria-label="${esc(_('Fundo'))}">${_('Fundo')}
            ${Tema.FUNDOS.map(f => `
            <label class="opcao-cor" title="${esc(_(f.nome))}">
              <input type="radio" name="fundo" value="${f.id}" data-aparencia="fundo" class="invisivel"${ap.fundo === f.id ? ' checked' : ''}>
              <span class="bolinha" style="background:${f.fundo}"></span><span class="invisivel">${esc(_(f.nome))}</span>
            </label>`).join('')}
          </span>
          <span class="ajuste ajuste-cores" role="radiogroup" aria-label="${esc(_('Cor de destaque'))}">${_('Cor')} ${htmlCores(ap)}</span>
          <label class="ajuste">${_('Fonte')}
            <select data-aparencia="combinacao">
              ${Tema.COMBINACOES.map(c => `<option value="${c.id}"${(Tema.combinacaoAtual(ap) || {}).id === c.id ? ' selected' : ''}>${esc(_(c.nome))}</option>`).join('')}
              <option value="" disabled${Tema.combinacaoAtual(ap) ? '' : ' selected'}>${_('Personalizada')}</option>
            </select>
          </label>
          <label class="ajuste">${_('Estrutura')}
            <select data-aparencia="estrutura">${Tema.ESTRUTURAS.map(e => `<option value="${e.id}"${ap.estrutura === e.id ? ' selected' : ''}>${esc(_(e.nome))}</option>`).join('')}</select>
          </label>
          <label class="ajuste">${_('Foto')}
            <select data-aparencia="foto">${Tema.FOTOS.map(f => `<option value="${f.id}"${ap.foto === f.id ? ' selected' : ''}>${esc(_(f.nome))}</option>`).join('')}</select>
          </label>
          ${estado.perfil.foto ? `
          <span class="ajuste">
            <label for="tamanho-foto">${_('Tamanho')}</label>
            <input type="range" id="tamanho-foto" data-foto-tamanho min="${Tema.FOTO_LARGURA[0]}" max="480" step="2" value="${ap.fotoLargura || 160}">
            <button type="button" class="link" data-acao="foto-padrao" title="${esc(_('Voltar ao tamanho padrão'))}" aria-label="${esc(_('Voltar ao tamanho padrão da foto'))}">↺</button>
          </span>` : ''}
          <label class="ajuste">${_('Organização')}
            <select data-aparencia="layout">${Tema.LAYOUTS.map(l => `<option value="${l.id}"${ap.layout === l.id ? ' selected' : ''}>${esc(_(l.nome))}</option>`).join('')}</select>
          </label>
          <label class="ajuste">${_('Referências')}
            <select data-aparencia="referencias">${Tema.REFERENCIAS.map(r => `<option value="${r.id}"${ap.referencias === r.id ? ' selected' : ''}>${esc(_(r.nome))}</option>`).join('')}</select>
          </label>
          <label class="ajuste">${_('Texto')}
            <select data-aparencia="alinhamento">${Tema.ALINHAMENTOS.map(a => `<option value="${a.id}"${ap.alinhamento === a.id ? ' selected' : ''}>${esc(_(a.nome))}</option>`).join('')}</select>
          </label>
          <label class="ajuste">${_('Modo escuro')}
            <select data-aparencia="escuro">${Tema.ESCURO.map(e => `<option value="${e.id}"${ap.escuro === e.id ? ' selected' : ''}>${esc(_(e.nome))}</option>`).join('')}</select>
          </label>
          <label class="ajuste">${_('Idioma')}
            <select data-aparencia="idioma">${idiomasSite.map(i => `<option value="${i.id}"${(ap.idioma || 'pt') === i.id ? ' selected' : ''}>${esc(i.nome)}</option>`).join('')}</select>
          </label>
        </div>
      </div>

      <div class="palco" id="palco">
        <div class="quadro">
          <div class="moldura-revisao" id="previa-moldura">
            <iframe id="previa" title="${esc(_('Prévia do seu site'))}" sandbox="allow-same-origin"></iframe>
          </div>
          <div class="alca" id="alca" tabindex="0" role="slider" aria-label="${esc(_('Largura da prévia'))}"
            aria-valuemin="${LARGURA_MIN}" aria-valuemax="${LARGURA_MAX}" aria-valuenow="${ui.largura}" title="${esc(_('Arraste para mudar a largura'))}"></div>
        </div>
      </div>

      <div class="barra">
        <span class="barra-acoes">
          <button type="button" class="link" data-acao="voltar-conteudo">${_('Voltar ao conteúdo')}</button>
          <button type="button" class="link" data-acao="abrir-site">${_('Abrir numa aba nova')}</button>
        </span>
        <span class="barra-acoes">
          <button type="button" class="botao" data-acao="continuar">${_('Publicar')}</button>
        </span>
      </div>`;
  }

  // Mostra o site na largura escolhida; se não couber na tela, reduz (como o modo responsivo do navegador).
  let escalaRevisao = 1;
  function ajustarRevisao() {
    const palco = document.getElementById('palco');
    const moldura = document.getElementById('previa-moldura');
    const iframe = document.getElementById('previa');
    if (!palco || !moldura || !iframe) return;
    const largura = ui.largura;
    const k = Math.min(1, (palco.clientWidth - 40) / largura); // 40: espaço da alça
    const topo = palco.getBoundingClientRect().top + window.scrollY;
    const altura = Math.max(320, window.innerHeight - topo - 90);
    escalaRevisao = k;
    iframe.style.width = largura + 'px';
    iframe.style.height = altura / k + 'px';
    iframe.style.transform = `scale(${k})`;
    moldura.style.width = largura * k + 'px';
    moldura.style.height = altura + 'px';

    document.getElementById('largura-atual').textContent = `${largura} px${k < 1 ? ' · ' + _('reduzido a {p}%', { p: Math.round(k * 100) }) : ''}`;
    document.getElementById('alca').setAttribute('aria-valuenow', largura);
    app.querySelectorAll('[data-largura]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.largura) === largura)));
  }

  function mudarLargura(largura) {
    ui.largura = Math.round(Math.min(LARGURA_MAX, Math.max(LARGURA_MIN, largura)));
    ajustarRevisao();
  }

  // ---------- redimensionar a foto na revisão ----------
  // Na prévia da revisão, a foto ganha uma alça no canto: arrastar muda o diâmetro (circular)
  // ou a largura e a altura (retangular). A alça só existe na prévia, nunca no site publicado.

  let posicionarAlcaFoto = () => {};

  function prepararFoto() {
    posicionarAlcaFoto = () => {};
    const iframe = document.getElementById('previa');
    const doc = iframe && iframe.contentDocument;
    const foto = doc && doc.querySelector('.foto');
    if (estado.etapa !== 'revisao' || !foto) return;
    const janela = doc.defaultView;

    const estilo = doc.createElement('style');
    estilo.textContent = `
      .alca-foto{position:absolute;z-index:10;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid var(--acento);border-radius:5px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:nwse-resize;touch-action:none}
      .foto{outline:2px dashed transparent;outline-offset:4px;transition:outline-color .15s}
      .foto:hover,.redimensionando-foto .foto{outline-color:var(--acento)}
      .redimensionando-foto,.redimensionando-foto *{cursor:nwse-resize!important;user-select:none}`;
    doc.head.appendChild(estilo);
    const alca = doc.createElement('span');
    alca.className = 'alca-foto';
    alca.title = _('Arraste para mudar o tamanho da foto');
    doc.body.appendChild(alca);

    posicionarAlcaFoto = () => {
      const r = foto.getBoundingClientRect();
      alca.hidden = !foto.offsetParent; // foto numa aba escondida
      alca.style.left = r.right + janela.scrollX + 'px';
      alca.style.top = r.bottom + janela.scrollY + 'px';
      const controle = document.getElementById('tamanho-foto');
      if (controle && r.width) controle.value = estado.aparencia.fotoLargura || Math.round(r.width);
    };
    janela.addEventListener('resize', posicionarAlcaFoto);
    janela.addEventListener('hashchange', posicionarAlcaFoto);
    doc.fonts.ready.then(posicionarAlcaFoto);
    foto.decode().then(posicionarAlcaFoto, posicionarAlcaFoto);

    let inicio = null;
    alca.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { alca.setPointerCapture(e.pointerId); } catch (err) { /* segue sem captura */ }
      const r = foto.getBoundingClientRect();
      inicio = { x: e.clientX, y: e.clientY, w: r.width, h: r.height };
      doc.documentElement.classList.add('redimensionando-foto');
    });
    alca.addEventListener('pointermove', e => {
      if (!inicio) return;
      const ap = estado.aparencia;
      const [min, max] = Tema.FOTO_LARGURA;
      const w = Math.min(max, Math.max(min, inicio.w + e.clientX - inicio.x));
      ap.fotoLargura = Math.round(w);
      if (ap.foto === 'retangular') {
        const h = Math.max(40, inicio.h + e.clientY - inicio.y);
        ap.fotoProporcao = Math.min(2.5, Math.max(0.4, Math.round((w / h) * 100) / 100));
      }
      atualizarCores();
    });
    const soltar = () => {
      if (!inicio) return;
      inicio = null;
      doc.documentElement.classList.remove('redimensionando-foto');
      salvar();
    };
    alca.addEventListener('pointerup', soltar);
    alca.addEventListener('pointercancel', soltar);
  }

  // Alça de redimensionar: o quadro fica centralizado, então cada pixel arrastado vale por dois.
  let arrasto = null;
  app.addEventListener('pointerdown', e => {
    const alca = e.target.closest('#alca');
    if (!alca) return;
    e.preventDefault();
    alca.setPointerCapture(e.pointerId);
    arrasto = { x: e.clientX, largura: ui.largura, k: escalaRevisao };
    document.body.classList.add('redimensionando');
  });
  app.addEventListener('pointermove', e => {
    if (arrasto) mudarLargura(arrasto.largura + (2 * (e.clientX - arrasto.x)) / arrasto.k);
  });
  app.addEventListener('pointerup', () => {
    arrasto = null;
    document.body.classList.remove('redimensionando');
  });

  // ---------- tela: publicar ----------

  const USUARIO_VALIDO = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i; // regra de nomes do GitHub

  function usuarioAtual() {
    const u = (estado.publicacao.usuario || '').trim().toLowerCase();
    return USUARIO_VALIDO.test(u) ? u : '';
  }

  // Troca {u} pelo usuário do GitHub (ou por "seu-usuario" enquanto não foi preenchido).
  function comUsuario(modelo) {
    return String(modelo || '').replace(/\{u\}/g, usuarioAtual() || _('seu-usuario'));
  }

  function telaPublicar() {
    const link = (modelo, conteudo, classe) =>
      `<a class="${classe}" data-href="${modelo}" href="${esc(comUsuario(modelo))}" target="_blank" rel="noopener">${conteudo}</a>`;
    const trecho = modelo => `<span data-texto="${modelo}">${esc(comUsuario(modelo))}</span>`;
    // Os modelos de endereço usam {u} (usuário do GitHub); ficam fora do _() para não se confundirem com os marcadores.
    return `
      <section class="cartao">
        <h1>${_('Publicar seu site')}</h1>
        <p class="sub">${_('O site inteiro é um arquivo só, o <code>index.html</code>. Você baixa aqui e envia para o GitHub, que publica de graça.')}</p>
        <ol class="passos-publicar">
          <li class="passo">
            <span class="passo-num">1</span>
            <h2>${_('Baixe o seu site')}</h2>
            <p><button type="button" class="botao" data-acao="baixar">${_('Baixar index.html')}</button>
              <span id="estado-download" class="dica" role="status"></span></p>
            <p class="dica">${_('O nome precisa ser exatamente <code>index.html</code>. Se o navegador salvar como “index (1).html”, renomeie antes de enviar.')}</p>
          </li>
          <li class="passo">
            <span class="passo-num">2</span>
            <h2>${_('Seu usuário no GitHub')}</h2>
            <p>${_('Ainda não tem conta? {link} e volte aqui.', { link: `<a href="https://github.com/signup" target="_blank" rel="noopener">${_('Crie uma de graça')}</a>` })}</p>
            <label class="campo-usuario">${_('Nome de usuário')}
              <input data-publicar="usuario" value="${esc(estado.publicacao.usuario)}" placeholder="${esc(_('seu-usuario'))}" autocomplete="off" spellcheck="false">
            </label>
            <p class="dica" id="aviso-usuario"${estado.publicacao.usuario && !usuarioAtual() ? '' : ' hidden'}>${_('Use o nome exato da sua conta: só letras, números e hífen.')}</p>
            <p>${_('Seu site vai ficar em')} <strong>https://${trecho('{u}')}.github.io</strong></p>
          </li>
          <li class="passo">
            <span class="passo-num">3</span>
            <h2>${_('Crie o repositório')} <small>${_('(só na primeira vez)')}</small></h2>
            <p>${_('O nome do repositório precisa ser exatamente')}
              <code class="repo">${trecho('{u}.github.io')}</code>
              <button type="button" class="link" data-acao="copiar" data-copiar="{u}.github.io">${_('Copiar')}</button></p>
            <p>${link('https://github.com/new?name={u}.github.io&visibility=public', _('Criar o repositório no GitHub ↗'), 'botao-secundario')}</p>
            <p class="dica">${_('Deixe como <strong>Public</strong> e clique em <strong>Create repository</strong>. Não precisa marcar mais nada.')}</p>
          </li>
          <li class="passo">
            <span class="passo-num">4</span>
            <h2>${_('Envie o arquivo')}</h2>
            <p>${link('https://github.com/{u}/{u}.github.io/upload/main', _('Abrir a página de envio ↗'), 'botao-secundario')}</p>
            <p>${_('Arraste o <code>index.html</code> para a página, desça até o fim e clique em <strong>Commit changes</strong>.')}</p>
            <p class="dica">${_('No repositório recém-criado, se a página de envio não abrir, entre nele e clique em “uploading an existing file”.')}</p>
          </li>
          <li class="passo">
            <span class="passo-num">5</span>
            <h2>${_('Pronto!')}</h2>
            <p>${_('Em um ou dois minutos o site aparece em {link}. Até lá, o endereço pode mostrar “404”: é o GitHub terminando de publicar.',
              { link: link('https://{u}.github.io', trecho('https://{u}.github.io'), 'link-site') })}</p>
          </li>
        </ol>
      </section>

      <section class="cartao">
        <h2>${_('Para atualizar depois')}</h2>
        <p>${_('Neste navegador, tudo fica salvo: volte aqui, ajuste, baixe de novo e repita o passo 4. O arquivo novo substitui o antigo.')}</p>
        <p>${_('Em outro computador, traga o <code>index.html</code> do seu site na etapa Lattes: ele guarda as suas escolhas para você continuar de onde parou.')}</p>
      </section>

      <div class="barra">
        <span class="barra-acoes"><button type="button" class="link" data-acao="voltar-revisao">${_('Voltar à revisão')}</button></span>
        <span></span>
      </div>`;
  }

  function atualizarUsuario() {
    app.querySelectorAll('[data-href]').forEach(a => { a.href = comUsuario(a.dataset.href); });
    app.querySelectorAll('[data-texto]').forEach(s => { s.textContent = comUsuario(s.dataset.texto); });
    const aviso = document.getElementById('aviso-usuario');
    if (aviso) aviso.hidden = !estado.publicacao.usuario || !!usuarioAtual();
  }

  // O que vai dentro do index.html para reabrir o site no construtor depois (em outro computador,
  // por exemplo). Só o que está no site: as produções não escolhidas voltam reimportando o Lattes.
  function dadosParaReabrir() {
    const p = estado.perfil;
    return {
      construtor: 'site-pessoal',
      versao: 1,
      aparencia: estado.aparencia,
      fonte: estado.fonte,
      perfil: {
        nome: p.nome, subtitulo: p.subtitulo, subtituloEn: p.subtituloEn, bio: p.bio, bioEn: p.bioEn, links: p.links,
        interesses: p.interesses, interessesEn: p.interessesEn, interessesEditados: p.interessesEditados,
      },
      publicacao: { usuario: usuarioAtual() },
      secoes: estado.secoes
        .map(s => ({ id: s.id, titulo: s.titulo, tipo: s.tipo, itens: s.itens.filter(i => i.manter) }))
        .filter(s => s.itens.length),
      // Só os códigos do que a pessoa tirou do site, para continuar de fora ao reimportar o Lattes.
      ocultos: estado.secoes.flatMap(s => s.itens.filter(i => !i.manter).map(i => i.id)),
    };
  }

  async function gerarArquivoFinal() {
    const fontesCss = await Tema.cssFontesEmbutidas(estado.aparencia, BASE_FONTES);
    return Site.html(conteudoSite(), estado.aparencia, { fontesCss, dadosConstrutor: dadosParaReabrir() });
  }

  // No Chrome e no Edge, a janela "Salvar como" já vem com o nome index.html (e sobrescreve o antigo),
  // o que evita o "index (1).html". Nos outros navegadores, é um download comum.
  async function baixarSite(botao) {
    const aviso = document.getElementById('estado-download');
    let destino = null;
    botao.disabled = true;
    try {
      if (window.showSaveFilePicker) {
        try {
          destino = await window.showSaveFilePicker({
            suggestedName: 'index.html',
            types: [{ description: _('Página do site'), accept: { 'text/html': ['.html'] } }],
          });
        } catch (e) {
          if (e.name === 'AbortError') return; // a pessoa cancelou
          destino = null;
        }
      }
      aviso.textContent = _('Gerando o arquivo…');
      const blob = new Blob([await gerarArquivoFinal()], { type: 'text/html' });
      if (destino) {
        const escrita = await destino.createWritable();
        await escrita.write(blob);
        await escrita.close();
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      }
      const kb = Math.round(blob.size / 1024);
      aviso.textContent = destino ? _('Pronto: index.html salvo ({kb} KB).', { kb }) : _('Pronto: index.html baixado ({kb} KB). Confira se o nome ficou index.html.', { kb });
    } catch (e) {
      console.error(e);
      aviso.textContent = _('Não consegui gerar o arquivo.') + ' ' + e.message;
    } finally {
      botao.disabled = false;
    }
  }

  // Um index.html feito pelo construtor, trazido de volta para continuar editando.
  function reabrirSite(texto) {
    const doc = new DOMParser().parseFromString(texto, 'text/html');
    let dados = null;
    try { dados = JSON.parse(doc.getElementById('dados-do-construtor').textContent); } catch (e) { /* segue para o erro abaixo */ }
    if (!dados || dados.construtor !== 'site-pessoal' || !Array.isArray(dados.secoes)) {
      throw Object.assign(new Error(_('Não consegui ler as escolhas guardadas neste index.html.')), { amigavel: true });
    }
    // A foto vem da própria página: no <style id="foto"> (sites novos) ou no <img> (sites antigos).
    const estiloFoto = doc.getElementById('foto');
    const img = doc.querySelector('img.foto');
    const src = estiloFoto
      ? (estiloFoto.textContent.match(/url\("?(data:[^")]+)"?\)/) || [])[1] || ''
      : img ? img.getAttribute('src') || '' : '';
    const p = dados.perfil || {};
    const base = novoEstado();
    const lista = v => (Array.isArray(v) ? v.map(String) : []);
    estado = Object.assign(base, {
      etapa: 'conteudo',
      aparencia: Tema.normalizar(dados.aparencia),
      fonte: dados.fonte || null,
      semLattes: !dados.fonte,
      perfil: Object.assign(base.perfil, {
        nome: String(p.nome || ''),
        subtitulo: String(p.subtitulo || ''),
        subtituloEn: String(p.subtituloEn || ''),
        bio: String(p.bio || ''),
        bioEn: String(p.bioEn || ''),
        links: Object.assign({}, p.links),
        interesses: lista(p.interesses),
        interessesEn: lista(p.interessesEn),
        interessesEditados: !!p.interessesEditados,
        foto: /^data:image\/(png|jpe?g|webp|gif);base64,/.test(src) ? src : '',
      }),
      secoes: (completarProducoes(dados.secoes), dados.secoes),
      ocultos: Array.isArray(dados.ocultos) ? dados.ocultos.map(String) : [],
      publicacao: Object.assign(base.publicacao, dados.publicacao),
      // Guardado em português; a tela traduz na hora de mostrar.
      avisos: dados.fonte ? ['Site reaberto a partir do index.html, que guarda só o que estava publicado. Para ver de novo todas as produções do Lattes, use “Usar outro arquivo” e traga a página do Lattes: suas escolhas continuam.'] : [],
    });
  }

  function telaLattes() {
    return `
      <section class="cartao">
        <h1>${_('Traga seu currículo Lattes')}</h1>
        <p class="sub">${_('O construtor lê a página pública do seu currículo e monta a base do site. Na próxima tela, você escolhe o que entra.')}</p>
        <ol class="passos">
          <li>${_('Abra seu currículo na {busca} e resolva o “Não sou um robô”.', { busca: `<a href="https://buscatextual.cnpq.br/buscatextual/busca.do" target="_blank" rel="noopener">${_('busca do Lattes')}</a>` })}</li>
          <li>${_('Com o currículo aberto, aperte <kbd>Ctrl</kbd> + <kbd>S</kbd> (no Mac, <kbd>⌘</kbd> + <kbd>S</kbd>) e salve. No Safari, escolha o formato <em>Código-fonte da página</em>.')}</li>
          <li>${_('Traga para cá o arquivo <code>.html</code> que foi salvo. A pasta que o navegador cria junto não é necessária.')}</li>
        </ol>
        <label class="soltar" id="soltar">
          <input type="file" accept=".html,.htm,text/html" class="invisivel" data-arquivo="lattes">
          <strong>${_('Arraste o arquivo aqui')}</strong>
          <span>${_('ou clique para escolher')}</span>
        </label>
        <p class="erro" role="alert"${ui.erro ? '' : ' hidden'}>${esc(ui.erro)}</p>
        <p class="privacidade">${_('O arquivo é lido no seu navegador e não sai do seu computador.')}</p>
        <p class="dica">${_('Já fez seu site aqui e quer continuar editando em outro computador? Traga o <code>index.html</code> do seu site do mesmo jeito.')}</p>
        <p class="alternativa">${estado.fonte
          ? `<button type="button" class="link" data-acao="voltar-conteudo">${_('Voltar para o conteúdo, sem trocar o arquivo')}</button>`
          : `<button type="button" class="link" data-acao="sem-lattes">${_('Não tenho Lattes, prefiro preencher à mão')}</button>`}</p>
      </section>`;
  }

  function telaConteudo() {
    const p = estado.perfil;
    const f = estado.fonte;
    const ambos = estado.aparencia.idioma === 'ambos'; // campos em inglês ao lado dos em português
    const primeiraProducao = estado.secoes.findIndex(s => s.tipo === 'producao');
    return `
      ${f ? `<p class="origem">${f.atualizadoEm ? _('Dados do Lattes atualizado em {data}.', { data: esc(f.atualizadoEm) }) : _('Dados do Lattes.')}
        <button type="button" class="link" data-acao="trocar-lattes">${_('Usar outro arquivo')}</button></p>` : ''}
      ${estado.avisos.length ? `<div class="aviso">${estado.avisos.map(a => `<p>${esc(_(a))}</p>`).join('')}</div>` : ''}

      <section class="cartao perfil">
        ${htmlFoto()}
        <div class="campo-nome">
          <label for="nome">${_('Nome')}</label>
          <input id="nome" data-perfil="nome" value="${esc(p.nome)}" autocomplete="name">
          <label for="subtitulo">${_('Linha abaixo do nome')}</label>
          <input id="subtitulo" data-perfil="subtitulo" value="${esc(p.subtitulo)}"
            placeholder="${esc(Site.subtituloPadrao(estado) || _('Ex.: Professora na Universidade X'))}">
          ${ambos ? `
          <label for="subtitulo-en" class="rotulo-en">${_('Em inglês')}</label>
          <input id="subtitulo-en" data-perfil="subtituloEn" value="${esc(p.subtituloEn || '')}" lang="en"
            placeholder="${esc(_('Ex.: Professor at University X'))}">` : ''}
        </div>
      </section>

      <section class="cartao">
        <h2 id="rotulo-bio">${_('Sobre você')}</h2>
        <p class="dica">${f ? _('Este é o resumo do seu Lattes, mas aqui o texto é seu: reescreva à vontade.') : _('Conte quem você é e com o que trabalha.')}
          ${_('Num site pessoal, a primeira pessoa costuma funcionar melhor: “Sou doutorando em…”, “Pesquiso…”. Para transformar um trecho em link, selecione e clique com o botão direito.')}</p>
        <div id="bio" class="editor-bio" contenteditable="true" role="textbox" aria-multiline="true"
          aria-labelledby="rotulo-bio" spellcheck="true" lang="pt-BR">${htmlEditorBio(p.bio)}</div>
        <div class="rodape-campo">
          <span id="contador">${_('{n} caracteres', { n: Site.textoPuro(p.bio).length })}</span>
          <span class="barra-acoes">
            <button type="button" class="link" data-acao="inserir-link" title="${esc(_('Selecione um trecho e clique aqui (ou Ctrl+K)'))}">${_('Inserir link')}</button>
            <button type="button" class="link" data-acao="restaurar-bio" id="restaurar-bio"${podeRestaurarBio() ? '' : ' hidden'}>${_('Voltar ao texto do Lattes')}</button>
          </span>
        </div>
        ${ambos ? `
        <h3 id="rotulo-bio-en" class="rotulo-en">${_('Em inglês')}</h3>
        <p class="dica">${_('A versão que o visitante vê ao escolher EN. Se ficar vazia, o site mostra o texto em português.')}</p>
        <div id="bio-en" class="editor-bio" contenteditable="true" role="textbox" aria-multiline="true"
          aria-labelledby="rotulo-bio-en" spellcheck="true" lang="en">${htmlEditorBio(p.bioEn)}</div>
        <div class="rodape-campo">
          <span id="contador-en">${_('{n} caracteres', { n: Site.textoPuro(p.bioEn || '').length })}</span>
        </div>` : ''}
      </section>

      <section class="cartao">
        <h2 id="rotulo-interesses">${_('Interesses')}</h2>
        <p class="dica">${_('Três a seis temas, separados por vírgula. Aparecem no início do site, ao lado da sua formação.')}${f ? ' ' + _('Vieram das áreas de atuação do seu Lattes.') : ''}</p>
        <input data-perfil="interesses" aria-labelledby="rotulo-interesses" value="${esc((p.interesses || []).join(', '))}"
          placeholder="${esc(_('Ex.: Direito e Desenvolvimento, Regulação, Métodos empíricos'))}">
        ${ambos ? `
        <label class="rotulo-en campo-en">${_('Em inglês')}
          <input data-perfil="interessesEn" value="${esc((p.interessesEn || []).join(', '))}" lang="en"
            placeholder="${esc(_('Ex.: Law and Development, Regulation, Empirical methods'))}"></label>` : ''}
      </section>

      <section class="cartao">
        <h2>${_('Links')}</h2>
        <div class="grade-links">
          ${LINKS.map(l => `<label>${_(l.nome)}
            <input type="${l.tipo}" data-link="${l.id}" value="${esc(p.links[l.id] || '')}" placeholder="${esc(l.tipo === 'email' ? _(l.exemplo) : l.exemplo)}"></label>`).join('')}
        </div>
      </section>

      ${telaDestaques()}
      <datalist id="tipos-livres">${TIPOS_LIVRES.map(t => `<option value="${esc(_(t))}">`).join('')}</datalist>

      ${estado.secoes.map((s, si) => (s.tipo === 'livre' ? '' : (si === primeiraProducao ? telaDicaDestaques() : '') + telaSecao(s, si))).join('')}

      <div class="barra">
        <span>
          <span id="resumo-selecao">${resumoSelecao()}</span>
          <span id="aviso-barra" class="aviso-barra" role="status"></span>
        </span>
        <span class="barra-acoes">
          <button type="button" class="link" data-acao="recomecar">${_('Começar de novo')}</button>
          <button type="button" class="botao" data-acao="continuar">${_('Revisar o site')}</button>
        </span>
      </div>`;
  }

  // ---------- destaques ----------
  // Cartões no topo do site. Cada destaque tem título, veículo, uma frase escrita pela pessoa e link;
  // os campos d* guardam o que ela editou (sem edição, o site usa o que veio do Lattes).

  function destaquesOrdenados(secoes = estado.secoes) {
    const lista = [];
    secoes.forEach((s, si) => s.itens.forEach((it, ii) => { if (it.destaque) lista.push({ si, ii, it }); }));
    const ordem = x => (typeof x.it.ordem === 'number' ? x.it.ordem : 1e9);
    return lista.sort((a, b) => ordem(a) - ordem(b) || (b.it.periodo || '').localeCompare(a.it.periodo || ''));
  }

  function renumerarDestaques(secoes = estado.secoes) {
    destaquesOrdenados(secoes).forEach(({ it }, n) => { it.ordem = n; });
  }

  function telaDestaques() {
    const lista = destaquesOrdenados();
    return `
      <section class="cartao" id="cartao-destaques">
        <h2>${_('Destaques')}</h2>
        <p class="dica">${_('Aparecem em cartões no topo do site, nesta ordem. O título e onde saiu vêm do Lattes: ajuste se precisar e escreva uma frase sobre cada um, dizendo do que trata, o que mostra ou por que importa.')}</p>
        ${lista.length
          ? `<ol class="lista-destaques">${lista.map((x, n) => editorDestaque(x, n, lista.length)).join('')}</ol>`
          : `<p class="vazio">${_('Nenhum destaque ainda. Marque com ★ até {max} produções nas listas abaixo.', { max: MAX_DESTAQUES })}</p>`}
        <p class="rodape-campo">
          <span>${_('Algo que não está no Lattes? Um software, um site, um projeto, um prêmio.')}</span>
          <button type="button" class="link" data-acao="novo-destaque-livre">${_('+ Adicionar destaque livre')}</button>
        </p>
      </section>`;
  }

  // Seção virtual que guarda os destaques fora do Lattes; fica no fim de estado.secoes.
  function secaoLivres(criar) {
    let s = estado.secoes.find(x => x.tipo === 'livre');
    if (!s && criar) {
      s = { id: 'Livres', titulo: 'Destaques livres', tipo: 'livre', itens: [] };
      estado.secoes.push(s);
    }
    return s;
  }

  function editorDestaque({ si, ii, it }, n, total) {
    const c = Site.camposDestaque(it);
    const chave = `${si}:${ii}`;
    const livre = estado.secoes[si].tipo === 'livre';
    const tipo = livre ? _('Fora do Lattes') : [_(Site.tipoDe(estado.secoes[si].titulo)), it.periodo].filter(Boolean).join(' · ');
    return `
      <li class="editor-destaque${livre ? ' livre' : ''}" data-destaque="${chave}">
        <div class="editor-destaque-topo">
          <span class="editor-destaque-tipo">${n + 1}. ${esc(tipo)}</span>
          <span class="item-acoes">
            <button type="button" class="icone" data-acao="subir-destaque" data-item="${chave}"${n === 0 ? ' disabled' : ''} title="${esc(_('Mover para cima'))}" aria-label="${esc(_('Mover para cima'))}">↑</button>
            <button type="button" class="icone" data-acao="descer-destaque" data-item="${chave}"${n === total - 1 ? ' disabled' : ''} title="${esc(_('Mover para baixo'))}" aria-label="${esc(_('Mover para baixo'))}">↓</button>
            <button type="button" class="icone" data-acao="destaque" data-item="${chave}" title="${esc(livre ? _('Excluir') : _('Tirar dos destaques'))}" aria-label="${esc(livre ? _('Excluir este destaque') : _('Tirar dos destaques'))}">✕</button>
          </span>
        </div>
        ${livre ? `
        <label>${_('Tipo')} <input data-destaque-campo="categoria" value="${esc(it.categoria || '')}" placeholder="${esc(_('Software, projeto, prêmio…'))}" list="tipos-livres"></label>
        <label>${_('Ano')} <input data-destaque-campo="periodo" value="${esc(it.periodo || '')}" placeholder="2025" inputmode="numeric" maxlength="11"></label>` : ''}
        <label class="campo-largo">${_('Título')} <input data-destaque-campo="dTitulo" value="${esc(c.titulo)}" placeholder="${esc(livre ? _('Nome do software, do projeto…') : _('Título da obra'))}"></label>
        <label>${livre ? _('Onde') : _('Onde saiu')} <input data-destaque-campo="dVeiculo" value="${esc(c.veiculo)}" placeholder="${esc(livre ? _('Instituição, grupo, parceria… (opcional)') : _('Revista, livro, evento…'))}"></label>
        <label>${_('Link')} <input type="url" data-destaque-campo="link" value="${esc(it.link || '')}" placeholder="${esc(_('https:// (opcional)'))}"></label>
        <label class="campo-largo">${livre ? _('Sobre') : _('Sobre o trabalho')}
          <textarea data-destaque-campo="dTexto" rows="2" placeholder="${esc(_('Em uma ou duas frases: do que trata e o que mostra.'))}">${esc(c.texto)}</textarea></label>
        ${estado.aparencia.idioma === 'ambos' ? `
        ${livre ? `<label class="rotulo-en">${_('Tipo em inglês')} <input data-destaque-campo="categoriaEn" value="${esc(it.categoriaEn || '')}" lang="en" placeholder="${esc(_('Software, project, award…'))}"></label>` : ''}
        <label class="campo-largo rotulo-en">${_('Em inglês')}
          <textarea data-destaque-campo="dTextoEn" rows="2" lang="en" placeholder="${esc(_('The same sentence in English (optional).'))}">${esc(it.dTextoEn || '')}</textarea></label>` : ''}
      </li>`;
  }

  function trocarDestaques() {
    const el = document.getElementById('cartao-destaques');
    if (el) el.outerHTML = telaDestaques();
  }

  function telaDicaDestaques() {
    return `
      <section class="cartao dica-destaques">
        <span class="estrela-exemplo" aria-hidden="true">★</span>
        <p>${_('Marque com a estrela até {max} produções para aparecerem em destaque no topo do site. As que você já tinha marcado como relevantes no Lattes vêm pré-selecionadas.', { max: MAX_DESTAQUES })}</p>
      </section>`;
  }

  // Seção sem nada marcado começa recolhida: currículos grandes chegam a ter 50 seções.
  function telaSecao(s, si) {
    const total = s.itens.length;
    const marcados = s.itens.filter(i => i.manter).length;
    const visiveis = ui.expandidas.has(s.id) ? total
      : !marcados ? 0
      : total <= ITENS_VISIVEIS + 2 ? total : ITENS_VISIVEIS;
    return `
      <section class="cartao secao${marcados ? '' : ' vazia'}${visiveis ? '' : ' recolhida'}" data-secao="${si}">
        <header class="secao-topo">
          <h2>${esc(s.titulo)}</h2>
          <span class="contagem" id="contagem-${si}">${contagemSecao(s)}</span>
          <span class="secao-acoes">
            ${visiveis ? '' : `<button type="button" class="link" data-acao="expandir" data-secao="${si}">${total === 1 ? _('Ver o item') : _('Ver os {n} itens', { n: total })}</button>`}
            ${marcados < total ? `<button type="button" class="link" data-acao="todos" data-secao="${si}">${_('Marcar todos')}</button>` : ''}
            ${marcados ? `<button type="button" class="link" data-acao="nenhum" data-secao="${si}">${_('Desmarcar todos')}</button>` : ''}
          </span>
        </header>
        ${visiveis ? `<ul class="itens">${s.itens.slice(0, visiveis).map((it, ii) => telaItem(s, si, it, ii)).join('')}</ul>` : ''}
        ${visiveis && visiveis < total ? `<button type="button" class="mais" data-acao="expandir" data-secao="${si}">${_('Mostrar todos os {n}', { n: total })}</button>` : ''}
      </section>`;
  }

  function telaItem(s, si, it, ii) {
    const chave = `${si}:${ii}`;
    const id = `item-${si}-${ii}`;
    const editando = ui.editando === chave;
    const conteudo = editando ? `
      <div class="editor">
        <textarea data-editor="${chave}" rows="3" aria-label="${esc(_('Texto do item'))}">${esc(it.titulo)}</textarea>
        <label class="editor-link">
          <span>${_('Link')} <em>${_('(opcional: página do artigo, PDF, vídeo…)')}</em></span>
          <input type="url" data-editor-link="${chave}" value="${esc(it.link || '')}" placeholder="https://">
        </label>
        <span class="editor-acoes">
          <button type="button" class="botao pequeno" data-acao="salvar-edicao" data-item="${chave}">${_('Salvar')}</button>
          <button type="button" class="link" data-acao="cancelar-edicao" data-item="${chave}">${_('Cancelar')}</button>
        </span>
      </div>` : `
      <div class="coluna-texto">
        <label for="${id}" class="texto">
          <span class="titulo">${esc(it.titulo)}</span>
          ${it.detalhe ? `<span class="detalhe">${esc(it.detalhe)}</span>` : ''}
          ${it.obs ? `<span class="obs">${esc(resumir(it.obs, 160))}</span>` : ''}
        </label>
        ${it.link || s.tipo === 'producao' ? `
        <button type="button" class="item-link${it.link ? '' : ' vazio'}" data-acao="editar" data-foco="link" data-item="${chave}"
          title="${it.link ? esc(it.link) : esc(_('Adicionar um link para este item'))}">${it.link ? '↗ ' + esc(dominio(it.link)) : _('+ link')}</button>` : ''}
      </div>`;
    return `
      <li class="item${it.manter ? '' : ' fora'}${it.destaque ? ' destacado' : ''}" data-li="${chave}">
        <input type="checkbox" id="${id}" data-marcar="${chave}"${it.manter ? ' checked' : ''}${editando ? ` aria-label="${esc(_('Manter no site'))}"` : ''}>
        ${conteudo}
        <span class="periodo">${esc(it.periodo)}</span>
        <span class="item-acoes">
          ${s.tipo === 'producao' ? `<button type="button" class="estrela" data-acao="destaque" data-item="${chave}"
            aria-pressed="${it.destaque}" title="${esc(it.destaque ? _('Tirar dos destaques') : _('Destacar'))}" aria-label="${esc(_('Destacar'))}">★</button>` : ''}
          ${editando ? '' : `<button type="button" class="icone" data-acao="editar" data-item="${chave}" title="${esc(_('Editar texto e link'))}" aria-label="${esc(_('Editar texto e link'))}">✎</button>`}
        </span>
      </li>`;
  }

  function contagemSecao(s) {
    return _('{n} de {total} no site', { n: s.itens.filter(i => i.manter).length, total: s.itens.length });
  }

  function resumoSelecao() {
    const t = totais();
    return _('<strong>{n}</strong> {itens} no site · <strong>{d}</strong> de {max} destaques',
      { n: t.itens, itens: t.itens === 1 ? _('item') : _('itens'), d: t.destaques, max: MAX_DESTAQUES });
  }

  function podeRestaurarBio() {
    return !!estado.perfil.bioOriginal && estado.perfil.bio !== estado.perfil.bioOriginal;
  }

  // ---------- atualizações pontuais (sem redesenhar a tela toda) ----------

  function trocarItem(si, ii) {
    const li = app.querySelector(`li[data-li="${si}:${ii}"]`);
    if (li) li.outerHTML = telaItem(estado.secoes[si], si, estado.secoes[si].itens[ii], ii);
  }

  function trocarSecao(si) {
    const el = app.querySelector(`section[data-secao="${si}"]`);
    if (el) el.outerHTML = telaSecao(estado.secoes[si], si);
  }

  function atualizarContadores(si) {
    const c = document.getElementById(`contagem-${si}`);
    if (c) c.textContent = contagemSecao(estado.secoes[si]);
    const sec = app.querySelector(`section[data-secao="${si}"]`);
    if (sec) sec.classList.toggle('vazia', !estado.secoes[si].itens.some(i => i.manter));
    const r = document.getElementById('resumo-selecao');
    if (r) r.innerHTML = resumoSelecao();
  }

  let timerAviso;
  function avisar(msg) {
    const el = document.getElementById('aviso-barra');
    if (!el) return;
    el.textContent = ' · ' + msg;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => { el.textContent = ''; }, 4500);
  }

  // ---------- arquivos ----------

  async function importar(arquivo) {
    ui.erro = '';
    try {
      const texto = Lattes.decodificar(await arquivo.arrayBuffer());
      // O mesmo campo aceita o index.html de um site feito aqui, para continuar editando.
      if (texto.includes('id="dados-do-construtor"')) reabrirSite(texto);
      else estado = aplicarLattes(Lattes.lerHtml(texto));
      ui.expandidas.clear();
      ui.editando = null;
      salvar();
      render();
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      ui.erro = e.amigavel ? e.message : _('Não consegui ler este arquivo. Confira se é a página do currículo salva pelo navegador (arquivo .html).');
      render();
    }
  }

  // Reduz a foto sem recortar: o recorte (redonda, quadrada, retangular) é feito pelo CSS do site,
  // então dá para trocar o formato depois sem mandar a foto de novo.
  function lerFoto(arquivo) {
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * escala);
        canvas.height = Math.round(img.naturalHeight * escala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        ok(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        falha(new Error(_('Não consegui abrir esta imagem.')));
      };
      img.src = url;
    });
  }

  // ---------- eventos ----------

  app.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const [si, ii] = (b.dataset.item || '').split(':').map(Number);
    const secao = b.dataset.secao !== undefined ? Number(b.dataset.secao) : si;

    switch (b.dataset.acao) {
      case 'continuar':
        if (estado.etapa === 'conteudo') irPara('revisao');
        else if (estado.etapa === 'revisao') irPara('publicar');
        else irPara(podeIr('conteudo') ? 'conteudo' : 'lattes');
        break;

      case 'baixar':
        baixarSite(b);
        break;

      case 'copiar': {
        const texto = comUsuario(b.dataset.copiar);
        navigator.clipboard.writeText(texto).then(() => {
          b.textContent = _('Copiado!');
          setTimeout(() => { b.textContent = _('Copiar'); }, 1800);
        }, () => { b.textContent = _('Selecione e copie'); });
        break;
      }

      case 'largura':
        mudarLargura(Number(b.dataset.largura));
        break;

      case 'tema-previa':
        ui.temaPrevia = ui.temaPrevia === 'escuro' ? 'claro' : 'escuro';
        atualizarCores();
        atualizarBotaoTema();
        break;

      case 'idioma-previa':
        ui.idiomaPrevia = ui.idiomaPrevia === 'en' ? 'pt' : 'en';
        atualizarCores();
        atualizarBotaoTema();
        break;

      case 'remover-foto':
        estado.perfil.foto = '';
        salvar();
        render();
        break;

      case 'foto-padrao':
        estado.aparencia.fotoLargura = null;
        estado.aparencia.fotoProporcao = null;
        salvar();
        atualizarCores();
        break;

      case 'abrir-site': {
        // Um Blob próprio, que não é revogado quando a prévia é refeita.
        const html = Site.html(conteudoSite(), estado.aparencia, { previa: true, baseFontes: BASE_FONTES });
        window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank', 'noopener');
        break;
      }

      case 'sem-lattes':
        estado.semLattes = true;
        irPara('conteudo');
        break;

      case 'trocar-lattes':
        irPara('lattes');
        break;

      case 'voltar-conteudo':
        irPara('conteudo');
        break;

      case 'voltar-revisao':
        irPara('revisao');
        break;

      case 'recomecar':
        if (!confirm(_('Apagar tudo o que foi feito aqui e começar de novo?'))) return;
        estado = novoEstado();
        ui.expandidas.clear();
        ui.editando = null;
        try { localStorage.removeItem(CHAVE); } catch (err) { /* nada a limpar */ }
        render();
        window.scrollTo(0, 0);
        break;

      case 'restaurar-bio':
        estado.perfil.bio = estado.perfil.bioOriginal;
        document.getElementById('bio').innerHTML = htmlEditorBio(estado.perfil.bio);
        atualizarBio();
        break;

      case 'inserir-link':
        if (!pedirLink()) avisar(_('Selecione um trecho do texto “Sobre você” para virar link.'));
        break;

      case 'todos':
      case 'nenhum': {
        const manter = b.dataset.acao === 'todos';
        for (const it of estado.secoes[secao].itens) {
          it.manter = manter;
          if (!manter) it.destaque = false;
        }
        salvar();
        trocarSecao(secao);
        atualizarContadores(secao);
        break;
      }

      case 'expandir':
        ui.expandidas.add(estado.secoes[secao].id);
        trocarSecao(secao);
        break;

      case 'novo-destaque-livre': {
        if (totais().destaques >= MAX_DESTAQUES) {
          avisar(_('Já são {n} destaques. Tire um para acrescentar outro.', { n: MAX_DESTAQUES }));
          return;
        }
        const s = secaoLivres(true);
        s.itens.push({
          id: 'livre-' + Date.now().toString(36), periodo: '', titulo: '', categoria: '',
          dTitulo: '', dVeiculo: '', dTexto: '', link: '', manter: true, destaque: true, ordem: 1e6,
        });
        renumerarDestaques();
        salvar();
        trocarDestaques();
        atualizarContadores(estado.secoes.indexOf(s));
        const novo = app.querySelector('.editor-destaque.livre:last-of-type input[data-destaque-campo="categoria"]');
        if (novo) novo.focus();
        break;
      }

      case 'destaque': {
        if (estado.secoes[si].tipo === 'livre') { // ✕ num destaque livre: some de vez
          estado.secoes[si].itens.splice(ii, 1);
          renumerarDestaques();
          salvar();
          trocarDestaques();
          atualizarContadores(si);
          break;
        }
        const it = estado.secoes[si].itens[ii];
        if (!it.destaque && totais().destaques >= MAX_DESTAQUES) {
          avisar(_('Já são {n} destaques. Tire um para escolher outro.', { n: MAX_DESTAQUES }));
          return;
        }
        it.destaque = !it.destaque;
        if (it.destaque) {
          it.manter = true;
          it.ordem = 1e6; // entra no fim da fila de destaques
        }
        renumerarDestaques();
        salvar();
        trocarItem(si, ii);
        atualizarContadores(si);
        trocarDestaques();
        if (b.classList.contains('estrela')) {
          const estrela = app.querySelector(`li[data-li="${si}:${ii}"] .estrela`);
          if (estrela) estrela.focus();
        }
        break;
      }

      case 'subir-destaque':
      case 'descer-destaque': {
        renumerarDestaques();
        const lista = destaquesOrdenados();
        const n = lista.findIndex(x => x.si === si && x.ii === ii);
        const m = n + (b.dataset.acao === 'subir-destaque' ? -1 : 1);
        if (n < 0 || m < 0 || m >= lista.length) break;
        [lista[n].it.ordem, lista[m].it.ordem] = [lista[m].it.ordem, lista[n].it.ordem];
        salvar();
        trocarDestaques();
        const botao = app.querySelector(`[data-destaque="${si}:${ii}"] [data-acao="${b.dataset.acao}"]`);
        if (botao && !botao.disabled) botao.focus();
        break;
      }

      case 'editar': {
        const anterior = ui.editando;
        ui.editando = `${si}:${ii}`;
        if (anterior) {
          const [asi, aii] = anterior.split(':').map(Number);
          trocarItem(asi, aii);
        }
        trocarItem(si, ii);
        const campo = app.querySelector(b.dataset.foco === 'link' ? `[data-editor-link="${si}:${ii}"]` : `[data-editor="${si}:${ii}"]`);
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
        break;
      }

      case 'salvar-edicao':
        salvarEdicao(si, ii);
        break;

      case 'cancelar-edicao':
        ui.editando = null;
        trocarItem(si, ii);
        break;
    }
  });

  function salvarEdicao(si, ii) {
    const it = estado.secoes[si].itens[ii];
    const ta = app.querySelector(`[data-editor="${si}:${ii}"]`);
    const campoLink = app.querySelector(`[data-editor-link="${si}:${ii}"]`);
    const texto = ta ? ta.value.replace(/\s+/g, ' ').trim() : '';
    if (texto) it.titulo = texto;
    if (campoLink) it.link = campoLink.value.trim();
    ui.editando = null;
    salvar();
    trocarItem(si, ii);
  }

  app.addEventListener('keydown', e => {
    if (e.target.classList && e.target.classList.contains('editor-bio') && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!pedirLink()) avisar(_('Selecione um trecho do texto para virar link.'));
      return;
    }
    if (e.target.id === 'alca' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const passo = (e.shiftKey ? 100 : 20) * (e.key === 'ArrowLeft' ? -1 : 1);
      mudarLargura(ui.largura + passo);
      return;
    }
    const campo = e.target.closest('[data-editor], [data-editor-link]');
    if (!campo) return;
    const [si, ii] = (campo.dataset.editor || campo.dataset.editorLink).split(':').map(Number);
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); salvarEdicao(si, ii); }
    if (e.key === 'Escape') { ui.editando = null; trocarItem(si, ii); }
  });

  document.getElementById('etapas').addEventListener('click', e => {
    const b = e.target.closest('[data-ir]');
    if (b && podeIr(b.dataset.ir)) irPara(b.dataset.ir);
  });

  // #idiomas fica fora de #app: precisa do próprio listener.
  const seletorIdiomas = document.getElementById('idiomas');
  if (seletorIdiomas) seletorIdiomas.addEventListener('click', e => {
    const b = e.target.closest('[data-idioma]');
    if (!b || b.dataset.idioma === I18n.idioma()) return;
    I18n.definir(b.dataset.idioma);
    render();
  });

  function mudarAparencia(t) {
    const campo = t.dataset.aparencia;
    const ap = estado.aparencia;
    if (campo === 'acento-livre') ap.acento = t.value.toLowerCase();
    else if (campo === 'combinacao') {
      const c = Tema.COMBINACOES.find(x => x.id === t.value);
      if (!c) return;
      ap.fonteTitulo = c.titulo;
      ap.fonteTexto = c.texto;
    } else ap[campo] = t.value;
    salvar();
    // Organização, estrutura, foto e idioma mudam o HTML; cor e fonte só mudam variáveis CSS.
    if (campo === 'layout' || campo === 'estrutura' || campo === 'foto' || campo === 'referencias' || campo === 'idioma') montarPrevia();
    atualizarAparencia();
  }

  app.addEventListener('change', async e => {
    const t = e.target;

    if (t.dataset.aparencia) { mudarAparencia(t); return; }

    if (t.dataset.marcar) {
      const [si, ii] = t.dataset.marcar.split(':').map(Number);
      const it = estado.secoes[si].itens[ii];
      it.manter = t.checked;
      if (!it.manter && it.destaque) {
        it.destaque = false;
        const estrela = t.closest('li').querySelector('.estrela');
        if (estrela) estrela.setAttribute('aria-pressed', 'false');
      }
      const li = t.closest('li');
      li.classList.toggle('fora', !it.manter);
      li.classList.toggle('destacado', it.destaque);
      salvar();
      atualizarContadores(si);
      return;
    }

    if (t.dataset.arquivo === 'lattes' && t.files[0]) importar(t.files[0]);

    if (t.dataset.arquivo === 'foto' && t.files[0]) {
      try {
        estado.perfil.foto = await lerFoto(t.files[0]);
        salvar();
        render();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  let timerPrevia;
  app.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.aparencia === 'acento-livre') { mudarAparencia(t); return; } // atualiza enquanto arrasta
    if (t.dataset.fotoTamanho !== undefined) {
      estado.aparencia.fotoLargura = Number(t.value);
      atualizarCores();
      salvar();
      return;
    }
    if (t.classList && t.classList.contains('editor-bio')) { atualizarBio(); return; }
    if (t.dataset.publicar === 'usuario') {
      estado.publicacao.usuario = t.value.trim().replace(/^@/, '');
      salvar();
      atualizarUsuario();
      return;
    }
    if (t.dataset.destaqueCampo) {
      const [si, ii] = t.closest('[data-destaque]').dataset.destaque.split(':').map(Number);
      const campo = t.dataset.destaqueCampo;
      estado.secoes[si].itens[ii][campo] = campo === 'link' || campo === 'periodo' || campo === 'categoria' ? t.value.trim() : t.value;
      salvar();
      if (campo === 'link') trocarItem(si, ii); // o link também aparece na lista
      return;
    }
    if (t.dataset.perfil === 'interesses' || t.dataset.perfil === 'interessesEn') {
      estado.perfil[t.dataset.perfil] = t.value.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
      if (t.dataset.perfil === 'interesses') estado.perfil.interessesEditados = true;
      salvar();
      return;
    }
    if (t.dataset.perfil) {
      estado.perfil[t.dataset.perfil] = t.value;
      if (estado.etapa === 'aparencia') {
        // O nome aparece nas amostras de fonte e na prévia.
        app.querySelectorAll('.fonte-amostra').forEach(el => { el.textContent = t.value || _('Seu Nome'); });
        clearTimeout(timerPrevia);
        timerPrevia = setTimeout(montarPrevia, 300);
      }
      salvar();
    }
    if (t.dataset.link) {
      estado.perfil.links[t.dataset.link] = t.value.trim();
      salvar();
    }
  });

  // Arrastar o arquivo para qualquer lugar da tela do Lattes; fora dela, soltar não faz nada
  // (sem isso, o navegador abriria o arquivo no lugar do construtor).
  window.addEventListener('dragover', e => {
    e.preventDefault();
    const zona = document.getElementById('soltar');
    if (zona) zona.classList.add('arrastando');
  });
  window.addEventListener('dragleave', e => {
    const zona = document.getElementById('soltar');
    if (zona && !e.relatedTarget) zona.classList.remove('arrastando');
  });
  window.addEventListener('drop', e => {
    e.preventDefault();
    const zona = document.getElementById('soltar');
    if (zona) zona.classList.remove('arrastando');
    const arquivo = e.dataTransfer && e.dataTransfer.files[0];
    if (arquivo && estado.etapa === 'lattes') importar(arquivo);
  });

  // ---------- editor do "Sobre você": texto com links, como num editor de documentos ----------
  // O texto fica guardado como texto puro, com os links no formato [trecho](endereço).

  function htmlEditorBio(bio) {
    return Site.textoComLinks(bio || '').replace(/\n/g, '<br>');
  }

  // O editor em uso: o último que recebeu foco (pt ou en); sem foco ainda, o português.
  function editorBio() {
    return document.getElementById(ui.bioAtivo) || document.getElementById('bio');
  }

  app.addEventListener('focusin', e => {
    if (e.target.classList && e.target.classList.contains('editor-bio')) ui.bioAtivo = e.target.id;
  });

  // Editor -> texto guardado. O navegador cria <div>, <br> e <a> conforme a pessoa digita.
  function serializarBio(raiz) {
    const partes = [];
    const fimDeLinha = () => partes.length && !partes[partes.length - 1].endsWith('\n');
    (function andar(no) {
      for (const n of no.childNodes) {
        if (n.nodeType === 3) partes.push(n.textContent);
        else if (n.nodeName === 'BR') partes.push('\n');
        else if (n.nodeName === 'A') partes.push(`[${n.textContent.replace(/\n/g, ' ')}](${n.getAttribute('href') || ''})`);
        else if (/^(DIV|P)$/.test(n.nodeName)) {
          if (fimDeLinha()) partes.push('\n');
          andar(n);
          if (fimDeLinha()) partes.push('\n');
        } else andar(n);
      }
    })(raiz);
    return partes.join('').replace(/\u00a0/g, ' ') /* espaço rígido que o editor às vezes insere */.replace(/\n{3,}/g, '\n\n').trim();
  }

  // Guarda o que está nos dois editores (o em inglês só existe no site em ambos os idiomas).
  function atualizarBio() {
    const pt = document.getElementById('bio');
    if (!pt) return;
    estado.perfil.bio = serializarBio(pt);
    document.getElementById('contador').textContent = _('{n} caracteres', { n: Site.textoPuro(estado.perfil.bio).length });
    document.getElementById('restaurar-bio').hidden = !podeRestaurarBio();
    const en = document.getElementById('bio-en');
    if (en) {
      estado.perfil.bioEn = serializarBio(en);
      document.getElementById('contador-en').textContent = _('{n} caracteres', { n: Site.textoPuro(estado.perfil.bioEn).length });
    }
    salvar();
  }

  // Aceita "www.site.com" e e-mails; só produz http(s) e mailto.
  function normalizarUrl(url) {
    url = String(url || '').trim();
    if (!url) return '';
    if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
    if (/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(url)) return 'mailto:' + url;
    return 'https://' + url.replace(/^[a-z]+:\/*/i, '').replace(/^\/+/, '');
  }

  const menu = document.createElement('div');
  menu.className = 'menu-contexto';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  const popover = document.createElement('div');
  popover.className = 'popover-link';
  popover.hidden = true;
  // Montado a cada render(), para acompanhar o idioma.
  function htmlPopover() {
    return `
    <label>${_('Endereço do link')} <input type="url" placeholder="https://"></label>
    <span class="popover-acoes">
      <button type="button" class="botao pequeno" data-popover="aplicar">${_('Aplicar')}</button>
      <button type="button" class="link" data-popover="cancelar">${_('Cancelar')}</button>
    </span>`;
  }
  document.body.append(menu, popover);

  let edicaoLink = null; // { range, link } enquanto o menu ou a caixa do link estão abertos

  function posicionar(el, x, y) {
    const r = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    el.style.top = Math.max(8, Math.min(y, window.innerHeight - r.height - 8)) + 'px';
  }

  function abrirPopover(x, y, valor) {
    popover.hidden = false;
    posicionar(popover, x, y);
    const campo = popover.querySelector('input');
    campo.value = valor || '';
    campo.focus();
    campo.select();
  }

  function fecharEdicaoLink(voltarAoTexto) {
    menu.hidden = true;
    popover.hidden = true;
    edicaoLink = null;
    if (voltarAoTexto && editorBio()) editorBio().focus();
  }

  function linkNaSelecao(ed, sel) {
    if (!sel.rangeCount) return null;
    const no = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
    const a = no && no.closest('a');
    return a && ed.contains(a) ? a : null;
  }

  // Botão "Inserir link" e Ctrl+K: usa o trecho selecionado (ou o link onde está o cursor).
  function pedirLink() {
    const ed = editorBio();
    const sel = window.getSelection();
    if (!ed || !sel.rangeCount || !ed.contains(sel.anchorNode)) return false;
    const link = linkNaSelecao(ed, sel);
    if (!link && sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    const r = (link || range).getBoundingClientRect();
    edicaoLink = { range: range.cloneRange(), link };
    abrirPopover(r.left, r.bottom + 6, link ? link.getAttribute('href') : '');
    return true;
  }

  function aplicarLink() {
    const url = normalizarUrl(popover.querySelector('input').value);
    const { range, link } = edicaoLink || {};
    fecharEdicaoLink(false);
    const ed = editorBio();
    if (!ed) return;
    ed.focus();
    if (link) {
      if (url) link.setAttribute('href', url);
      else removerLink(link);
    } else if (range && url) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('createLink', false, url); // entra no desfazer (Ctrl+Z) do navegador
      sel.collapseToEnd();
    }
    atualizarBio();
  }

  function removerLink(link) {
    const ed = editorBio();
    ed.focus();
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(link);
    sel.removeAllRanges();
    sel.addRange(r);
    document.execCommand('unlink');
    sel.collapseToEnd();
    atualizarBio();
  }

  // Botão direito: com um trecho selecionado ou sobre um link, mostra o menu de link.
  // Sem seleção, fica o menu normal do navegador (com a correção ortográfica).
  app.addEventListener('contextmenu', e => {
    const ed = e.target.closest('.editor-bio');
    if (!ed) return;
    ui.bioAtivo = ed.id;
    const sel = window.getSelection();
    const link = e.target.closest('a') || linkNaSelecao(ed, sel);
    const temSelecao = sel.rangeCount && !sel.isCollapsed && ed.contains(sel.anchorNode) && ed.contains(sel.focusNode);
    if (!link && !temSelecao) return;
    e.preventDefault();
    edicaoLink = { range: temSelecao ? sel.getRangeAt(0).cloneRange() : null, link };
    const itens = link ? [['editar', _('Editar link')], ['remover', _('Remover link')]] : [['criar', _('Adicionar link')]];
    menu.innerHTML = itens.map(([acao, rotulo]) => `<button type="button" role="menuitem" data-menu="${acao}">${rotulo}</button>`).join('');
    menu.hidden = false;
    posicionar(menu, e.clientX, e.clientY);
    menu.querySelector('button').focus();
  });

  menu.addEventListener('click', e => {
    const b = e.target.closest('[data-menu]');
    if (!b || !edicaoLink) return;
    const { left, top } = menu.getBoundingClientRect();
    menu.hidden = true;
    if (b.dataset.menu === 'remover') {
      const { link } = edicaoLink;
      edicaoLink = null;
      removerLink(link);
    } else {
      abrirPopover(left, top, edicaoLink.link ? edicaoLink.link.getAttribute('href') : '');
    }
  });

  popover.addEventListener('click', e => {
    const b = e.target.closest('[data-popover]');
    if (b && b.dataset.popover === 'aplicar') aplicarLink();
    else if (b) fecharEdicaoLink(true);
  });

  popover.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); aplicarLink(); }
    if (e.key === 'Escape') fecharEdicaoLink(true);
  });

  menu.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharEdicaoLink(true);
  });

  document.addEventListener('mousedown', e => {
    if (!menu.hidden || !popover.hidden) {
      if (!menu.contains(e.target) && !popover.contains(e.target)) fecharEdicaoLink(false);
    }
    // "Inserir link" não pode tirar a seleção do texto.
    if (e.target.closest('[data-acao="inserir-link"]')) e.preventDefault();
  });

  // Colar: só texto, sem a formatação de onde veio. Colar um endereço sobre um trecho selecionado vira link.
  app.addEventListener('paste', e => {
    if (!e.target.closest('.editor-bio')) return;
    e.preventDefault();
    const texto = e.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel.isCollapsed && /^(https?:\/\/|www\.)\S+$/i.test(texto.trim())) document.execCommand('createLink', false, normalizarUrl(texto.trim()));
    else document.execCommand('insertText', false, texto);
    atualizarBio();
  });

  // ---------- utilidades ----------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function resumir(s, n) {
    return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
  }

  function dominio(url) {
    try {
      return new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url).hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  }

  window.addEventListener('resize', ajustar);
  Tema.carregarFontes(document, BASE_FONTES); // para as amostras de fonte da tela de aparência
  render();
})();
