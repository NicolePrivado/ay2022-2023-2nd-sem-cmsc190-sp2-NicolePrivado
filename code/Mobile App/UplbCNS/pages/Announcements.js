import React, { Fragment, useState, useEffect } from 'react';
import { 
    RefreshControl,
    ScrollView, 
    View, 
    Text, 
    StyleSheet 
} from 'react-native';
import Footer from '../components/Footer';
import useStore from '../components/UserHook'

const Announcements = () => {
    const[announcements, set_announcements] = useState([]);
    const[page, set_page] = useState(false);
    const[refreshing, setRefreshing] = React.useState(false);
    const[empty, setEmpty] = useState("");
    const { user } = useStore()

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
      }, []);

    const Card = ({title, content, date}) => {
        return (
            <View style = { styles.card} >
              <Text style= { styles.card_title }>
                {title}
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

    useEffect(()=>{
        // Get all announcements
        setRefreshing(true)
        fetch("https://uplb-cns-server.onrender.com/announcement?order=desc",
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                var list = json.output.filter((ann) => {
                    return(
                        ann.hidden !== 1
                    )
                })
                set_announcements(list)
                if(list.length === 0) setEmpty("No announcements posted")
            }
            else{
                setEmpty("Failed to get announcements")
            }
            setRefreshing(false)
        })
        .catch(() => {
            setEmpty("Failed to get announcecements")
            setRefreshing(false)
        })

    },[page])

    return(
        <View style = { { flex: 1 }}>
            <View style = { styles.container }>
                {user !== null?
                <Text style = { styles.greetings }> 
                     Good day, { user.givenName }!
                </Text>  
                : <Text style = { styles.greetings }> 
                    Good day!
                </Text>}
                <Text style = { styles.page_title }> 
                    Announcements
                </Text>
                <ScrollView refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() =>{set_page(!page) ; onRefresh}} />}>
                    {announcements.length > 0 ?
                    announcements.map(({id, title, body, datetime, hidden}) => {   
                        if(!hidden){
                            return (
                                <Fragment key={id}>
                                    <Card title = {title} content = {body} date = {datetime} />
                                </Fragment>
                            )
                        }
                    }): <Text style = {styles.empty}> {empty} </Text>}  
                </ScrollView>
            </View>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        marginLeft: 35,
        marginRight: 35,
        textAlign: 'left',
        height: '85%' 
    },
    greetings: {
        fontSize: 25,
        fontFamily: "Segoe UI",
        color: 'rgb(89,89,89)'
    },
    page_title:{
        marginTop: 20,
        marginBottom: 10,
        fontSize: 22,
        fontFamily: "Segoe UI",
        color: 'rgb(0,86,63)'
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
    card_title: {
        fontSize: 16,
        fontFamily: "Segoe UI",
        color: 'rgb(89,89,89)',
    },
    card_content: {
        marginTop: 8,
        fontSize: 13,
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
});

export default Announcements;