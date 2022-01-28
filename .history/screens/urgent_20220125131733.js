import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  ImageBackground,
  View,
  Image,
  useColorScheme,
  Platform,
} from 'react-native';
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcEngineContext,
} from 'react-native-agora';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AsyncStorage from '../AsyncStorageCustom'
import { Layout, Text, Icon, Button } from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';

const CancelIcon = (props) => (
  <Icon {...props} name='close-outline'/>
);

const SpeakerIcon = (props) => (
  <Icon {...props} name='volume-up-outline'/>
);

const HeadsetIcon = (props) => (
  <Icon {...props} name='volume-up-outline'/>
);

const MuteIcon = (props) => (
  <Icon {...props} name='mic-off-outline'/>
);

const MutedIcon = (props) => (
  <Icon {...props} name='mic-outline'/>
);

let _engine
let call_id
let urgent
let countt = 0

const Urgent = ({navigation, route}) => {
  call_id = route.params.email;
  console.log(call_id)
  const _engine_ref = useRef(null);

  let countt_r = useRef(0)
  countt_r.current = 0;

  const isDarkMode = useColorScheme() === 'dark';
  const [joined, setjoined] = useState(false)
  const [picked, setpicked] = useState(false)
  const [muted, setmuted] = useState(false)
  const [speaker, setspeaker] = useState(false)
  const [duration, setduration] = useState('0:00')

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#141414' : '#FFFFFF',
  };

  const _init = async (channel, token) => {
    _engine = await RtcEngine.createWithContext(
      new RtcEngineContext('0742c8affa02429b9622956bac0d67d0')
    )

    _engine_ref.current = _engine;

    _addListeners()

    if(Platform.OS == 'android'){
      requestCameraAndAudioPermission()
    }

    await _engine.enableAudio()
    await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await _engine.setClientRole(route.params.user == null ? ClientRole.Broadcaster : ClientRole.Broadcaster)
    try{
      console.info('joining')
      await _engine.joinChannel(token,
      channel, null, 0)
    }catch(e){
      console.log('Init error: ', e)
    }
    try{
      await _joinChannel()
    }catch(e){
      console.log('Join error: ', e)
    }
  }

  const requestCameraAndAudioPermission = async () =>{
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ])
        if (
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
            console.log('You can use the mic')
        } else {
            console.log('Permission denied')
        }
    } catch (err) {
        console.warn(err)
    }
  }

  const _addListeners = () => {
    _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.info('JoinChannelSuccess', channel, uid, elapsed)
      setjoined(true)

      try {
        // _engine_ref.current.enableLocalAudio(_switchMicrophone())
        _switchMicrophone()
      } catch (error) {
        
      }
    })

    _engine.addListener('LeaveChannel', (stats) => {
      console.info('LeaveChannel', stats)
      if(picked){
        firestore().collection('calls').doc(call_id).set({data: {
          duration: stats.duration
        }}, {merge: true})
      }
      setjoined(false)

      (async()=>{
        try{
          await _leaveChannel()
        }catch(e){}
      })()
    })

    _engine.addListener('UserJoined', (channel, uid, elapsed)=>{
      if(true){
        firestore().collection('calls').doc(call_id).set({data: {
          status: 'ongoing'
        }}, {merge: true})
      }
      setpicked(true)
    })

    _engine.addListener('UserOffline', (channel, uid, elapsed)=>{
      (async()=>{
        try{
          await _leaveChannel()
        }catch(e){}
      })()
    })

    _engine.addListener('Error', (e)=>{
      console.log('Main Error: ', e)
    })
  }

  const _joinChannel = async () => {
    console.log('Connection state: ', await _engine.getConnectionState())
  };

  const _onChangeRecordingVolume = (value) => {
    _engine.adjustRecordingSignalVolume(value * 400)
  }

  const _onChangePlaybackVolume = (value) => {
    _engine.adjustPlaybackSignalVolume(value * 400)
  }

  const _toggleInEarMonitoring = (isEnabled) => {
    _engine.enableInEarMonitoring(isEnabled)
  }

  const _onChangeInEarMonitoringVolume = (value) => {
    _engine.setInEarMonitoringVolume(value * 400)
  }

  const _leaveChannel = async () => {
    try{
      if(_engine !=null){
        await _engine.leaveChannel()
      }
    }catch(e){
      console.log('Leave error: ', e)
    }
    navigation.goBack()
  }

  const _switchMicrophone = () => {
    try {
      _engine_ref.current.enableLocalAudio(!muted)
      .then(() => {
        setmuted(!muted);
        console.log('local audio:', !muted)
      })
      .catch((err) => {
        console.warn('enableLocalAudio', err);
      });

      console.log('local audio clicked')  
    } catch (error) {
      console.log(_engine_ref.current)
    }
    
  };

  const _switchSpeakerphone = () => {
    try {
      _engine_ref.current.setEnableSpeakerphone(!speaker)
      .then(() => {
        setspeaker(!speaker)
        console.log('local speaker:', !speaker)
      })
      .catch((err) => {
        console.warn('setEnableSpeakerphone', err);
      });  
    } catch (error) {
      
    }
    
  }

  const startUrgent = async()=>{
    try{
      let email = await AsyncStorage.getItem('_email')
      let res = await axios.get('https://api.clarondoc.com/urgent/token')
      _init(res.data.RTCChannel, res.data.RTCAccessToken)
      // let doc = await firestore().collection('calls').add({
      //   time: new Date(),
      //   recipient: route.params.user.email,
      //   caller: email,
      //   status: 'started',
      //   channel: res.data.RTCChannel,
      //   token: res.data.RTCAccessToken
      // })
      call_id = route.params.email
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {

    
    (async()=>{

      if(route.params.user == null){
        _init(route.params.channel, route.params.token)
      }else{
        startUrgent()
      }

      // firebase
      firestore().collection('calls').doc(call_id).onSnapshot(async snapshot=>{
        // console.log('Docs: ', snapshot.docs.length)
        // if(snapshot.docs.length > 0){
        if(true){
            // urgent = snapshot.docs[0]
            urgent = snapshot.data().data;
            // let call = await AsyncStorage.removeItem('_call')
            // // console.log(urgent.data().channel)

            console.log('count:'+ countt_r.current)

            if(countt_r.current >= 3 ){
                // console.log('reached')
                // console.log(urgent.status)
                if((urgent.status != "ended") ){
                    
                }else{
                  console.log('reached end call'+urgent.status)
                    try{
                      if(_engine !=null){
                        // await _engine.leaveChannel()
                      }
                    }catch(e){
                      console.log('Leave error: ', e)
                    }
                    // navigation.goBack()
                }
                
                
            }

            countt_r.current+=1;
        }
    }, e => {
        console.log('Firebase Error: ', e)
    })
    })()

    return () => {
      if(call_id != null){
        firestore().collection('calls').doc(call_id).set({data: {
          status: 'ended'
        }}, {merge: true})
      }
      _engine.destroy()

      countt_r.current = 0;
    }
  }, [])

  return (
    <Layout style={{ flex: 1}}>
        <View style={{marginTop: 100, alignItems: 'center', justifyContent: 'center'}}>
          <Text category='s1' appearance='hint'>{ picked ? 'Connected' : route.params.user == null ? 'Joining...' : 'Calling...' } </Text>
          <Text category='h4' style={{marginTop: 10}}>{route.params.user == null ? 'Urgent Care' : route.params.user.firstname +' ' + route.params.user.lastname}</Text>
          <Image source={require('../assets/icon.png')} resizeMode={'contain'} style={{height: 150, width: 150, borderRadius: 150, marginTop: 50}}/>
        </View>

        <View style={{flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', bottom: 50, position: 'absolute'}}>
          <Button onPress={_switchMicrophone} style={{width: 70, height: 70, borderRadius: 70, alignSelf: 'flex-end', marginEnd: 25}} appearance={!muted ? 'filled' : 'outline'} status='basic' accessoryLeft={MuteIcon}/>
          <Button onPress={_leaveChannel} style={{width: 70, height: 70, borderRadius: 70, alignSelf: 'flex-end', marginEnd: 25}} status='danger' accessoryLeft={CancelIcon}/>
          <Button onPress={_switchSpeakerphone} style={{width: 70, height: 70, borderRadius: 70, alignSelf: 'flex-end'}} appearance={speaker ? 'filled' : 'outline'} status='basic' accessoryLeft={SpeakerIcon}/>
        </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default Urgent;