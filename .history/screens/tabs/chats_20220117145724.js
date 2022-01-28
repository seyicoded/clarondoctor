import React, { useEffect, useState } from 'react';
import * as Reuse from '../../components/reusables'
import * as Placeholder from '../../components/placeholders'
import { Alert } from 'react-native'
import { Icon, Layout, Text, Button, Modal, Card, Divider, Input } from '@ui-kitten/components';
import * as API from '../../api';
import { StyleSheet, Dimensions, FlatList, TouchableOpacity, View, RefreshControl } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AsyncStorage from '../../AsyncStorageCustom'

const ChatIcon = (props)=><Icon {...props} name="message-circle-outline"/>
let interval

const Chats = ({navigation}) =>{

  const [chats, setchats] = useState([])
  const [email, setemail] = useState()
  const [query, setquery] = useState('')
  const [filteredusers, setfilteredusers] = useState([])
  const [users, setusers] = useState([])
  const [newchat, setnewchat] = useState(false)
  const [loading, setloading] = useState(true)
  
  const startChat = (patient)=>{
    setnewchat(false)
    setquery('')
    setfilteredusers(users)
    navigation.navigate('Conversation', {user: patient.email, name: patient.firstname +' '+patient.lastname})
  }

  const fetchChats = async ()=>{
    try{
      let data = await API.getChats()
      setemail(await AsyncStorage.getItem('_email'))
      setchats(data)
      setloading(false)
      // console.log(data[0])
    }catch(e){
      console.log(e)
    }
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

  useEffect(() => {
    (async()=>{
      fetchChats()
      getPatients()
      interval = setInterval(fetchChats, 10000)
    })(()=>{
      clearInterval(interval)
    })
  }, [])

  return (
      <Layout style={{ flex: 1}}>
        
        <Modal
          visible={newchat}
          backdropStyle={styles.backdrop}
          onBackdropPress={()=>{setquery(''); setfilteredusers(users); setnewchat(false);}}>
          <Card style={{width: Dimensions.get('screen').width-50}} disabled={true}>
            <Text category={'h6'} style={{margin: 10, textAlign: 'center'}}>Start New Conversation</Text>
            
            <Input autoCapitalize={'none'} placeholder={'Search for patient...'} value={query} onChangeText={search}/>
            <FlatList
              data={filteredusers}
              style={{maxHeight: 200, marginVertical: 10}}
              keyExtractor={item=>item.email}
              renderItem={({item})=>{
                return <TouchableOpacity onPress={()=>startChat(item)}>
                  <View style={{marginVertical: 5}}>
                    <Text>{item.firstname} {item.lastname}</Text>
                    <Text appearance={'hint'} category={'c2'}>{item.email} &middot; {item.phone}</Text>
                    <Divider style={{marginTop: 5}}/>
                  </View>
                </TouchableOpacity>
              }}/>

            <Button status={'basic'} appearance={'ghost'} onPress={()=>{setquery(''); setfilteredusers(users); setnewchat(false);}}>
              Dismiss
            </Button>
          </Card>
        </Modal>

        { loading ?

        <>
          <Placeholder.chat/>
          <Placeholder.chat/>
          <Placeholder.chat/>
          <Placeholder.chat/>
        </>
        :
        <FlatList
          data={chats}
          refreshing={loading}
          keyExtractor={item=>item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchChats} />}
          renderItem={({item})=>{
            return <Reuse.chat email={email} nav={navigation} message={item}/>
          }}/>
        }

        <Button onPress={()=>setnewchat(true)} style={{bottom: 15, right: 15, height: 50, width: 50, borderRadius: 50, position: 'absolute'}} accessoryLeft={ChatIcon} />
      </Layout>
  );
}

export default Chats

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});