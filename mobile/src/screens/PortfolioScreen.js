import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const PortfolioScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall">Portfolio</Text>
        <Text style={styles.description}>Review positions, allocation, and performance.</Text>
      </Card.Content>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa', justifyContent: 'center' },
  card: { borderRadius: 12 },
  description: { marginTop: 12, marginBottom: 16, color: '#666' }
});

export default PortfolioScreen;
