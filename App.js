import * as React from 'react';
import {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AsyncStorage from './AsyncStorageCustom'

import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { default as claron } from './theme.json';
import { ThemeContext } from './context';
import { Login } from './screens/login';
import messaging from '@react-native-firebase/messaging';
import VoipPushNotification from 'react-native-voip-push-notification';
import { KeyboardAvoidingView, Platform, useColorScheme, LogBox } from 'react-native';
import { MainScreen } from './screens/main';
import Conversation from './screens/conversation';
import Urgent from './screens/urgent';
import Notifications from './screens/notifications';
import * as API from './api';
import uuid from 'react-native-uuid';
import AudioCall from './screens/calls/audio';
import VideoCall from './screens/calls/video';
import Account from './screens/account';
import firebase from 'firebase'
import CodePush from 'react-native-code-push'
import { updateUserInfoToFirebase } from './function/firebase';

// let codePushOptions = { checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME, installMode: CodePush.InstallMode.IMMEDIATE };
let codePushOptions = { checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: "a new update is available!"
  }
};

// AsyncStorage.getAllKeys();
// AsyncStorage.clear();

firebase.apps.length == 0 ? firebase.initializeApp({
  apiKey: "AIzaSyA07_A7At-J9Mu6NMXBpoLVYcrKWR3ezy4",
  authDomain: "fcm-notify-db9b8.firebaseapp.com",
  databaseURL: "https://fcm-notify-db9b8.firebaseio.com",
  projectId: "fcm-notify-db9b8",
  storageBucket: "fcm-notify-db9b8.appspot.com",
  messagingSenderId: "77071010064",
  appId: "1:77071010064:web:e693b1fa22167a00e27d95",
  measurementId: "G-VWCS7XBQC3"
}) : null

firebase.firestore().settings({ experimentalForceLongPolling: true, merge: true });

// LogBox.ignoreAllLogs()
const { Navigator, Screen } = createStackNavigator();

const App = () => {
  
  const [theme, setTheme] = useState(useColorScheme());
  const [logged, setlogged] = useState(false)
  const [loading, setloading] = useState(true)

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  registerForPushNotificationsAsync = async () => {
    try{
      await messaging().requestPermission();
      await messaging().registerDeviceForRemoteMessages()
    }catch(e){}
    let token = await messaging().getToken()
    console.log('token: ', token)
    await API.updateFCMToken(token)
    await messaging().requestPermission();
    await messaging().registerDeviceForRemoteMessages()

    try{
      messaging().onTokenRefresh(token=>{
        console.log(token)
      })

      let initial = await messaging().getInitialNotification()
      if(initial != null){
        console.log('initial notification: ', initial.data)
      }else{
        console.log('no initial notification')
      }

    }catch(e){
      console.log('error registering fcm token: ', e)
    }

    if(Platform.OS == 'ios'){

      try{
        VoipPushNotification.registerVoipToken()
        
        VoipPushNotification.addEventListener('register', (token) => {
          // --- send token to your apn provider server
          console.log('VOIP TOKEN: ', token)
        });
        
        VoipPushNotification.addEventListener('notification', (notification) => {
          // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
          VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
        });

        // ===== Step 3: subscribe `didLoadWithEvents` event =====
        VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
          // --- this will fire when there are events occured before js bridge initialized
          // --- use this event to execute your event handler manually by event type

          if (!events || !Array.isArray(events) || events.length < 1) {
              return;
          }
          for (let voipPushEvent of events) {
              let { name, data } = voipPushEvent;
              console.log('VOIP EVENTS: ', voipPushEvent)
              if (name === VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
                  console.log('Voip Registration: ', data)
              } else if (name === VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
                  console.log('Voip Event: ', data);
              }
          }
        });

        // ===== Step 4: register =====
        // --- it will be no-op if you have subscribed before (like in native side)
        // --- but will fire `register` event if we have latest cahced voip token ( it may be empty if no token at all )
        // VoipPushNotification.registerVoipToken(); // --- register token
      }catch(e){
        console.log('Error initializing VOIP Notification', e)
      }
    }
  };

  const getUserAndUpdate = async ()=>{
    let user = await AsyncStorage.getItem('user');

    if(!user){
      return ;
    }

    user = JSON.parse(user);

    console.log('doctorDetail', user);
    await updateUserInfoToFirebase(user);
  }

  useEffect(() => {

    // registerForPushNotificationsAsync()

    (async ()=>{

      try{
        await API.getApiKey()
      }catch(e){
        console.log('api key fetch failed: ', e)
      }

      let email = await AsyncStorage.getItem('_email')

      if(email == null){
        setlogged(false)
      }else{
        setlogged(true)
      }
      setloading(false)
      await registerForPushNotificationsAsync()
      getUserAndUpdate();
      
    })()
  }, [])

  // React.useEffect(()=>{
  //   console.log('aa');
  // }, []);
  // return <View style={{backgroundColor: 'red', flex: 1}}></View>;

  if(loading){
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color="green" />
      </View>
    )
  }else{
    return(
      <>
        <IconRegistry icons={EvaIconsPack}/>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : null} style={{flex: 1}}>
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <ApplicationProvider {...eva} theme={{...eva[theme], ...claron}}>
              <NavigationContainer>
                <Navigator initialRouteName={logged ? 'Main' : 'Login'} screenOptions={{headerShown: false}}>
                  <Screen name='Login' component={Login}/>
                  <Screen name='Main' component={MainScreen}/>
                  <Screen name='Conversation' component={Conversation}/>
                  <Screen name='Notifications' component={Notifications}/>
                  <Screen name='AudioCall' component={AudioCall}/>
                  <Screen name='VideoCall' component={VideoCall}/>
                  <Screen name='Account' component={Account}/>
                  <Screen name='Urgent' component={Urgent}/>
                </Navigator>
              </NavigationContainer>
            </ApplicationProvider>
          </ThemeContext.Provider>
        </KeyboardAvoidingView>
      </>
    );
  }
}

export default CodePush(codePushOptions)(App);