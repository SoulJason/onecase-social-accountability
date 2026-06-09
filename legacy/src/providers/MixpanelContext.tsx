import React, { useEffect, useState, createContext, useContext } from 'react';
import ExpoMixpanelAnalytics from '@law-lin/expo-mixpanel-analytics';
import isDev from '../utils/isDev';
import * as Sentry from 'sentry-expo';

export const MixpanelContext = createContext<ExpoMixpanelAnalytics | null>(
  null
);

export const MixpanelProvider = ({ children }: any) => {
  const [mixpanel, setMixpanel] = useState<ExpoMixpanelAnalytics | null>(null);

  useEffect(() => {
    const initMixpanel = async () => {
      Sentry.Native.captureMessage(
        `Environment: ${!isDev() ? 'Production' : 'Development'}, Project ID: ${
          !isDev()
            ? 'be94a8f96814c683c34eb15618a20719'
            : '5ac2ecc38f1491468457a1c38d11b15a'
        } `
      );
      const initializedMixpanel = new ExpoMixpanelAnalytics(
        !isDev()
          ? 'be94a8f96814c683c34eb15618a20719'
          : '5ac2ecc38f1491468457a1c38d11b15a'
      );
      setMixpanel(initializedMixpanel);
    };
    initMixpanel();
  }, []);

  return (
    <MixpanelContext.Provider value={mixpanel}>
      {children}
    </MixpanelContext.Provider>
  );
};

export const useMixpanel = () => {
  const context = useContext(MixpanelContext);
  if (context === undefined) {
    throw new Error(
      `useMixpanel must be used within a MixpanelContextProvider.`
    );
  }
  return context;
};
