/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import RNCallKeep from 'react-native-callkeep';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async message => {
    console.log('Message handled in the background!', message);
    if(message.data.hasOwnProperty('call')){
        try{
            console.log('notification: ', message.data.call)
            let calls = await RNCallKeep.getCalls()
            if(calls.length == 0){
                RNCallKeep.displayIncomingCall(call_id, '0546330929', localizedCallerName = message.data.call.name, handleType = 'number')
            }
            return;
        }catch(e){
            console.log('display incoming call error: ', e)
        }
    }
});

AppRegistry.registerComponent(appName, () => App);
