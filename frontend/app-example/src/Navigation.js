import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Importa Iconos desde expo/vector-icons
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importa MaterialCommunityIcons desde expo/vector-icons
import { AntDesign } from '@expo/vector-icons';
import Chat from './screen/Chat'              // Importamos las distintas pantallas
import Pdf from './screen/Pdf'
import Profile from './components/home/Profile'
import Classifier from "./screen/Classifier";

// Crea el navegador de pestañas
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'; // Icono de perfil
          } else if (route.name === 'OpenAI') {
            iconName = focused ? 'brain' : 'brain'; // Icono de OpenAI
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Clasificador') {
            iconName = focused ? 'form' : 'form'; // Icono de lista
            return <AntDesign name={iconName} size={size} color={color} />;
          } else if (route.name === 'Lector PDF') {
            iconName = focused ? 'document-text' : 'document-text-outline'; // Icono de PDF
          }

          // Devuelve el componente de icono
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
  
      tabBarOptions={{
        activeTintColor: 'blue',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name='Profile' component={Profile} />
      <Tab.Screen name='OpenAI' component={Chat} />
      <Tab.Screen name='Clasificador' component={Classifier} />
      <Tab.Screen name='Lector PDF' component={Pdf} />
    </Tab.Navigator> 
  );
}

export default function Navigation(){
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}