# Dicionário — English Words

Aplicativo mobile para explorar palavras em inglês, com significados, fonética, pronúncia em áudio, favoritos e histórico sincronizados por usuário.

> This is a challenge by [Coodesh](https://coodesh.com/)

## Sumário

- [Status](#status)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Arquitetura](#arquitetura)
- [Base de palavras](#base-de-palavras)
- [Dicionário, cache e offline](#dicionário-cache-e-offline)
- [Autenticação e dados por usuário](#autenticação-e-dados-por-usuário)
- [Decisões técnicas](#decisões-técnicas)
- [Problemas encontrados](#problemas-encontrados)
- [Limitações e próximos passos](#limitações-e-próximos-passos)
- [Design](#design)

## Status

**Requisitos obrigatórios**

| Requisito                                      | Situação |
| ---------------------------------------------- | -------- |
| Lista de palavras com rolagem infinita         | ✅       |
| Visualizar palavra, significados e fonética    | ✅       |
| Salvar e remover favoritos                     | ✅       |
| Histórico de palavras vistas                   | ✅       |
| Cache das requisições                          | ✅       |
| Wireframe (lista + detalhe com Voltar/Próximo) | ✅       |

**Diferenciais**

| Diferencial                   | Situação | Como                                                             |
| ----------------------------- | -------- | ---------------------------------------------------------------- |
| 1 — Áudio                     | ✅       | mp3 da API com fallback para voz sintetizada do aparelho         |
| 2 — Injeção de dependência    | ✅       | Contexts tipados + composition root, sem biblioteca              |
| 3 — Testes                    | ✅       | 142 testes (unitários, integração com SQLite real, hooks, telas) |
| 4 — Login e dados por usuário | ✅       | Supabase Auth + Postgres com Row Level Security                  |

## Tecnologias

| Área              | Escolha                                                         |
| ----------------- | --------------------------------------------------------------- |
| Base              | React Native 0.88, Expo SDK 58, TypeScript 6, Expo Router       |
| UI                | Restyle (tokens tipados), Lucide, Plus Jakarta Sans / Noto Sans |
| Listas            | FlashList v2                                                    |
| Dados locais      | expo-sqlite (banco pré-construído), expo-sqlite/kv-store        |
| Estado assíncrono | TanStack Query (+ persister e onlineManager com NetInfo)        |
| Formulários       | React Hook Form + zod                                           |
| Backend           | Supabase (Auth + Postgres com RLS)                              |
| Áudio             | expo-audio, expo-speech                                         |
| Testes            | Jest (jest-expo), React Native Testing Library v14              |
| Qualidade         | ESLint (com `import/order`), Prettier                           |

## Como executar

### Pré-requisitos

- Node 22+
- Xcode (iOS) e/ou Android Studio com emulador (Android)
- Um projeto [Supabase](https://supabase.com) (plano gratuito é suficiente)

### 1. Supabase

1. Crie um projeto no Supabase.
2. **SQL Editor** → execute o conteúdo de [`supabase/migrations/20261105120000_create_favorites_and_history.sql`](supabase/migrations/20261105120000_create_favorites_and_history.sql) (tabelas, índices e políticas RLS).
3. **Authentication → Sign In / Providers**: provider **Email** habilitado, **Allow new users to sign up** ligado e **Confirm email** desligado (permite entrar logo após o cadastro).
4. **Project Settings → API Keys / Data API**: copie a **Project URL** e a **Publishable key**.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. O app valida as variáveis na inicialização (zod) e **recusa chaves que não sejam publishable** — a `secret key` nunca deve ir para o app.

### 3. Rodar

```bash
npm install
npx expo run:ios      # ou: npx expo run:android
```

O projeto usa **Continuous Native Generation**: `ios/` e `android/` não são versionadas e são geradas a partir do `app.json` no primeiro `run`. É um development build (não usa Expo Go).

### Scripts

| Comando                  | O que faz                                                |
| ------------------------ | -------------------------------------------------------- |
| `npm start`              | Metro; também gera os tipos das rotas (`typedRoutes`)    |
| `npm test`               | Testes                                                   |
| `npm run typecheck`      | Checagem de tipos                                        |
| `npm run lint`           | ESLint + Prettier                                        |
| `npm run build:words-db` | Regenera `assets/db/words.db` a partir da lista original |

## Testes

**142 testes**, organizados por camada:

| Camada               | Como é testada                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Regras puras         | Tabelas de casos (`it.each`): busca por prefixo, mapper da API, política de retry, agrupamento por dia |
| Repositório SQLite   | **SQL real** em banco em memória (`node:sqlite`) — valida a consulta, não a string                     |
| Repositórios remotos | `fetch` e cliente Supabase injetados: classificação de erros, timeout, cancelamento                    |
| Hooks                | `renderHook` com repositórios fake via DI (paginação, atualização otimista com rollback)               |
| Telas                | RNTL buscando por papel de acessibilidade (`findByRole('button', { name })`)                           |

As rotas (`src/app/`) ficam fora da cobertura: são composição; a lógica vive nas features.

## Arquitetura

Organização por **funcionalidade**, com camadas leves dentro de cada uma:

```
src/
  app/            rotas (Expo Router) — compõem features, sem regra de negócio
  features/
    words/        lista local (SQLite), busca, próximo
    dictionary/   definições (Free Dictionary API), detalhe, pronúncia
    auth/         login, cadastro, sessão
    library/      favoritos e histórico (Supabase)
      domain/     contratos e regras puras (sem React, sem SDKs)
      data/       implementações (SQLite, HTTP, Supabase)
      hooks/      estado assíncrono (TanStack Query)
      components/ e screens/
  di/             composition root
  shared/         tema, UI, providers, utilitários
  test-utils/     render com providers e dependências fake
```

**Regras de dependência:** uma feature não importa outra; `shared/` não conhece features. Quando duas features precisam conversar (ex.: o detalhe da palavra mostra o botão de favorito e o "Próximo" da lista), **a rota compõe** usando _slots_ (`headerAction`, `footer`) — a tela do dicionário não sabe que favoritos existem.

### Injeção de dependência

Cada feature declara o que precisa com `createInjectionContext<T>()` — um Context tipado que **falha imediatamente** se o provider estiver ausente. O composition root (`src/di/`) fornece as implementações reais; `test-utils` fornece fakes.

```
Tela → hook → useXRepository() → contrato (domain)
                                     ↑
               src/di: implementação real (SQLite / HTTP / Supabase)
               test-utils: jest.fn / fake
```

InversifyJS/tsyringe foram descartados: dependem de decorators e `reflect-metadata` (atrito com Babel/Hermes) para um ganho que o Context já entrega.

## Base de palavras

A Free Dictionary API não lista palavras; a lista vem de [`dwyl/english-words`](https://github.com/dwyl/english-words) (~370 mil).

| Opção                        | Problema                                                                |
| ---------------------------- | ----------------------------------------------------------------------- |
| `import` do JSON no bundle   | Parse de vários MB na thread JS no startup; dezenas de MB fixos no heap |
| JSON carregado em runtime    | Mesmo custo de memória; busca vira `filter` linear a cada tecla         |
| Tabela remota                | Dado estático dependendo de rede a cada página                          |
| **SQLite pré-construído** ✅ | Dados em disco, consultas por índice, offline, abertura instantânea     |

O script [`scripts/build-words-db.mjs`](scripts/build-words-db.mjs) gera `assets/db/words.db` com o SQLite embutido no Node, sem dependências.

- **Tabela `WITHOUT ROWID`** com `word` como chave primária: a tabela é o próprio índice.
- **Paginação por cursor** (`word > :cursor`), custo constante em qualquer profundidade (ao contrário de `OFFSET`).
- **Busca por prefixo como intervalo** (`word >= 'hel' AND word < 'hem'`), que usa o índice — `LIKE` normalmente não.
- **`LIMIT n + 1`** indica se há próxima página sem `COUNT`.
- **Nome versionado** (`words-v1.db`) força a cópia de uma base atualizada.

| Medição                             | Valor                                      |
| ----------------------------------- | ------------------------------------------ |
| Palavras                            | 370.098 (3 entradas inválidas descartadas) |
| Tamanho                             | 5,1 MB                                     |
| `COUNT(*)` + página (iOS / Android) | ~13 ms / ~19 ms                            |
| `EXPLAIN QUERY PLAN` da paginação   | `SEARCH words USING PRIMARY KEY (word>?)`  |

## Dicionário, cache e offline

- **Validação na fronteira:** a resposta da API passa por zod e por um mapper puro (agrupa classes gramaticais repetidas entre entradas, deduplica fonética, identifica sotaque pelo nome do mp3).
- **Erros de domínio** (`not-found`, `server`, `network`, `timeout`, `invalid-response`): a tela nunca inspeciona status HTTP; um `switch` exaustivo escolhe a mensagem.
- **Retry só para falhas transitórias** (`server`, `network`), no máximo 2; timeout de 10 s não é repetido.
- **Cache persistido** (Obrigatório 2): `PersistQueryClientProvider` sobre `expo-sqlite/kv-store`. A persistência é **opt-in** via `meta: { persist: true }` — só definições são gravadas; a lista de palavras já está no SQLite.
- **Offline:** `onlineManager` ligado ao NetInfo (conectado **e** internet alcançável). Sem rede, a consulta pausa, a tela mostra "Você está offline" e **retoma sozinha** quando a conexão volta. Palavras já vistas abrem offline.
- **Pronúncia:** mp3 da API (prioridade US → UK → AU); se não houver áudio ou o arquivo não carregar em 6 s, usa a **voz sintetizada** do aparelho.

## Autenticação e dados por usuário

- **Supabase Auth** (e-mail e senha). Senhas ficam em `auth.users` como **hash bcrypt**, gerenciadas pelo Supabase; o app nunca armazena senha.
- **Sessão persistida** no aparelho e renovada automaticamente (pausada em segundo plano via `AppState`).
- **Rotas protegidas** com `Stack.Protected` + `redirectTo`. **Nenhuma tela navega após login/logout**: a navegação é consequência do estado da sessão. A splash só some quando a sessão é resolvida (sem "piscar" o login).
- **Logout com `scope: 'local'`**: sai deste aparelho e funciona offline.
- **Banco** ([migration](supabase/migrations/20261105120000_create_favorites_and_history.sql)): `favorites` e `history` com chave `(user_id, word)`, snapshot da palavra para listar sem consultar a API, `check` na palavra e **RLS por operação** (`(select auth.uid()) = user_id`, `to authenticated`). Advisors de segurança do Supabase sem alertas.
- **Cache por usuário:** as chaves incluem o id (`['library', 'favorites', userId]`), então trocar de conta nunca exibe dados da anterior.
- **Favoritar é otimista** com rollback se o servidor falhar.

## Decisões técnicas

| Decisão                                   | Motivo                                                                                        | Alternativa descartada                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Apenas mobile                             | Escopo da vaga; SQLite e áudio exigiriam tratamento específico na web                         | `react-native-web`                         |
| Continuous Native Generation              | `app.json` como fonte única da config nativa                                                  | Versionar `ios/` e `android/`              |
| Sem Zustand                               | Não há estado global de cliente: remoto no TanStack Query, lista no SQLite, sessão em Context | Zustand                                    |
| Restyle com tokens semânticos             | Tema tipado; nenhum hex nas telas                                                             | StyleSheet + constantes                    |
| Uma família de fonte por peso (e itálico) | No Android, `fontWeight`/`fontStyle` não selecionam arquivo de fonte customizada              | Embutir via plugin                         |
| TanStack Query também para dados locais   | Paginação, estados uniformes e cache entre telas                                              | `useState` manual                          |
| Abas headless (`expo-router/ui`) no topo  | Design pede seletor segmentado; sem biblioteca extra                                          | Tab bar inferior                           |
| Busca abaixo das abas                     | Abas não mudam de posição entre telas (o enunciado permite reposicionar)                      | Busca entre header e abas                  |
| React Hook Form + zod                     | Validação tipada de ponta a ponta e estado de formulário pronto                               | `useState` + validação manual              |
| Persistência do cache opt-in por `meta`   | `shared` não conhece features; nenhuma feature é persistida por acidente                      | Excluir chaves por nome                    |
| Feature `library` única                   | Favoritos e histórico compartilham snapshot, repositório e padrão de chaves                   | Duas features duplicadas                   |
| Voz sintetizada como fallback de áudio    | Nativa, offline, sem chave de API                                                             | ResponsiveVoice                            |
| Sessão no `kv-store`                      | Simples e suficiente para o desafio (área privada do app)                                     | SecureStore (limite de tamanho no Android) |
| Tradução das definições                   | Não pedida; exigiria API externa, custo e latência; o app é "inglês → significados"           | Traduzir para português                    |

## Problemas encontrados

| Problema                                           | Causa                                                                                      | Solução                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `render function has not been called`              | RNTL v14: `render`, `renderHook` e `fireEvent` são assíncronos                             | `await` em todas as chamadas                                      |
| `Cannot find name 'describe'` / `'node:sqlite'`    | TypeScript 6 assume `"types": []`                                                          | `"types": ["jest", "node"]`                                       |
| Hook não re-renderizava após `fetchNextPage`       | _Tracked queries_: só re-renderiza por propriedades lidas antes                            | `waitFor` na propriedade que muda                                 |
| `Must use import to load ES Module`                | Lucide resolvido para `.mjs`; FlashList só ESM                                             | `moduleNameMapper` / `transformIgnorePatterns`                    |
| Rota "não existe" no TypeScript                    | `typedRoutes` só regenera com o Metro rodando                                              | Manter `npm start` ao criar rotas                                 |
| `Element type is invalid … WrappedScreenComponent` | Arquivo de rota vazio, sem `export default`                                                | Restaurar o export                                                |
| "helluo" sempre retorna 502 em HTML                | Instabilidade do servidor da API (Cloudflare)                                              | Erro `server` honesto com retry e link para o Wiktionary          |
| Skeleton por ~33 s offline                         | `fetch` pendurado até o timeout, repetido 3 vezes                                          | NetInfo + estado pausado; timeout não é repetido                  |
| Avisos `act(...)` em testes                        | Asserções cedo demais / consulta pausada retomando após o teste                            | `waitFor` no estado final; `cleanup()` antes de `setOnline(true)` |
| `Invalid API key`                                  | Chave copiada incompleta (39 de 46 caracteres)                                             | Copiar pelo botão do painel                                       |
| Cadastro falhava com mensagem genérica             | `email_provider_disabled`: cadastros desligados no painel (diagnosticado nos logs via MCP) | Reativar "Allow new users to sign up"                             |
| "Unmatched Route" deslogado                        | `Stack.Protected` sem destino de redirecionamento                                          | `redirectTo` explícito nos dois grupos                            |
| Áudio preso em "Carregando…"                       | Servidor de mídia da API retornando 502                                                    | Fallback automático para voz sintetizada após 6 s                 |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` (Android)    | Partição do emulador pequena para o APK de debug                                           | Aumentar o armazenamento do AVD + Wipe Data                       |

## Limitações e próximos passos

Escopo deixado de fora conscientemente, priorizando os requisitos e a qualidade do que foi entregue:

- **Testes E2E (Maestro):** os fluxos críticos (login, favoritar, histórico) estão cobertos por testes de componente; o E2E seria o próximo passo.
- **Recuperação de senha:** exige deep link e tela de redefinição.
- **Dark mode:** o design só define a paleta clara; o tema já separa paleta e tokens semânticos.
- **Marcadores "vista/favorita" no grid, deslizar para excluir e animações** (ex.: pulso no skeleton).
- **Sessão criptografada** (SecureStore + chave para dados grandes).
- **Projeto Supabase gratuito pausa após 7 dias sem uso:** se o login falhar, reative o projeto no painel ou crie o seu com a migration acima.
- **Jest:** aviso intermitente "worker process failed to exit gracefully" (não afeta resultados) a investigar.

## Design

Telas de referência em [`docs/design/`](docs/design/) (abra `index.html` no navegador). Enunciado original em [`docs/challenge/challenge.md`](docs/challenge/challenge.md).
