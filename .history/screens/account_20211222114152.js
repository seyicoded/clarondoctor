import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, Dimensions, Platform, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import * as Reuse from '../components/reusables'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../api';
import DocumentPicker from 'react-native-document-picker'
import { Avatar, Text, Layout, Input, Button, TabBar, Tab, Calendar,Modal, Card, Icon } from '@ui-kitten/components';
import firebase from 'firebase';

const Account = ({navigation}) =>{
  
  const [tab, settab] = useState(0)
  const [date, setdate] = useState(new Date())
  const [selected, setselected] = useState([])
  const [user, setUser] = useState()
  const [error, seterror] = useState()
  const [loading, setloading] = useState(false)
  const [imgloading, setimgloading] = useState(false)
  const [time_selected, settime_selected] = useState([])
  const [response, setresponse] = useState({
    error: false,
    message: null
  })
  const [account, setaccount] = useState({
    firstname: '', 
    lastname: '', 
    age: '', 
    email: '', 
    avatar: '', 
    address: '', 
    gender: '',
    phoneNumber: ''
  })

  const list_time = [
    '06:00 - 07:00',
    '07:00 - 08:00',
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
  ];

  const renderTime = ({index, item})=>{
    // console.log(item)
    return (
      <Button style={{margin: 0.5}} onPress={()=>addToSelected(item)} appearance={(getIfSelected(item) == true) ? "filled" : "outline"}>{item}</Button>
    );
  }

  const logout = async ()=>{
    await AsyncStorage.removeItem('_email')
    await AsyncStorage.removeItem('_accesstoken')
    navigation.goBack()
    navigation.replace('Login')
  }

  useEffect(() => {
    (async()=>{
      let account = await AsyncStorage.getItem('user')
      // console.log(account)
      setUser(JSON.parse(account))
      setaccount({
        ...JSON.parse(account),
        ...{
          gender: JSON.parse(account).sex,
          phoneNumber: JSON.parse(account).phone
        }
      })

      const userData = await API.getuserDetails();
      
      console.log(userData)

    })()

  }, [])

  // added methods
  const getFileName = (name, path)=> {
    if (name != null) { return name; }

    if (Platform.OS === "ios") {
        path = "~" + path.substring(path.indexOf("/Documents"));
    }
    return path.split("/").pop();
}

const getPlatformPath = ({ path, uri }) => {
    return Platform.select({
        android: { "value": uri },
        ios: { "value": uri }
    })
}

const getPlatformURI = (imagePath) => {
    let imgSource = imagePath;
    if (isNaN(imagePath)) {
        imgSource = { uri: this.state.imagePath };
        if (Platform.OS == 'android') {
            imgSource.uri = "file:///" + imgSource.uri;
        }
    }
    return imgSource
}

const uriToBlob = (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
      };
      
      xhr.onerror = function() {
        // something went wrong
        reject(new Error('uriToBlob failed'));
      };
      // this helps us get a blob
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      
      xhr.send();
    });
  }

  const pickImage = async()=>{
    // let result = await ImagePicker.launchImageLibraryAsync({
      setimgloading(true)
    
    try{
      let result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: false,
    })

      if (!result.cancelled) {
        result = (result[0]);
        if(result.size/1024 > 500){
            seterror(`${attached.name} cannot be attached. Exceed the maximum upload size (500KB).`)
            return false
        }

        var path = getPlatformPath(result).value;
        var name = getFileName(result.name, path);
        var blob = await uriToBlob(result.uri);
        let type = result.type;
        let attached = await firebase.storage().ref(`new-photo/${name}`).put(blob, {contentType: type})
        let url = await firebase.storage().ref(`new-photo`).child(name).getDownloadURL()
        // console.log(url);
        // setimgloading(false)
        // return ;
        setaccount({
          ...account,
          ...{
            avatar: url
          }
        });
      }
    }catch(e){
      console.log(e)
    }

    setimgloading(false)
  }

  const saveAccount = async()=> {
    setloading(true)

    if(account.firstname.trim().length == 0){
      return seterror('name')
    }

    if(account.lastname.trim().length == 0){
      return seterror('lastname')
    }

    if(account.email.trim().length == 0){
      return seterror('email')
    }

    if(user.firstname != account.firstname ||
      user.lastname != account.lastname ||
      true){
        try{
          setloading(true)
          let data = await API.update_physician(account)

          console.log(data)

          if(data.success){
            await AsyncStorage.setItem('user', JSON.stringify({...account, ...{ phone: account.phone, avatar: account.avatar }}))
            setresponse({
              error: false,
              message: 'Your profile was successfully updated! image would be reflect on app restart'
            })
          }else{
            setresponse({
              error: true,
              message: data.message
            })
          }

        }catch(e){
          console.log(e)
          setloading(false)
          setresponse({
            error: true,
            message: e.response.data.message
          })
        }
      }

    setloading(false)
  }

  const updateAvailbility = async()=>{
    setloading(true)
    try {
      let date_ = date.toLocaleDateString();
      let times = await getTimeSelected();
      console.log(times)
    } catch (error) {
      
    }
    setloading(false)
  }

  const getTimeSelected = async()=>{
    return false;
  }

  const getIfSelected = (time)=>{
    let date_ = (date).toLocaleDateString()
    if(time_selected[date_] == null){
      return false;
    }

    let d = time_selected[date_];

    
  }

  const addToSelected = (item)=>{
    let date_ = (date).toLocaleDateString()
    let index = null;
    for(var i = 0; i < time_selected.length ; i++){
      if(time_selected[i].date == date_){
        index = i;
        continue;
      }

    }

    if(index == null){
      let new_time = [{
        date: date_,
        times : [item]
      }]
      settime_selected(new_time.concat(time_selected));
    }else{
      // check if time exist
      let index1 = null;
      for(var j = 0; j < (time_selected[index].times).length ; j++){
        if( ((time_selected[index].times)[j]) == item){
          index1 = j;
          continue;
        }
      }
      if(index1 == null){
        // add time
        let old_time = time_selected;
        // old
        old_time[index].times = ([item].concat(old_time[index].times));
        // console.log(old_time)
        settime_selected(old_time)
      }else{
        // ignore time already exist
      }
    }

  }

  // console.log(time_selected)

  return(
    <Layout style={{ flex: 1 }}>
      <SafeAreaView style={{flex: 1}}>
        <Layout style={{ flex: 1 }}>
          <Reuse.header nav={navigation} logout={logout} title={'My Account'}/>

          <Modal
            visible={response.message}
            backdropStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}>
            <Card disabled status={response.error ? 'danger' : 'primary'} style={{width: Dimensions.get('screen').width-60}}>
              <Text category="h6" style={{textAlign: 'center', margin: 15}} status={response.error ? 'danger' : 'primary'}>{response.error ? 'Error!' : 'Saved!'}</Text>
              <Text style={{textAlign: 'center'}}>{response.message}</Text>
              <Button onPress={()=>{setresponse({error: false, message: null})}} appearance={'outline'}  status={response.error ? 'basic' : 'primary'} style={{marginTop: 15}}>{response.error ? 'Try Again' : 'Alright'}</Button>
            </Card>
          </Modal>

          <TabBar
            style={{minHeight: 50}}
            selectedIndex={tab}
            onSelect={settab}>
            <Tab title='Account Details'/>
            <Tab title='My Availability'/>
          </TabBar>

          { tab == 0 ?
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={()=>pickImage()}>
              {
                imgloading ? 
                <ActivityIndicator color="green"/>:
                <Avatar source={{uri: account.avatar}} size={'giant'} shape={'round'} style={{alignSelf: 'center', margin: 15, backgroundColor: '#141414'}}/>
              }
              
            </TouchableOpacity>
            

            <Input value={account.firstname} onChangeText={txt=>{
                      setaccount({
                        ... account,
                        ... {
                          firstname: txt
                        }
                      })
                    }} placeholder={'First Name'} label={'First Name'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input value={account.lastname} onChangeText={txt=>{
                      setaccount({
                        ... account,
                        ... {
                          lastname: txt
                        }
                      })
                    }} placeholder={'Last Name'} label={'Last Name'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input value={account.phone} onChangeText={txt=>{
                      setaccount({
                        ... account,
                        ... {
                          phone: txt
                        }
                      })
                    }} placeholder={'Phone Number'} label={'Phone Number'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input value={account.department} onChangeText={txt=>{
                      setaccount({
                        ... account,
                        ... {
                          department: txt
                        }
                      })
                    }} placeholder={'Speciality'} label={'Speciality'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input value={account.seniority} onChangeText={txt=>{
                      setaccount({
                        ... account,
                        ... {
                          seniority: txt
                        }
                      })
                    }} placeholder={'Seniority'} label={'Seniority'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input value={account.bio} onChangeText={txt=>{
                      setaccount({
                        ... account,
                        ... {
                          bio: txt
                        }
                      })
                    }} placeholder={'Write something about yourself'} label={'Biography'} multiline numberOfLines={5} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Button disabled={loading}
                    onPress={saveAccount} style={{margin: 15}}>Save Changes</Button>
          </ScrollView>
          :
          <ScrollView showsVerticalScrollIndicator={false}>
            <Calendar
              date={date}
              onSelect={setdate}
              min={new Date()}
              style={{margin: 15, alignSelf: 'center'}}/>

            <FlatList
            data={list_time}
            style={{width: '100%'}}
            numColumns={3}
            renderItem={renderTime}
            />

            <View>
              <Text />
              <Button disabled={loading} onPress={()=>updateAvailbility()}>{loading ? 'LOADING': 'UPDATE AVAILABILITY'}</Button>
            </View>
          </ScrollView>
          }
        </Layout>
      </SafeAreaView>
    </Layout>
  );
}

export default Account