import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

export function isDeviceOnline(state: NetInfoState): boolean {
  return Boolean(state.isConnected) && state.isInternetReachable !== false;
}

/**
 * Chamado quando o usuário pede para tentar de novo.
 * Retoma as consultas pausadas e deixa a própria requisição confirmar se há internet:
 * se falhar, a tela mostra o erro de conexão com a opção de tentar novamente.
 */
export function resumeNetworkRequests() {
  onlineManager.setOnline(true);
}

export function setupOnlineManager() {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(isDeviceOnline(state))),
  );
}
