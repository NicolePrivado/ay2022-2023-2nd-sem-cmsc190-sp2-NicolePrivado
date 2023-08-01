import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItem,
    DrawerToggleButton
} from '@react-navigation/drawer';
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { useToast } from 'react-native-toast-notifications'
import { decryptData } from './Encryption';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import Icon from 'react-native-vector-icons/Ionicons';
import useStore from '../components/UserHook'
import Announcements from '../pages/Announcements';
import Notices from '../pages/Notices';
import Account from '../pages/Account';
import GoogleSignInPage from '../pages/GoogleSignInPage';
import Inquiry from '../pages/Inquiry';
import ViewInquiry from '../pages/ViewInquiry';

const Drawer = createDrawerNavigator();
  
const SideDrawer = () => {
    const [Loading, setLoading] = useState(false);
    const toast = useToast()

    PushNotification.configure({
        // Called when a notification is received 
        onNotification: function (notification) {
            // In-app notifications
            notification.data.body = decryptData(notification.data.body)
            if(notification.data.title && notification.data.body){
                toast.show(notification.data.body, {
                    data : { title: notification.data.title },
                    type: 'in_app_notif',
                    duration: 10000,
                    placement: 'top',
                })
            }
            //(required) Called when a remote is received or opened, or local notification is opened
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        },
    });

    const CustomDrawerContent = (props) => {
    
        const { user } = useStore()
        const set_user = useStore((state) => state.set_user)
    
        return (
            <DrawerContentScrollView {...props}>
                {user !== null ?
                <TouchableOpacity style = {styles.img_container} onPress = { () => {
                        props.navigation.navigate('Account');
                        }}>
                    <Image  source = {{uri: user.photo}} style = {styles.account_img} /> 
                    <Text style = {styles.name_text}> {user.name} </Text>
                </TouchableOpacity> : ""}
                <View style = {styles.menu_container}>
                    <View style = {{padding: 25 }}>
                    <DrawerItem
                        style = {styles.drawer_item}
                        icon = {() => <Icon name="megaphone" size={20} style = {{color: 'rgb(80,80,80)'}}/>}
                        label="Announcements"
                        labelStyle = {styles.drawer_label}
                        onPress = {() => {
                        props.navigation.navigate('Announcements');
                        }}
                    />
                    </View>
                    <View style = {{ padding: 25 }}>
                    <DrawerItem
                        style = {styles.drawer_item}
                        icon = {() => <Icon name="md-notifications" size={20} style = {{color: 'rgb(80,80,80)'}}/>}
                        label = "Notices"
                        labelStyle = {styles.drawer_label}
                        onPress = { () => {
                        props.navigation.navigate('Notices');
                        }}/>
                    </View>
                    <View style = {{ padding: 25 }}>
                    <DrawerItem
                        style = {styles.drawer_item}
                        icon = {() => <Icon name="send" size={19} style = {{color: 'rgb(80,80,80)'}}/>}
                        label = "Inquiry"
                        labelStyle = {styles.drawer_label}
                        onPress = { () => {
                        props.navigation.navigate('Inquiry');
                        }}/>
                    </View>
                    <View style = {{ padding: 25 }}>
                    </View>
                    <View style = {{flex:1, padding: 50}}></View>
                    <View style = {{ padding: 25 }}>
                    <DrawerItem
                        style = {styles.drawer_item}
                        icon = {() => <Icon name="exit" size={20} color= 'rgb(141,20,54)'/>}
                        label = "Logout"
                        labelStyle = {[styles.drawer_label, { color: 'rgb(141,20,54)' }]}
                        onPress = {async() => {
                            setLoading(true)
                            if(await GoogleSignin.isSignedIn()){
                                await GoogleSignin.signOut();
                                // Remove device token on user

                                await fetch('https://uplb-cns-server.onrender.com/user/logout',{
                                method:'POST',
                                credentials:'include',
                                headers:{
                                    'Content-Type':'application/json'
                                },
                                body: JSON.stringify({
                                    id: user.doc_id,
                                })
                                }).then((response) => {return response.json()})
                                .catch((e) => {console.log(e)})

                                // Remove user info on app's state
                                set_user(null)
                            }
                            setLoading(false)
                        props.navigation.navigate('GoogleSignInPage');
                        }}/>
                    </View>
                </View>
            </DrawerContentScrollView>
        );
    }

    return (
        <>
        <Drawer.Navigator 
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            initialRouteName = 'GoogleSignInPage'
            
            screenOptions={{
                drawerPosition: 'right',
                swipeEnabled: false,
                headerTransparent:true,
                headerLeft: () => { return false},
                headerRight: () => <DrawerToggleButton tintColor = 'rgb(89,89,89)' /> 
            }}>
        <Drawer.Screen 
            name = "GoogleSignInPage" 
            component={GoogleSignInPage} 
            options = {{
            headerShown : false, unmountOnBlur: true}} />
        <Drawer.Screen 
            name="Announcements" 
            component = { Announcements } 
            options = {{ headerTitleStyle: {color: 'white'}, unmountOnBlur: true}} />
        <Drawer.Screen 
            name = "Notices" 
            component={Notices} 
            options = {{ headerTitleStyle: {color: 'white'}, unmountOnBlur: true}} />
        <Drawer.Screen 
            name = "Account" 
            component={Account} 
            options = {{ headerTitleStyle: {color: 'white'}, unmountOnBlur: true}} />
        <Drawer.Screen 
            name = "Inquiry" 
            component={Inquiry} 
            options = {{ headerTitleStyle: {color: 'white'}, unmountOnBlur: true}}/>
        <Drawer.Screen 
            name = "ViewInquiry" 
            component={ViewInquiry} 
            options = {{ headerTitleStyle: {color: 'white'}, unmountOnBlur: true}}/>
        
        </Drawer.Navigator>
        { Loading ? <ActivityIndicator  size={30} color="rgb(0,86,63)" style = {styles.loading}/>: ""}
        </>
    );
}

const styles = StyleSheet.create({
    menu_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginTop: 45,
    },
    img_container:{
        flexDirection: 'row',
        left: 20,
        top: 20,
    },
    account_img: {
        resizeMode: 'contain',
        borderRadius: 150,
        height: 30,
        width: 30,
    },
    name_text:{
        color: 'rgb(0,86,63)', 
        fontFamily: "Segoe UI Bold", 
        fontSize: 18,
        marginLeft: 10,
        paddingTop: 5
    },
    drawer_item:{
        position: 'absolute',
        left: 0,
        width: '100%',
        height: "auto",
    },
    drawer_label:{
        color: 'rgb(89,89,89)', 
        fontFamily: "Segoe UI", 
        fontSize: 17,
        left: -17
    },
    loading: {
        position: 'absolute',
        alignSelf: 'center',
        top: '35%'
    },
    toast:{
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'rgb(0,86,63)',
        width: '80%',
        padding: 20,
    },
    toast_text:{
        color: 'rgb(80,80,80)'
    }

});

export default SideDrawer;