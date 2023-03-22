import { useEffect } from 'react'
import { StatusBar, Platform } from "react-native";
import OneSignal from "react-native-onesignal";
import { NativeBaseProvider } from "native-base";
import {useFonts, Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";

import { AuthContextProvider } from "@contexts/AuthContext";

import { THEME } from "./src/theme";
import { Loading } from "@components/Loading";
import { tagUserInfoCreate } from "./src/notifications/notificationsTags";

import { Routes } from "@routes/index";

const oneSignalAppId = Platform.OS === 'ios' ? '53b4befe-252a-496e-d611bfscd27b' : '66fb0bac-bfe8-49c1-86c4-f19a0f81a64d';
OneSignal.setAppId(oneSignalAppId)

OneSignal.promptForPushNotificationsWithUserResponse();

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  

  tagUserInfoCreate();

  useEffect(() => {
    const unsubscribe = OneSignal.setNotificationOpenedHandler((response) => {

      const { actionId } = response.action as any;

    switch (actionId) {
      case '1':
        return console.log('Ver todas');
      case '2':
        return console.log('Ver exercicio');
      default:
        return console.log('Não foi clicado em botão de ação');
      };
    });

    return () => unsubscribe;
  },[]);


  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}