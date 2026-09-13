# Estacionado: site gerado em inglês

Aqui fica o que foi tirado do PageLattes quando o **site gerado em inglês** foi estacionado,
em 2026-09-12. Nada nesta pasta é carregado pelo construtor.

O que continua funcionando no PageLattes: a **interface** do construtor em português e inglês
(`js/i18n.js` e o seletor PT/EN no cabeçalho). O que saiu é a capacidade de **gerar um site**
em inglês ou nos dois idiomas.

## O que tem aqui

| Arquivo | O que é |
| --- | --- |
| `traducao.js` | O módulo inteiro: tradutor português→inglês rodando no navegador (Transformers.js + Opus-MT quantizado, ~108 MB, num Web Worker) e as regras de tradução de nome de instituição e de área. |
| `site-em-ingles.js` | As duas tabelas que moravam soltas em `js/site.js`: prefixo do grau (`GRAUS_EN`) e países (`PAISES_EN`). |

O resto do código removido está no histórico do git. Para ver como era, compare com o commit
**`0edd83d`**, que é o último em que o recurso existia inteiro:

```bash
git show 0edd83d:js/site.js
git show 0edd83d:js/app.js
git show 0edd83d:js/lattes.js
```

## Por que foi estacionado

Não foi por bug. Foi porque a tradução do **conteúdo do Lattes** não tem resposta boa dentro das
regras do projeto (tudo no navegador, sem servidor e sem chave de API), e meia tradução é pior
que nenhuma.

O que ficou medido em 214 currículos reais (11 de docentes e 200 de um corpus maior):

- **Rótulos e estrutura**: resolvido. Títulos de seção, graus, países e nomes de instituição
  traduzem bem por regras, porque o vocabulário é fechado.
- **Áreas de titulação**: vocabulário aberto. Das 227 áreas distintas, as regras traduziam 125
  inteiras e devolviam 73 pela metade, do tipo
  `Management of Social Projetos and Organizações of Terceiro Setor`. A solução aplicada antes de
  estacionar foi exigir tradução completa: ou a frase toda tem tradução, ou fica em português.
  Isso chegou a 91% das ocorrências **naquele corpus, que é de direito**. Em outras áreas a
  cobertura cai, e cresce a lista de dicionário a manter para sempre.
- **Prosa livre** (descrições de projeto): 716 trechos e 530 mil caracteres, quase todos únicos,
  uns 2,5 mil caracteres por pessoa. Dicionário não serve. O Opus-MT desta pasta serve, mas só
  era chamado em quatro campos (apresentação, subtítulo, interesses e texto dos destaques): os
  outros 58 a 106 trechos por currículo não passavam por nada.

## Se for retomar

O gargalo não é o motor de tradução, é o encanamento. Antes de escolher motor, o que falta é:

1. guardar um campo em inglês **por item** (hoje só o perfil e os destaques têm), editável à mão;
2. preencher esses campos em lote, sob revisão de quem publica;
3. na hora de gerar, cair para o português em tudo que estiver vazio.

Com isso pronto, o motor é trocável: as regras desta pasta, o Opus-MT no navegador, ou uma API.

Sobre API, o que foi levantado: o volume é irrisório, uns **5 a 15 mil caracteres por pessoa**,
um único pedido em lote. O obstáculo é a chave, porque página estática não guarda segredo. As
três formas honestas são a pessoa usar a chave dela, o projeto manter um proxy com a chave, ou
não usar API. A terceira é a que respeita a decisão de manter tudo no navegador.
