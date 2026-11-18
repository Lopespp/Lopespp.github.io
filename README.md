# Meu site pessoal

Site-currículo em uma página só, hospedado no GitHub Pages: <https://lopespp.github.io>.

A navegação imita um pipeline de dados na arquitetura medallion. Cada aba é uma camada:

| Camada | Aba | Conteúdo |
| --- | --- | --- |
| Bronze | Quem sou | Biografia, trajetória, fora do código |
| Silver | O que sei | Skills, certificações, formação, idiomas |
| Gold | O que construí | Projeto em destaque e experiência |
| Output | Contato | E-mail, LinkedIn, GitHub, CV em PDF |

Feito com Vite, React, TypeScript, Tailwind CSS e Framer Motion. É um site estático, sem backend.

## Como rodar

Precisa de Node.js 22 ou mais novo.

```bash
npm install
npm run dev        # servidor de desenvolvimento em http://localhost:5173
```

Para ver o site exatamente como vai ao ar:

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve a dist/ em http://localhost:4173
```

O build gera o currículo em PDF e a imagem de compartilhamento usando o Chromium do
Playwright. Na primeira vez, instale o navegador:

```bash
npx playwright install chromium
```

Sem o Chromium o build local continua funcionando: ele avisa e usa as cópias que já
estão em `public/`.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checa os tipos, gera `dist/`, pré-renderiza o HTML e gera PDF, `og.jpg` e ícone |
| `npm run preview` | Serve a `dist/` localmente |
| `npm run assets` | Faz o build e copia PDF, `og.jpg` e ícone para `public/` |
| `npm run images` | Regera as versões otimizadas da foto, das badges e das imagens de projeto |
| `npm run typecheck` | Só a checagem de tipos |

## Como editar o conteúdo

Todo o texto do site fica em dois arquivos, um por idioma, com o mesmo formato:

- `src/content/pt.ts` (português, idioma padrão)
- `src/content/en.ts` (inglês)

O formato está descrito em `src/content/types.ts`, e o que vale para os dois idiomas
(e-mail, links, lista de skills, links do Handy Bird e das credenciais) fica em
`src/content/shared.ts`.
Nenhum componente tem texto próprio: mudou o conteúdo, mudou o site, o currículo e o PDF.

Coisas comuns de atualizar:

- **Nova skill:** adicione um item em `skillBase`, no `shared.ts`, com `id`, `icon` e
  `group` (`data`, `engineering`, `languages`, `ml`, `bi` ou `tools`). Use `daily: true`
  para marcar como uso no dia a dia. Se o nome mudar entre os idiomas, ou se a skill tiver
  um complemento, coloque `name`/`detail` em `silver.skills` de cada idioma.
- **"Onde usei" de uma skill:** não é escrito à mão. O popover é montado cruzando o `id`
  da skill com o campo `stack` dos projetos, das experiências e das entregas. Para uma
  skill aparecer num projeto, coloque o `id` dela no `stack` dele.
- **Certificações e badges:** a certificação em destaque fica em `silver.certification` e
  as demais em `silver.badges`. Coloque o PNG da badge (fundo transparente) em
  `assets/badges/`, rode `npm run images` e registre o caminho em `badgeImages`, no
  `shared.ts`. O link da carteira de credenciais fica em `wallets`. O PNG baixado da
  carteira costuma trazer dados da credencial embutidos no arquivo; as versões geradas em
  `public/badges/` saem sem esses metadados, e vale limpar também o original antes de
  versionar.
- **Nova entrega na experiência:** adicione um item em `gold.experiences[].deliveries`
  com `icon`, `text`, `short` (nome curto usado no popover) e `stack`.
- **Novo projeto em destaque:** adicione um item em `gold.projects`. A imagem fica em
  `public/` e o campo `image` é o caminho sem extensão (o site procura `.webp`,
  `-720.webp` e `.jpg`; `npm run images` mostra como gerar essas versões).
- **Linha do tempo, cursos, idiomas, textos do terminal:** mesma ideia, cada um na sua
  seção do arquivo.
- **Ícones:** as chaves aceitas no campo `icon` estão em `src/lib/icons.tsx`. Marcas vêm
  do Simple Icons e o resto do Lucide. Para usar um ícone novo, registre a chave ali.
- **Negrito:** textos aceitam `**assim**`.
- **Foto:** troque `assets/pietro.jpg` (quadrada) e rode `npm run images`.

Lembre de mexer nos dois idiomas. Como os dois arquivos têm o mesmo tipo, o
`npm run typecheck` acusa se faltar um campo em um deles.

## Como publicar

O deploy é automático: todo push na `main` roda `.github/workflows/deploy.yml`, que
instala as dependências, faz o build e publica a `dist/` no GitHub Pages.

Para ligar isso num repositório pela primeira vez: **Settings → Pages → Build and
deployment → Source: GitHub Actions**.

O endereço do site fica em um arquivo só, `site.config.ts`:

```ts
export const BASE = '/';
export const SITE_URL = 'https://lopespp.github.io';
```

Em `<usuario>.github.io` o `BASE` é `'/'`. Se o site for para um repositório com outro
nome, troque para `'/<nome-do-repo>/'` e ajuste o `SITE_URL` para a origem
correspondente. Canonical, Open Graph, `sitemap.xml` e `robots.txt` saem daí.

O GitHub Pages não faz fallback de SPA, então nada aqui depende de rota no servidor: as
abas usam hash (`#bronze`, `#silver`, `#gold`, `#contato`) e o currículo é uma página
HTML separada (`cv.html`).

