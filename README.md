# PageLab

Monte seu site pessoal a partir do Currículo Lattes e publique no GitHub Pages.

O construtor gera um único arquivo, `index.html`, com tudo dentro (textos, cores, fontes e foto). Para publicar, basta criar um repositório chamado `seu-usuario.github.io` e enviar esse arquivo.

## Como funciona

1. **Aparência**: fundo, cor de destaque, fontes, estrutura e formato da foto.
2. **Lattes**: importe a página pública do seu currículo, salva pelo navegador (Ctrl+S). O arquivo é lido no próprio navegador e não é enviado a lugar nenhum.
3. **Conteúdo**: reescreva a apresentação, escolha o que entra no site e monte os destaques.
4. **Revisão**: veja o site em celular, tablet e computador e faça os ajustes finais.
5. **Publicar**: baixe o `index.html` e siga o passo a passo no GitHub.

O progresso fica salvo no navegador. Para editar depois, reabra o `index.html` gerado no construtor.

## Rodando localmente

É um site estático, sem etapa de build. Sirva a pasta com qualquer servidor, por exemplo:

```
python -m http.server 8765
```

e abra `http://localhost:8765`.

## Fontes

As fontes em `fonts/` são distribuídas sob a SIL Open Font License (os textos das licenças estão na mesma pasta).
