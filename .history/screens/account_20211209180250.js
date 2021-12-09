import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, Dimensions, Platform } from 'react-native';
import * as Reuse from '../components/reusables'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../api';
import { Avatar, Text, Layout, Input, Button, TabBar, Tab, Calendar,Modal, Card, Icon } from '@ui-kitten/components';

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
            <Avatar source={{uri: account.avatar}} size={'giant'} shape={'round'} style={{alignSelf: 'center', margin: 15, backgroundColor: '#141414'}}/>

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