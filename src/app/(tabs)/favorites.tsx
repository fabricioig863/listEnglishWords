import { Heart } from 'lucide-react-native';

import { StateMessage } from '@/shared/ui/state-message';

export default function FavoriteRoute() {
  return <StateMessage icon={Heart} title="Favoritos" description="Disponível na Etapa 6" />;
}
