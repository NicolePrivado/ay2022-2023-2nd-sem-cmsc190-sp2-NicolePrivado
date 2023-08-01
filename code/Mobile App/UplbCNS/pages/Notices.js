import React, { Fragment, useState, useEffect, useRef } from 'react';
import { 
    RefreshControl,
    ScrollView, 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    TextInput
} from 'react-native';
import { subYears } from 'date-fns';
import { Calendar} from 'react-native-calendars';
import useStore from '../components/UserHook'
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/EvilIcons'

const Notices = () => {
    const [notices_orig, set_notices_orig] = useState([]);
    const [notices, set_notices] = useState([]);
    const [page, set_page] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [show_calendar1, set_show_calendar1] = useState(false);
    const [show_calendar2, set_show_calendar2] = useState(false);
    const [empty, setEmpty] = useState("");
    const [isTextInputFocused, setTextInputFocused] = useState(false);
    const [key, set_key] = useState("");
    const [selected1, setSelected1] = useState("");
    const [selected2, setSelected2] = useState("");
    const { user } = useStore()
    const textInputRef = useRef()

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
      }, []);

    const Card = ({name, amount, date_credit, particular}) => {
        var date = new Date(date_credit)
        return (
            <View style = { styles.card} >
              <Text style= { styles.card_title }>
              <Text style={{color: 'rgb(0,86,63)'}}>P{amount}</Text> - {particular.charAt(0).toUpperCase() + particular.substr(1).toLowerCase()}
              </Text>
              <Text style = { styles.card_content }>
              From: UPLB Cashier's Office
              </Text>
              <Text style = { styles.card_date }>
                {date.toDateString()}
              </Text>
            </View>
          );
    }

    useEffect(()=>{
        if(notices_orig.length > 0){
            set_notices([])
            setRefreshing(true);
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            var [month, day, year] = selected1.split(' ');
            var monthIndex = months.indexOf(month) + 1
            var date1 = new Date(`${year}-${monthIndex}-${day}`);
            date1.setDate(date1.getDate()-1)
            var [month, day, year] = selected2.split(' ');
            var monthIndex = months.indexOf(month) + 1
            var date2 = new Date(`${year}-${monthIndex}-${day}`);
            var noticelist = notices_orig.filter(function (notice) {
                return new Date(notice.date_credit).getTime() >= date1.getTime() &&
                    new Date(notice.date_credit).getTime() <= date2.getTime() &&
                    notice.particular.toLowerCase().includes(key.toLowerCase());
            });
            set_notices(noticelist)
            setRefreshing(false);
        }
    },[key, selected1, selected2])

    useEffect(()=>{
        var start = subYears(new Date(), 1);
        start.setDate(start.getDate() - 1)
        var date1 = subYears(new Date(), 1).toDateString().split(" ")
        date1.shift()
        var date2 = new Date().toDateString().split(" ")
        date2.shift()
        
        setSelected1(date1.join(" "))
        setSelected2(date2.join(" "))

        set_notices([])
        setRefreshing(true);
        //Get all my notices
        fetch("https://uplb-cns-server.onrender.com/notice/user?acc_num=" + user.account_number + "&start=" + start,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_notices_orig(json.output)
                set_notices(json.output)
                if(json.output.length === 0) setEmpty("No notices")
            }
            else{
                setEmpty("Failed to get notices")
            }
            setRefreshing(false)
        })
        .catch(() => {
            setEmpty("Failed to get notices")
            setRefreshing(false)
        })
    },[page])

    const handleTextInputFocus = () => {
        setTextInputFocused(true);
    };

    const handleTextInputBlur = () => {
        setTextInputFocused(false);
    };

    return(
        <View style = { { flex: 1 }}>
            <View style = { styles.container }>
                <Text style = { styles.page_title }> 
                    Notices <Text style = {{fontFamily: "Mulish-SemiBold", color: 'gray', fontSize: 15}} >{notices.length}</Text>
                </Text>
                <Text style = { styles.note }> 
                    For the last 12 months
                </Text>
                <TextInput
                    onChangeText={(k) => {
                        set_key(k)
                        }}
                    value={key}
                    placeholder = 'Search by particular'
                    placeholderTextColor = {'gray'}
                    style = {styles.input}
                    ref = {textInputRef}
                    onFocus={handleTextInputFocus}
                    onBlur={handleTextInputBlur} />
                <View style = {styles.date_range}>
                    <TouchableOpacity style = {styles.date} onPress={()=> {set_show_calendar1(!show_calendar1); set_show_calendar2(false)}}>
                        <Text style = {{color: 'rgb(80,80,80)', fontFamily: "Segoe UI",}}>{selected1}  </Text> 
                        <View style = {{position: 'absolute', right: 7}}><Icon name = "calendar" size = {25} style = {{color: 'rgb(80,80,80)'}}/></View>
                    </TouchableOpacity>
                    <Icon name = "arrow-right" size= {30} style = {{alignSelf: 'center', color: 'rgb(80,80,80)'}}/>
                    <TouchableOpacity style = {styles.date} onPress={()=> {set_show_calendar2(!show_calendar2); set_show_calendar1(false)}}>
                        <Text style = {{color: 'rgb(80,80,80)', fontFamily: "Segoe UI",}}>{selected2}</Text>
                        <View style = {{position: 'absolute', right: 7}}><Icon name = "calendar" size = {25} style = {{color: 'rgb(80,80,80)'}}/></View>
                    </TouchableOpacity>
                </View>
                <ScrollView refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() =>{set_page(!page) ; onRefresh}} />}>
                    {!refreshing && notices.length > 0 ?
                        notices.map((data) => {
                            return (
                                <Fragment key = {data.id}>
                                    <Card name = {data.registered_name} amount = {data.amount} particular = {data.particular} date_credit = {data.date_credit} />
                                </Fragment>
                            )
                    })
                    : refreshing && notices.length === 0? ""
                    : <Text style = {styles.empty}>{empty}</Text>}  
                </ScrollView>
                { show_calendar1 ? 
                    <View style = {styles.calendar1}>
                    <Calendar
                        style = {{elevation: 10,}}
                        onDayPress={day => {
                            var date = new Date(day.dateString).toDateString().split(" ")
                            date.shift()
                            setSelected1(date.join(" ")); 
                            set_show_calendar1(false);
                        }}
                        markedDates={{
                            [selected1]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
                        }}
                    />
                </View>
                : ""}
                {show_calendar2 ? <View style = {styles.calendar2}>
                    <Calendar
                        style = {{elevation: 10,}}
                        onDayPress={day => {
                            var date = new Date(day.dateString).toDateString().split(" ")
                            date.shift()
                            setSelected2(date.join(" ")); 
                            set_show_calendar2(false);
                        }}
                        markedDates={{
                            [selected2]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
                        }}
                    />
                </View>
                : ""}
                
            </View>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginLeft: 35,
        marginRight: 35,
        textAlign: 'left',
        height: '85%' 
    },
    page_title:{
        marginTop: 10,
        fontSize: 22,
        fontFamily: "Segoe UI",
        color: 'rgb(0,86,63)'
    },
    note:{
        marginTop: 0,
        marginBottom: 10,
        fontSize: 15,
        fontFamily: "Segoe UI",
        color: 'rgb(89,89,89)',
        fontStyle: 'italic'
    },
    card:{
        marginTop: 10,
        padding: 15,
        backgroundColor: 'rgb(248, 248, 248)',
        borderRadius: 5,
        color: 'rgb(89,89,89)',
        borderWidth: 0.5,
        borderColor: 'gray'
    },
    card_title: {
        fontWeight: '600',
        fontFamily: "Segoe UI",
        color: 'rgb(89,89,89)',
    },
    card_content: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: "Segoe UI",
        color: 'rgb(120,120,120)',
        
    },
    card_date: {
        textAlign: "right",
        fontSize: 12,
        fontFamily: "Segoe UI",
        color: 'rgb(89,89,89)'
    },
    calendar1:{
        position: 'absolute',
        top: 160,
    },
    calendar2:{
        position: 'absolute',
        top: 160,
        right: 0
    },
    date_range: {
        position: 'relative',
        flexDirection: 'row', 
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 15,
        
    },
    date:{
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        width: '45%',
        justifyContent: 'center',
    },
    input: {
        color: 'rgb(80,80,80)',
        backgroundColor: 'rgb(248,248,248)',
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: 'gray',
        paddingHorizontal: 15,
        paddingVertical: 7,
        fontFamily: "Segoe UI",
        marginBottom: 10,
    },
    empty: {
        fontFamily: "Segoe UI",
        color: 'rgb(80,80,80)',
    }

});

export default Notices;
