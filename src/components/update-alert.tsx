import { Alert } from 'react-native';
import { useEffect } from 'react';

type UpdateAlertProps = {
  visible: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
};

export function UpdateAlert({ visible, onDismiss, onUpdate }: UpdateAlertProps) {
  useEffect(() => {
    if (visible) {
      Alert.alert(
        'Update Available',
        'A new version has been downloaded and is ready to install.',
        [
          { text: 'Later', style: 'cancel', onPress: onDismiss },
          { text: 'Update Now', onPress: onUpdate },
        ],
      );
    }
  }, [visible, onDismiss, onUpdate]);

  return null;
}
