/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
const MED_AUTH_TOKEN =process.env.MED_AUTH_TOKEN;

const HomeScreen = () => {
  const [sessionID, setSessionID] = useState('');
  const [messages, setMessages] = useState('');
  const [result, setResult] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const ScrollViewRef = useRef();

  const speechStartHandler = (e) => {
    console.log('speech start handler', e);
  };

  const speechEndHandler = () => {
    setRecording(false);
    console.log('speech stop handler');
  };

  const speechResultsHandler = (e) => {
    console.log('voice Event', e);
    const text = e.value[0];
    setResult(text);
  };

  const speechErrorHandler = (e) => {
    console.log('speech error: ', e);
  };

  const startRecording = async () => {
    setRecording(true);
    try {
      await Voice.start('en-GB'); // en-us
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setRecording(false);
    } catch (error) {
      console.log(error);
    }
  };
  const spinValue = new Animated.Value(0);

  const startRotationAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };
  const initializeSession = async () => {
    try {
      const response = await axios.post(
        'https://medagentv1.excelus.ai/initialise',
        {
          session_id: '',
        },
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${MED_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { session_id, agent_response } = response.data.details;
      setSessionID(session_id);

      setMessages([
        { role: 'assistant', content: agent_response },
      ]);
    } catch (error) {
      console.error('Error initializing session:', error);
    }finally {
      setLoading(false);
    }
  };
  const send = async () => {
    fetchResponse();
    if (result.trim().length > 0) {
      try {
        const response = await axios.post(
          'https://medagentv1.excelus.ai/chat',
          {
            session_id: sessionID,
            human_message: result.trim(),
          },
          {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${MED_AUTH_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const assistantMessage = response.data.details.agent_response;
        let newMessages = [...messages];
        newMessages.push({ role: 'user', content: result.trim() });
        newMessages.push({ role: 'assistant', content: assistantMessage });
        setMessages(newMessages);
        startTextToSpeech(newMessages[newMessages.length - 1]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
      updateScrollView();
      setResult('');
    }
  };

  const startTextToSpeech = (messages) => {
    // playing response with the voice id and voice speed
    Tts.speak(messages.content, {
      iosVoiceId: 'com.apple.ttsbundle.Daniel-compact',
      rate: 0.25,
    });
  };

  const updateScrollView = () => {
    // scrolling the response to finish
    setTimeout(() => {
      ScrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const fetchResponse = async () => {
    // updating the response in chats
    if (result.trim().length > 0) {
      let newMessages = [...messages];
      newMessages.push({ role: 'user', content: result.trim() });
      setMessages([...newMessages]);
      // setLoading(true);
      updateScrollView();
    }
  };

  const clear = () => {
    setMessages([]);
    Tts.stop();
  };

  useEffect(() => {
    startRotationAnimation();
    initializeSession();
    //Voice - Handler Events
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    Voice.onSpeechError = speechErrorHandler;

    return () => {
        // Destroy the Voice Instance
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  const rotateData = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container_in}>
      {loading ? (
          <View style={styles.loadingContainer}>
             <Animated.View style={{ transform: [{ rotate: rotateData }] }}>
              <ActivityIndicator size="large" color="#ff0000" />
            </Animated.View>
          </View>
        ) :(
        <>
        {/* MESSAGES */}
        {messages.length > 0 && (
          <View style={styles.messagesContainer}>
            <TouchableOpacity onPress={clear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>CLEAR</Text>
            </TouchableOpacity>
            <View style={styles.messagesScrollView}>
              <ScrollView ref={ScrollViewRef} bounces={false} style={styles.scrollView}>
                {messages.map((message, index) => (
                    // Checking the role that is currently on server
                  <View
                    key={index}
                    style={[
                      styles.messageContainer,
                      message.role === 'assistant'
                        ? styles.assistantMessageContainer 
                        : styles.userMessageContainer,  
                    ]}
                  >
                    <Text style={styles.messageText}>{message.content}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
        <View style={styles.inputBox}>
          <TextInput
            value={result}
            multiline
            placeholder="Type your message..."
            style={styles.textInput}
            onChangeText={(text) => setResult(text)}
          />
          <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
            <Image
              source={
                recording
                  ? require('../../assets/microphoneloading.png')
                  : require('../../assets/microphone.png')
              }
              style={styles.iconImage}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={send}>
            <Image source={require('../../assets/send.png')} style={styles.iconImage} />
          </TouchableOpacity>
        </View>
        </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#28282B',
  },
  container_in: {
    flex: 1,
    marginHorizontal: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  clearButton: {
    alignItems: 'flex-end',
    marginRight: 5,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 10,
    backgroundColor: '#ff0000',
    padding: 5,
    marginTop:10,color:'white'
  },
  messagesScrollView: {
    height: '99%',
    padding: 4,
  },
  scrollView: {
    marginTop: 4,
  },
  messageContainer: {
    padding: 5,
    borderRadius: 6,
    borderColor: 'white',
    borderWidth: 1,
    marginVertical: 5,
  },
  assistantMessageContainer: {
    alignSelf: 'flex-end',
    width: wp(60),
  },
  userMessageContainer: {
    alignSelf: 'flex-start',
    width: wp(60),
    backgroundColor:'#353935'
  },
  messageText: {
    fontWeight: '600',
    color:'#fff'
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    // height: 40,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#1b1212',
    color: 'white',
    borderRadius: 5,
  },
  iconImage: {
    height: hp(3),
    width: hp(3),
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
