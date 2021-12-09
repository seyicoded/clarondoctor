import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import * as Reuse from '../components/reusables'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../api';
import { Avatar, Layout, Input, Button, TabBar, Tab, Calendar } from '@ui-kitten/components';

const Account = ({navigation}) =>{
  
  const [tab, settab] = useState(0)
  const [date, setdate] = useState(new Date())
  const [selected, setselected] = useState([])
  const [user, setUser] = useState()
  const [error, seterror] = useState()
  const [loading, setloading] = useState(false)
  const [imgloading, setimgloading] = useState(false)
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
    })()

  }, [])

  return(
    <Layout style={{ flex: 1 }}>
      <SafeAreaView style={{flex: 1}}>
        <Layout style={{ flex: 1 }}>
          <Reuse.header nav={navigation} logout={logout} title={'My Account'}/>

          <TabBar
            style={{minHeight: 50}}
            selectedIndex={tab}
            onSelect={settab}>
            <Tab title='Account Details'/>
            <Tab title='My Availability'/>
          </TabBar>

          { tab == 0 ?
          <ScrollView showsVerticalScrollIndicator={false}>
            <Avatar source={{uri: ''}} size={'giant'} shape={'round'} style={{alignSelf: 'center', margin: 15, backgroundColor: '#141414'}}/>
            <Input placeholder={'First Name'} label={'First Name'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input placeholder={'Last Name'} label={'Last Name'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input placeholder={'Phone Number'} label={'Phone Number'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input placeholder={'Speciality'} label={'Speciality'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input placeholder={'Seniority'} label={'Seniority'} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Input placeholder={'Write something about yourself'} label={'Biography'} multiline numberOfLines={5} size={'medium'} style={{marginHorizontal: 15, marginVertical: 5}}/>
            <Button style={{margin: 15}}>Save Changes</Button>
          </ScrollView>
          :
          <ScrollView showsVerticalScrollIndicator={false}>
            <Calendar
              date={date}
              onSelect={setdate}
              min={new Date()}
              style={{margin: 15, alignSelf: 'center'}}/>

            <View style={{flexDirection: 'row', marginHorizontal: 15}}>
              <Button style={{flex: 1}} size={'small'} appearance={selected.includes(1) ? 'filled' : 'outline'}>0600-0700</Button>
              <Button style={{flex: 1, marginHorizontal: 10}} size={'small'} appearance={'outline'}>0800-0900</Button>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>0900-1000</Button>
            </View>

            <View style={{flexDirection: 'row', marginHorizontal: 15, marginTop: 15}}>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>1000-1100</Button>
              <Button style={{flex: 1, marginHorizontal: 10}} size={'small'} appearance={'outline'}>1100-1200</Button>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>1200-1300</Button>
            </View>

            <View style={{flexDirection: 'row', marginHorizontal: 15, marginTop: 15}}>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>1300-1400</Button>
              <Button style={{flex: 1, marginHorizontal: 10}} size={'small'} appearance={'outline'}>1400-1500</Button>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>1500-1600</Button>
            </View>

            <View style={{flexDirection: 'row', marginHorizontal: 15, marginVertical: 15}}>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>1600-1700</Button>
              <Button style={{flex: 1, marginHorizontal: 10}} size={'small'} appearance={'outline'}>1700-1800</Button>
              <Button style={{flex: 1}} size={'small'} appearance={'outline'}>1800-1900</Button>
            </View>
          </ScrollView>
          }
        </Layout>
      </SafeAreaView>
    </Layout>
  );
}

export default Account