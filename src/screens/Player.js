import React, {useState, useEffect, useCallback, useRef} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {
  View,
  Image,
  StatusBar,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Button, Layout, Text} from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import {NodeCameraView} from 'react-native-nodemediaclient';

import config from '../../config/config';
import fetchJSON from '../utils/fetchJSON';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import createIcon from '../utils/createIcon';
const {height, width} = Dimensions.get('window');
console.log({height, width});

const StartIcon = createIcon('play-circle');
const PauseIcon = createIcon('pause-circle');

export default () => {
  const {
    params: {rtmpUrl},
  } = useRoute();
  const cameraRef = useRef();
  const [isPushing, setIsPushing] = useState(false);
  const toogleStart = () => {
    if (cameraRef.current) {
      if (!isPushing) {
        cameraRef.current.start();
        setIsPushing(true);
      } else {
        cameraRef.current.stop();
        setIsPushing(false);
      }
    }
  };
  useFocusEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  });
  return (
    <View style={styles.container}>
      <NodeCameraView
        style={{height, width, flex: 1}}
        ref={cameraRef}
        outputUrl={rtmpUrl}
        camera={{cameraId: 1, cameraFrontMirror: true}}
        audio={{bitrate: 32000, profile: 1, samplerate: 44100}}
        video={{
          preset: 12,
          bitrate: 400000,
          profile: 1,
          fps: 30,
          videoFrontMirror: false,
        }}
        autopreview={true}
      />
      <View style={styles.operationButtonWrapper}>
        <TouchableOpacity style={{height: 48, width: 48}} onPress={toogleStart}>
          {isPushing ? (
            <PauseIcon
              fill="rgba(255, 255, 255, 0.5)"
              style={{widht: 48, height: 48}}
            />
          ) : (
            <StartIcon
              fill="rgba(255, 255, 255, 0.5)"
              style={{widht: 48, height: 48}}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
  camera: {
    height,
    width,
    position: 'absolute',
    zIndex: 2,
  },
  operationButtonWrapper: {
    zIndex: 3,
    height: 60,
    width: '100%',
    position: 'absolute',
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
