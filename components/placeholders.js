import * as React from 'react';
import { View } from 'react-native';
import { Layout, Avatar } from '@ui-kitten/components';

export const chat = ({message, nav})=>{

    return (
        <Layout level={'2'} style={{borderRadius: 5, marginHorizontal: 10, marginVertical: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
                <Avatar style={{backgroundColor: '#ffffff'}} size={'large'} shape={'round'} />
                <View style={{flex: 1, marginStart: 10}}>
                    <Layout level={'1'} style={{alignSelf: 'flex-end', width: 50, height: 8, borderRadius: 10}}></Layout>
                    <Layout level={'1'} style={{height: 15, width: '50%', marginVertical: 5, borderRadius: 15}}/>
                    <Layout level={'1'} style={{height: 10, width: '90%', borderRadius: 15}}/>
                    <Layout level={'1'} style={{height: 10, width: '90%', marginTop: 5, borderRadius: 15}}/>
                </View>
            </View>
        </Layout>
    )

}
