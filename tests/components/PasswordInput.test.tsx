import { fireEvent, render } from '@testing-library/react-native';

import { PasswordInput } from '@/features/authentication/components/PasswordInput';

describe('PasswordInput', () => {
  it('lets the user reveal and hide their password', () => {
    const screen = render(
      <PasswordInput mode="sign-in" onChangeText={jest.fn()} value="secret123" />,
    );
    const input = screen.getByLabelText('Password');

    expect(input.props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
    expect(input.props.secureTextEntry).toBe(false);
    fireEvent.press(screen.getByRole('button', { name: 'Hide password' }));
    expect(input.props.secureTextEntry).toBe(true);
  });
});
