import React, {useState} from 'react';
import { Image, SafeAreaView, TouchableOpacity } from 'react-native';
import * as Modals from '../components/modals'
import * as API from '../api';
import { Button, Icon, Input, Layout, Text } from '@ui-kitten/components';

export const Login = ({ navigation }) => {

    const [visible, setvisible] = useState(false)
    const [loading, setloading] = useState(false)
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [error, seterror] = useState()

    const togglePassword = ()=>{
        setvisible(!visible)
    }

    const login = async()=>{

        if(email.length < 10){
            seterror('Please enter a valid email address.')
            return
        }

        if(password.length < 6){
            seterror('Please enter a valid password.')
            return
        }

        setloading(true)

        try{
            let data = await API.login(email, password)
            setloading(false)
            if(data.success){
                navigation.replace('Main')
            }else{
                console.log(data)
                seterror(data.message)
            }
        }catch(e){
            setloading(false)
            seterror(e.message)
        }

    }

    const EyeIcon = (props) => (
        <TouchableOpacity onPress={togglePassword}><Icon {...props} name={visible ? 'eye-off-outline' : 'eye-outline'} /></TouchableOpacity>
    );

    return (
        <Layout style={{flex: 1}}>
            <SafeAreaView style={{ flex: 1 }}>
                { error != null ?
                <Modals.error visible={true} callback={()=>seterror(null)} message={error}/> : null }

                <Layout style={{ flex: 1, justifyContent: 'center' }}>
                    <Image source={require('../assets/logo.png')} style={{width: 200, height: 150, alignSelf: 'center'}} resizeMode={'contain'}/>
                    <Input size={'large'} value={email} onChangeText={setemail} style={{margin: 15}} placeholder={'Email address'}  label={'Email address'} autoCompleteType={'email'} keyboardType={'email-address'} autoCapitalize={'none'}/>
                    <Input size={'large'} value={password} secureTextEntry={true} onChangeText={setpassword} accessoryRight={EyeIcon} style={{marginHorizontal: 15}} placeholder={'Password'}  label={'Password'} autoCompleteType={'password'} keyboardType={'default'} autoCapitalize={'none'} secureTextEntry={!visible}/>
                    <TouchableOpacity style={{marginHorizontal: 15, alignSelf: 'flex-end', marginVertical: 10}}>
                        <Text status={'primary'}>Forgot password?</Text>
                    </TouchableOpacity>
                    <Button onPress={login} disabled={loading} size={'large'} style={{margin: 15}}>{loading ? 'Please wait...' : 'Login'}</Button>
                </Layout>
            </SafeAreaView>
        </Layout>
    );
};