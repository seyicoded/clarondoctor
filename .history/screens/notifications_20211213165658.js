import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import * as Reuse from '../components/reusables'
import * as API from '../api';
import { Icon, Layout, Text } from '@ui-kitten/components';

const Notifications = ({navigation}) =>{
  
  const [notifications, setnotifications] = useState([])
  const [loading, setloading] = useState(true)

  const loadNotifications = async ()=>{
    try{
      setloading(true)
      let data = await API.getNotifications()
      setnotifications(data)
      console.log(data)

    }catch(e){

    }

    setloading(false)
  }

  useEffect(() => {
    (()=>{
      loadNotifications()
    })()
  }, [])

  return(
    <Layout style={{ flex: 1 }}>
      <SafeAreaView style={{flex: 1}}>
        <Layout style={{ flex: 1 }}>
          <Reuse.header nav={navigation} title={'Notications'}/>

          {loading ? 
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator color="green" />
            </View>
          :<></>
          }

          { notifications.length > 0 ?
          <FlatList data={notifications} keyExtractor={item=>item.id}
            renderItem={({item})=><Reuse.notification notification={item} />}
            /> : 
          <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text appearance={'hint'} category={'h5'}>No notifications.</Text>
          </Layout> }

        </Layout>
      </SafeAreaView>
    </Layout>
  );
}

export default Notifications