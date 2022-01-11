import React, { useEffect, useState } from 'react';
import * as Reuse from '../../components/reusables'
import * as API from '../../api'
import { Icon, Calendar, Layout, Text, Button, Modal, Card, Input, Divider } from '@ui-kitten/components';
import { FlatList, ScrollView, StyleSheet, Dimensions, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CallIcon = (props)=><Icon {...props} name="phone-call-outline"/>

const Calls = ({navigation}) =>{

  (async()=>{
    // const user = JSON.parse(await AsyncStorage.getItem('user'));
    // console.log(user.firstname)
  })()

  const [now, setnow] = useState(new Date())
  const [requests, setrequests] = useState([])
  const [selected, setselected] = useState([])
  const [hascall, sethascall] = useState([])
  const [query, setquery] = useState()
  const [filteredusers, setfilteredusers] = useState([])
  const [users, setusers] = useState([])
  const [newcall, setnewcall] = useState(false)
  const [loading, setloading] = useState(false)

  const DayCell = ( {date}, style) => (
    <View
      style={[styles.dayContainer, style.container]}>
      <Text style={style.text}>{`${date.getDate()}`}</Text>
      { hascall.includes(date.toString().substring(0, 10)) ?
      <Icon fill={now == date ? '#ffffff' : '#1BCC88'} name="radio-button-on-outline" style={{height: 5, width: 5}}/> : null }
    </View>
  );

  const getSchedule = async ()=>{
    try{
      setloading(true)
      let requests = await API.getSchedule()
      setrequests(requests)
      
      let days = []
      requests.forEach(request=>{
        !days.includes(new Date(request.createDate).toString().substring(0, 10)) ? days.push(new Date(request.createDate).toString().substring(0, 10)) : null
      })

      setselected(requests.filter(request=>{
        return new Date().toString().substring(0, 10) == new Date(request.createDate).toString().substring(0, 10)
      }))

      sethascall(days)

    }catch(e){
      console.log('failed to get schedule: ', e)
    }
    setloading(false)
  }

  const filter = (date)=>{
    setnow(date)
    setselected(requests.filter(request=>{
      return date.toString().substring(0, 10) == new Date(request.createDate).toString().substring(0, 10)
    }))
  }

  const respond = async (response, id)=>{
    try{
      let done = await API.respondRequest(response, id)
      if(done){
        getSchedule()
      }

      // console.log(done)
    }catch(e){
      console.log(e)
    }
  }

  const search = (text)=>{
    setquery(text)
    setfilteredusers(users.filter(user=>
        user.firstname.toLowerCase().includes(text.toLowerCase()) ||
        user.lastname.toLowerCase().includes(text.toLowerCase()) ||
        user.phone.toLowerCase().includes(text.toLowerCase()) ||
        user.email.toLowerCase().includes(text.toLowerCase())
      )
    )
  }

  const getPatients = async()=>{
    try{

      let users = await API.getPatients(' ')
      setfilteredusers(users)
      setusers(users)

    }catch(e){
      console.log('error fetching patients', e)
    }
  }

  useEffect(() => {
    getSchedule()
    getPatients()
    return () => {
      
    }
  }, [])
  
  return (
      <Layout style={{ flex: 1 }}>

        <Modal
          visible={newcall}
          backdropStyle={styles.backdrop}
          onBackdropPress={()=>{setquery(''); setfilteredusers(users); setnewcall(false);}}>
          <Card style={{width: Dimensions.get('screen').width-50}} disabled={true}>
            <Text category={'h6'} style={{margin: 10, textAlign: 'center'}}>Make Urgent Call to Patient</Text>
            
            <Input autoCapitalize={'none'} placeholder={'Search for patient...'} value={query} onChangeText={search}/>
            <FlatList
              data={filteredusers}
              style={{maxHeight: 200, marginVertical: 10}}
              keyExtractor={item=>item.email}
              renderItem={({item})=>{
                return <TouchableOpacity onPress={()=>{setnewcall(false); navigation.navigate('Urgent', {user: item})}}>
                  <View style={{marginVertical: 5}}>
                    <Text>{item.firstname} {item.lastname}</Text>
                    <Text appearance={'hint'} category={'c2'}>{item.email} &middot; {item.phone}</Text>
                    <Divider style={{marginTop: 5}}/>
                  </View>
                </TouchableOpacity>
              }}/>

            <Button status={'basic'} appearance={'ghost'} onPress={()=>{setquery(''); setfilteredusers(users); setnewcall(false);}}>
              Dismiss
            </Button>
          </Card>
        </Modal>

        <ScrollView>
          {/* <Text style={{margin: 10}} category='h4'>Calls</Text> */}
          <Calendar
            date={now}
            collapsable
            onSelect={filter}
            renderDay={DayCell}
            // min={new Date()}
            shouldRasterizeIOS
            style={{alignSelf: 'center', margin: 10}}
          />

          {
            (loading && <View style={{width: '100%'}}>
              <ActivityIndicator />
            </View>)
          }
          { selected.length > 0 ?
          <FlatList
            data={selected}
            keyExtractor={item=>item.id}
            renderItem={({item})=>{
              return <Reuse.call respond={respond} request={item} nav={navigation} />
            }}/>
            :
            <Text category={'s1'} style={{margin: 15, textAlign: 'center'}}>No scheduled consultations for selected date</Text>
          }
        </ScrollView>

          <Button onPress={()=>setnewcall(true)} style={{bottom: 15, right: 15, height: 50, width: 50, borderRadius: 50, position: 'absolute'}} accessoryLeft={CallIcon} />

      </Layout>
  );
}

export default Calls

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  value: {
    fontSize: 12,
    fontWeight: '400',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
});