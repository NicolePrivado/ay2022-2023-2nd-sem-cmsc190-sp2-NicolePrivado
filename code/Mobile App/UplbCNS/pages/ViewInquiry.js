import React, { Fragment, useState, useEffect, useRef} from 'react';
import { Text, StyleSheet, View, TextInput, Keyboard, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useToast } from "react-native-toast-notifications";
import useStore from '../components/UserHook'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ViewInquiry = ({navigation,route}) => {
    const [text, set_text] = useState("")
    const [isTextInputFocused, setTextInputFocused] = useState(false);
    const [replies, set_replies] = useState([]);
    const [page, set_page] = useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [empty, setEmpty] = useState("No replies");
    const { user } = useStore()
    const { id, inquiry } = route.params
    const [inq,set_inq] = useState({})
    const textInputRef = useRef()
    const toast = useToast();

    useEffect(() => {
      //Get the inquiry
      fetch("https://uplb-cns-server.onrender.com/inquiry/one?id=" + id,
      {
          method: "GET",
          credentials:'include'
      })
      .then(response => {return response.json()})
      .then(json=>{
          if(json.success){
              set_inq(json.output)
          }
          setRefreshing(false)
      })
      .catch((e) => {})
    })
    
    useEffect(() => {
      // Get all inquiry's replies
      setRefreshing(true)
      fetch("https://uplb-cns-server.onrender.com/reply?id=" + inquiry.id,
      {
          method: "GET",
          credentials:'include'
      })
      .then(response => {return response.json()})
      .then(json=>{
          if(json.success){
              set_replies(json.output)
          }
          else{
              setEmpty("Failed to get replies")
          }
          setRefreshing(false)
      })
      .catch((e) => {
          setEmpty("Failed to get replies "+ e)
          setRefreshing(false)
      })
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

    const add_reply = async() => {
      if(text !== ""){
        const reply = {
          inquiry_id: id,
          body: text,
          name: user.name,
        }

        await fetch('https://uplb-cns-server.onrender.com/reply',{
        method:'POST',
        credentials:'include',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            reply
        })
        }).then((response) => {return response.json()})
        .then((json) => {
            if(json.success){
                toast.show("Your reply has been posted!",{ type: "success", placement: "bottom"}) 
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
        toast.show("Reply cannot be empty",{ type: "danger", placement: "bottom"}) 
      }
    }

    const handleTextInputFocus = () => {
    setTextInputFocused(true);
    };

    const handleTextInputBlur = () => {
    setTextInputFocused(false);
    };

    const Card1 = ({content, date}) => {
      return (
          <View style = { styles.card1} >
            <Text style = { styles.card_name }>
              Me:
            </Text>
            <Text style = { styles.card_content }>
              {content}
            </Text>
            <Text style = { styles.card_date }>
              {date}
            </Text>
          </View>
        );
    }

    const Card2 = ({name, content, date}) => {
      return (
          <View style = { styles.card2} >
            <Text style = { styles.card_name }>
              {name}: 
            </Text>
            <Text style = { styles.card_content }>
              {content}
            </Text>
            <Text style = { styles.card_date }>
              {date}
            </Text>
          </View>
        );
    }
    const CardMain = ({content, date, replies}) => {
      return (
          <View style = { styles.card_main} >
            <Text style = { styles.card_content }>
              {content !== undefined ? content: ""}
            </Text>
            <Text style = { styles.card_date }>
              {date  !== undefined && replies !== undefined? replies.toString() + " replies, " + date : "" }
            </Text>
          </View>
        );
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

    return(
        <View style = {styles.container}>
            
            <Text style = { styles.page_title }> 
                    MY INQUIRY
            </Text>
            <View style = {styles.input_container}>

            <CardMain content = {inq.content} date = {format_date(new Date(inq.timestamp))} replies = {inq.reply_count} />
            
            </View>
            <Text style = { styles.section_title }> 
                    Replies
            </Text>
            <TextInput
                multiline={true}
                numberOfLines={2}
                onChangeText={(text) => set_text(text)}
                value={text}
                placeholder = 'Write a reply'
                placeholderTextColor = {'gray'}
                style = {styles.input}
                ref = {textInputRef}
                onFocus={handleTextInputFocus}
                onBlur={handleTextInputBlur} />
              <TouchableOpacity onPress={()=> add_reply()} style = {styles.send_btn}>
                <Text style = {styles.send_text}> <Icon name="send" size={15}/> Send </Text>
              </TouchableOpacity>
            <ScrollView refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() =>{set_page(!page) ; onRefresh}} />}>
              {replies.length > 0 ?
              replies.map((data) => {
                  
                  return (
                      <Fragment key={data.id}>
                          {user.name && data.name === user.name ? 
                          <Card1 content = {data.body} date = {format_date(new Date(data.timestamp))} />
                          :<Card2 name = {data.name} content = {data.body} date = {format_date(new Date(data.timestamp))} />}
                      </Fragment>
                  )
                  
              }): <Text style = {styles.empty} >{empty} </Text>}  
            </ScrollView>
            <TouchableOpacity  onPress={()=>{navigation.navigate('Inquiry')}} style = {styles.back_icon}>
              <Icon name='keyboard-backspace' size= {30} style = {{color: 'rgb(80,80,80)'}}/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  container:{
      flex: 1,
      paddingHorizontal: 30,
  },
  page_title:{
    textAlign: 'center',
      top: 50,
      marginBottom: 10,
      fontSize: 25,
      fontFamily: "Mulish-Medium",
      color: 'rgb(0,86,63)'
  },
  input_container:{
      top: 30,
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
      fontFamily: 'Mulish-Medium',
      marginTop: 10,
      borderRadius: 50,
      backgroundColor: 'rgb(240, 240, 240)',
      color: 'rgb(80,80,80)'
    },
    send_btn: {
      alignSelf: 'flex-end',
      marginTop: 10,
      borderRadius: 3,
      backgroundColor: 'white',
      alignItems: 'center',
      marginBottom: 20,
  },
  send_text:{
      color: 'rgb(0,86,63)',
      fontFamily: "Mulish-Medium",
  },
  section_title: {
    marginTop: 50,
    fontSize: 20,
    fontFamily: "Mulish-SemiBold",
    color: 'rgb(80,80,80)'
  },
  card_main: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgb(253, 253, 253)',
    borderRadius: 3,
    color: 'rgb(89,89,89)',
    borderWidth: 1,
    borderColor: 'gray'
  },
  card1:{
    marginTop: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(240, 240, 240)',
    borderRadius: 50,
    color: 'rgb(89,89,89)',
    borderWidth: 0.5,
    borderColor: 'gray',
    width: '80%',
    alignSelf: 'flex-end',
    marginBottom: 5,
    marginRight: 1,

  },
  card2:{
    marginTop: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(253, 253, 253)',
    borderRadius: 50,
    color: 'rgb(89,89,89)',
    borderWidth: 0.5,
    borderColor: 'gray',
    width: '80%',
    marginBottom: 5,
    marginRight: 1,
  },
  card_name: {
    fontSize: 14,
      fontFamily: "Mulish-Bold",
      color: 'rgb(89,89,89)'
  }, 
  card_content: {
      fontSize: 14,
      fontFamily: "Mulish-Medium",
      color: 'rgb(89,89,89)'
  },
  card_date: {
      textAlign: "right",
      marginTop: 5,
      fontSize: 12,
      fontFamily: "Mulish-Medium",
      color: 'rgb(180,180,180)'
  },
  back_icon:{
    position: 'absolute',
    top: 52,
    left: 30,
    color: 'rgb(80,80,80)'
  },
  empty: {
    fontFamily: "Segoe UI",
    color: 'rgb(80,80,80)',
  }
})

export default ViewInquiry;