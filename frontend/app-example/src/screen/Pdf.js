import React, { useState } from "react";
import { Text, View, StyleSheet, Button, TextInput } from "react-native";
import { Chip } from "react-native-paper";
import * as ExpoDocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const serverIP = process.env.EXPO_PUBLIC_ServerIP;

const Pdf = () => {
  const [file, setFile] = useState({ canceled: true });
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [chips, setChips] = useState([]);
  const [charge, setCharge] = useState(true);

  const handleFilePicker = async () => {
    const document = await ExpoDocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: true,
    });
    if (!document.canceled) {
      const newChips = [];
      for (let i = 0; i < document.assets.length; i++) {
        newChips.push({ id: i, text: `${document.assets[i].name}` });
      }
      setChips(newChips);
    }
    setFile(document);
  };

  const handleChipClose = (chipId) => {
    if (chips.length <= 1) {
      restartDocument();
    }
    setChips(chips.filter((chip) => chip.id !== chipId));
  };

  const restartDocument = () => {
    setFile({ canceled: true });
    setChips([]);
  };

  const handleUpload = async () => {
    if (!file.canceled && question === "") {
    } else {
      const newPdf = [];
      for (let i = 0; i < file.assets.length; i++) {
        try {
          await FileSystem.uploadAsync(
            `http://${serverIP}/upload`,
            file.assets[i].uri,
            {
              fieldName: file.assets[i].name,
              httpMethod: "POST",
              headers: {
                "Content-Type": "multipart/form-data",
                name: file.assets[i].name,
              },
              uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            }
          );
          newPdf.push({
            title: `${file.assets[i].name}`,
          });
        } catch (error) {
          setCharge(false);
          console.error("Error en la carga del archivo (Frontend):", error);
        }
        // setPdf(newPdf);
      }
      // console.log(chips);
      if (charge) {
        const queryParams = new URLSearchParams({
          question: question,
          pdfs: JSON.stringify(newPdf),
        }).toString();
        try {
          const response = await fetch(
            `http://${serverIP}/question?${queryParams}`,
            {
              method: "GET",
            }
          );
          if (!response.ok) {
            throw new Error("Error de red o servidor");
          }
          const data = await response.text();
          setResult(data);
          setQuestion("");
          restartDocument();
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerButton}>
        <Button title={"Selecciona el PDF"} onPress={handleFilePicker} />
      </View>
      {!file.canceled && (
        <Text style={styles.text}>Archivos seleccionados:</Text>
      )}
      <View style={{ marginBottom: "3%" }}>
        {chips.map((chip) => (
          <Chip key={chip.id} onClose={() => handleChipClose(chip.id)}>
            {chip.text}
          </Chip>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder={"Ingresa tu pregunta"}
      />
      <View style={styles.containerButton}>
        <Button title={"Enviar"} onPress={handleUpload} />
      </View>
      <View style={styles.response}>
        <Text style={styles.text}>{result}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  containerButton: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "75%",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    margin: "5%",
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "3%",
  },
  response: {
    padding: 50,
  },
});
export default Pdf;
