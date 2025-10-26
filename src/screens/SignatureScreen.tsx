import React from "react";
import SignaturePad from "../components/Signature";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Invoice: undefined;
  Signature: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Signature">;

export default function SignatureScreen({ navigation }: Props) {
  return (
    <SignaturePad
      onOK={(data) => {
        console.log("Captured:", data);
        navigation.goBack();
      }}
      onClear={() => console.log("Cleared")}
    />
  );
}
