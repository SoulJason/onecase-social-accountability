import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'open-sans': require('../assets/fonts/OpenSans-Regular.ttf'),
          'open-sans-medium': require('../assets/fonts/OpenSans-Medium.ttf'),
          'open-sans-semibold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
          'open-sans-bold': require('../assets/fonts/OpenSans-Bold.ttf'),
          'montserrat-extrabold': require('../assets/fonts/Montserrat-ExtraBold.ttf'),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
