# Estacionado: tradução automática (modelo de IA no navegador)

Aqui fica o que foi tirado do PageLattes e não voltou: o **tradutor automático**. Nada nesta
pasta é carregado pelo construtor.

O site gerado em inglês, que também esteve estacionado, **voltou em 2026-09-14**, sem tradução
automática: rótulos e nomes por regras, e o conteúdo escrito à mão pela própria pessoa, campo a
campo, com português em tudo que ficar vazio. O que está no construtor hoje é descrito no fim.

## O que tem aqui

| Arquivo | O que é |
| --- | --- |
| `traducao.js` | O tradutor português→inglês rodando no navegador: Transformers.js **2.17.2** (`@xenova/transformers`) + Opus-MT `Xenova/opus-mt-ROMANCE-en` quantizado (~108 MB), num Web Worker; a proteção de nomes de instituição e siglas por marcadores numéricos, que o modelo copia sem mexer; e a recolocação dos links `[trecho](endereço)` na frase traduzida. As regras de nome de instituição que moravam aqui voltaram ao construtor, em `js/ingles.js`, e este arquivo passa a usá-las de lá. Nas versões 3.x e 4.x da biblioteca o modelo não abre ou gera texto sem fim: não "atualizar" sem retestar. |

O resto do código que existiu está no histórico do git. O último commit em que o tradutor
funcionava dentro do construtor é **`0edd83d`**:

```bash
git show 0edd83d:js/app.js      # os botões "Traduzir com IA"
git show 0edd83d:js/traducao.js # o módulo inteiro, com as regras ainda dentro
```

## Por que foi estacionado

Não foi por bug. Foi porque a tradução automática do **conteúdo do Lattes** não tem resposta boa
dentro das regras do projeto (tudo no navegador, sem servidor e sem chave de API), e meia
tradução é pior que nenhuma.

O que ficou medido em 214 currículos reais (11 de docentes e 200 de um corpus maior), em
2026-09-12:

- **Rótulos e estrutura**: resolvido. Títulos de seção, graus, países e nomes de instituição
  traduzem bem por regras, porque o vocabulário é fechado. (Isso voltou.)
- **Áreas de titulação**: vocabulário aberto. Das 227 áreas distintas, as regras traduziam 125
  inteiras e devolviam 73 pela metade, do tipo
  `Management of Social Projetos and Organizações of Terceiro Setor`. A solução foi exigir
  tradução completa: ou a frase toda tem tradução, ou fica em português. Isso chegou a 91% das
  ocorrências **naquele corpus, que é de direito**; em outras áreas a cobertura cai. (A regra
  "inteira ou nada" voltou; o que a regra não cobre, a pessoa escreve.)
- **Prosa livre** (descrições de projeto): 716 trechos e 530 mil caracteres, quase todos únicos,
  uns 2,5 mil caracteres por pessoa. Dicionário não serve. O Opus-MT desta pasta serve, mas só
  era chamado em quatro campos (apresentação, subtítulo, interesses e texto dos destaques): os
  outros 58 a 106 trechos por currículo não passavam por nada.

## O que voltou, e como

O caminho de volta foi o que este README apontava: **um campo em inglês por item**, preenchido à
mão, e português em tudo que ficar vazio. O construtor avisa, na Aparência e no Conteúdo, que não
traduz.

- **Idioma do site** (português, inglês, ou os dois com um botão PT/EN para o visitante), em
  `js/tema.js` (`IDIOMAS`, `aparencia.idioma`).
- **Regras** de grau da formação, país e nome de instituição, em `js/ingles.js`. Só vocabulário
  fechado; a área do título sai em inglês só quando todas as palavras têm regra.
- **Campos "Em inglês"** na etapa Conteúdo, em `js/app.js`: apresentação (`bioEn`), linha abaixo
  do nome (`subtituloEn`), interesses (`interessesEn`), o texto de cada destaque (`dTextoEn`; nos
  destaques livres também `dTituloEn`, `dVeiculoEn` e `categoriaEn`) e, no lápis (✎) de cada item
  do Lattes fora das produções, o texto, o detalhe e a descrição (`tituloEn`, `detalheEn`,
  `descricaoEn`). O editor mostra o que as regras fariam sem eles. Tudo vai dentro do
  `index.html` gerado e é preservado ao reimportar o Lattes.
- **Geração**, em `js/site.js`: `Site.dados(estado, idioma)` monta o conteúdo de um idioma e
  `Site.itemNoIdioma` aplica, item a item, o que a pessoa escreveu, depois as regras, depois o
  português. As produções e as orientações não mudam de idioma: são registros.

O que continua estacionado é só o motor. Se algum dia o modelo voltar, o encanamento já existe:
basta preencher os campos `*En` em lote, sob revisão de quem publica. Sobre usar uma API em vez
do modelo local, o que foi levantado: o volume é irrisório (5 a 15 mil caracteres por pessoa, um
pedido só), mas página estática não guarda segredo. As três formas honestas são a pessoa usar a
chave dela, o projeto manter um proxy com a chave, ou não usar API. A terceira é a que respeita a
decisão de manter tudo no navegador.
