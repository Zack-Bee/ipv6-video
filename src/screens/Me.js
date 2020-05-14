import React, {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {
  View,
  Image,
  StatusBar,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Clipboard,
} from 'react-native';
// import Clipboard from '@react-native-community/clipboard';
import {Button, Layout, Text} from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';

import config from '../../config/config';
import Login from './Login';
import Signup from './Signup';
import fetchJSON from '../utils/fetchJSON';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import createIcon from '../utils/createIcon';

const {Navigator, Screen} = createStackNavigator();

const EditIcon = createIcon('edit-2-outline');

const RefreshIcon = createIcon('refresh');

const CopyIcon = createIcon('clipboard-outline');

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState({});
  const navigation = useNavigation();
  useEffect(() => {
    const fetchData = async () => {
      const {isSuccess, error, ...detail} = await fetchJSON(
        config.httpHost + config.liveDetailRouter,
        {method: 'GET'},
      );
      if (!isSuccess) {
        console.error(error);
      } else {
        setDetail(detail);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('transparent');
    }, []),
  );
  const rtmpUrl = `${config.rtmpHost}/${detail.id}?key=${detail.key}`;
  const onCopy = useCallback(() => {
    Clipboard.setString(rtmpUrl);
    ToastAndroid.show('已复制地址');
  }, [rtmpUrl]);
  const onPressLiveButton = useCallback(() => {
    navigation.navigate('pusher', {rtmpUrl});
  }, [navigation, rtmpUrl]);
  return (
    <ScrollView style={{flex: 1}}>
      <Layout level="2" style={{flex: 1, marginBottom: 16}}>
        <Layout
          level="1"
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 16,
            marginHorizontal: 16,
            padding: 16,
            borderRadius: 16,
          }}>
          <Image
            style={{width: 48, height: 48, marginRight: 16}}
            source={require('../img/tv256.png')}
          />
          <View style={{flex: 1}}>
            <Text category="s1">{`账号ID：${detail.id}`}</Text>
            <Text category="s1">{`频道名：${detail.channelName}`}</Text>
          </View>
        </Layout>
        <Layout level="1" style={styles.itemLayout}>
          <Text category="p1">{`更新时间：${detail.updatedAt}`}</Text>
        </Layout>
        <Layout level="1" style={styles.itemLayout}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text category="p1">{`节目标题：${detail.title}`}</Text>
            <Button size="tiny" status="info" accessoryRight={EditIcon}>
              修改标题
            </Button>
          </View>
        </Layout>
        <Layout level="1" style={styles.itemLayout}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{flex: 1}}
              category="p1">{`RTMP推流地址：${rtmpUrl}`}</Text>
            <View style={{justifyContent: 'space-between'}}>
              <Button
                onPress={onCopy}
                style={{marginBottom: 8}}
                size="tiny"
                status="info"
                accessoryRight={CopyIcon}>
                复制地址
              </Button>
              <Button size="tiny" status="info" accessoryRight={RefreshIcon}>
                刷新地址
              </Button>
            </View>
          </View>
        </Layout>
        <Layout level="1" style={styles.itemLayout}>
          <View style={{alignItems: 'center'}}>
            <Text style={{marginBottom: 8}} category="label">
              扫描下方二维码即可直播
            </Text>
            <QRCode value={rtmpUrl} size={200} />
          </View>
        </Layout>
        <Button
          status="success"
          style={styles.button}
          onPress={onPressLiveButton}>
          开始直播
        </Button>
        <Button
          status="danger"
          style={styles.button}
          onPress={() => AsyncStorage.clear()}>
          退出登录
        </Button>
        <Button style={styles.button} onPress={() => AsyncStorage.clear()}>
          清除缓存
        </Button>
      </Layout>
    </ScrollView>
  );
};

const Me = () => {
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    console.log('effect');
    AsyncStorage.getItem('isLogin').then(dataStr => {
      setIsLogin(JSON.parse(dataStr));
    });
  }, []);
  const enjectedLogin = useCallback(
    props => <Login setIsLogin={setIsLogin} {...props} />,
    [],
  );

  const enjectedSignup = useCallback(
    props => <Signup setIsLogin={setIsLogin} {...props} />,
    [],
  );
  return (
    <Navigator
      mode="modal"
      headerMode="screen"
      screenOptions={({route, navigation}) => ({
        ...TransitionPresets.ModalPresentationIOS,
        cardOverlayEnabled: true,
        gestureEnabled: true,
        headerStatusBarHeight:
          navigation.dangerouslyGetState().routes.indexOf(route) > 0
            ? 0
            : undefined,
      })}>
      {isLogin ? (
        <Screen
          name="me"
          options={{title: '我', headerShown: false}}
          component={Index}
        />
      ) : (
        <>
          <Screen
            name="login"
            options={{headerShown: false}}
            component={enjectedLogin}
            setLogin={setIsLogin}
          />
          <Screen
            name="signup"
            options={{headerShown: false}}
            component={enjectedSignup}
          />
        </>
      )}
    </Navigator>
  );
};

const styles = StyleSheet.create({
  itemLayout: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  button: {
    marginTop: 16,
    marginHorizontal: 16,
  },
});

export default Me;
