import * as ImagePicker from "expo-image-picker";

export async function pickPhoto(): Promise<string | null> {
  
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
  if (res.canceled || !res.assets?.[0]?.uri) return null;
  
  return res.assets[0].uri;
}
