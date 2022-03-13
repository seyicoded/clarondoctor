import React, { useEffect, useState } from 'react';
import RNCallKeep from 'react-native-callkeep';
import Chats from './tabs/chats';
import Calls from './tabs/calls';
import Manage from './tabs/manage';
import uuid from 'react-native-uuid';
import { Alert, PermissionsAndroid, SafeAreaView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AsyncStorage from '../AsyncStorageCustom'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { BottomNavigation, BottomNavigationTab, Icon, Button, Layout, Divider, Toggle } from '@ui-kitten/components';
import * as API from '../api';

import useAppState from 'react-native-appstate-hook'

const call_options = {
    ios: {
      appName: 'ClarondocDoctors',
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'ok',
      imageName: 'phone_account_icon',
      additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS],
      // Required to get audio in background when using Android 11
      foregroundService: {
        channelId: 'default',
        channelName: 'Foreground service for my app',
        notificationTitle: 'Incoming urgent connect',
        notificationIcon: 'https://imageuploads01.s3.amazonaws.com/1607082935102-icon_inv.jpg',
      }, 
    }
};
RNCallKeep.setup(call_options).then(accepted=>{})
let oncall = false
let call_id
let urgent

// add listener for call reject
RNCallKeep.addEventListener('endCall', ()=>{
    (async()=>{
        let email = await AsyncStorage.getItem('_email')
        firestore().collection('calls').doc(email).set({data: {
            status: 'ended'
        }}, {merge: true})

        RNCallKeep.endAllCalls();
        console.log('rnck: ended call')
    })()
    
})

const { Navigator, Screen } = createBottomTabNavigator();

const ChatIcon = (props) => (
    <Icon {...props} name='message-circle-outline'/>
);

const BellIcon = (props) => (
    <Icon {...props} name='bell-outline'/>
);

const LockIcon = (props) => (
    <Icon {...props} name='person-outline'/>
);
  
const CallIcon = (props) => (
    <Icon {...props} name='phone-call-outline'/>
);
  
const AccountIcon = (props) => (
    <Icon {...props} name='clipboard-outline'/>
);

const BottomTabBar = ({ navigation, state }) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title='Chats' icon={ChatIcon}/>
    <BottomNavigationTab title='Calls' icon={CallIcon}/>
    <BottomNavigationTab title='More' icon={AccountIcon}/>
  </BottomNavigation>
);

