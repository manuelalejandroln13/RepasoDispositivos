import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button, TextInput } from "react-native";
import { Chip } from "react-native-paper";
import * as ExpoDocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const serverIP = process.env.EXPO_PUBLIC_ServerIP;

const Classifier = () => {
  const [file, setFile] = useState({ canceled: true });
  const [result, setResult] = useState("");
  const [chips, setChips] = useState([]);
  const [inputTags, setInputTags] = useState("");
  const [charge, setCharge] = useState(true);

  useEffect(() => {
    const defaultTags = [
      { id: 1, text: "Economía", selected: true },
      { id: 2, text: "Educación", selected: true },
      { id: 4, text: "Deportes", selected: true },
      { id: 5, text: "Seguridad", selected: true },
      { id: 6, text: "Tecnología", selected: true },
      { id: 7, text: "Salud", selected: true },
    ];
    setChips(defaultTags);
  }, []);

  const handleFilePicker = async () => {
    const document = await ExpoDocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: false,
    });
    setFile(document);
  };

  const handleChipPress = (chipId) => {
    setChips((prevChips) =>
      prevChips.map((chip) => {
        if (chip.id === chipId) {
          return { ...chip, selected: !chip.selected };
        }
        return chip;
      })
    );
  };

  const handleTagsInputChange = (text) => {
    setInputTags(text);
  };

  const handleUpload = async () => {
    if (file.canceled) {
      console.error("Seleccione un pdf");
    } else {
      try {
        // Upload the selected file
        await FileSystem.uploadAsync(
          `http://${serverIP}/upload`,
          file.assets[0].uri,
          {
            fieldName: file.assets[0].name,
            httpMethod: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
              name: file.assets[0].name,
            },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          }
        );

        // Fetch text content from server
        const queryParams = new URLSearchParams({
          name: file.assets[0].name,
        }).toString();
        const response = await fetch(
          `http://${serverIP}/getText?${queryParams}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Error de red o servidor");
        }

        const text = await response.text();

        // Prepare data for classification
        const selectedTags = chips.filter((chip) => chip.selected).map((chip) => chip.text);
        const combinedTags = [...selectedTags, ...inputTags.split(",").map((tag) => tag.trim())];
        const data = {
          text: text,
          labels: combinedTags,
        };

        // Call classifier API
        const classifierResponse = await fetch(
          "http://192.168.1.159:3000/classifier",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        const classifierResult = await classifierResponse.json();
        let show = "";
        for (let i = 0; i < classifierResult.labels.length; i++) {
          const score = classifierResult.scores[i] * 100;
          show += `${classifierResult.labels[i]}   -   ${score.toFixed(2)}%\n`;
        }
        setResult(show);
        setFile({ canceled: true });
      } catch (error) {
        setCharge(false);
        console.error("Error:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerButton}>
        <Button title={"Selecciona el PDF"} onPress={handleFilePicker} />
      </View>
      <Text style={styles.text}>Seleccione las etiquetas de clasificación:</Text>
      <View style={styles.chip}>
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            onPress={() => handleChipPress(chip.id)}
            mode={chip.selected ? "flat" : "outlined"}
            selected={chip.selected}
            style={{ margin: 5 }}
          >
            {chip.text}
          </Chip>
        ))}
      </View>
      <Text style={styles.text}>O ingrese etiquetas separadas por coma:</Text>
      <TextInput
        style={styles.input}
        placeholder="Etiqueta1, Etiqueta2, ..."
        value={inputTags}
        onChangeText={handleTagsInputChange}
      />
      <View style={styles.containerButton}>
        <Button title={"Clasificador"} onPress={handleUpload} />
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
  chip: {
    marginBottom: "3%",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
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

export default Classifier;
