import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Footer = () => {
    
    return(
        <View style={styles.container}>
            <Text style = { styles.content }> 
                © UPLB Cashier’s Office   cash@uplb.edu.ph   (049) 536-3558
            </Text>  
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgb(141,20,54)',
        padding: 5,
        height: 30,
    },
    content: {
        textAlign: 'center',
        margin: 3,
        fontSize: 11,
        fontFamily: "Mulish-SemiBold",
        color: 'white',
    }
  });

export default Footer;