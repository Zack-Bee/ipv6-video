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

const StartIcon = createIcon('play-circle');
const PauseIcon = createIcon('pause-circle');
const FlipIcon = createIcon('flip-2');

export default () => {
  const {
    params: {rtmpUrl},
  } = useRoute();
  const cameraRef = useRef();
  const [isPushing, setIsPushing] = useState(false);
  const [cameraId, setCameraId] = useState(0);
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

  const toogleCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.switchCamera();
    }
  };
  useFocusEffect(() => {
    return () => {
      // if (cameraRef.current) {
      //   cameraRef.current.stop();
      // }
    };
  });
  return (
    <View style={styles.container}>
      <NodeCameraView
        style={{height, width, flex: 1}}
        ref={cameraRef}
        outputUrl={rtmpUrl}
        camera={{cameraId, cameraFrontMirror: true}}
        audio={{bitrate: 32000, profile: 1, samplerate: 44100}}
        video={{
          preset: 4,
          bitrate: 256 * 1024 * 8,
          profile: 1,
          fps: 30,
          videoFrontMirror: false,
        }}
        autopreview={true}
      />
      <View style={styles.operationButtonWrapper}>
        <TouchableOpacity onPress={toogleStart}>
          {isPushing ? (
            <PauseIcon
              fill="rgba(255, 255, 255, 0.5)"
              style={styles.largebutton}
            />
          ) : (
            <StartIcon
              fill="rgba(255, 255, 255, 0.5)"
              style={styles.largebutton}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.switchCameraButtonWrapper}>
        <TouchableOpacity
          style={{
            ...styles.normalButton,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 48
          }}
          onPress={toogleCamera}>
          <FlipIcon
            fill="rgba(255, 255, 255, 0.5)"
            style={styles.smallButton}
          />
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
  switchCameraButtonWrapper: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 3,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
  largebutton: {
    width: 48,
    height: 48,
  },
  normalButton: {
    width: 36,
    height: 36,
  },
  smallButton: {
    width: 24,
    height: 24,
  },
});
