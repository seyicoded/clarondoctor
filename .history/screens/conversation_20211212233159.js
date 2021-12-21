import React, { useEffect, useState } from 'react';
import * as Reuse from '../components/reusables'
import {Platform } from 'react-native'
import { Dimensions, FlatList, RefreshControl, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Input, Layout, Text } from '@ui-kitten/components';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker'
import * as API from '../api';
import firebase from 'firebase';
import {Image} from 'react-native-elements'
// import { ActivityIndicator } from 'react-native-paper';

let interval

const Conversation = ({navigation, route}) =>{
    
    const [email, setemail] = useState('')
    const [user, setuser] = useState()
    const [message, setmessage] = useState('')
    const [loading, setloading] = useState(true)
    const [conversation, setconversation] = useState([])
    const [attachment, setattachment] = useState()
    const [attachments, setattachments] = useState([])
    const [attachmenttype, setattachmenttype] = useState()
    const [attachmentsize, setattachmentsize] = useState()
    const [error, seterror] = useState()
    const [selected, setSelected] = useState()
    const [sendingNow, setsendingNow] = useState(false)
    const [sendingNowAA, setsendingNowAA] = useState(false)
    const [loadingChat, setloadingChat] = useState(false)

    const SendIcon = (props)=>{
        return (
            <TouchableOpacity onPress={send}>
                <Icon {...props} name="navigation-2-outline"/>
            </TouchableOpacity>
        )
    }

    const AttachIcon = (props)=>{
        return (
            <TouchableOpacity onPress={attach}>
                <Icon {...props} name="attach-outline"/>
            </TouchableOpacity>
        )
    }

    const LoadingIcon = (props) => (
        <ActivityIndicator {...props} color="green"></ActivityIndicator>
    );


    const attach = async () => {

        try{
            setsendingNowAA(true)
            let document = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: false
            })

            let attached_files = []

            document.map(attached=>{
                if(attached.size/1024/1024 > 25){
                    seterror(`${attached.name} cannot be attached. Exceed the maximum upload size (25MB).`)
                    setsendingNowAA(false)
                }else{
                    attached_files.push(attached)
                }
            })

            setattachments(attached_files)    
            setattachmenttype(attached_files[0].type)
            setattachmentsize((attached_files[0].size/1024/1024).toFixed(2), 'MB')
            setattachment(attached_files[0])
            setsendingNowAA(false)
        }catch(e){
            console.log(e)
            setsendingNowAA(false)
        }
    }

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

    const send = async () => {

        let url, type

        var messag = message;
        if(message.length == 0){
            messag = 'Media Attachment';
        }

        setsendingNow(true)

        if(attachment){
            type = attachment.type

            // adding
            // console.log(attachment)
            var path = getPlatformPath(attachment).value;
            var name = getFileName(attachment.name, path);
            // console.log(name+'--'+path);
            // return false;
            try{
                var blob = await uriToBlob(attachment.uri);
                let attached = await firebase.storage().ref(`new-attaches/${name}`).put(blob, {contentType: type})
                url = await firebase.storage().ref(`new-attaches`).child(name).getDownloadURL()
                console.log(url)
                // setsendingNow(false)
                // return false;
            }catch(e){
                console.log('*****')
                console.log(e)
            }
        }

        try{

            let email = await AsyncStorage.getItem('_email')

            let sent = API.sendMessage({
                message: messag.trim(),
                recipient: route.params.user,
                attachment: url,
                file_type: type,
                sender: email,
                symptoms: []
            })

            if(sent){
                setmessage('')
                setattachment(null)
                setloading(true)
                startStream()
            }else{
                seterror('There was an error sending your message')
            }

        }catch(e){
            console.log('message sending failed: ', e)
        }

        setsendingNow(false)

    }

    // sender, recipient, symptoms, message, attachment, file_type

    const chat_code = (patient, doctor)=>{
        return patient+'-'+doctor;
    }

    const loadfirebasechat = async()=>{
        // const from = await AsyncStorage.getItem('email');
        // setMe(from)
        console.log(chat_code(route.params.user, email))
        // console.log(email)
        firebase.firestore().collection('newSMessages').doc(chat_code(route.params.user, email)).collection('messages').orderBy('timeStamp', 'desc').onSnapshot(snapshot=>{
            var r = snapshot.docs.map(doc =>{
                return (doc.data())
                  
                // return {
                //     id: doc.id,
                //     data: (doc.data())
                //   }
              // check if data is thesame as uid
            //   if(my_data.uid != doc.id){
                
            //   }
              
            });
      
            // console.log('reach: ')
            console.log(r)
            setconversation(r)
            setloading(false)
            // setchat_record(r)
          }, error=>{
            console.log(error)
          });
    }

    const startStream = async ()=>{
        try{
            let data = await API.getConversation(route.params.user)
            setconversation(data)
            setTimeout(()=>{
                setloading(false)
            }, 3000)
        }catch(e){

        }
    }

    useEffect(() => {
        (async()=>{
            setemail(await AsyncStorage.getItem('_email'))
            await loadfirebasechat()
            // startStream()
            // interval = setInterval(startStream, 10000)
        })()
        return ()=>{
            clearInterval(interval)
        }
    }, [])

    return (
        <Layout style={{ flex: 1 }}>
            <SafeAreaView style={{flex: 1}}>
                <Layout style={{ flex: 1 }}>
                    <Reuse.header title={route.params.name} nav={navigation}/>

                    <FlatList
                        inverted
                        data={conversation}
                        keyExtractor={item=>item.id}
                        style={{marginBottom: 75}}
                        refreshing={loading}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadfirebasechat} />}
                        renderItem={({item})=><Reuse.message email={email} message={item} chat={item}/>}/>

                    <Layout level={'2'} style={{bottom: 10, right: 10, left: 10, position: 'absolute'}}>
                        { attachment ?
                        ['image/jpg', 'image/png', 'image/jpeg'].includes(attachmenttype.toLowerCase()) ?
                        <>
                        <TouchableOpacity style={{alignSelf: 'flex-end', padding: 10}} onPress={()=>setattachment(null)}><Icon name="close-outline" style={{height: 20, width: 20}} fill={'grey'}/></TouchableOpacity>
                        <Image source={{ uri: attachment.uri }} style={{height: 300, width: Dimensions.get('screen').width}} resizeMode={'contain'} />
                        </> : <Text style={{margin: 10, flexDirection: 'row', alignItems: 'center'}} status={'primary'}>Attached: {attachment.name} <TouchableOpacity onPress={()=>setattachment(null)}><Icon name="trash-outline" style={{height: 15, width: 15}} fill={'red'}/></TouchableOpacity></Text> : null }
                        <Input accessoryLeft={sendingNowAA ? LoadingIcon: AttachIcon} size={'large'} value={message} onChangeText={setmessage} placeholder={'type your reply here...'} accessoryRight={sendingNow ? LoadingIcon: SendIcon} />
                    </Layout>
                </Layout>
            </SafeAreaView>
        </Layout>
    );
}

export default Conversation