/**
 * @format
 */

import {AppRegistry} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import App from './App';
import {name as appName} from './app.json';
import RNCallKeep from 'react-native-callkeep';
import messaging from '@react-native-firebase/messaging';
import * as AsyncStorage from './AsyncStorageCustom'
import uuid from 'react-native-uuid';
import useAppState from 'react-native-appstate-hook'
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, {Importance} from "react-native-push-notification";

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log("TOKEN:", token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);

    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log("ACTION:", notification.action);
    console.log("NOTIFICATION:", notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function(err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: false,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});

messaging().setBackgroundMessageHandler(async message => {
    console.log('Message handled in the background!', message);
    if(message.data.hasOwnProperty('call')){
        try{
            PushNotification.createChannel(
                {
                channelId: "12345654321", // (required)
                channelName: "ClaronDoc", // (required)
                channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
                playSound: true, // (optional) default: true
                soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
                importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
                vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
                },
                (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
            );

            PushNotification.localNotification({
            /* Android Only Properties */
            channelId: "12345654321", // (required) channelId, if the channel doesn't exist, notification will not trigger.
            ticker: "ClaronDoc", // (optional)
            showWhen: true, // (optional) default: true
            autoCancel: false, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher". Use "" for no large icon.
            largeIconUrl: "https://www.example.tld/picture.jpg", // (optional) default: undefined
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
            bigText: "Calls", // (optional) default: "message" prop
            subText: "", // (optional) default: none
            bigPictureUrl: "https://www.example.tld/picture.jpg", // (optional) default: undefined
            bigLargeIcon: "ic_launcher", // (optional) default: undefined
            bigLargeIconUrl: "https://www.example.tld/bigicon.jpg", // (optional) default: undefined
            color: "red", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 1000, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            tag: "some_tag", // (optional) add tag to message
            group: "group", // (optional) add group to message
            groupSummary: false, // (optional) set this notification to be the group summary for a group of notifications, default: false
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            ignoreInForeground: true, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear). should be used in combine with `com.dieam.reactnativepushnotification.notification_foreground` setting
            shortcutId: "shortcut-id", // (optional) If this notification is duplicative of a Launcher shortcut, sets the id of the shortcut, in case the Launcher wants to hide the shortcut, default undefined
            onlyAlertOnce: false, // (optional) alert will open only once with sound and notify, default: false
            
            when: null, // (optional) Add a timestamp (Unix timestamp value in milliseconds) pertaining to the notification (usually the time the event occurred). For apps targeting Build.VERSION_CODES.N and above, this time is not shown anymore by default and must be opted into by using `showWhen`, default: null.
            usesChronometer: false, // (optional) Show the `when` field as a stopwatch. Instead of presenting `when` as a timestamp, the notification will show an automatically updating display of the minutes and seconds since when. Useful when showing an elapsed time (like an ongoing phone call), default: false.
            timeoutAfter: null, // (optional) Specifies a duration in milliseconds after which this notification should be canceled, if it is not already canceled, default: null

            messageId: "google:message_id", // (optional) added as `message_id` to intent extras so opening push notification can find data stored by @react-native-firebase/messaging module. 

            actions: ["Open App"], // (Android only) See the doc for notification actions to know more
            invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

            /* iOS only properties */
            category: "", // (optional) default: empty string
            subtitle: "My Notification Subtitle", // (optional) smaller title below notification title

            /* iOS and Android properties */
            id: 0, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            title: "Incoming Call", // (optional)
            message: "Click to enter app", // (required)
            picture: "https://www.example.tld/picture.jpg", // (optional) Display an picture with the notification, alias of `bigPictureUrl` for Android. default: undefined
            userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
            number: 1, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
            // repeatType: "day", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
            });
        }catch(e){
            console.log(e)
        }
    }
});

// messaging().setBackgroundMessageHandler(async message => {
//     console.log('reached')
// });
// Register background handler
// old code
// messaging().setBackgroundMessageHandler(async message => {
//     console.log('Message handled in the background!', message);
//     if(message.data.hasOwnProperty('call')){
//         try{
//             console.log('notification: ', message.data.call)
//             let calls = await RNCallKeep.getCalls()
//             if(calls.length == 0){
//                 RNCallKeep.displayIncomingCall(call_id, '0546330929', localizedCallerName = message.data.call.name, handleType = 'number')
//             }
//             return;
//         }catch(e){
//             console.log('display incoming call error: ', e)
//         }
//     }
// });

// messaging().setBackgroundMessageHandler(async message => {
//     console.log('Message handled in the background!', message);
//     if(message.data.hasOwnProperty('call')){
//         // AsyncStorage.setItem('call_d',JSON.stringify(message.data.call));

//         try{
//             // console.log('notification: ', message.data.call)
//             var call_id = uuid.v4();
//             var calls = await RNCallKeep.getCalls()
//             console.log("call info", calls);

//             // RNCallKeep.removeEventListener('answerCall');
            
//             RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
//                 const {appState} = useAppState();
//                 console.log(appState);
//                 if(appState == 'active'){
//                     return false;
//                 }

//                 // Do your normal `Answering` actions here.
//                 RNCallKeep.endAllCalls();
//                 try{
//                     console.log('moving to screen #00')
//                     AsyncStorage.setItem('call_d',JSON.stringify(message.data.call));
//                     setTimeout(()=>{
                        
//                         // console.log(get_nav_ref.isReady());
//                         // navigationref.navigate('Video', {urgent: message.data.call});
//                     }, 2000)
//                 }catch(e){

//                 }
                
//                 // navigationref.navigate('Video', {urgent: message.data.call});
//             });

// // old
//             // var a = setInterval(async()=>{
//             //     let calls = await RNCallKeep.getCalls()
//             //     if(calls.length > 0){
//             //         (async()=>{
//             //             // console.log(await RNCallKeep.isCallActive(call_id))
//             //             if(await RNCallKeep.isCallActive(call_id)){
//             //                 RNCallKeep.endAllCalls();
//             //                 console.log('moving to screen')
//             //                 setTimeout(()=>{
//             //                     console.log(get_nav_ref.isReady());
//             //                     // navigationref.navigate('Video', {urgent: message.data.call});
//             //                 }, 2000)
                            
//             //                 clearInterval(a)
//             //             }
//             //         })()
                    
//             //     }
//             // }, 100)
// // old stop

//             calls = await RNCallKeep.getCalls()
//             console.log("call info", calls)
//         if( (calls != undefined) && calls.length == 0){
//             try {
//                 RNCallKeep.displayIncomingCall(message.data.call.channel, 'Urgent Care', localizedCallerName = 'Urgent Call', handleType = 'generic')                    
//             } catch (error) {
//                 console.log(error)
//             }
//         }else{
//             try {
//                 RNCallKeep.displayIncomingCall(message.data.call.channel, 'Urgent Care', localizedCallerName = 'Urgent Call', handleType = 'generic')                    
//             } catch (error) {
//                 console.log(error)
//             }
//         }
//             return;
//         }catch(e){
//             console.log('display incoming call error: ', e)
//         }
//     }
// });

const HeadlessCheck = ({isHeadless}) =>{
    if(isHeadless){
        return null
    }

    return <App />;
}

// AppRegistry.registerComponent(appName, () => HeadlessCheck);
AppRegistry.registerComponent(appName, () => App);

// AppRegistry.registerComponent(appName, () => App);
