import { useEffect, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Typography } from '@/shared/components/Typography/Typography';

import { BrandLogo } from './BrandLogo';
import { WaveBackdrop } from './WaveBackdrop';

const spinnerImage = require('../../../../assets/onboarding/spinner-alpha.png');

export function BrandLoadingScreen() {
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View
      className="flex-1 bg-night"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Uwaci"
    >
      <StatusBar style="light" />
      <WaveBackdrop />
      <View className="flex-1 items-center px-6">
        <View style={{ flex: 16 }} />
        <BrandLogo width={252} />
        <View style={{ flex: 30 }} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image source={spinnerImage} resizeMode="contain" style={{ width: 56, height: 56 }} />
        </Animated.View>
        <Typography variant="title" className="mt-6 font-poppins-semibold text-[19px] text-white">
          Loading Uwaci…
        </Typography>
        <Typography variant="caption" className="mt-3 font-poppins text-night-muted">
          Preparing knowledge for you
        </Typography>
        <View style={{ flex: 24 }} />
      </View>
    </View>
  );
}
