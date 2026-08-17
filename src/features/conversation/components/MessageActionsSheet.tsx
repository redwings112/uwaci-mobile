import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { Typography } from '@/shared/components/Typography/Typography';
import { colors } from '@/theme/tokens';

interface MessageActionsSheetProps {
  visible: boolean;
  saved: boolean;
  saveDisabled?: boolean;
  onClose: () => void;
  onShare: () => void;
  onSave: () => void;
}

function SheetAction({
  icon,
  label,
  disabled = false,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`min-h-12 flex-row items-center gap-3 rounded-control px-2 ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      onPress={onPress}
    >
      <AppIcon color={colors.brand} name={icon} size={22} />
      <Text className="text-base text-ink dark:text-white">{label}</Text>
    </Pressable>
  );
}

export function MessageActionsSheet({
  visible,
  saved,
  saveDisabled = false,
  onClose,
  onShare,
  onSave,
}: MessageActionsSheetProps) {
  const { t } = useTranslation();
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        accessibilityLabel="Close answer actions"
      >
        <Pressable
          className="gap-1 rounded-t-card bg-surface p-6 pb-10 dark:bg-[#1B1933]"
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <Typography variant="title" className="mb-2">
            {t('answerActions.title')}
          </Typography>
          <SheetAction icon="share" label={t('answerActions.share')} onPress={onShare} />
          <SheetAction
            icon="star"
            label={saved ? t('answerActions.unsave') : t('answerActions.save')}
            disabled={saveDisabled}
            onPress={onSave}
          />
          <View className="mt-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close answer actions"
              className="min-h-12 items-center justify-center rounded-full border border-border"
              onPress={onClose}
            >
              <Text className="text-sm font-semibold text-brand">{t('common.close')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
