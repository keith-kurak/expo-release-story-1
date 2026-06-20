import { Host, Alert, Button, Text } from '@expo/ui/swift-ui';

type UpdateAlertProps = {
  visible: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
};

export function UpdateAlert({ visible, onDismiss, onUpdate }: UpdateAlertProps) {
  return (
    <Host style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <Alert
        title="Update Available"
        isPresented={visible}
        onIsPresentedChange={(presented) => {
          if (!presented) onDismiss();
        }}>
        <Alert.Trigger>
          <Button label="" onPress={() => {}} />
        </Alert.Trigger>
        <Alert.Actions>
          <Button label="Update Now" onPress={onUpdate} />
          <Button label="Later" role="cancel" onPress={onDismiss} />
        </Alert.Actions>
        <Alert.Message>
          <Text>A new version has been downloaded and is ready to install.</Text>
        </Alert.Message>
      </Alert>
    </Host>
  );
}
