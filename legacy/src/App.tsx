import React, { useEffect } from 'react';
import { StyleSheet, View, LogBox, Text } from 'react-native';
import { registerRootComponent } from 'expo';
import EStyleSheet from 'react-native-extended-stylesheet';
import AuthNavigator from './navigation/AuthNavigator';
import useCachedResources from './hooks/useCachedResources';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';
import { UserContextProvider } from './providers/UserContext';
import { QueryClientProvider, QueryClient } from 'react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import * as Sentry from 'sentry-expo';
import isDev from './utils/isDev';
import { MixpanelProvider } from './providers/MixpanelContext';

Sentry.init({
  dsn: 'https://1e7c920e820246e4a820ccdc4e69a9fe@o1099302.ingest.sentry.io/6123898',
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

EStyleSheet.build({
  $normalFont: 'open-sans',
  $mediumFont: 'open-sans-medium',
  $semiboldFont: 'open-sans-semibold',
  $boldFont: 'open-sans-bold',
  $titleFont: 'montserrat-extrabold',
  $body: 15,
  $heading: 20,
  $textPrimary: '#000000',
  $blueberry: '#7189FF',
  $ceruleanFrost: '#758ECD',
  $grannySmithApple: '#96DE90',
});

LogBox.ignoreLogs([
  'Setting a timer',
  'VirtualizedLists should never be nested',
  'componentWillMount has been renamed',
  'componentWillReceiveProps has been renamed',
  'Constants.deviceId has been deprecated',
]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function App() {
  const isLoadingComplete = useCachedResources();

  useEffect(() => {
    async function checkForUpdates() {
      const { isAvailable } = await Updates.checkForUpdateAsync();
      if (isAvailable) {
        Sentry.Native.captureMessage('Found update and reloading');
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    }
    if (!isDev()) {
      checkForUpdates();
    }
  }, []);

  if (!isLoadingComplete) {
    return null;
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
      },
    },
  });

  return (
    <MixpanelProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <UserContextProvider>
              <View style={styles.container}>
                <AuthNavigator />
                <Toast ref={(ref) => Toast.setRef(ref)} />
              </View>
            </UserContextProvider>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </MixpanelProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

export default registerRootComponent(App);
