# Apito Final — downloads oficiais

Este repositório publica as **versões oficiais** do Apito Final: a aplicação Windows e o pacote de **emblemas oficiais** usados nos overlays do marcador.

O uso normal é feito pela aplicação ou durante a instalação num PC novo. Não é necessário alterar ficheiros neste repositório no dia a dia.

## O que está disponível

| Tipo | Exemplo de etiqueta | Conteúdo |
| ---- | ------------------- | -------- |
| **Aplicação** | `app-v2.0.8` | Instalador Windows (`.msi`) e, quando incluído, script de instalação para máquinas novas |
| **Emblemas** | `v1.0.3` | Emblemas oficiais das equipas para o marcador |

Consulte a página [**Releases**](https://github.com/vunf1/Stream_Futebol_Artifacts/releases) para ver todas as versões. Cada versão da aplicação tem a sua própria release; os emblemas seguem numeração independente.

## Recomendado: instalar e atualizar pela aplicação

1. Instale o Apito Final no Windows (ver abaixo se for uma máquina nova).
2. No rodapé do launcher ou do dashboard de campo, clique no **ícone de atualizações**.
3. Na janela que abre pode:
   - instalar ou atualizar os **emblemas oficiais** quando faltam ou estão desatualizados;
   - instalar uma versão mais recente da **aplicação**, se existir.

A aplicação descarrega as releases daqui, verifica a integridade dos ficheiros e orienta a instalação. Emblemas personalizados que tenha adicionado localmente são mantidos ao instalar o pacote oficial.

## Instalação nova (Windows)

Num ambiente controlado, num PC sem a aplicação:

1. Abra [**Releases**](https://github.com/vunf1/Stream_Futebol_Artifacts/releases).
2. Escolha a release **Apito Final** mais recente (etiqueta `app-v…`).
3. Execute **`Install-ApitoFinal.ps1`**, se estiver incluída. Prepara a confiança do instalador assinado e inicia a instalação.
4. Se o script não existir na release, execute **`ApitoFinal-<versão>-setup.msi`**.

Depois da instalação, use o ícone de atualizações na aplicação para instalar os emblemas oficiais, se for solicitado.

## Descarregar emblemas manualmente (opcional)

O método habitual é instalar pela aplicação. Se o seu fluxo exigir cópia manual, descarregue **`logos-bundle-<versão>.zip`** na release de emblemas correspondente (`v…`) na página Releases.

## Apoio

Problemas com instalação ou atualizações: contacte o administrador do Apito Final ou o canal de apoio JMSIT.
