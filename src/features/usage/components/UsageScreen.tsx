import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { mapApiError } from '@/core/errors/mapApiError';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { Screen } from '@/shared/components/Screen/Screen';
import { StatusBanner } from '@/shared/components/StatusBanner/StatusBanner';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { colors } from '@/theme/tokens';

import { useGetMyUsageQuery } from '../api/usageApi';

function displayCredits(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numeric);
}

function displayDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function UsageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const query = useGetMyUsageQuery();
  const percentage = Math.max(
    0,
    Math.min(100, Number(query.data?.credits.percentage_used ?? '0') || 0),
  );
  const statusMessage = query.data
    ? query.data.status === 'exhausted'
      ? t('usage.exhaustedMessage')
      : query.data.status === 'approaching_limit'
        ? t('usage.nearLimitMessage')
        : query.data.status === 'configuration_required'
          ? t('usage.configurationMessage')
          : null
    : null;

  return (
    <Screen scroll>
      <View className="mb-6 flex-row items-center gap-3">
        <IconButton
          icon="arrowLeft"
          label={t('usage.goBack')}
          className="bg-surface"
          onPress={() => router.back()}
        />
        <View className="flex-1">
          <Typography variant="title">{t('usage.title')}</Typography>
          <Typography variant="caption" className="mt-1">
            {t('usage.subtitle')}
          </Typography>
        </View>
      </View>

      {query.isLoading ? (
        <View
          className="min-h-56 items-center justify-center"
          accessibilityLabel={t('usage.loading')}
          accessibilityRole="progressbar"
        >
          <ActivityIndicator color={colors.brand} size="large" />
          <Typography className="mt-3 text-muted">{t('usage.loading')}</Typography>
        </View>
      ) : query.error || !query.data ? (
        <StatusBanner
          title={t('usage.loadErrorTitle')}
          message={mapApiError(query.error).message}
          variant="error"
        />
      ) : (
        <>
          <SurfaceCard
            className="p-5"
            accessible
            accessibilityLabel={t('usage.planA11y', {
              plan: query.data.plan.display_name,
            })}
          >
            <View className="flex-row items-start justify-between">
              <View>
                <Typography variant="caption">{t('usage.currentPlan')}</Typography>
                <Typography variant="title" className="mt-1 text-brand">
                  {query.data.plan.display_name}
                </Typography>
              </View>
              <View className="rounded-full border border-brand/30 bg-lavender px-3 py-1">
                <Text className="text-xs font-semibold text-brand">
                  {query.data.status === 'configuration_required'
                    ? t('usage.configurationBadge')
                    : t('usage.active')}
                </Text>
              </View>
            </View>
            <Typography className="mt-4 text-muted">{t('usage.futurePlans')}</Typography>
          </SurfaceCard>

          {query.data.status !== 'configuration_required' ? (
            <SurfaceCard className="mt-4 p-5">
              <Typography variant="label">{t('usage.creditsTitle')}</Typography>
              <View className="mt-4 flex-row items-end justify-between">
                <View>
                  <Text
                    className="text-3xl font-bold text-ink dark:text-white"
                    accessibilityLabel={t('usage.remainingA11y', {
                      remaining: displayCredits(query.data.credits.remaining),
                    })}
                  >
                    {displayCredits(query.data.credits.remaining)}
                  </Text>
                  <Typography variant="caption">{t('usage.creditsRemaining')}</Typography>
                </View>
                <Typography variant="caption">
                  {t('usage.usedOfTotal', {
                    used: displayCredits(query.data.credits.used),
                    total: displayCredits(query.data.credits.allocated),
                  })}
                </Typography>
              </View>
              <View
                className="mt-4 h-3 overflow-hidden rounded-full bg-border"
                accessibilityRole="progressbar"
                accessibilityLabel={t('usage.progressA11y')}
                accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage) }}
              >
                <View
                  className={`h-full rounded-full ${query.data.status === 'exhausted' ? 'bg-danger' : query.data.status === 'approaching_limit' ? 'bg-accent' : 'bg-brand'}`}
                  style={{ width: `${percentage}%` }}
                />
              </View>
              <Typography variant="caption" className="mt-2 text-right">
                {t('usage.percentageUsed', { percentage: percentage.toFixed(0) })}
              </Typography>
            </SurfaceCard>
          ) : null}

          {statusMessage ? (
            <View className="mt-4">
              <StatusBanner
                title={
                  query.data.status === 'exhausted'
                    ? t('usage.exhaustedTitle')
                    : query.data.status === 'approaching_limit'
                      ? t('usage.nearLimitTitle')
                      : t('usage.configurationTitle')
                }
                message={statusMessage}
                variant={query.data.status === 'exhausted' ? 'error' : 'warning'}
              />
            </View>
          ) : null}

          {query.data.status !== 'configuration_required' ? (
            <SurfaceCard className="mt-4 p-5">
              <Typography variant="label">{t('usage.periodTitle')}</Typography>
              <View className="mt-3 flex-row justify-between gap-4">
                <View className="flex-1">
                  <Typography variant="caption">{t('usage.periodStart')}</Typography>
                  <Typography className="mt-1">
                    {displayDate(query.data.period.starts_at)}
                  </Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="caption">{t('usage.resetDate')}</Typography>
                  <Typography className="mt-1">{displayDate(query.data.period.ends_at)}</Typography>
                </View>
              </View>
            </SurfaceCard>
          ) : null}
        </>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('usage.refresh')}
        className="mt-5 min-h-12 items-center justify-center rounded-full border border-brand bg-surface"
        disabled={query.isFetching}
        onPress={() => void query.refetch()}
      >
        <Text className="text-sm font-semibold text-brand">
          {query.isFetching ? t('usage.refreshing') : t('usage.refresh')}
        </Text>
      </Pressable>
    </Screen>
  );
}
