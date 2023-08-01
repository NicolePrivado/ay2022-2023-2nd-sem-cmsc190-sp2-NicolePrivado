import React, { useState, useEffect, useRef} from 'react';
import { Text, StyleSheet, View, TextInput, Keyboard, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useToast } from "react-native-toast-notifications";
import useStore from '../components/UserHook'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Inquiry = ({navigation, route}) => {
    const [text, set_text] = useState("")
    const [isTextInputFocused, setTextInputFocused] = useState(false);
    const [inquiries, set_inquiries] = useState([]);
    const [page, set_page] = useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [empty, setEmpty] = useState("");
    const { user } = useStore()
    const textInputRef = useRef()
    const toast = useToast();
    
    useEffect(() => {
      setRefreshing(true)

      // Get all user's inquiries
      const get_inqs = async () => {
        fetch("https://uplb-cns-server.onrender.com/inquiry/own?user_id=" + user.id,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_inquiries(json.output)
                if(json.output.length === 0) setEmpty("No inquiries")
            }
            else{
                setEmpty("Failed to get inquiries")
            }
            setRefreshing(false)
        })
        .catch((e) => {
            setEmpty("Failed to get inquiries "+ e)
            setRefreshing(false)
        })
      }

      get_inqs()
      
    }, [page]);

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      setTimeout(() => {
          setRefreshing(false);
      }, 2000);
    }, []);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
          'keyboardDidHide',
          () => {
            if (isTextInputFocused) {
              // Remove the focus from TextInput
              textInputRef.current?.blur();
            }
          }
        );
    
        return () => {
          keyboardDidHideListener.remove();
        };
    }, [isTextInputFocused]);

    const add_inquiry = async() => {
      if(text !== ""){
        const inquiry = {
          content: text,
          user_id: user.id,
          name: user.name,
          email: user.email,
        }

        await fetch('https://uplb-cns-server.onrender.com/inquiry',{
        method:'POST',
        credentials:'include',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            inquiry
        })
        }).then((response) => {return response.json()})
        .then((json) => {
            if(json.success){
                toast.show("Your inquiry has been sent!",{ type: "success", placement: "bottom"}) 
                set_page(!page)
                set_text("")
                Keyboard.dismiss()
            }
            else toast.show(json.message,{ type: "danger", placement: "bottom"})
        })
        .catch(e => {
          toast.show(e.toString(),{ type: "danger", placement: "bottom"}) 
        })
      }
      else{
        toast.show("Inquiry cannot be empty",{ type: "danger", placement: "bottom"}) 
      }
    }

    // Helper function for date formatting
    function padTo2Digits(num) { 
      return num.toString().padStart(2, '0');
    }
    // Function for date formatting
    function format_date(date) { 
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return (
        [ date.getFullYear(),
          padTo2Digits(date.getMonth() + 1),
          padTo2Digits(date.getDate()),
        ].join('-') + ' ' + strTime
      );
    }

    const handleTextInputFocus = () => {
    setTextInputFocused(true);
    };

    const handleTextInputBlur = () => {
    setTextInputFocused(false);
    };

    const Card = ({content, date, replies}) => {
      return (
          <View style = { styles.card} >
            <Text style = { styles.card_content }>
              {content}
            </Text>
            <Text style = { styles.card_date }>
              {replies} replies, {date}
            </Text>
          </View>
        );
  }

  return(
      <View style = {styles.container}>
          <Text style = { styles.page_title }> 
                  INQUIRY
          </Text>
          <View style = {styles.input_container}>
          <TextInput
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) => set_text(text)}
              value={text}
              placeholder = 'Detailed inquiry here'
              placeholderTextColor = {'gray'}
              style = {styles.input}
              ref = {textInputRef}
              onFocus={handleTextInputFocus}
              onBlur={handleTextInputBlur} />
            <TouchableOpacity onPress={()=> add_inquiry()} style = {styles.send_btn}>
              <Text style = {styles.send_text}> <Icon name="send" size={15}/> Send </Text>
            </TouchableOpacity>
          </View>
          <Text style = { styles.section_title }> 
                  Your inquiries
          </Text>
          <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() =>{set_page(!page) ; onRefresh}} />}>
            {inquiries.length > 0 ?
            inquiries.map((data) => {
                if(!data.hidden){
                  return (
                    <TouchableOpacity key={data.id} onPress={()=> navigation.navigate('ViewInquiry', {id:data.id,inquiry: data})}> 
                          <Card content = {data.content} date = {format_date(new Date(data.timestamp))} replies = {data.reply_count}/>
                    </TouchableOpacity>
                  )
                }
            }): <Text style = {styles.empty}> {empty} </Text>}  
          </ScrollView>
      </View>
      
  );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: 30,
    },
    page_title:{
        top: 40,
        marginBottom: 10,
        fontSize: 25,
        fontFamily: "Segoe UI",
        color: 'rgb(0,86,63)'
    },
    input_container:{
        top: 50,
        width: '100%',
    },
    input:{
        width: '100%',
        borderWidth: 1,
        borderColor: 'gray',
        textAlignVertical: 'top',
        paddingVertical: 10,
        paddingHorizontal: 15,
        lineHeight: 20,
        fontFamily: 'Segoe UI',
        backgroundColor:'rgb(245,245,245)',
        color: 'rgb(80,80,80)'
    },
    send_btn: {
      alignSelf: 'flex-end',
      marginTop: 10,
      borderRadius: 3,
      backgroundColor: 'white',
      alignItems: 'center'
  },
  send_text:{
      color: 'rgb(0,86,63)',
      fontFamily: "Segoe UI",
  },
  section_title: {
    marginTop: 70,
    fontSize: 20,
    fontFamily: "Segoe UI",
    color: 'rgb(80,80,80)'
  },
  card:{
    marginTop: 10,
    padding: 15,
    backgroundColor: 'rgb(253, 253, 253)',
    borderRadius: 3,
    color: 'rgb(89,89,89)',
    borderWidth: 0.5,
    borderColor: 'gray'
  },
  card_content: {
      fontSize: 14,
      fontFamily: "Segoe UI",
      color: 'rgb(89,89,89)'
  },
  card_date: {
      textAlign: "right",
      marginTop: 8,
      fontSize: 12,
      fontFamily: "Segoe UI",
      color: 'rgb(180,180,180)'
  },
  empty: {
      fontFamily: "Segoe UI",
      color: 'rgb(80,80,80)',
  }
})

export default Inquiry;