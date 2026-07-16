import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const ProfileScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall">Profile</Text>
        <Text style={styles.description}>Manage your account, preferences, and security settings.</Text>
      <Button mode="outlined" onPress={() => navigation.navigate('Subscription')}>Manage subscription</Button>
      </Card.Content>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa', justifyContent: 'center' },
  card: { borderRadius: 12 },
  description: { marginTop: 12, marginBottom: 16, color: '#666' }
});

export default ProfileScreen;
