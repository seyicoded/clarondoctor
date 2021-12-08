import React, { useEffect, useState } from 'react';
import * as Reuse from '../components/reusables'
import {Platform, TouchableOpacity, SafeAreaView } from 'react-native'
import { Dimensions, FlatList, RefreshControl, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Input, Layout, Text } from '@ui-kitten/components';
import { Image, SafeAreaView, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker'
import * as API from '../api';
import { ActivityIndicator } from 'react-native-paper';

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

    const attach = async () => {

        try{
            let document = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: true
            })

            let attached_files = []

            document.map(attached=>{
                if(attached.size/1024/1024 > 25){
                    seterror(`${attached.name} cannot be attached. Exceed the maximum upload size (25MB).`)
                }else{
                    attached_files.push(attached)
                }
            })

            setattachments(attached_files)    
            setattachmenttype(attached_files[0].type)
            setattachmentsize((attached_files[0].size/1024/1024).toFixed(2), 'MB')
            setattachment(attached_files[0])
        }catch(e){
            console.log(e)
        }
    }

    const send = async () => {

        if(message.length == 0){
            return 
        }

        try{

            let email = await AsyncStorage.getItem('_email')

            let sent = API.sendMessage({
                message: message.trim(),
                recipient: route.params.user,
                attachment: null,
                file_type: null,
                sender: email,
                symptoms: []
            })

            if(sent){
                setmessage('')
                startStream()
            }else{
                seterror('There was an error sending your message')
            }

        }catch(e){
            console.log('message sending failed: ', e)
        }

    }

    // sender, recipient, symptoms, message, attachment, file_type

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
            startStream()
            interval = setInterval(startStream, 10000)
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
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={startStream} />}
                        renderItem={({item})=><Reuse.message email={email} message={item}/>}/>

                    <Layout level={'2'} style={{bottom: 10, right: 10, left: 10, position: 'absolute'}}>
                        { attachment ?
                        ['image/jpg', 'image/png', 'image/jpeg'].includes(attachmenttype.toLowerCase()) ?
                        <>
                        <TouchableOpacity style={{alignSelf: 'flex-end', padding: 10}} onPress={()=>setattachment(null)}><Icon name="close-outline" style={{height: 20, width: 20}} fill={'grey'}/></TouchableOpacity>
                        <Image source={{ uri: attachment.uri }} style={{height: 300, width: Dimensions.get('screen').width}} resizeMode={'contain'} />
                        </> : <Text style={{margin: 10, flexDirection: 'row', alignItems: 'center'}} status={'primary'}>Attached: {attachment.name} <TouchableOpacity onPress={()=>setattachment(null)}><Icon name="trash-outline" style={{height: 15, width: 15}} fill={'red'}/></TouchableOpacity></Text> : null }
                        <Input accessoryLeft={AttachIcon} size={'large'} value={message} onChangeText={setmessage} placeholder={'type your reply here...'} accessoryRight={SendIcon} />
                    </Layout>
                </Layout>
            </SafeAreaView>
        </Layout>
    );
}

export default Conversation