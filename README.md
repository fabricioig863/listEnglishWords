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
- [Decisões técnicas](#decisões-técnicas)
- [Problemas encontrados](#problemas-encontrados)
- [Limitações conhecidas](#limitações-conhecidas)
- [Design](#design)

## Status

| Etapa | Entrega                                                                    | Situação |
| ----- | -------------------------------------------------------------------------- | -------- |
| 0     | Fundação: lint, testes, tema, providers                                    | ✅       |
| 1     | Lista de palavras com rolagem infinita e busca                             | ✅       |
| 2     | Detalhe da palavra (Free Dictionary API): significados, fonética e estados | ⏳       |
| 3     | Cache persistido das requisições                                           | ⏳       |
| 4     | Pronúncia em áudio                                                         | ⏳       |
| 5     | Autenticação (Supabase)                                                    | ⏳       |
| 6     | Favoritos e histórico por usuário                                          | ⏳       |
| 7     | Testes E2E (Maestro)                                                       | ⏳       |
| 8     | Polimento e documentação final                                             | ⏳       |

## Tecnologias

| Área              | Escolha                                                   |
| ----------------- | --------------------------------------------------------- |
| Base              | React Native 0.88, Expo SDK 58, TypeScript 6, Expo Router |
| UI                | Restyle, Lucide, Plus Jakarta Sans / Noto Sans            |
| Listas            | FlashList v2                                              |
| Dados locais      | expo-sqlite (banco pré-construído)                        |
| Estado assíncrono | TanStack Query                                            |
| Testes            | Jest (jest-expo), React Native Testing Library v14        |
| Qualidade         | ESLint (com `import/order`), Prettier                     |

_Lista completada a cada etapa._

## Como executar

### Pré-requisitos

- Node 22+
- Xcode (iOS) e/ou Android Studio com emulador (Android)

### Passos

```bash
npm install
npx expo run:ios      # ou: npx expo run:android
```

O projeto usa **Continuous Native Generation**: as pastas `ios/` e `android/` não são versionadas e são geradas automaticamente a partir do `app.json` no primeiro `run`. Não é compatível com Expo Go — é um development build.

_Variáveis de ambiente do Supabase: Etapa 5._

### Scripts

| Comando                  | O que faz                                                           |
| ------------------------ | ------------------------------------------------------------------- |
| `npm start`              | Servidor de desenvolvimento (Metro); também gera os tipos das rotas |
| `npm run build:words-db` | Regenera `assets/db/words.db` a partir da lista original            |
| `npm run format`         | Formata o projeto com Prettier                                      |

## Testes

| Comando                 | O que faz                         |
| ----------------------- | --------------------------------- |
| `npm test`              | Testes unitários e de componentes |
| `npm run test:coverage` | Cobertura                         |
| `npm run lint`          | ESLint + Prettier                 |
| `npm run typecheck`     | Checagem de tipos                 |

### Estratégia

| Camada                 | Como é testada                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Regras puras (domínio) | Testes unitários com tabelas de casos (`it.each`), ex.: limites da busca por prefixo         |
| Repositório SQLite     | **SQL real** executado em banco em memória (`node:sqlite`) — valida a consulta, não a string |
| Hooks                  | `renderHook` com repositório fake injetado via DI                                            |
| Telas                  | RNTL buscando elementos por papel de acessibilidade (`findByRole('button', { name })`)       |
| Fluxos completos       | _Maestro — Etapa 7_                                                                          |

As rotas (`src/app/`) ficam fora da cobertura: são apenas composição; a lógica vive nas features.

_E2E com Maestro: Etapa 7._

## Arquitetura

Organização por **funcionalidade**, com camadas leves dentro de cada uma:

```
src/
  app/            rotas do Expo Router (somente composição de telas)
  features/
    words/
      domain/     contratos e regras puras (sem React, sem SQLite)
      data/       implementações (repositório SQLite)
      hooks/      estado assíncrono com TanStack Query
      components/ componentes da feature
      screens/    telas que orquestram hooks, navegação e estados
      di.ts       dependências que a feature declara
  di/             composition root: liga contratos às implementações
  shared/         tema, componentes de UI, hooks genéricos, providers
  test-utils/     render com providers e dependências fake
```

**Regras de dependência**

- Uma feature não importa outra feature — apenas `shared/`.
- `shared/` não conhece nenhuma feature.
- Só `src/di/` (no app) e `src/test-utils/` (nos testes) conhecem as implementações concretas.

### Injeção de dependência

Sem biblioteca: cada feature declara do que precisa com `createInjectionContext<T>()` (um Context tipado que falha imediatamente se o provider estiver ausente), e o composition root em `src/di/` fornece as implementações reais.

```
Tela → useWordList → useWordsRepository() → WordsRepository (contrato)
                                                    ↑
                         src/di: createSqliteWordsRepository(db)   ← app
                         test-utils: jest.fn() / fake                ← testes
```

Bibliotecas como InversifyJS ou tsyringe foram descartadas: dependem de decorators e `reflect-metadata`, que geram atrito com Babel/Hermes, para um ganho que o Context já entrega.

## Base de palavras

A Free Dictionary API não tem endpoint de listagem; a lista vem de [`dwyl/english-words`](https://github.com/dwyl/english-words) (`words_dictionary.json`, ~370 mil palavras).

### Por que SQLite pré-construído

| Opção                        | Problema                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `import` do JSON no bundle   | Parse de vários MB na thread JS no startup; dezenas de MB fixos no heap      |
| JSON carregado em runtime    | Mesmo custo de memória; busca vira `filter` linear a cada tecla              |
| AsyncStorage                 | Chave-valor: sem consulta, ordenação ou índice                               |
| Tabela remota (Supabase)     | Dado estático e público dependendo de rede a cada página                     |
| **SQLite pré-construído** ✅ | Dados em disco, consultas por índice O(log n), offline, abertura instantânea |

O script [`scripts/build-words-db.mjs`](scripts/build-words-db.mjs) baixa a lista, filtra entradas inválidas e gera `assets/db/words.db` usando o SQLite embutido no Node (`node:sqlite`) — sem dependências extras.

### Técnicas

- **Tabela `WITHOUT ROWID` com `word` como chave primária**: a tabela é o próprio índice ordenado; sem duplicar os dados num índice separado.
- **Paginação por cursor (keyset)**: `WHERE word > :cursor ORDER BY word LIMIT n` — custo constante em qualquer profundidade, ao contrário de `OFFSET`.
- **Busca por prefixo como intervalo**: `word >= 'hel' AND word < 'hem'` usa o índice; `LIKE 'hel%'` normalmente não. Casos de borda (`'az' → 'b'`, `'zz'` sem limite superior) cobertos por testes.
- **`LIMIT n + 1`**: uma linha extra indica se há próxima página, sem `COUNT`.
- **Nome versionado (`words-v1.db`)**: o asset só é copiado se o arquivo não existir no aparelho; mudar a versão força a cópia de uma base atualizada.

### Medições

| Métrica                                       | Valor                                      |
| --------------------------------------------- | ------------------------------------------ |
| Palavras                                      | 370.098 (3 entradas inválidas descartadas) |
| Tamanho do banco                              | 5,1 MB                                     |
| `COUNT(*)` + página keyset (simulador iOS)    | ~13 ms                                     |
| `COUNT(*)` + página keyset (emulador Android) | ~19 ms                                     |

```
EXPLAIN QUERY PLAN SELECT word FROM words WHERE word > 'helmet' LIMIT 50;
`--SEARCH words USING PRIMARY KEY (word>?)
```

`SEARCH` (e não `SCAN`) confirma o uso do índice.

### Lista na tela

- **TanStack Query também para dados locais**: paginação (`useInfiniteQuery`), estados de carregamento/erro uniformes e cache entre telas — voltar do detalhe mantém a lista e a busca.
- **`staleTime: Infinity`**: a base é estática; nunca há refetch desnecessário.
- **`keepPreviousData`**: ao trocar a busca, o resultado anterior permanece até o novo chegar — sem o grid piscar para um spinner a cada termo.
- **Debounce de 300 ms** na busca; termo normalizado (trim + minúsculas) numa função única do domínio.
- **FlashList**: recicla células em vez de recriá-las; páginas de 60 palavras (múltiplo das 3 colunas).

## Decisões técnicas

| Decisão                                                      | Motivo                                                                                                             | Alternativa descartada                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Apenas mobile (sem web)                                      | Escopo da vaga; SQLite e áudio exigiriam tratamento específico na web                                              | Manter `react-native-web`                 |
| Continuous Native Generation                                 | `app.json` como fonte única da config nativa; diffs limpos                                                         | Versionar `ios/` e `android/`             |
| Sem Zustand                                                  | Não há estado global de cliente: dados remotos ficam no TanStack Query e a lista no SQLite                         | Zustand para favoritos                    |
| Restyle com tokens semânticos                                | Tema tipado; componentes nunca usam hex diretamente                                                                | StyleSheet + constantes                   |
| Fontes via `useFonts`, uma família por peso                  | `fontWeight` não seleciona arquivo de fonte customizada no Android; nomes consistentes entre plataformas           | Embutir via config plugin                 |
| `QueryClient` criado por factory                             | Testes isolados, sem cache compartilhado                                                                           | Instância singleton                       |
| DI com Context tipado, um por dependência                    | Cada feature declara só o que usa; erro imediato e claro se faltar provider                                        | InversifyJS/tsyringe; objeto único global |
| Repositório depende de `Pick<SQLiteDatabase, 'getAllAsync'>` | Permite testar com SQLite real no Node                                                                             | Depender do tipo completo do expo-sqlite  |
| Abas headless (`expo-router/ui`)                             | Design pede seletor segmentado no topo; navegação do router, visual próprio, sem biblioteca extra                  | Tab bar inferior padrão                   |
| Busca abaixo das abas, dentro da tela Palavras               | Abas não mudam de posição entre telas; busca pertence à feature que a usa (o enunciado permite reposicionar itens) | Busca entre header e abas, como no design |
| Título da busca mostra o termo normalizado                   | Exibe o que o app realmente buscou (a busca ignora maiúsculas)                                                     | Exibir o texto digitado                   |
| `@types/node` e `jest` declarados em `types`                 | TS 6 não carrega `@types/*` automaticamente; globals visíveis no projeto todo é custo aceito                       | `tsconfig` separado para testes           |
| Ordem de imports imposta pelo ESLint                         | Padrão automático (externos → `@/` → relativos), corrigido ao salvar                                               | Convenção manual                          |

## Problemas encontrados

| Problema                                              | Causa                                                                                                         | Solução                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `render function has not been called`                 | RNTL v14: `render`, `renderHook` e `fireEvent` passaram a ser assíncronos                                     | `await` em todas as chamadas                                                          |
| `Cannot find name 'describe'` / `'node:sqlite'`       | TypeScript 6 assume `"types": []` por padrão                                                                  | `"types": ["jest", "node"]` e `@types/node` explícito                                 |
| Hook não re-renderizava após `fetchNextPage` no teste | _Tracked queries_ do TanStack Query: só re-renderiza por propriedades lidas antes; o teste lia só `isSuccess` | Aguardar com `waitFor` exatamente a propriedade que muda (`data`)                     |
| `Must use import to load ES Module` no Jest           | `lucide-react-native` resolvido para `.mjs`; FlashList distribuída só como ESM                                | `moduleNameMapper` para o build CJS do Lucide; FlashList em `transformIgnorePatterns` |
| `Type '"/word/[word]"' is not assignable`             | Tipos das rotas (`typedRoutes`) só são gerados com o Metro rodando                                            | Manter `npm start` ativo ao criar rotas                                               |
| `Element type is invalid … WrappedScreenComponent`    | Arquivo de rota vazio, sem `export default` (o typecheck não detecta)                                         | Restaurar o export; diante desse erro, verificar primeiro os arquivos de rota         |
| `Ref<View>` incompatível no `Pressable`               | No RN 0.88 `View` é componente de função; `Ref<View>` referencia a função, não a instância                    | `Ref<ComponentRef<typeof View>>`                                                      |
| Avisos `not wrapped in act(...)` e falha na busca     | Asserção síncrona viu o estado intermediário do `keepPreviousData`; a consulta terminou após o teste          | `waitFor` no estado final — o aviso indicava teste terminando antes do app            |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` no Android      | Partição de dados do emulador pequena para o APK de debug (~80 MB)                                            | Aumentar _Internal Storage_ do AVD e aplicar com _Wipe Data_                          |

## Limitações conhecidas

- **Recuperação de senha** fora do escopo: exige deep link e tela de redefinição; custo alto para o valor no contexto do desafio.
- **Dark mode** não implementado: o design só define a paleta clara. O tema já separa paleta e tokens semânticos para receber uma segunda paleta.
- **Primeira abertura** copia o banco de 5,1 MB do bundle para o armazenamento do app (operação única, imperceptível nos testes realizados).

## Design

As telas de referência estão em [`docs/design/`](docs/design/) (abra `index.html` no navegador). O enunciado original do desafio está em [`docs/challenge/challenge.md`](docs/challenge/challenge.md).
