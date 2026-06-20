import { Host, AlertDialog, TextButton, Text } from '@expo/ui/jetpack-compose';

type UpdateAlertProps = {
  visible: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
};

export function UpdateAlert({ visible, onDismiss, onUpdate }: UpdateAlertProps) {
  if (!visible) return null;

  return (
    <Host style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <AlertDialog onDismissRequest={onDismiss}>
        <AlertDialog.Title>
          <Text>Update Available</Text>
        </AlertDialog.Title>
        <AlertDialog.Text>
          <Text>A new version has been downloaded and is ready to install.</Text>
        </AlertDialog.Text>
        <AlertDialog.ConfirmButton>
          <TextButton onClick={onUpdate}>
            <Text>Update Now</Text>
          </TextButton>
        </AlertDialog.ConfirmButton>
        <AlertDialog.DismissButton>
          <TextButton onClick={onDismiss}>
            <Text>Later</Text>
          </TextButton>
        </AlertDialog.DismissButton>
      </AlertDialog>
    </Host>
  );
}
