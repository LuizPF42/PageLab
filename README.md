# PageLab

Monte seu site pessoal a partir do Currículo Lattes e publique no GitHub Pages.

O construtor gera um único arquivo, `index.html`, com tudo dentro (textos, cores, fontes e foto). Para publicar, basta criar um repositório chamado `seu-usuario.github.io` e enviar esse arquivo.

## Como funciona

1. **Aparência**: fundo, cor de destaque, fontes, estrutura, formato da foto e modo escuro.
2. **Lattes**: importe a página pública do seu currículo, salva pelo navegador (Ctrl+S). O arquivo é lido no próprio navegador e não é enviado a lugar nenhum.
3. **Conteúdo**: reescreva a apresentação, escolha o que entra no site, edite os interesses e monte os destaques.
4. **Revisão**: veja o site em celular, tablet e computador e faça os ajustes finais.
5. **Publicar**: baixe o `index.html` e siga o passo a passo no GitHub.

O progresso fica salvo no navegador. Para editar depois, reabra o `index.html` gerado no construtor.

## Por que não lançar produções livremente?

Porque o Lattes já é a fonte oficial da produção acadêmica no Brasil, e manter uma segunda lista, editada à mão no site, cria retrabalho e confusão de fontes: cada artigo novo teria que ser cadastrado duas vezes, e cedo ou tarde o site e o currículo divergiriam.

No PageLab, o Lattes é a única fonte das produções. Quando o currículo muda, a pessoa salva a página pública de novo e importa no construtor: os itens novos entram, e as escolhas anteriores (o que mostrar, o que destacar, os textos e links escritos à mão) são preservadas.

O que o construtor deixa livre é o que o Lattes não cobre bem: a apresentação em primeira pessoa, os interesses, os links e os **destaques livres**, cartões para um software, um site, um projeto ou um prêmio que não têm registro no currículo.

## Rodando localmente

É um site estático, sem etapa de build. Sirva a pasta com qualquer servidor, por exemplo:

```
python -m http.server 8765
```

e abra `http://localhost:8765`.

## Fontes

As fontes em `fonts/` são distribuídas sob a SIL Open Font License (os textos das licenças estão na mesma pasta).

## Autoria

Idealizado por [Luiz Cláudio Pimenta Filho](https://github.com/LuizPF42) e escrito com o [Claude Code](https://claude.com/claude-code), da Anthropic. O leitor do Lattes foi construído e testado sobre páginas públicas reais de currículos.
