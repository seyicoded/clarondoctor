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

messaging().setBackgroundMessageHandler(async message => {
    console.log('Message handled in the background!', message);
    if(message.data.hasOwnProperty('call')){
        // AsyncStorage.setItem('call_d',JSON.stringify(message.data.call));

        try{
            console.log('notification: ', message.data.call)
            var call_id = uuid.v4();
            let calls = await RNCallKeep.getCalls()
            RNCallKeep.removeEventListener('answerCall');
            
            RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
                // Do your normal `Answering` actions here.
                RNCallKeep.endAllCalls();
                console.log('moving to screen #00')
                AsyncStorage.setItem('call_d',JSON.stringify(message.data.call));
                setTimeout(()=>{
                    
                    // console.log(get_nav_ref.isReady());
                    // navigationref.navigate('Video', {urgent: message.data.call});
                }, 2000)
                // navigationref.navigate('Video', {urgent: message.data.call});
            });

            // var a = setInterval(async()=>{
            //     let calls = await RNCallKeep.getCalls()
            //     if(calls.length > 0){
            //         (async()=>{
            //             // console.log(await RNCallKeep.isCallActive(call_id))
            //             if(await RNCallKeep.isCallActive(call_id)){
            //                 RNCallKeep.endAllCalls();
            //                 console.log('moving to screen')
            //                 setTimeout(()=>{
            //                     console.log(get_nav_ref.isReady());
            //                     // navigationref.navigate('Video', {urgent: message.data.call});
            //                 }, 2000)
                            
            //                 clearInterval(a)
            //             }
            //         })()
                    
            //     }
            // }, 100)

            if(calls.length == 0){
                
                RNCallKeep.displayIncomingCall(call_id, 'Urgent Care', localizedCallerName = message.data.call.name, handleType = 'generic')

            }
            return;
        }catch(e){
            console.log('display incoming call error: ', e)
        }
    }
});

const HeadlessCheck = ({isHeadless}) =>{
    if(isHeadless){
        return null
    }

    return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);

// AppRegistry.registerComponent(appName, () => App);
