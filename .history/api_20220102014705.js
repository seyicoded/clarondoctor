import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios').default

let base_url = 'https://api.clarondoc.com'

//authenticate doctors into the app
export const getuserDetails = async () => {
    const email = await AsyncStorage.getItem('_email')
    const auth = await AsyncStorage.getItem('_accesstoken')
    let key = await AsyncStorage.getItem('_apikey')

    const response = await axios({
        method: 'GET',
        url: 'https://api.clarondoc.com/physicians/'+email,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth}`,
            'x-api-key': key
        },
        options: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    // console.log(response.data.physicianDetails)
    if(response.data.success){
        await AsyncStorage.setItem('user', JSON.stringify(response.data.physicianDetails))
    }

    return response.data;
}

//authenticate doctors into the app
export const userDetails = async (email, key, auth) => {
    const response = await axios({
        method: 'GET',
        url: 'https://api.clarondoc.com/physicians/'+email,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth}`,
            'x-api-key': key
        },
        options: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    console.log(response.data.physicianDetails)
    if(response.data.success){
        await AsyncStorage.setItem('user', JSON.stringify(response.data.physicianDetails))
    }
}

export const update_physician = async(data)=>{
    let key = await AsyncStorage.getItem('_apikey')
    let auth = await AsyncStorage.getItem('_accesstoken')
    const response = await axios.default.put('https://api.clarondoc.com/physicians/update',
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth}`,
                'x-api-key': key
            },
            options: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )

    return response.data
}

export const login = async (email, password)=>{

    let response

    try{

        let key = await AsyncStorage.getItem('_apikey')
        let res = await axios.post(`${base_url}/login?type=doctor`, {
            email,
            password
        },
        {
            headers:{
                'x-api-key': key
            }
        })

        response = res.data
        await AsyncStorage.setItem('_email', email)
        await AsyncStorage.setItem('_accesstoken', response.accessToken)
        await userDetails(email, key, response.accessToken)

    }catch(e){
        response = {
            success: false,
            message: e.response.data.message
        }
    }

    return response

}

// send message to patient
export const sendMessage = async (data) =>{
    try{

        let key = await AsyncStorage.getItem('_apikey')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.post(`${base_url}/chats`, data, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })

        return res.data.success

    }catch(e){
        console.log(e)
        return false
    }
}

// respond to consultation request
export const respondRequest = async (response, id)=>{
    try{
        console.log('reach for logger')
        let key = await AsyncStorage.getItem('_apikey')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.post(`${base_url}/physicians/consultations/confirm`, {
            availability: response,
            id
        }, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })

        console.log(res.data)
        return res.data.success
    }catch(e){
        return false
    }
}

// get all chats the doctor has
export const getChats = async ()=>{

    let data = []

    try{
        let key = await AsyncStorage.getItem('_apikey')
        let email = await AsyncStorage.getItem('_email')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.get(`${base_url}/chats/conversations/all/${email}`, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        res.data.chats.forEach(chat=>{

            let c

            if(chat.from.email == email){
                
                c = {
                    name: `${chat.to.firstname} ${chat.to.lastname}`,
                    message: chat.message,
                    time: chat.createDate,
                    avatar: chat.to.avatar,
                    email: chat.to.email,
                    id: chat.id
                }
            }else{
                c = {
                    name: `${chat.from.firstname} ${chat.from.lastname}`,
                    message: chat.message,
                    time: chat.createDate,
                    avatar: chat.from.avatar,
                    email: chat.from.email,
                    id: chat.id
                }
            }

            data.push(c)
        })
    }catch(e){
        console.log('chat fetch failed: ', e.response.data)
    }

    return data

}

// get patients
export const getPatients = async (query)=>{
    let data = []

    let s = query
    if(query == ' '){
        s = '%20'
    }

    try{
        let query = ' '
        let key = await AsyncStorage.getItem('_apikey')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.get(`${base_url}/search/users/${s}`, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        data = res.data.users
    }catch(e){
        console.log('patients fetch failed: ', e)
    }

    return data
}

// get messages from selected chat
export const getConversation = async (to)=>{

    let data = []

    try{
        let key = await AsyncStorage.getItem('_apikey')
        let email = await AsyncStorage.getItem('_email')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.get(`${base_url}/chats/conversations/between/${email}/and/${to}`, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        data = res.data.chats
    }catch(e){
        console.log('conversation fetch failed: ', e)
    }

    return data
}


// fetch notifications
export const getNotifications = async ()=>{

    let data = []

    try{
        let key = await AsyncStorage.getItem('_apikey')
        let email = await AsyncStorage.getItem('_email')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.get(`${base_url}/notifications/users/${email}`, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        data = res.data.notifications
        // console.log(data)
    }catch(e){
        // console.log(e)
        data = []
    }

    return data

}

// get doctor's schedule
export const getSchedule = async ()=>{

    let data = []

    try{
        let key = await AsyncStorage.getItem('_apikey')
        let email = await AsyncStorage.getItem('_email')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.get(`${base_url}/requests/physicians/consultations/physicians/${email}`, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        data = res.data.requests
    }catch(e){
        data = []
    }

    return data

}

// change status to online, offline or in meeting
export const changeStatus = async (status)=>{
    try{
        let key = await AsyncStorage.getItem('_apikey')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.put(`${base_url}/physicians/update/availability`, {
            availability: status
        }, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data.success
    }catch(e){
        return false
    }
}

// update fcm token for push notifications
export const updateFCMToken = async (fcm)=>{

    try{
        let key = await AsyncStorage.getItem('_apikey')
        let token = await AsyncStorage.getItem('_accesstoken')
        let res = await axios.post(`${base_url}/notifications/subscribe`, {
            token: fcm
        }, {
            headers: {
                'x-api-key': key,
                'Authorization': `Bearer ${token}`
            }
        })
        console.log(res.data)
        data = res.data
    }catch(e){
        console.log(e)
        data = null
    }

    return data

}

// get api key for authorization to all endpoints
export const getApiKey = async ()=>{

    try{
        let key = await AsyncStorage.getItem('_apikey')

        if(key == null){
            let res = await axios.post(`${base_url}/getAPIKey`, {
                email: 'developer@clarondoc.com',
                password: 'Basket012Ball'
            })
            let key = res.data.apiKey
            await AsyncStorage.setItem('_apikey', key)
        }
    }catch(e){
        console.log('api key fetch failed: ', e)
    }

}