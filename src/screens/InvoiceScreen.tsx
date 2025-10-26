import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Invoice: undefined;
  Signature: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Invoice">;

interface LineItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
}

export default function InvoiceScreen({ navigation }: Props) {
  const [items] = useState<LineItem[]>([
    { id: "1", name: "Labor", qty: 2, rate: 75 },
    { id: "2", name: "Materials", qty: 1, rate: 120 },
  ]);

  const total = items.reduce((sum, i) => sum + i.qty * i.rate, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Invoice</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            • {item.name} — {item.qty} × ${item.rate.toFixed(2)}
          </Text>
        )}/>

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      <View style={styles.buttons}>
        <Button
          title="Sign Invoice"
          onPress={() => navigation.navigate("Signature")}
        />
        <Button
          title="Back to Menu"
          color="#888"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  item: { fontSize: 16, marginVertical: 4 },
  total: { fontSize: 18, fontWeight: "600", marginVertical: 20 },
  buttons: { flexDirection: "row", gap: 12 },
});
