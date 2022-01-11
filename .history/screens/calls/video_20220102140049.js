import { Button, Icon, Layout, Text } from '@ui-kitten/components';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Platform,
  View,
  TouchableOpacity
} from 'react-native';
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcEngineContext,
  RtcLocalView,
  RtcRemoteView
} from 'react-native-agora';
import firebase from 'firebase';

const SpeakerIcon = (props)=><Icon {...props} name="volume-up-outline"/>
const EndIcon = (props)=><Icon {...props} name="close-outline"/>
const MuteIcon = (props)=><Icon {...props} name="mic-off-outline"/>
const VideoIcon = (props)=><Icon {...props} name="video-outline"/>

const VideoCall = ({navigation, route}) => {
  const doctor_email = route.params.doctor_email;
  const patient_email = route.params.patient_email;

  const isDarkMode = useColorScheme() === 'dark';
  const [joined, setjoined] = useState(false)
  const [engine, setengine] = useState()
  const [muted, setmuted] = useState(false)
  const [video, setvideo] = useState(true)
  const [speaker, setspeaker] = useState(false)
  const [remoteid, setremoteid] = useState()
  let _engine

  const _init = async (channel, token) => {
    _engine = await RtcEngine.createWithContext(
      new RtcEngineContext('a90dea913c844cd7bcada446242c6150')
    )

    setengine(_engine)

    requestCameraAndAudioPermission()

    _addListeners()
    await _engine.enableVideo()
    await _engine.startPreview()
    await _engine.enableLocalVideo(true)
    await _engine.startPreview()
    await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await _engine.setClientRole(ClientRole.Broadcaster)
    try{
      // await _engine.joinChannel('006a90dea913c844cd7bcada446242c6150IAA0Kk/v+DSMEdW7apteZTf19Fz2BUqa3+nMAj7HeO9KYwO7xC0AAAAAEACLgpZh2C8vYQEAAQDVLy9h',
      // 'urgent', null, 0)

      await _engine.joinChannel(token,
      channel, null, 0)
    }catch(e){
      console.log(e)
    }
  }

  const requestCameraAndAudioPermission = async () =>{
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
        ])
        if (
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
            console.log('You can use the mic')
            console.log(granted)
        } else {
            console.log('Permission denied')
        }
    } catch (err) {
        console.warn(err)
    }
  }

  const _addListeners = () => {
    _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.info('JoinChannelSuccess', channel, uid)
      setjoined(true)
    })

    _engine.addListener('LeaveChannel', (stats) => {
      console.info('LeaveChannel', stats)
      setjoined(false)
      try{
        navigation.goBack()
      }catch(e){

      }
    })

    _engine.addListener('UserJoined', (uid, elapsed) => {
      console.info('UserJoined', uid, elapsed);
      // engine.stopPreview()
      setremoteid(uid)
    })

    _engine?.addListener('UserOffline', (uid, reason) => {
      console.info('UserOffline', uid, reason);
      setremoteid(null)
      try{
        navigation.goBack()
      }catch(e){

      }
    })

    // _engine.addListener('JoinChannelError', (e)=>{
    //   console.log(e)
    // })
  }

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
      console.log('Leave Error: ', e)
    }
    navigation.goBack()
  }

  const _switchCamera =async()=>{
    try{
      await engine.enableLocalVideo(!video)
      setvideo(!video)
    }catch(e){
      console.log(e)
    }
  }

  const _switchMicrophone = async() => {
    try{
      await engine.enableLocalAudio(!muted)
      setmuted(!muted)
    }catch(e){
      console.log(e)
    }
  };

  const _switchSpeakerphone = () => {
    try{
      engine.setEnableSpeakerphone(!speaker)
      setspeaker(!speaker)
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    // _init()
    
    (async()=>{
      try{
        let res = await axios.get('https://api.clarondoc.com/urgent/token')
        _init(res.data.RTCChannel, res.data.RTCAccessToken)

        const user = JSON.parse(await AsyncStorage.getItem('user'));
        // console.log(user.firstname)

        let doc = await firebase.firestore().collection('normal_calls').doc(patient_email).set({data: {
          time: new Date(),
          patient: patient_email,
          doctor: doctor_email,
          caller: `${user.firstname} ${user.lastname}`,
          status: 'started',
          end_now: 'false',
          channel: res.data.RTCChannel,
          token: res.data.RTCAccessToken
        }})

      }catch(e){
        console.log('aa')
        console.log(e)
      }
    })()

    return () => {
      engine.destroy()
    }
  }, [])

  return (
    <Layout style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        { joined ?
        <Layout style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <RtcLocalView.SurfaceView style={remoteid == null ? styles.localConnecting : styles.localConnected} />

          {remoteid != null ?
          <RtcRemoteView.SurfaceView
            style={{flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: -1}}
            uid={remoteid}
            zOrderMediaOverlay={false}
          /> : <Text category={'h5'}>Connecting...</Text> }
        </Layout>
        :
        // <Layout style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        //   <Text category={'h5'}>Connecting...</Text>
        // </Layout>
        // <RtcLocalView.SurfaceView style={styles.localConnecting} />
        <Text />
        }
        <View style={{position: 'absolute', bottom: 35, left: 15, right: 15, alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row'}}>
          <Button onPress={_switchCamera} status={'basic'} style={{height: 65, width: 65, borderRadius: 65}} accessoryLeft={VideoIcon} appearance={video ? 'filled' : 'outline'}></Button>
          <Button onPress={_switchMicrophone} status={'basic'} style={{height: 65, width: 65, borderRadius: 65}} accessoryLeft={MuteIcon} appearance={muted ? 'filled' : 'outline'}></Button>
          <Button onPress={_leaveChannel} status={'danger'} style={{height: 75, width: 75, borderRadius: 75}} accessoryLeft={EndIcon} appearance={'filled'}></Button>
          <Button onPress={_switchSpeakerphone} status={'basic'} style={{height: 65, width: 65, borderRadius: 65}} accessoryLeft={SpeakerIcon} appearance={speaker ? 'filled' : 'outline'}></Button>
        </View>
      </SafeAreaView>
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
  localConnecting: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
    zIndex: 99
  },
  localConnected: {
    height: 200,
    width: 150,
    borderRadius: 5,
    backgroundColor: '#141414',
    position: 'absolute',
    top: 50,
    right: 15
  }
});

export default VideoCall;
