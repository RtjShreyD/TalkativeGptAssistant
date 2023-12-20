import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Voice from '@react-native-community/voice';
import axios from 'axios';
import Tts from 'react-native-tts';

const MED_AUTH_TOKEN = process.env.MED_AUTH_TOKEN;

const AgentScreen = ({ navigation }) => {
  const [connection, setConnection] = useState(false);
  const [listening, setListening] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [responseGenerated, setResponseGenerated] = useState(false);
  const [sessionID, setSessionID] = useState('');
  const [error, setError] = useState(null);
  const [currentState, setCurrentState] = useState('agent_connecting');

  const handleConnection = async () => {
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
      console.log('Session ID:', session_id);
      setSessionID(session_id);
      setConnection(true);
  
      // Move to the listening state
      setCurrentState('listening');
      handleStartRecording();
    } catch (error) {
      console.error('Error initializing session:', error);
      setError('Connection failed. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    console.log('Starting recording...');
    setListening(true);
    setCurrentState('listening');

    try {
      await handleStopRecording();
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setListening(false);
      setError('Failed to start voice recognition. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    console.log('Stopping recording...');
    if (listening) {
      setListening(false);
  
      try {
        await Voice.stop();
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
        setError('Failed to stop voice recognition.');
      }
    }
  };
  
  const handleResponse = async (text) => {
    setWaiting(true);
    setCurrentState('waiting');

    try {
      const response = await axios.post(
        'https://medagentv1.excelus.ai/chat',
        {
          session_id: sessionID,
          human_message: text,
        },
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${MED_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = response.data.details.agent_response;

      console.log('Response from server:', responseText);

      // Subscribe to onSpeechStart event
      const onSpeechStartSubscription = Tts.addEventListener('tts-start', () => {
        console.log('TTS started.');
        setResponseGenerated(true);
        setCurrentState('response_generated')

        // Unsubscribe from onSpeechStart event
        onSpeechStartSubscription.remove();
      });

      // Subscribe to onSpeechEnd event
      const onSpeechEndSubscription = Tts.addEventListener('tts-finish', () => {
        console.log('Response spoken.');
        setResponseGenerated(false);

        // Move back to the listening state to repeat the process
        setCurrentState('listening');
        handleStartRecording();
        setWaiting(false);

        // Unsubscribe from onSpeechEnd event
        onSpeechEndSubscription.remove();
      });

      // Use TTS to speak the response
      Tts.speak(responseText);
    } catch (error) {
      console.error('Error sending voice data to chat API:', error);
      setWaiting(false);
      setError('Failed to send voice data to chat API.');
    }
  };

  useEffect(() => {
    console.log('Initializing connection...');
    handleConnection();

    return () => {
      Voice.removeAllListeners();
    };
  }, []);

  Voice.onSpeechResults = (e) => {
    const text = e.value[0];
    console.log('Speech results:', text);
    handleResponse(text);
  };

  const handleStopAllProcesses = async () => {
    try {
      // Stop voice recognition
      await handleStopRecording();

      // Stop TTS
      Tts.stop();

      // Reset states
      setConnection(false);
      setListening(false);
      setWaiting(false);
      setResponseGenerated(false);
      setSessionID('');
      setError(null);

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error stopping processes:', error);
    }
  };

  const handleGoBack = () => {
    // Stop all processes and navigate back to HomeScreen
    handleStopAllProcesses();
    navigation.goBack();
  };

  const renderStateText = () => {
    switch (currentState) {
      case 'agent_connecting':
        return <Text>Agent is connecting...</Text>;
      case 'listening':
        return <Text>Listening for queries...</Text>;
      case 'waiting':
        return <Text>Waiting for server response...</Text>;
      case 'response_generated':
        return <Text>Response generated Successfully...</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStateText()}
      <TouchableOpacity style={styles.crossButton} onPress={handleGoBack}>
        <View style={styles.crossIconContainer}>
          <Image source={require('../../assets/crossicon.png')} style={styles.crossIcon} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  crossButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  crossIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default AgentScreen;
