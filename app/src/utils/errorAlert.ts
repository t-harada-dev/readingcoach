import { Alert } from 'react-native';

export function showErrorAlert(title: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  Alert.alert(title, message);
}
