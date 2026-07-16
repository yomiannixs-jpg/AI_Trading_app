import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const submit = () => {
    if (!email.trim()) return setMessage('Enter your email address.');
    setMessage('Password-reset instructions will be sent when the backend endpoint is connected.');
  };
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Reset password</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <Button mode="contained" onPress={submit}>Request reset</Button>
      <Button onPress={() => navigation.navigate('Login')}>Back to login</Button>
      <Snackbar visible={Boolean(message)} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </View>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, justifyContent: 'center' }, input: { marginVertical: 18 } });
export default ForgotPasswordScreen;
