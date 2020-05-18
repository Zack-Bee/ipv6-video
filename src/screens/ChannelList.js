import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  List,
  ListItem,
  Card,
  Text,
  Button,
  OverflowMenu,
  MenuItem,
} from '@ui-kitten/components';
import {Alert, StyleSheet, Dimensions, StatusBar} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import useIntervalImediately from '../utils/useIntervalImediately';
import config from '../../config/config';
import fetchJSON from '../utils/fetchJSON';
import {
  startDiscoveringPeers,
  getAvailablePeers,
  connect,
  removeGroup,
} from 'react-native-wifi-p2p';

const {Navigator, Screen} = createStackNavigator();

const Index = () => {
  const [list, setList] = useState([]);
  const outSetList = setList;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isShowMenu, setIsShowMenu] = useState(false);

  const refreshChannelList = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const {isSuccess, error, data} = await fetchJSON(
        `${config.httpHost}${config.channelListRouter}`,
      );
      console.log({isSuccess, error, data});
      if (!isSuccess) {
        Alert.alert('登录错误', error);
        return;
      }
      console.log({data});
      setList(data);
      console.log(setList === outSetList);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useIntervalImediately(
    async () => {
      await startDiscoveringPeers();
      const {devices} = await getAvailablePeers();
      console.log({devices});
      setDevices(devices);
    },
    20 * 1000,
    [],
  );

  useEffect(() => {
    refreshChannelList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keyExtractor = item => item.channelId;
  // useIntervalImediately(refreshChannelList, 30000, []);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('transparent');
    }, []),
  );
  const RenderItem = ({item: {channelId, title, channelName, groupOwners}}) => {
    const filteredDevices = devices.filter(({deviceAddress}) =>
      groupOwners.includes(deviceAddress),
    );
    console.log({filteredDevices});
    return (
      <Card style={styles.itemLayout}>
        <Text category="h6">{title}</Text>
        <Text category="s1">{channelName}</Text>
        {filteredDevices.length > 0 ? (
          <OverflowMenu
            anchor={() => (
              <Button onPress={() => setIsShowMenu(true)}>选择播放源</Button>
            )}
            onSelect={async index => {
              console.log({index, filteredDevices});
              setIsShowMenu(false);
              if (index.row === 0) {
                navigation.navigate('player', {channelId, title, channelName});
              } else {
                try {
                  await removeGroup();
                } catch (err) {
                  console.log(1, err);
                }
                try {
                  await connect(filteredDevices[index.row - 1].deviceAddress);
                } catch (err) {
                  console.log(2, err);
                }
                navigation.navigate('player', {
                  channelId,
                  title,
                  channelName,
                  isUseP2p: true,
                });
              }
            }}
            visible={isShowMenu}
            onBackdropPress={() => setIsShowMenu(false)}>
            <MenuItem key="default" title="从服务器播放" />
            {filteredDevices.map(({deviceName, deviceAddress}) => (
              <MenuItem
                title={`D2D: ${[...deviceName].slice(0, 5).join('')}`}
                key={deviceAddress}
              />
            ))}
          </OverflowMenu>
        ) : (
          <Button
            onPress={() => {
              navigation.navigate('player', {channelId, title, channelName});
            }}>
            播放
          </Button>
        )}
      </Card>
    );
  };

  return (
    <List
      keyExtractor={keyExtractor}
      style={{flex: 1}}
      data={list}
      renderItem={RenderItem}
      onRefresh={refreshChannelList}
      refreshing={isLoading}
    />
  );
};

const ChannelList = () => (
  <Navigator>
    <Screen
      name="channelList"
      options={{title: '频道列表', headerTitleAlign: 'center'}}
      component={Index}
    />
    <Screen name="scan" component={Index} />
  </Navigator>
);

const styles = StyleSheet.create({
  itemLayout: {
    marginVertical: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
});

export default ChannelList;
