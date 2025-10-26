import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }: {navigation: any}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JobSite Invoice</Text>
      <Button title="Create New Invoice" onPress={() => navigation.navigate("Invoice")} />
      <View style={{ height: 10 }} />
      <Button title="View Signatures" onPress={() => navigation.navigate("Signature")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
});
