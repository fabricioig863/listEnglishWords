import { History } from 'lucide-react-native';

import { StateMessage } from '@/shared/ui/state-message';

export default function HistoryRoute() {
  return <StateMessage icon={History} title="Histórico" description="Disponível na Etapa 6" />;
}
