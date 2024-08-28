import React, { useState } from "react";
import { TextInput, View, StyleSheet, Text, Button } from "react-native";

const serverIP = process.env.EXPO_PUBLIC_ServerIP;

const Chat = () => {
  const [num, setNum] = useState("");
  const [result, setResult] = useState("");

  const getResultFromOpenApi = async () => {
    try {
      const response = await fetch(`http://${serverIP}/openapi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ num }),
      });
      const jsonData = await response.json();
      setResult(
        jsonData.result
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {"Ingrese el numero que desea convertir a binario"}
      </Text>
      <TextInput style={styles.input} value={num} onChangeText={setNum} />
      <Button title={"Enviar"} onPress={getResultFromOpenApi} />
      <View style={styles.response}>
        <Text style={styles.text2}>{result}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
  },
  text2: {
    fontSize: 18,
    fontWeight: "bold",
  },
  response: {
    padding: 50,
  },
});

export default Chat;
