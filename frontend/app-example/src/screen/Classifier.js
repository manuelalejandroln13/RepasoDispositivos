import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button, TextInput } from "react-native";
import { Chip } from "react-native-paper";
import * as ExpoDocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const serverIP = process.env.EXPO_PUBLIC_ServerIP;

const Classifier = () => {
  const [llamada, setLlamada] = useState('');
  const [valor, setValor] = useState('');
  const [results, setResults] = useState([]);

  const getResultFromOpenAPI = async () => {
      try {
          const dataToSend = { llamada, valor };
          console.log("JSON to send:", JSON.stringify(dataToSend, null, 2));

          const response = await fetch("http://192.168.43.160:3000/openapi", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ llamada, valor }),
          });
          const jsonData = await response.json();
          console.log("JSON received:", JSON.stringify(jsonData, null, 2));

          // Asegúrate de que la respuesta sea un arreglo, si el backend devuelve el historial
          setResults(jsonData || []);
      } catch (error) {
          console.log(error);
      }
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
        <Text style={styles.text}>
            {"Ingrese el texto que desea conocer la clasificación"}
        </Text>

        <TextInput 
            style={styles.input} 
            value={llamada} 
            onChangeText={setLlamada} 
            placeholder="Ingrese el texto" 
            placeholderTextColor="#888"
        />
        <TextInput 
            style={styles.input} 
            value={valor} 
            onChangeText={setValor} 
            placeholder="Ingrese el valor" 
            placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.button} onPress={getResultFromOpenAPI}>
            <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>

        <Link href="/home" style={styles.button} >
            <Text style={styles.buttonText}>Regresar</Text>
        </Link>

        <FlatList
            data={results}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <View style={styles.resultContainer}>
                    <Text style={styles.result}>Label: {item.label}</Text>
                    <Text style={styles.result}>Valor: {item.valor}</Text>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.result}>No hay resultados.</Text>}
        />
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
