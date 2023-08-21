import React, { useEffect, useState } from 'react';import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import * as API from '../../api'
import * as Const from '../../constants'
import { StyleSheet, Dimensions, ScrollView, View, useColorScheme, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, Icon, Modal, Layout, Text, Input, Divider } from '@ui-kitten/components';

let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let items = []
let itemsDrug = []

const Manage = () =>{

  const [requestlab, setrequestlab] = useState(false)
  const [prescribe, setprescribe] = useState(false)
  const [filteredusers, setfilteredusers] = useState([])
  const [users, setusers] = useState([])
  const [cart, setcart] = useState([])
  const [patient, setpatient] = useState()
  const [earnings, setearnings] = useState(values.splice(new Date().getMonth()))
  const [bookings, setbookings] = useState(values.splice(new Date().getMonth()))
  const [wallet, setwallet] = useState(0.00)
  const [query, setquery] = useState('')

  const [total, settotal] = useState(null)
  const [isSending, setisSending] = useState(false)
  const [drugs, setdrugs] = useState([])
  const [filtereddrugs, setfiltereddrugs] = useState([])
  const [cartDrugs, setcartDrugs] = useState([])
  const [totalDrugs, settotalDrugs] = useState(null)
  const [queryDrugs, setqueryDrugs] = useState('')

  // console.log(bookings)

  const getSchedule = async ()=>{
    try{
      let requests = await API.getSchedule()
      let book = [], earn = []
      
      for(var x = 0; x <= new Date().getMonth(); x++){
        book.push(0)
        earn.push(0)
      }

      requests.forEach(request=>{
        book[new Date(request.createDate).getMonth()] += 1
        earn[new Date(request.createDate).getMonth()] += 50
      })

      setearnings(earn)
      setbookings(book)
      setwallet(requests.length*50)
    }catch(e){
      console.log('error fetching schedule', e)
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
    // setfilteredusers(users.filter(user=>
    //     user.firstname.toLowerCase().includes(text.toLowerCase()) ||
    //     user.lastname.toLowerCase().includes(text.toLowerCase()) ||
    //     user.phone.toLowerCase().includes(text.toLowerCase()) ||
    //     user.email.toLowerCase().includes(text.toLowerCase())
    //   )
    // )
    setfilteredusers(users.filter(user=>{
      return (user?.firstname?.toLowerCase()?.includes(text?.toLowerCase()) ||
      user?.lastname?.toLowerCase()?.includes(text.toLowerCase()) ||
      (user?.lastname + ' ' + user?.firstname)?.toLowerCase()?.includes(text.toLowerCase()) ||
      user?.phone?.toLowerCase()?.includes(text.toLowerCase()) ||
      user?.email?.toLowerCase()?.includes(text.toLowerCase()))
    }
    )
  )
  }

  const searchDrugs = (text)=>{
    setqueryDrugs(text)
    setfiltereddrugs(drugs.filter(user=>
        user.name.toLowerCase().includes(text.toLowerCase())
      )
    )
  }

  const processLab = async()=>{
    setisSending(true)
    const recipient = (patient.email)
    // console.log(users)
    var lab = [];
    items.map((item, index)=>{
      lab[index] = {
        name: item,
        qty: '1',
        unitprice: '0',
        charges: total
      };
    })

    try {
      const r = await API.sendRequestLab(recipient, lab)
      console.log(r)
      if(r.success){
        Alert.alert(r.message)
        setrequestlab(false)
        setpatient(null)
      }
    } catch (error) {
      
    }
    setisSending(false)


  }

  // send drug
  const processDrug = async()=>{
    setisSending(true)
    const recipient = (patient.email)
    // console.log(users)
    var lab = [];
    itemsDrug.map((item, index)=>{
      lab[index] = {
        name: item,
        qty: '1',
        unitprice: '0',
        charges: totalDrugs
      };
    })

    try {
      const r = await API.sendRequestDrug(recipient, lab)
      console.log(r)
      if(r.success){
        Alert.alert(r.message)
        setrequestlab(false)
        setprescribe(false)
        setpatient(null)
      }
    } catch (error) {
      
    }
    setisSending(false)


  }

  const tocart = (item)=>{

    if(items.includes(item.name)){
      items = items.filter(i=>i!=item.name)
      settotal(total-item.price)
    }else{
      items.push(item.name)
      settotal(total+item.price)
    }

    setcart(items)
    console.log(items)
  }

  const tocartDrugs = (item)=>{

    if(itemsDrug.includes(item.name)){
      itemsDrug = itemsDrug.filter(i=>i!=item.name)
      settotalDrugs(totalDrugs-item.price)
    }else{
      itemsDrug.push(item.name)
      settotalDrugs(totalDrugs+item.price)
    }

    setcartDrugs(itemsDrug)
    setdrugs([])
    setTimeout(()=> setdrugs(drugs), 100)
    console.log(itemsDrug)
  }

  const getDrugs = async ()=>{
    try{

      let drugs = await API.getDrugs()
      setfiltereddrugs(drugs)
      setdrugs(drugs)

      console.log('reach drug')
      console.log(drugs[0])

    }catch(e){
      console.log('error fetching patients', e)
    }
  }

  useEffect(() => {
    getSchedule()
    getPatients()
    getDrugs()
    return () => {
      
    }
  }, [])

  return (
      <Layout style={{ flex: 1}}>
        <Modal
          visible={requestlab}
          backdropStyle={styles.backdrop}
          onBackdropPress={()=>{setquery(''); setpatient(null); setfilteredusers(users); setrequestlab(false);}}>
          <Card style={{width: Dimensions.get('screen').width-50}} disabled={true}>
            <Text category={'h6'} style={{margin: 10, textAlign: 'center'}}>{ patient ? `Select Lab Test for ${patient.firstname}` : 'Search Patient'}</Text>
            
            { patient ?
              <>
                <FlatList
                  data={Const.tests}
                  style={{maxHeight: 200, marginVertical: 10}}
                  keyExtractor={(item, index)=>index}
                  renderItem={({item})=>{
                    return <TouchableOpacity onPress={()=>tocart(item)}>
                      <Layout level={cart.includes(item.name) ? '3' : '1'} style={{marginVertical: 5}}>
                        <Text>{item.name}</Text>
                        <Text appearance={'hint'} category={'c2'}>GHS {item.price}</Text>
                        <Divider style={{marginTop: 5}}/>
                      </Layout>
                    </TouchableOpacity>
                }}/>
                <Text />
                <Button disabled={isSending} onPress={()=>{processLab()}}>Send</Button>
              </>
              :
              <>
                <Input autoCapitalize={'none'} placeholder={'Search for patient...'} value={query} onChangeText={search}/>
                <FlatList
                  data={filteredusers}
                  style={{maxHeight: 200, marginVertical: 10}}
                  keyExtractor={item=>item.email}
                  renderItem={({item})=>{
                    return <TouchableOpacity onPress={()=>setpatient(item)}>
                      <View style={{marginVertical: 5}}>
                        <Text>{item.firstname} {item.lastname}</Text>
                        <Text appearance={'hint'} category={'c2'}>{item.email} &middot; {item.phone}</Text>
                        <Divider style={{marginTop: 5}}/>
                      </View>
                    </TouchableOpacity>
                  }}/>

                  {/* <Button></Button> */}
                </>
              }
            <Button status={'basic'} appearance={'ghost'} onPress={()=>{setquery(''); setpatient(null); setfilteredusers(users); setrequestlab(false);}}>
              Dismiss
            </Button>
          </Card>
        </Modal>

        <Modal
          visible={prescribe}
          backdropStyle={styles.backdrop}
          onBackdropPress={()=>{setquery(''); setpatient(null); setfilteredusers(users); setprescribe(false);}}>
          <Card style={{width: Dimensions.get('screen').width-50}} disabled={true}>
            <Text category={'h6'} style={{margin: 10, textAlign: 'center'}}>{ patient ? `Prescribe Drugs for ${patient.firstname}` : 'Search Patient'}</Text>
            
            { patient ?
              <>
                <Input autoCapitalize={'none'} placeholder={'Search for Drugs...'} value={queryDrugs} onChangeText={searchDrugs}/>
                <FlatList
                  data={filtereddrugs}
                  // data={filteredusers}
                  style={{maxHeight: 200, marginVertical: 10}}
                  keyExtractor={item=>item.email}
                  renderItem={({item})=>{
                    return <TouchableOpacity onPress={()=>tocartDrugs(item)}>
                      <Layout level={cartDrugs.includes(item.name) ? '3' : '1'} style={{marginVertical: 5}}>
                        <Text>{item.name}</Text>
                        <Text appearance={'hint'} category={'c2'}>GHS {item.unitprice}</Text>
                        <Divider style={{marginTop: 5}}/>
                      </Layout>
                    </TouchableOpacity>
                }}/>
                <Text />
                <Button disabled={isSending} onPress={()=>{processDrug()}}>Send</Button>
              </>
              :
              <>
                <Input autoCapitalize={'none'} placeholder={'Search for patient...'} value={query} onChangeText={search}/>
                <FlatList
                  data={filteredusers}
                  style={{maxHeight: 200, marginVertical: 10}}
                  keyExtractor={item=>item.email}
                  renderItem={({item})=>{
                    return <TouchableOpacity onPress={()=>setpatient(item)}>
                      <View style={{marginVertical: 5}}>
                        <Text>{item.firstname} {item.lastname}</Text>
                        <Text appearance={'hint'} category={'c2'}>{item.email} &middot; {item.phone}</Text>
                        <Divider style={{marginTop: 5}}/>
                      </View>
                    </TouchableOpacity>
                  }}/>
                </>
              }
            <Button status={'basic'} appearance={'ghost'} onPress={()=>{setquery(''); setpatient(null); setfilteredusers(users); setprescribe(false);}}>
              Dismiss
            </Button>
          </Card>
        </Modal>

        <ScrollView shouldRasterizeIOS showsVerticalScrollIndicator={false}>
          {/* <Text style={{margin: 10}} category='h4'>Manage</Text> */}

          <Button appearance={'outline'} onPress={()=>setrequestlab(true)} style={{marginHorizontal: 15, marginVertical: 10}}>Request Lab Test</Button>
          <Button appearance={'outline'} onPress={()=>setprescribe(true)} style={{marginHorizontal: 15}}>Prescribe Drugs</Button>

          {/* <Card style={{margin: 10}}>
            <Text style={{alignSelf: 'center'}}>Wallet Balance</Text>
            <Text style={{alignSelf: 'center', marginTop: 10}} category={'h4'}>GHS {wallet.toFixed(2)}</Text>
            <Text style={{alignSelf: 'center', marginBottom: 10}} appearance={'hint'} category={'c1'}>Last cashout Apr 19, 2021</Text>
            { wallet > 100 ?
              <Button appearance={'outline'}>Withdraw Funds</Button> : <></>
            }
          </Card> */}

          {/* <Text style={{margin: 10}} category='h6'>Earnings Overview</Text> */}
          {/* <BarChart
            data={{
              labels: months.slice(new Date().getMonth() > 6 ? new Date().getMonth()%6 : 0, new Date().getMonth()),
              datasets: [
                {
                  data: earnings.slice(new Date().getMonth() > 6 ? new Date().getMonth()%6 : 0, new Date().getMonth())
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={220}
            yAxisLabel="¢ "
            chartConfig={{
              backgroundColor: useColorScheme() === 'dark' ? "#222B45" : "#ffffff",
              backgroundGradientFrom: useColorScheme() === 'dark' ? "#222B45" : "#ffffff",
              backgroundGradientTo: useColorScheme() === 'dark' ? "#222B45" : "#ffffff",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(27, 204, 136, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(27, 204, 136, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "2",
                strokeWidth: "2",
                stroke: "#1BCC88"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              marginStart: -15
            }}
          /> */}

          <Text style={{margin: 15}} category='h6'>&nbsp;</Text>

          <Text style={{margin: 10}} category='h6'>Bookings Overview</Text>
          <BarChart
            data={{
              labels: months.slice(new Date().getMonth() > 6 ? new Date().getMonth()%6 : 0, new Date().getMonth()),
              datasets: [
                {
                  data: bookings.slice(new Date().getMonth() > 6 ? new Date().getMonth()%6 : 0, new Date().getMonth())
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={220}
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: useColorScheme() === 'dark' ? "#222B45" : "#ffffff",
              backgroundGradientFrom: useColorScheme() === 'dark' ? "#222B45" : "#ffffff",
              backgroundGradientTo: useColorScheme() === 'dark' ? "#222B45" : "#ffffff",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(27, 204, 136, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(27, 204, 136, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              marginStart: -25,
            }}
          />
        </ScrollView>

      </Layout>
  );
}

export default Manage

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});