import { render } from '@testing-library/react-native';

import { BrandLoadingScreen } from '@/features/onboarding/components/BrandLoadingScreen';

describe('BrandLoadingScreen', () => {
  it('announces loading progress to assistive technology', () => {
    const screen = render(<BrandLoadingScreen />);
    expect(screen.getByRole('progressbar', { name: 'Loading Uwaci' })).toBeTruthy();
    expect(screen.getByText('Loading Uwaci…')).toBeTruthy();
    expect(screen.getByText('Preparing knowledge for you')).toBeTruthy();
  });

  it('renders the brand backdrop and logo', () => {
    const screen = render(<BrandLoadingScreen />);
    expect(screen.getByTestId('wave-backdrop')).toBeTruthy();
    expect(screen.getByTestId('brand-logo')).toBeTruthy();
  });
});
