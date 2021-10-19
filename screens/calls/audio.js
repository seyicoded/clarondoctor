import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  Platform,
} from 'react-native';
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcEngineContext,
} from 'react-native-agora';

const AudioCall = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [joined, setjoined] = useState(false)
  const [muted, setmuted] = useState(false)
  const [speaker, setspeaker] = useState(false)
  let _engine

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#141414' : '#FFFFFF',
  };

  const _init = async () => {
    _engine = await RtcEngine.createWithContext(
      new RtcEngineContext('a90dea913c844cd7bcada446242c6150')
    )

    _addListeners()

    await _engine.enableAudio()
    await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await _engine.setClientRole(ClientRole.Broadcaster)
    try{
      console.info('joining')
      await _engine.joinChannel('006a90dea913c844cd7bcada446242c6150IAA0Kk/v+DSMEdW7apteZTf19Fz2BUqa3+nMAj7HeO9KYwO7xC0AAAAAEACLgpZh2C8vYQEAAQDVLy9h',
      'urgent', null, 0)
    }catch(e){
      console.log(e)
    }
    try{
      await _joinChannel()
    }catch(e){
      console.log(e)
    }
  }

  const _addListeners = () => {
    _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.info('JoinChannelSuccess', channel, uid, elapsed)
      setjoined(true)
    })

    _engine.addListener('LeaveChannel', (stats) => {
      console.info('LeaveChannel', stats)
      setjoined(false)
    })

    // _engine.addListener('JoinChannelError', (e)=>{
    //   console.log(e)
    // })
  }

  const _joinChannel = async () => {
    console.log(await _engine.getConnectionState())
    // if (Platform.OS === 'android') {
    //   await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    //   );
    // }
    // try{
    //   await _engine.joinChannel(
    //     '006a90dea913c844cd7bcada446242c6150IAA0Kk/v+DSMEdW7apteZTf19Fz2BUqa3+nMAj7HeO9KYwO7xC0AAAAAEACLgpZh2C8vYQEAAQDVLy9h',
    //     'urgent',
    //     null,
    //     '479hfdfhjds8'
    //   )
    // }catch(e){
    //   console.log(e)
    // }
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
      console.log('Leave Error: ', e)
    }
    navigation.goBack()
  }

  _switchMicrophone = () => {
    _engine
      ?.enableLocalAudio(!muted)
      .then(() => {
        setmuted(!muted);
      })
      .catch((err) => {
        console.warn('enableLocalAudio', err);
      });
  };

  _switchSpeakerphone = () => {
    _engine
      ?.setEnableSpeakerphone(!speaker)
      .then(() => {
        setspeaker(!speaker)
      })
      .catch((err) => {
        console.warn('setEnableSpeakerphone', err);
      });
  }

  useEffect(() => {
    _init()
    return () => {
      _engine.destroy()
    }
  }, [])

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text>Test</Text>
    </SafeAreaView>
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

export default AudioCall;