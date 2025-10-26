import React, { useRef } from "react";
import { View, Button } from "react-native";
import Signature from "react-native-signature-canvas";

export default function SignaturePad({ onOK, onClear }: { onOK: (dataUrl: string)=>void; onClear?: ()=>void }) {

  const ref = useRef<any>(null);

  return (
    <View style={{ flex: 1 }}>
      <Signature
        ref={ref}
        onOK={onOK}
        onClear={onClear}
        descriptionText="Sign with finger"
        webStyle=".m-signature-pad--footer {display: none;}"/>

      <Button title="Clear" onPress={() => ref.current?.clearSignature()} />
        
      <Button title="Save" onPress={() => ref.current?.readSignature()} />
    </View>
  );
}
