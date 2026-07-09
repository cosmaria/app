import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * App raiz do COSMARIA mobile (React Native + Expo — doc 13 §9).
 * Sprint 01 — bootstrap: apenas uma tela mínima que confirma que o app monta.
 * Nenhuma regra de negócio, nenhuma tela de Grow/Med ainda (doc 14 §12).
 * O Design System (doc 11) e as telas (doc 10) entram em sprints seguintes,
 * consumindo @cosmaria/shared-ui-components e @cosmaria/shared-design-tokens.
 */
export default function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>COSMARIA</Text>
      <Text style={styles.subtitle}>bootstrap — Sprint 01</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#EDF1F5',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9AA7B2',
    fontSize: 16,
    marginTop: 8,
  },
});
