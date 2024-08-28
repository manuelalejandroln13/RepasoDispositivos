import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Video } from 'expo-av'; // Importar el componente Video
import coverImage from '../../../assets/cover.png'; // Importar imagen local

const ProfileScreen = () => {
  const facebook = <FontAwesome name="facebook" size={30} color="black" />;
  const twitter = <FontAwesome name="twitter" size={30} color="black"/>;
  const instagram = <FontAwesome name="instagram" size={30} color="black" />;
  const kwai = <FontAwesome name="camera" size={30} color="black" />;
  const discord = <FontAwesome name="android" size={30} color="black" />;
  const linkedin = <FontAwesome name="linkedin" size={30} color="black" />;

  const handleOpenURL = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`No se puede abrir el enlace: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Portada */}
      <Image
        source={coverImage}
        style={styles.coverImage}
      />
      
      {/* Video de perfil */}
      <View style={styles.profileImageContainer}>
        <Video
          source={require('../../../assets/Manuel.mp4')} // video .mp4
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay
          isLooping
          style={styles.profileVideo} // Cambia la propiedad para adaptar el estilo al video
        />
      </View>

      {/* Nombre del usuario */}
      <Text style={styles.userName}>Manuel Alejandro Lopez</Text>

      {/* Redes sociales */}
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleOpenURL('https://www.facebook.com')}>
          {facebook}
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleOpenURL('https://x.com/')}>
          {twitter}
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleOpenURL('https://www.instagram.com')}>
          {instagram}
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleOpenURL('https://www.kwai.com')}>
          {kwai}
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleOpenURL('https://www.discord.com')}>
          {discord}
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleOpenURL('https://ec.linkedin.com/')}>
          {linkedin}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -100,
    borderRadius: 100, // Cambia a 100 para mantener la forma circular
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 100,
  },
  profileVideo: {
    width: 200,
    height: 200,
    borderRadius: 100, // Mantén la forma circular
  },
  userName: {
    marginTop: 160,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    backgroundColor: '#ffffff', 
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default ProfileScreen;