## Privacidade e segurança

O site foi pensado para não coletar nada de quem visita:

- **Sem cookies, analytics ou rastreadores.** Não há formulário nem backend.
- **Nenhuma requisição a terceiros.** Fontes, ícones, imagens e até o modelo de
  rastreamento da mão são servidos pelo próprio site. Links externos (LinkedIn, GitHub,
  credenciais) só são acessados quando o visitante clica, e abrem com
  `rel="noopener noreferrer"`.
- **Armazenamento local mínimo.** O navegador guarda só o idioma e o tema escolhidos
  (`localStorage`), que não identificam ninguém.
- **Câmera.** O modo "navegar com a mão" só pede a câmera depois de explicar o uso e de o
  visitante clicar em "Ativar". O vídeo é processado no aparelho, não é gravado nem
  enviado, e a câmera é liberada ao desligar o modo.
- **Content Security Policy.** O build aplica uma CSP restritiva por `<meta>` (o GitHub
  Pages não permite cabeçalhos próprios): só carrega recursos do próprio domínio, e os
  scripts embutidos no HTML são liberados pelo hash. A política é montada em
  `scripts/prerender.mjs`.
- **Dados pessoais publicados.** Só o que o dono do site escolheu divulgar: nome, cidade,
  e-mail profissional, foto e links públicos. Sem telefone, endereço ou data de nascimento.
- **Aviso no rodapé.** O link "Privacidade" resume esses pontos para o visitante, inclusive
  que a hospedagem (GitHub Pages) pode registrar dados técnicos de acesso, como o IP.

Ao publicar, mantenha a opção **Enforce HTTPS** ligada em Settings → Pages.

## Estrutura

```
index.html, cv.html      entradas do Vite (site e currículo)
site.config.ts           endereço do site (BASE e SITE_URL)
src/content/             todo o conteúdo, em PT e EN
src/components/          componentes da página
src/components/panels/   conteúdo de cada aba
src/cv/                  currículo para impressão
src/lib/                 ícones, gestos da mão, utilitários
src/state/app.tsx        idioma, tema, aba ativa, toasts
src/index.css            tokens de design (cores, tipografia, movimento)
scripts/                 pré-render, PDF/OG e otimização de imagens
assets/                  originais da foto e das badges
public/                  arquivos servidos como estão
```

