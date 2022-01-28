import React from 'react'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

export const getItem = async (key)=>{
    // return 'a';
    const val = storage.getString(key)
    return ((val != undefined) ? val: null)
}

export const setItem = async (key, value)=>{
    console.log(key+' '+value)
    storage.set((key).toString(), (value).toString())
    return true;
}

export const getAllKeys = async ()=>{
    // storage.set('test', 'tt1')
    // storage.set('tes2', 'tt1')
    // storage.set('tes3', 'tt1')
    return (storage.getAllKeys()).toString()
}

export const clear = async ()=>{
    storage.clearAll()
    return true
}

export const removeItem = async (key)=>{
    storage.delete(key)
    return true
}
