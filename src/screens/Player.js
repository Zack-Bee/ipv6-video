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
import Player, {getP2pMac} from 'react-native-p2p-rtmp-player';
import config from '../../config/config';
import fetchJSON from '../utils/fetchJSON';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import createIcon from '../utils/createIcon';
import {createGroup, removeGroup} from 'react-native-wifi-p2p';
const {height, width} = Dimensions.get('window');
console.log({height, width});

const StartIcon = createIcon('play-circle');
const PauseIcon = createIcon('pause-circle');

export default () => {
  const {
    params: {channelId, title, channelName, isUseP2p},
  } = useRoute();
  const playerRef = useRef();
  const macRef = useRef();
  useEffect(() => {
    const func = async () => {
      if (playerRef.current) {
        if (!isUseP2p) {
          try {
            try {
              await removeGroup();
            } catch (err) {
              console.log(3, err);
            }
            const [mac, info] = await Promise.all([getP2pMac(), createGroup()]);
            console.log({info});
            console.log(typeof macRef);
            macRef.current = mac;
            fetchJSON(config.httpHost + config.registerGroupOwnerRouter, {
              method: 'POST',
              body: JSON.stringify({
                mac: macRef.current.toLowerCase(),
                id: channelId,
              }),
            });
          } catch (err) {
            console.log(4, err);
          }
          console.log({channelId, channelName});
          playerRef.current.startRtmp({
            host: config.host,
            appName: 'live',
            streamName: channelId,
            isBroadcast: true,
            port: 1935,
          });
        } else {
          setTimeout(() => {
            playerRef.current.startD2D();
          }, 300);
        }
      }
    };
    func();
    return () => {
      console.log('in effect');
      if (playerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playerRef.current.release();
      }
      if (!isUseP2p) {
        try {
          removeGroup();
        } catch (err) {
          console.log(5, err);
        }
        fetchJSON(config.httpHost + config.removeGroupRouter, {
          method: 'POST',
          body: JSON.stringify({
            mac: macRef.current.toLowerCase(),
            id: channelId,
          }),
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
