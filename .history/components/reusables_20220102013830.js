import React, {useState} from 'react';
import * as API from '../api'
import { StyleSheet, View, Dimensions, Linking, Alert } from 'react-native'
import { TouchableOpacity } from 'react-native';
import { format, formatDistance, formatRelative, subDays, isBefore } from 'date-fns'
import { Button, Icon, Input, Layout, Card, Text, Modal, Avatar, Divider } from '@ui-kitten/components';
import {Image} from 'react-native-elements'
import Clipboard from '@react-native-clipboard/clipboard';

const BackIcon = (props) => (
    <Icon {...props} name='arrow-ios-back-outline'/>
);

const BellIcon = (props) => (
    <Icon {...props} name='bell-outline'/>
);

const LockIcon = (props) => (
    <Icon {...props} name='lock-outline'/>
);

export const header = ({title, nav, logout})=>{
    return (
        <>
        <Layout style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Layout style={{flexDirection: 'row', padding: 15, alignItems: 'center'}}>
                <Button onPress={()=>nav.goBack()} style={{height: 35, width: 35}} size={'small'} appearance={'outline'} accessoryLeft={BackIcon}></Button>
                <Text style={{marginStart: 10}} category={'h5'}>{title}</Text>
            </Layout>
            { logout ?
            <Button onPress={logout} style={{height: 35, width: 35, marginEnd: 15}} size={'small'} appearance={'outline'} accessoryLeft={LockIcon}></Button> : <></> }
        </Layout>
        <Divider/>
        </>
    )
}

export const chat = ({email, message, nav})=>{

    let date = formatDistance(new Date(message.time), new Date(), { addSuffix: true })
    //formatDistance(subDays(new Date(), 3), new Date(), { addSuffix: true })

    return (
        <TouchableOpacity onPress={()=>nav.navigate('Conversation', { user: message.email, name: message.name })}>
            <Layout level={'2'} style={{borderRadius: 5, marginHorizontal: 10, marginVertical: 5}}>
                <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>

                    {/* <View style={{height: '100%', width: 5, backgroundColor: 'green'}}/> */}

                    <Avatar style={{backgroundColor: '#f2f2f2'}} source={{uri: message.avatar}} size={'large'} shape={'round'} />
                    <View style={{flex: 1, marginStart: 10}}>
                        <Text style={{alignSelf: 'flex-end', fontSize: 10}} appearance={'hint'} category={'c1'}>{date}</Text>
                        <Text category={'label'} style={{marginVertical: 5}}>{message.name}</Text>
                        <Text category={'c1'} appearance={'hint'}>{ message.message.length > 50 ? message.message.substring(0, 50)+'...' : message.message }</Text>
                    </View>
                </View>
            </Layout>
        </TouchableOpacity>
    )

}

export const message = ({email, message, chat})=>{
    const [failedLoad, setfailedLoad] = useState(false);
    let date = formatRelative(new Date(message.createDate), new Date())

    return (
        // <Layout level={message.sender == email ? '4' : '3'} style={{ width: '80%', borderRadius: 15, alignSelf: message.sender == email ? 'flex-end' : 'flex-start', borderBottomRightRadius: message.sender == email ? 0 : 15, borderBottomLeftRadius: message.sender == email ? 15 : 0, padding: 10, marginHorizontal: 10, marginVertical: 5}}>
        //     <Text>{message.message}</Text>
        //     <Text style={{alignSelf: 'flex-end', fontWeight: '300'}} appearance={'hint'} category={'c2'}>{date}</Text>
        // </Layout>

        <Card onPress={()=>{
            console.log('clicked');
            try{
                if((chat.attachment == null || chat.attachment == 'undefined') || (chat.attachment).length < 3 ){
                    Alert.alert("Opening Attachment", "about opening a third party app to process attachments", [
                        {
                          text: 'Cancel',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel'
                        },
                        { text: 'Only Copy Text', onPress: () => Clipboard.setString(chat.message) }
                      ]);
                }else{
                    Alert.alert("Opening Attachment", "about opening a third party app to process attachment.", [
                        {
                          text: 'Cancel',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel'
                        },
                        { text: 'Proceed To Attachment', onPress: () => Linking.openURL(chat.attachment) },
                        { text: 'Only Copy Text', onPress: () => Clipboard.setString(chat.message) }
                      ]);
                }
                
            }catch(e){}


            chat.attachment != null && chat.file_type.includes('image') ?
            <View style={{flex: 1}}>
                <Image onError={()=>{console.log('e')}} PlaceholderContent={()=><ActivityIndicator size="large"/>} source={{uri: chat.attachment}} resizeMode={'contain'}/>
            </View>
            : null
        }} style={ chat.sender == email ? style.bubble_right : style.bubble_left}>
            {!(failedLoad) && chat.attachment != null && chat.file_type.includes('image') ? <Image source={{uri: chat.attachment}} onError={(e)=>{
                
                setfailedLoad(true)
            }} PlaceholderContent={()=><ActivityIndicator size="large"/>}  style={{width: width-150, height: 180, marginBottom: 10}} resizeMode={'cover'}/> : null }
            {((chat.attachment != null && chat.attachment != 'undefined') && (chat.attachment).length > 3) && !(chat.file_type.includes('image')) ? <Image source={require('../assets/imga.png')} onError={()=>{console.log('e')}} style={{width: width-150, height: 180, marginBottom: 10}} resizeMode={'cover'}/> : null }
            {(failedLoad) ? <Image source={require('../assets/failed.png')} style={{width: width-150, height: 180, marginBottom: 10}} resizeMode={'contain'}/> : null }
            <Text category={'p1'}>{chat.message}</Text>
            <Text category={'p2'} style={{ alignSelf: chat.sender == email ? 'flex-end' : 'flex-start' }} appearance={'hint'} >{date}</Text>
        </Card>
    )

}

