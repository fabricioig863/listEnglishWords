# listEnglishWords

Challenge em React Native com **Expo SDK 58**, **Expo Router** e **TypeScript**.

As pastas nativas `android/` e `ios/` são versionadas (geradas com `npx expo prebuild`), então
dá para editar código nativo diretamente. Não use o Expo Go — rode um development build.

## Requisitos

- Node 22+
- Android Studio (SDK + emulador) para Android
- Xcode + CocoaPods para iOS (apenas macOS)

## Rodando

```bash
npm install
cd ios && pod install && cd ..   # apenas iOS
npm run android                  # ou: npm run ios
```

## Scripts

| Comando             | O que faz                                |
| ------------------- | ---------------------------------------- |
| `npm start`         | sobe o Metro                             |
| `npm run android`   | compila e instala o app no Android       |
| `npm run ios`       | compila e instala o app no iOS           |
| `npm run lint`      | ESLint (`expo lint`)                     |
| `npm run typecheck` | `tsc --noEmit`                           |

## Pastas nativas

Como `android/` e `ios/` estão versionadas, mudanças no `app.json` (ícone, plugins, scheme etc.)
**não** são aplicadas automaticamente. Depois de alterar o `app.json`, rode:

```bash
npx expo prebuild --clean
```

Atenção: `--clean` recria as pastas nativas e descarta edições manuais feitas nelas.

## Estrutura

```
src/app/         rotas do expo-router (file-based routing)
src/components/  componentes
src/constants/   tema
src/hooks/       hooks
android/ ios/    projetos nativos
```