## Decisões de projeto

- **HTML pré-renderizado.** O build renderiza a página em português dentro do
  `index.html`. Sem JavaScript, as quatro seções aparecem empilhadas e os links das abas
  funcionam como âncoras. Com JavaScript, o React assume e mostra uma aba por vez.
- **Idioma.** Português é o padrão. A escolha fica salva no navegador, e
  `?lang=en` abre direto em inglês (útil para mandar o link a alguém de fora).
- **Tema.** Na primeira visita segue a preferência do sistema; sem preferência, escuro.
- **Cores em dois tons.** Cada cor de destaque (bronze, silver, gold e o roxo do contato)
  tem um tom cheio, usado em fundos, bordas e brilhos, e um tom "ink", usado em texto e
  ícones. No tema escuro os dois são iguais. No claro, o cheio mantém a cor viva e o ink é
  uma versão escura que passa no AA (4.5:1) sobre os três fundos. Na prática: `text-gold-ink`
  e `text-layer-ink` para texto, `bg-gold` e `border-layer` para o resto.
- **Aba Contato.** Não é uma camada medallion, então tem cor própria (um roxo escuro, o
  token `--output`) e o rótulo `OUTPUT`, o fim do pipeline. O hash é `#contato`; `#contact`
  também funciona.
- **Barra de abas.** No celular é uma bottom nav fixa. No desktop ela acompanha a rolagem
  só quando a janela tem altura suficiente (a partir de 832px), para não comer a tela.
- **CV.** Os botões "Baixar CV" abrem `cv.html`, que já chama a impressão e tem um botão
  de download do PDF. O card "Baixar CV (PDF)" da aba Contato baixa o arquivo direto. Os
  PDFs são gerados no build (`cv-pietro-lopes.pdf` e `cv-pietro-lopes-en.pdf`).
  `cv.html?print=0` mostra o currículo sem abrir o diálogo de impressão.
- **Navegar com a mão.** A biblioteca do MediaPipe, o binário WebAssembly e o modelo de
  pontos da mão (`public/mediapipe/hand_landmarker.task`, do MediaPipe, licença Apache 2.0)
  são servidos pelo próprio site e só são baixados quando o visitante clica em "Ativar".
  A detecção de gestos reaproveita a lógica do Handy Bird (`src/lib/gestures.ts`). Com a mão
  aberta, a altura dela no quadro rola a página (acima do meio sobe, abaixo desce, no meio
  fica parada); o punho fechado vai para a próxima aba; o sinal de paz desliga o modo.
- **Skills por área.** As skills aparecem agrupadas por área, com um marcador para as de
  uso diário. Só as que têm um "onde usei" viram botão com popover.
- **Certificações.** A certificação principal ganha destaque; as outras badges são
  exemplos, com link para a carteira oficial, que é a fonte sempre atualizada.
- **Foto.** O fundo cinza original foi mantido.
- **Grid do fundo.** As linhas usam a cor do texto a 6% de opacidade, que dá o mesmo
  efeito sutil nos dois temas.
- **Movimento.** Além da entrada do nome e das partículas do pipeline, o cano acende até a
  aba ativa, uma barra no topo mostra o progresso da rolagem, a linha do tempo se pinta
  conforme a rolagem passa por ela, os cards ganham uma luz que segue o mouse e a troca de
  tema se abre em círculo a partir do botão (View Transitions). Onde o navegador não
  suporta um desses recursos, o site funciona igual, só sem o efeito.
- **Movimento reduzido.** Com `prefers-reduced-motion`, não há decodificação do nome,
  partículas, tilt, rotação nem os efeitos acima, e as transições viram um fade de 150ms.
- **Fontes.** Space Grotesk, Inter e JetBrains Mono vêm dos pacotes `@fontsource` e são
  servidas pelo próprio site, só no subconjunto latino.