export const notification = ({notification})=>{

    return (
        <Layout level={'2'} style={{marginVertical: 5, marginHorizontal: 10, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            
            <Button disabled style={{height: 20, width: 20, borderRadius: 20}} accessoryLeft={BellIcon}></Button>
            
            <View style={{flex: 1, marginStart: 10}}>
                <Text>This is the notification message.</Text>
                <Text appearance={'hint'} category={'c2'}>10:02 am</Text>
            </View>
        </Layout>
    )
}

export const call = ({request, nav, respond}) => {
    console.log(request)
    let date = new Date(request.createDate).toString().substring(4, 21)

    const change = ()=>{
        Alert.alert('Change Response?', 'You previously rejected this request, do want to change that?', [
            {
                text: 'Yes',
                onPress: ()=>respond('Accepted', request.id),
                style: 'default'
            },
            {
                text: 'No, Dismiss',
                onPress: ()=>{},
                style: 'cancel'
            }
        ])
    }

    return (
        <Layout level={'2'} style={{marginVertical: 5, marginHorizontal: 10, borderRadius: 5, padding: 15}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon fill={'grey'} style={{height: 15, width: 15, marginEnd: 5}} name={"star-outline"}/>
                <Text category={'s1'}>Consult with {request.patient.fullName}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
                <Icon fill={'grey'} style={{height: 20, width: 20, marginEnd: 5}} name={"video-outline"}/>
                <Text>{date} <Text status={'primary'}>Telemedicine: C0_{request.cid}</Text></Text>
            </View>

            { !isBefore(new Date(request.createDate), new Date()) ?
                <Divider/> : <></>
            }

            { true ? request.status == 'Pending' ?
            // { !isBefore(new Date(request.createDate), new Date()) ? request.status == 'Pending' ?

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Button appearance={'outline'} onPress={()=>respond('Accepted', request.id)} style={{flex: 1, marginEnd: 10}} size={'small'}>Accept</Button>
                <Button appearance={'outline'} onPress={()=>respond('Rejected', request.id)} status={'danger'} style={{flex: 1}} size={'small'}>Reject</Button>
            </View>
            : request.status == 'Accepted' ?

            <Button appearance={'outline'} onPress={()=>nav.navigate('VideoCall')} size={'small'}>Start Call</Button>

            : 

            <Button appearance={'outline'} status={'info'} onPress={()=>change()} size={'small'}>Change Response</Button>

            : <></>
            }

        </Layout>
    )
}

const width = Dimensions.get('screen').width

const style = StyleSheet.create({
    menu_card: {
        marginVertical: 15,
        marginHorizontal: 10,
        width: 180,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center'
    },
    doctor_card: {
        marginVertical: 15,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingVertical: 15
    },
    bubble_right: {
        width: width-100,
        alignSelf: 'flex-end',
        marginHorizontal: 15,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        marginVertical: 10,
        backgroundColor: '#f2f2f2'
    },
    bubble_left: {
        width: width-100,
        alignSelf: 'flex-start',
        marginHorizontal: 15,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 25,
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        marginVertical: 10
    }
})