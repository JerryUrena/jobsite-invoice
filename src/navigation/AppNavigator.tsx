import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import InvoiceScreen from "../screens/InvoiceScreen";
import SignatureScreen from "../screens/SignatureScreen";
import SettingsScreen from "../screens/SettingsScreen";
import InvoiceListScreen from "../screens/InvoiceListScreen";
import InvoiceViewScreen from "../screens/InvoiceViewScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  Invoice: undefined;
  Signature: undefined;
  InvoiceView: { invoice: any };
};

export type TabParamList = {
  Home: undefined;
  Invoices: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#2ecc71",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 80,
          position: "absolute",
          overflow: "hidden",
          elevation: 0, 
          shadowOpacity: 0, 
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 8,
        },
      }}>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
            focused: boolean;
          }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}/>

      <Tab.Screen
        name="Invoices"
        component={InvoiceListScreen}
        options={{
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
            focused: boolean;
          }) => <MaterialIcons name="request-quote" size={size} color={color} />,
        }}/>

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
            focused: boolean;
          }) => <FontAwesome5 name="cog" size={size} color={color} />,
        }}/>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}/>
        <Stack.Screen
          name="Invoice"
          component={InvoiceScreen}
          options={{ title: "Create Invoice" }}/>
        <Stack.Screen
          name="Signature"
          component={SignatureScreen}
          options={{ title: "Sign Invoice" }}/>
        <Stack.Screen
          name="InvoiceView"
          component={InvoiceViewScreen}
          options={{ title: "Invoice Details" }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
