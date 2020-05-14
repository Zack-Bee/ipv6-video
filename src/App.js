import {NavigationContainer} from '@react-navigation/native';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import * as eva from '@eva-design/eva';
import {View, Button, ToolbarAndroid} from 'react-native';
import {
  initialize,
  startDiscoveringPeers,
  getAvailablePeers,
  getConnectionInfo,
  createGroup,
  removeGroup,
  subscribeOnPeersUpdates,
  getGroupPassphraseInfo,
  connect,
} from 'react-native-wifi-p2p';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  BottomNavigation,
  BottomNavigationTab,
  Layout,
  Text,
  ApplicationProvider,
  IconRegistry,
} from '@ui-kitten/components';
import Home from './screens/Home';

import Player from 'react-native-p2p-rtmp-player';
import * as WIFI_DIRECT_STATUS from 'react-native-wifi-p2p/device-info-statuses';
import {NodeCameraView} from 'react-native-nodemediaclient';

console.log('\n\n\n\n');
console.log('*'.repeat(50));
console.log('\n\n\n\n');

initialize();

const getStatusInfo = code => {
  switch (code) {
    case WIFI_DIRECT_STATUS.AVAILABLE:
      return 'available';
    case WIFI_DIRECT_STATUS.CONNECTED:
      return 'connected';
    case WIFI_DIRECT_STATUS.FAILED:
      return 'failed';
    case WIFI_DIRECT_STATUS.INVITED:
      return 'invited';
    case WIFI_DIRECT_STATUS.UNAVAILABLE:
      return 'unavailable';
  }
};

const {Navigator, Screen} = createBottomTabNavigator();

const PlayerScreen = () => {
  const [wifiDirectList, setWifiDirectList] = useState([]);
  const [isInitial, setIsInitail] = useState(false);
  const [isGroupOwner, setIsOwner] = useState(false);
  const playerRef = useRef(null);
  const onToogleButton = useCallback(() => {
    if (isGroupOwner) {
      removeGroup();
      setIsOwner(false);
    } else {
      createGroup()
        .then(
          () =>
            new Promise(resolve => {
              setTimeout(resolve, 3000);
            }),
        )
        .then(() => {
          console.log(getGroupPassphraseInfo());
        });
      setIsOwner(true);
    }
  }, [isGroupOwner]);

  console.log(typeof ToolbarAndroid);
  useEffect(() => {
    console.log('initial');
    const f = async () => {
      if (!isInitial) {
        startDiscoveringPeers();
        setInterval(async () => {
          const {devices} = await getAvailablePeers();
          console.log({devices});
        }, 3000);
        subscribeOnPeersUpdates(({devices}) => {
          console.log('peers updates: ');
          console.log({devices});
          console.log(new Date());
          setWifiDirectList([...devices]);
        });
        console.log('startService');
        setIsInitail(true);
      }
    };
    f();
  }, [isInitial]);

  return (
    <>
      <View style={{flex: 1}}>
        <View>
          <Button
            title={isGroupOwner ? 'remove group' : 'creat group'}
            onPress={onToogleButton}
          />
        </View>
        <View>
          <Button title="start discover" onPress={startDiscoveringPeers} />
        </View>
        <View>
          <Button
            title="start rtmp"
            onPress={() => {
              playerRef.current.startRtmp({
                host: '192.168.0.106',
                port: 1935,
                appName: 'abcs',
                streamName: 'obs',
                isBroadcast: true,
              });
            }}
          />
        </View>
        <View>
          <Button
            title="start d2d"
            onPress={() => {
              playerRef.current.startD2D();
            }}
          />
        </View>
        <View style={{flex: 1}}>
          {wifiDirectList.map(
            ({deviceAddress, deviceName, isGroupOwner, status}) => (
              <View
                key={deviceAddress}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}>
                <View style={{flex: 2}}>
                  <Text>{`deviceName: ${deviceName}`}</Text>
                  <Text>{`deviceAddress: ${deviceAddress}`}</Text>
                  <Text>{`isGroupOwner: ${isGroupOwner}`}</Text>
                  <Text>{`statusInfo: ${getStatusInfo(status)}`}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Button
                    title="connect"
                    onPress={() => {
                      connect(deviceAddress)
                        .then(getConnectionInfo)
                        .then(info => console.log({info}));
                    }}
                  />
                </View>
              </View>
            ),
          )}
        </View>
        <Player ref={playerRef} style={{width: 360, height: 202}} />
      </View>
    </>
  );
};

const PusherScreen = () => {
  const pusherRef = useRef();
  return (
    <Layout style={{flex: 1}}>
      <NodeCameraView
        style={{height: 400}}
        ref={pusherRef}
        outputUrl={'rtmp://192.168.0.106/abcs/obs'}
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
      <Button
        title="push"
        onPress={() => {
          pusherRef.current.start();
        }}
      />
      <Button
        title="stop"
        onPress={() => {
          pusherRef.current.stop();
        }}
      />
    </Layout>
  );
};

export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.light}>
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    </ApplicationProvider>
  </>
);
