# Dicionário — English Words

Aplicativo mobile para explorar palavras em inglês, com significados, fonética, pronúncia em áudio, favoritos e histórico sincronizados por usuário.

> This is a challenge by [Coodesh](https://coodesh.com/)

## Sumário

- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Arquitetura](#arquitetura)
- [Decisões técnicas](#decisões-técnicas)
- [Limitações conhecidas](#limitações-conhecidas)

## Tecnologias

| Área          | Escolha                                                   |
| ------------- | --------------------------------------------------------- |
| Base          | React Native 0.88, Expo SDK 58, TypeScript 6, Expo Router |
| UI            | Restyle, Lucide, Plus Jakarta Sans / Noto Sans            |
| Dados e cache | TanStack Query                                            |
| Testes        | Jest (jest-expo), React Native Testing Library            |

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

## Testes

| Comando                 | O que faz                         |
| ----------------------- | --------------------------------- |
| `npm test`              | Testes unitários e de componentes |
| `npm run test:coverage` | Cobertura                         |
| `npm run lint`          | ESLint + Prettier                 |
| `npm run typecheck`     | Checagem de tipos                 |

_E2E com Maestro: Etapa 7._

## Arquitetura

Organização por **funcionalidade**, com camadas leves dentro de cada uma:

```
src/
  app/          rotas do Expo Router (somente composição de telas)
  features/     uma pasta por funcionalidade (words, dictionary, favorites, history, auth, audio)
  shared/       tema, componentes de UI, providers, utilitários de teste
```

Regra: uma feature não importa outra feature — apenas `shared/`.

_Detalhamento (repositórios, mappers, injeção de dependência): Etapas 1 e 2._

## Decisões técnicas

| Decisão                                      | Motivo                                                                                                   | Alternativa descartada         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Apenas mobile (sem web)                      | Escopo da vaga; SQLite e áudio exigiriam tratamento específico na web                                    | Manter `react-native-web`      |
| Continuous Native Generation                 | `app.json` como fonte única da config nativa; diffs limpos                                               | Versionar `ios/` e `android/`  |
| Sem Zustand                                  | Não há estado global de cliente: dados remotos ficam no TanStack Query e a lista no SQLite               | Zustand para favoritos         |
| Restyle com tokens semânticos                | Tema tipado; componentes nunca usam hex diretamente                                                      | StyleSheet + constantes        |
| Fontes via `useFonts`, uma família por peso  | `fontWeight` não seleciona arquivo de fonte customizada no Android; nomes consistentes entre plataformas | Embutir via config plugin      |
| `QueryClient` criado por factory             | Testes isolados, sem cache compartilhado                                                                 | Instância singleton            |
| Injeção de dependência adiada para a Etapa 1 | Só faz sentido quando existe o primeiro repositório                                                      | Container vazio desde o início |

### Problemas encontrados

| Problema                              | Causa                                                       | Solução                                |
| ------------------------------------- | ----------------------------------------------------------- | -------------------------------------- |
| `render function has not been called` | RNTL v14: `render` e `fireEvent` passaram a ser assíncronos | `await render(...)` em todos os testes |
| `Cannot find name 'describe'`         | TypeScript 6 assume `"types": []` por padrão                | `"types": ["jest"]` no `tsconfig.json` |

## Limitações conhecidas

- **Recuperação de senha** fora do escopo: exige deep link e tela de redefinição; custo alto para o valor no contexto do desafio.
- **Dark mode** não implementado: o design só define a paleta clara. O tema já separa paleta e tokens semânticos para receber uma segunda paleta.

## Design

As telas de referência estão em [`docs/design/`](docs/design/) (abra `index.html` no navegador).
