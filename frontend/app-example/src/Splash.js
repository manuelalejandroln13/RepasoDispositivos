import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import localImage from '../assets/localImage.png'; //importo ruta de localImage o en caso de importar desde url borro este import

const Splash = () => {
  return (
    <View style={styles.container}>
      <Image
        source={localImage} //uso una imagen local
        style={styles.image}/>
      <Text style={styles.message}>¡Bienvenido Usuario!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Puedes cambiar el color de fondo según tus preferencias
  },
  image: {
    width: 300, // Ajusta el ancho de la imagen según sea necesario
    height: 300, // Ajusta la altura de la imagen según sea necesario
    resizeMode: 'contain', // Ajusta el modo de redimensionamiento según sea necesario
  },
  message: {
    marginTop: 20, // Puedes ajustar el espacio entre la imagen y el mensaje según sea necesario
    fontSize: 20, // Puedes ajustar el tamaño de fuente del mensaje según sea necesario
    fontWeight: 'bold', // Puedes ajustar el grosor de la fuente según sea necesario
    color: '#333333', // Puedes cambiar el color del mensaje según tus preferencias
  },
});

export default Splash;