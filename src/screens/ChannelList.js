import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {List, ListItem, Card, Text, Button} from '@ui-kitten/components';
import {Alert, StyleSheet, Dimensions, StatusBar} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import useIntervalImediately from '../utils/useIntervalImediately';
import config from '../../config/config';
import fetchJSON from '../utils/fetchJSON';

const {Navigator, Screen} = createStackNavigator();

const Index = () => {
  const [list, setList] = useState([]);
  const outSetList = setList;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

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
  const RenderItem = ({item: {channelId, title, channelName}}) => {
    return (
      <Card style={styles.itemLayout}>
        <Text category="h6">{title}</Text>
        <Text category="s1">{channelName}</Text>
        <Button
          onPress={() => {
            navigation.navigate('player', {channelId, title, channelName});
          }}>
          播放
        </Button>
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
    <Screen name="player" component={Index} />
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
