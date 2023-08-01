import React, { useState, useEffect } from 'react';
import { Image, Text, StyleSheet, View, TouchableOpacity, BackHandler, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import { useToast } from "react-native-toast-notifications";
import { CLIENT_ID } from '@env'
import useStore from '../components/UserHook'
import auth from "@react-native-firebase/auth"

GoogleSignin.configure({
    webClientId: CLIENT_ID,
    offlineAccess: true,
})

const GoogleSignInPage = ({navigation,route}) => {
    const [Waiting1, setWaiting1] = useState(false);
    const [Waiting, setWaiting] = useState(false);
    const [Loading, setLoading] = useState(false);
    const set_user = useStore((state) => state.set_user)
    const toast = useToast();
    const { device_token } = useStore()

    useEffect(()=> {
        setWaiting1(true)
        setWaiting(true)
        const check_sign = async() => {
            if(await GoogleSignin.isSignedIn()){
                const curr_user = await GoogleSignin.getCurrentUser();
                const result = await get_user(curr_user.user)
                if(result) navigation.navigate('Announcements')
            }
            setWaiting(false)
        }
        check_sign()
        
    },[])

    BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
    });

    const get_user = async(user_details) => {

        return await fetch('https://uplb-cns-server.onrender.com/user/details',{
        method:'POST',
        credentials:'include',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            user_details,
            device_token
        })
        }).then((response) => {return response.json()})
        .then((json) => {
            if(json.data && json.data.fetched){
                set_user(json.data.user_info)
                return true
            }
            else return false
        })
    }

    const sign_in = async () => {
      setLoading(true)
      try {
        if(await GoogleSignin.isSignedIn()){
            await GoogleSignin.signOut();
            set_user(null)
        }
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        var user_details = userInfo.user
        var idToken = userInfo.idToken

        // Check if email is recognized
        var result = await get_user(user_details)
        if(result){
            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            // Sign-in the user with the credential
            await auth().signInWithCredential(googleCredential);
            // Navigate to announcements page
            setLoading(false)
            navigation.navigate('Announcements')
        }  
        else {
            setLoading(false)
            toast.show("Email is not recognized by UPLB Cashier's office",{
             type: "danger",
             placement: "bottom"}) 
        }


      } catch (error) {
        if(error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            toast.show("Google Play Services is not available.",{
                type: "danger",
                placement: "bottom"})
        } 
        else {
            toast.show("An error has ocurred: ", error,{
                type: "danger",
                placement: "bottom"})
        }
        setLoading(false)
      }
    };

    return(
        <View style = {styles.container}>
        
        <Image source = {{
            uri: "https://i.ibb.co/vc8XJrb/mobile-front.png",
        }} resizeMode='contain' style = {styles.app_logo} onLoad={() => {setWaiting1(false)}}/>
        { Waiting || Waiting1 ? 
        <ActivityIndicator  size={50} color="rgb(0,86,63)" style = {styles.waiting} />
        : <TouchableOpacity style={styles.signin_btn} onPress = {() => {sign_in()}}>
            <Image source={{
            uri: "https://i.ibb.co/j82DCcR/search.png",
            }} resizeMode='contain' style={styles.google_logo} />
            <Text style={styles.signin_text}>Sign in with Google</Text>
        </TouchableOpacity> }
        
        { Loading ? <ActivityIndicator  size={30} color="rgb(0,86,63)" style = {styles.loading}/>: ""}
        <Text style = {styles.footer}> Copyright © 2023. UPLB Cashier's Office. All rights reserved.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    app_logo: {
        flex: 1,
        top: '-25%',
        width: '50%',
    },
    google_logo: {
        flex:0.2,
        height: 23,
    },
    signin_btn: {
        paddingVertical: 7,
        borderRadius: 3,
        backgroundColor: 'white',
        width: '70%',
        borderWidth: 1,
        borderColor: 'gray',
        flexDirection:"row",
        alignItems:'center',
        justifyContent:'center',
        position: 'absolute',
        bottom: '40%'
    },
    signin_text:{
        paddingVertical: 8,
        fontSize: 17,
        color: 'rgb(80,80,80)',
        fontFamily: "Mulish-Medium",
        flex: 0.6
    },
    loading: {
        position: 'absolute',
        top: '40%'
    },
    waiting: {
        position: 'absolute',
        top: '50%'
    },
    footer:{
        bottom: 20,
        fontFamily: "Mulish-Medium",
        color: 'gray',
        fontSize: 12,
    }
});

export default GoogleSignInPage;