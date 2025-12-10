import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const INVOICES_KEY = "@jobsite_invoices";

export default function InvoiceListScreen({ navigation }: any) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await AsyncStorage.getItem(INVOICES_KEY);
      if (data) {
        setInvoices(JSON.parse(data));
      } else {
        setInvoices([]);
      }
    } catch (err) {
      setInvoices([]);
    }
  };

  useEffect(() => {
    loadInvoices();
    const unsubscribe = navigation.addListener('focus', loadInvoices);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("InvoiceView", { invoice: item })}>
      <Text style={styles.id}>Invoice #{item.id}</Text>
      <Text style={styles.date}>Date: {item.createdAt}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.total}>Total: ${item.total?.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Invoices</Text>
      <FlatList
        data={invoices}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No invoices found.</Text>}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 24,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  id: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 2,
  },
  total: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 40,
  },
});
