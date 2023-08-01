import * as React from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import useStore from '../components/UserHook'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Account = () => {
    const { user } = useStore()
    return(
        <View style = {styles.container}>
            {user !== null ? 
            <View style = {styles.img_container}>
                <Image  source = {{uri: user.photo}} style = {styles.account_img} /> 
            </View>
            :<Icon name='account-circle' style = {styles.account_icon} size = {100}/>}
            <Text style = { styles.page_title }> 
                    ACCOUNT DETAILS
            </Text>
            <View style = {styles.details_container}>
                <Text style = {styles.desc}>NAME</Text>    
                <Text style = {styles.details}>{user !== null? user.name: "---"}</Text>  
                <Text style = {styles.desc}>ACCOUNT NUMBER</Text>    
                <Text style = {styles.details}>{user !== null?  user.account_number: "---"}</Text>
                <Text style = {styles.desc}>MOBILE NUMBER</Text>    
                <Text style = {styles.details}>{user !== null?  user.mobile_number: "---"}</Text>
                <Text style = {styles.desc}>EMAIL</Text>    
                <Text style = {styles.details}>{user !== null?  user.email: "---"}</Text>   
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: 30
    },
    img_container:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        top: 70,
    },
    account_img: {
        resizeMode: 'contain',
        borderRadius: 150,
        height: 100,
        width: 100,
    },
    account_icon: {
        top: 70,
        textAlign: 'center',
        color: 'rgb(0,86,63)'
    },
    page_title:{
        textAlign: 'center',
        top: 85,
        marginBottom: 10,
        fontSize: 25,
        fontFamily: "Mulish-Medium",
        color: 'rgb(0,86,63)'
    },
    details_container: {
        top: 120
    },
    desc:{
        fontFamily: "Mulish-Medium",
        color: 'rgb(180,180,180)',
        fontSize: 12
    },
    details: {
        fontFamily: "Mulish-Medium",
        fontSize: 17,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        paddingTop: 5,
        paddingBottom: 8,
        color: 'rgb(80,80,80)',
    }
})

export default Account;