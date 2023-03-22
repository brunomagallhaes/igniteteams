import { useEffect, useState } from "react";
import { useTheme, Box } from "native-base";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import OneSignal, { NotificationReceivedEvent, OSNotification } from "react-native-onesignal";

import { AuthRoutes } from "./auth.routes";
import { AppRoutes } from "./app.routes";
import { Notification } from "../components/Notification";

import { Loading } from "@components/Loading";

import { useAuth } from "@hooks/useAuth";

const linking = {
  prefixes: ['ignitgym://', 'com.rocketseat.ignitgym://', 'exp+ignitgym://'],
  config: {
    screens: {
      details: {
        path: 'exercise/:exercisesId',
        parse: {
          exerciseId: (exerciseId: string) => exerciseId
        }
      }
    }
  }
}

export const Routes = () => {
  const [notification, setNotification] = useState<OSNotification>();

  const { colors } = useTheme();


  const { user, isLoadingUserStorageData } = useAuth();

  const theme = DefaultTheme;
  theme.colors.background = colors.gray[700];

  useEffect(() => {
    const unsubscribe = OneSignal
    .setNotificationWillShowInForegroundHandler((notificationReceivedEvent: NotificationReceivedEvent) => {
      const response = notificationReceivedEvent.getNotification();

      setNotification(response);
    });

    return () => unsubscribe;
  }, []);

  if (isLoadingUserStorageData) {
    return <Loading />;
  }

  return (
    <Box flex={1} bg="gray.700">
      <NavigationContainer theme={theme} linking={linking}>
        {user.id ? <AppRoutes /> : <AuthRoutes />}

        {
              notification?.title &&
              <Notification
               data={notification} 
              onClose={() => setNotification ( undefined )} 
              />
             }
      </NavigationContainer>
    </Box>
  );
};