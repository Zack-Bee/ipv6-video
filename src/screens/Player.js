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
import Player from 'react-native-p2p-rtmp-player';
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
    params: {channelId, title, channelName},
  } = useRoute();
  const playerRef = useRef();
  useEffect(() => {
    console.log(typeof playerRef.current);
    if (playerRef.current) {
      console.log({channelId, channelName});
      playerRef.current.startRtmp({
        host: config.host,
        appName: 'live',
        streamName: channelId,
        isBroadcast: true,
        port: 1935,
      });
    }
    return () => {
      console.log('in effect');
      if (playerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // playerRef.current.release();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRef.current]);
  return (
    <View style={styles.container}>
      <Player style={styles.container} ref={playerRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
});
