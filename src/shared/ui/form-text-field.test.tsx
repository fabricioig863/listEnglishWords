import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, screen } from '@testing-library/react-native';
import { Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { renderWithProviders } from '@/test-utils/render';

import { Button } from './button';
import { FormTextField } from './form-text-field';

const schema = z.object({ email: z.email('E-mail inválido.') });

function TestForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  return (
    <>
      <FormTextField control={control} name="email" label="E-mail" icon={Mail} />
      <Button label="Enviar" onPress={handleSubmit(onSubmit)} />
    </>
  );
}

describe('FormTextField', () => {
  it('shows the schema error after submitting and does not submit', async () => {
    const onSubmit = jest.fn();
    await renderWithProviders(<TestForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail inválido.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the values when the field is valid', async () => {
    const onSubmit = jest.fn();
    await renderWithProviders(<TestForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@email.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar' }));

    await screen.findByLabelText('E-mail');
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@email.com' }, expect.anything());
  });
});
