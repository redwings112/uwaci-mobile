import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StatusBanner } from '@/shared/components/StatusBanner/StatusBanner';

import { useGetMyUsageQuery } from '../api/usageApi';

export function UsageExhaustedBanner() {
  const { t } = useTranslation();
  const usage = useGetMyUsageQuery();

  // Credit availability can change after a server-side reconciliation while
  // this screen is still mounted. Do not keep a stale exhausted warning.
  useFocusEffect(
    useCallback(() => {
      void usage.refetch();
    }, [usage.refetch]),
  );

  if (usage.data?.status !== 'exhausted') return null;

  return (
    <View className="px-3 pb-2">
      <StatusBanner
        title={t('usage.exhaustedTitle')}
        message={t('usage.exhaustedAttemptMessage')}
        variant="warning"
      />
    </View>
  );
}
