import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

export default function WelcomeScreen() {
    const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
        <View>
            <Text style={styles.text1}>icon</Text>
        </View>
    <TouchableOpacity 
    onPress={()=>navigation.navigate('Home')}
    style={styles.button} 
    activeOpacity={50}>
        <Text style={styles.btnText}>Get Started</Text>
    </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container:{
      flex:1,
      justifyContent:'space-around',
      backgroundColor:'#fff',
    },
    text1:{
        fontSize:100,
        alignItems:'center',
        color:'#000fff',
        fontWeight:'bold'
    },
    button:{
        backgroundColor:'#aaaaaa',
        marginHorizontal:40,
        alignItems:'center',
        paddingVertical:12,
        paddingHorizontal:2,
        borderRadius:15
    },
    btnText:{
       fontWeight:'bold',
       fontSize:20,
       color:'#000'
    }
})