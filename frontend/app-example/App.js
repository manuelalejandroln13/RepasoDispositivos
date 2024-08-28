import React from 'react';
import { View } from 'react-native';
import Navigation from './src/Navigation';
import Splash from './src/Splash';

export default function App() {
  const [splashVisible, setSplashVisible] = React.useState(true);

  // Oculta el splash después de 5 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 5000); // 5000 milisegundos = 5 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {splashVisible ? <Splash /> : <Navigation />}
    </View>
  );
}
