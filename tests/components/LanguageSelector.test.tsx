import { fireEvent, render } from '@testing-library/react-native';

import { LanguageSelector } from '@/features/language/components/LanguageSelector';

describe('LanguageSelector', () => {
  it('reports selected state and experimental status', () => {
    const onChange = jest.fn();
    const screen = render(<LanguageSelector value="en" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'English' }).props.accessibilityState.selected).toBe(
      true,
    );
    fireEvent.press(screen.getByRole('radio', { name: 'Lingála, experimental' }));
    expect(onChange).toHaveBeenCalledWith('ln');
  });
});
