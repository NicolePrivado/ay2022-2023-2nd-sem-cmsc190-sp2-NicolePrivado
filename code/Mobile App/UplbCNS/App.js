import React, { useEffect} from 'react';
import { ToastProvider } from 'react-native-toast-notifications'
import { useNetInfo } from "@react-native-community/netinfo"
import { Text, StyleSheet, View} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import SideDrawer from './components/SideDrawer';
import SplashScreen from 'react-native-splash-screen';
import useStore from './components/UserHook'
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

function App() {
  const set_token = useStore((state) => state.set_token)

  useEffect(() => {
    SplashScreen.hide()
    messaging().getToken(firebase.app().options.messagingSenderId).then((dev_token) => {
      set_token(dev_token)
    })
  }, )
  
  const netInfo = useNetInfo();
  return (
    <ToastProvider renderType={{
        in_app_notif: (toast) => {
          return(
            <View style={styles.notif_style}>
            <Text style= {styles.notif_title}>{toast.data.title}</Text>
            <Text style= {styles.notif_message}>{toast.message}</Text>
            </View>
          )}
        }}>
      <NavigationContainer theme = { light_theme }>
        <SideDrawer />
        {!netInfo.isConnected !== undefined && netInfo.isConnected === false?  
        <Text style = {styles.no_net}> No Internet Connection </Text> : "" }
      </NavigationContainer>
    </ToastProvider>
  );
}

const light_theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:'white'
  }
};

const styles = StyleSheet.create({
  no_net: {
    position: 'absolute',
    top: 0,
    textAlign: 'center',
    backgroundColor: 'rgba(255,0,0,0.3)',
    color: 'black',
    paddingVertical: 6,
    fontFamily: "Mulish-Medium",
    width: '100%',
  },
  notif_style: {
    padding: 15, 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: 'rgb(0,86,63)',
    width: '90%',
    borderRadius: 5,
    marginBottom: 10,
  },
  notif_title:{
    fontWeight: 'bold',
    color: 'rgb(0,86,63)'
  },
  notif_message:{
    color: 'rgb(80,80,80)'
  }
})

export default App;