export const MainScreen = ({navigation}) =>{
    
    const [online, setonline] = useState(false)

    const updateStatus = async (online)=>{
        setonline(online)

        try{
            let changed = await API.changeStatus(online ? 'Online' : 'Offline')

            if(!changed){
                statuserror(online)
                return
            }

            await AsyncStorage.setItem('_status', online ? 'true' : 'false')
        }catch(e){
            statuserror(online)
        }
    };

    const statuserror = async(online)=>{
        setonline(!online)
        Alert.alert('Not Changed', 'There was an error updating your online status', [
            {
                text: 'Retry',
                onPress: ()=>updateStatus(online),
                style: 'default'
            },
            {
                text: 'Cancel',
                onPress: ()=>setonline(!online),
                style: 'cancel'
            }
        ])
    }

    const logout = async()=>{
        navigation.navigate('Account')
    }

    useEffect(() => {
        (async()=>{

            let email = await AsyncStorage.getItem('_email');

            console.log(email);

            setonline((await AsyncStorage.getItem('_status')) == 'true')
            call_id = uuid.v4()

            RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
                // Do your normal `Answering` actions here.
                RNCallKeep.startCall(urgent.channel, 'Urgent Care', localizedCallerName = 'Urgent Care', handleType = 'generic')
                console.log('rnck: call')
                navigation.navigate('Urgent', {channel: urgent.channel, token: urgent.token, email: email})
            });

            RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
                // Do your normal `Answering` actions here.
                await AsyncStorage.removeItem('_call')
                if(urgent != null){
                    firestore().collection('urgent').doc(urgent.id).delete()
                }
                RNCallKeep.endAllCalls()
            });

            RNCallKeep.addEventListener('didPerformSetMutedCallAction', (data)=>{
                console.log(data.muted)
            });

            // RNCallKeep.displayIncomingCall(call_id, '0500000000', localizedCallerName = 'Urgent Care', handleType = 'generic')

            firestore().collection('calls').doc(email).onSnapshot(async snapshot=>{
                // console.log('Docs: ', snapshot.docs.length)
                // if(snapshot.docs.length > 0){
                if(true){
                    // urgent = snapshot.docs[0]
                    urgent = snapshot.data().data;
                    let call = await AsyncStorage.removeItem('_call')
                    // console.log(urgent.data().channel)

                    if(call == null){
                        // console.log('reached')
                        console.log(urgent.status)
                        if((urgent.status != "ended") && (urgent.status != "ongoing")){
                            await AsyncStorage.setItem('_call', urgent.channel)
                            try{
                                console.log('call reached')
                                RNCallKeep.displayIncomingCall(urgent.channel, 'Urgent Care', localizedCallerName = 'Urgent Care', handleType = 'generic')
                            }catch(e){
                                // console.log(e)
                            }
                        }else if(urgent.status == "ongoing"){

                        }else{
                            console.log('ending nw')
                            RNCallKeep.endAllCalls()
                        }
                        
                        
                    }
                }
            }, e => {
                console.log('Firebase Error: ', e)
            })

            // listen for foreground notifications
            messaging().onMessage(async message => {

                if(message.data.hasOwnProperty('call')){
                    try{
                        if(!oncall){
                            oncall = true
                            console.log('foreground')
                            console.log(message)
                            RNCallKeep.displayIncomingCall(call_id, '0500000000', localizedCallerName = `${message.notification.title}`, handleType = 'generic')
                        }
                        return;
                    }catch(e){
                        console.log('display incoming call error: ', e)
                        return
                    }
                }

                console.log(message)

                Alert.alert(message.notification.title, message.notification.body, [
                {
                    text: 'View',
                    style: 'default',
                    onPress: ()=>{
                    if(message.data.title.includes('New message')){
                        let sender = message.data.extraData1
                        navigation.navigate('Conversation', { user: sender, name: message.data.title.replace('New message from ', '')})
                    }
                    }
                },
                {
                    text: 'Dismiss',
                    style: 'cancel',
                    onPress: ()=>{}
                }
                ]);
            })
            // end listen for foreground notifications

            // do something on notification open
            messaging().onNotificationOpenedApp(message=>{
                console.log('Notification opened: ', message)
            })
        })()
    }, [])

    const bg_picker = ()=>{
        console.log('state changed');
        (async()=>{
            try{
                const call_d = await AsyncStorage.getItem('call_d')
                let email = await AsyncStorage.getItem('_email');
                if(call_d != null){
                    console.log('about to start call from background call');
                    const urgent = JSON.parse(call_d);
                    console.log(urgent)
                    navigation.navigate('Urgent', {channel: urgent.channel, token: urgent.token, email: email})
                    // navigation.navigate('Video', {urgent: urgent});
                    AsyncStorage.removeItem('call_d')
                }
            }catch(e){}
            
        })()
    }

    useAppState({
        onForeground: ()=>{
            bg_picker();
        }
    })

    useEffect(()=>{
        (async()=>{
            // updating token on firebase
            let token = await AsyncStorage.getItem('device_fcm_token');
            let email = await AsyncStorage.getItem('_email')
            await firebase.firestore().collection('device_token').doc(email).set({token: token});
        })()
    }, [])

    return (
        <Layout style={{flex: 1}}>
            <SafeAreaView style={{flex: 1}}>
                <Layout style={{flexDirection: 'row', padding: 15, justifyContent: 'space-between'}}>
                    <Button onPress={()=>navigation.navigate('Notifications')} style={{height: 35, width: 35}} size={'small'} appearance={'outline'} accessoryLeft={BellIcon}></Button>
                    <Toggle checked={online} onChange={updateStatus}/>
                    <Button onPress={logout} style={{height: 35, width: 35}} size={'small'} appearance={'outline'} accessoryLeft={LockIcon}></Button>
                </Layout>
                <Divider/>
                <Navigator screenOptions={{headerShown: false}} tabBar={props => <BottomTabBar {...props} />}>
                    <Screen name='Chats' component={Chats}/>
                    <Screen name='Calls' component={Calls}/>
                    <Screen name='Manage' component={Manage}/>
                </Navigator>
            </SafeAreaView>
        </Layout>
    );
}