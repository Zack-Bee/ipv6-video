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
  Dimensions,
  // Clipboard,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {Button, Layout, Text, Modal, Input} from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import config from '../../config/config';
import Login from './Login';
import Signup from './Signup';
import fetchJSON from '../utils/fetchJSON';
import createIcon from '../utils/createIcon';

const {Navigator, Screen} = createStackNavigator();

const EditIcon = createIcon('edit-2-outline');

const RefreshIcon = createIcon('refresh');

const CopyIcon = createIcon('clipboard-outline');

const {height, width} = Dimensions.get('window');

const Index = ({setIsLogin}) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [detail, setDetail] = useState({});
  const navigation = useNavigation();
  const [newTitle, setNewTitle] = useState(detail.title);
  useEffect(() => {
    const fetchData = async () => {
      const {isSuccess, error, errorCode, ...detail} = await fetchJSON(
        config.httpHost + config.liveDetailRouter,
        {method: 'GET'},
      );
      if (!isSuccess) {
        console.log(errorCode);
        if (errorCode === 403) {
          ToastAndroid.show('尚未登录', ToastAndroid.SHORT);
          try {
            await AsyncStorage.setItem('isLogin', JSON.stringify(false));
            setTimeout(() => {
              setIsLogin(false);
            }, 2000);
          } catch (err) {
            console.error(err);
          }
        } else {
          console.error(error);
        }
      } else {
        setDetail(detail);
      }
    };
    fetchData();
  }, [setIsLogin]);
  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('transparent');
    }, []),
  );
  const showModal = () => {
    setNewTitle(detail.title);
    setIsShowModal(true);
  };
  const rtmpUrl = `${config.rtmpHost}/${detail.id}?key=${detail.key}`;
  const onCopy = () => {
    Clipboard.setString(rtmpUrl);
    ToastAndroid.show('已复制地址', ToastAndroid.SHORT);
  };
  const logout = async () => {
    const {isSuccess, error} = await fetchJSON(
      config.httpHost + config.logoutRouter,
    );
    if (isSuccess) {
      ToastAndroid.show('已退出当前账号', ToastAndroid.SHORT);
      AsyncStorage.setItem('isLogin', JSON.stringify(false)).then(() => {
        setIsLogin(false);
      });
    }
  };
  const refreshKey = async () => {
    const {isSuccess, key, error} = await fetchJSON(
      config.httpHost + config.refreshKeyRouter,
    );
    if (!isSuccess) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
    } else {
      setDetail({...detail, key});
      ToastAndroid.show('刷新成功！', ToastAndroid.SHORT);
    }
  };
  const onPressLiveButton = useCallback(() => {
    navigation.navigate('pusher', {rtmpUrl});
  }, [navigation, rtmpUrl]);

  const changeTitle = async () => {
    setIsShowModal(false);
    const {isSuccess, error} = await fetchJSON(
      config.httpHost + config.changeLiveTitleRouter,
      {method: 'POST', body: JSON.stringify({title: newTitle})},
    );
    if (isSuccess) {
      setDetail({...detail, title: newTitle});
      ToastAndroid.show('修改标题成功', ToastAndroid.SHORT);
    }
  };
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
            <Button
              size="tiny"
              status="info"
              accessoryRight={EditIcon}
              onPress={showModal}>
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
              category="p1">{`RTMP推流地址：${'fe80::83f:f53e:e538:684e'}/${
              detail.id
            }?key=${detail.key}`}</Text>
            <View style={{justifyContent: 'space-between', marginLeft: 16}}>
              <Button
                onPress={onCopy}
                style={{marginBottom: 8}}
                size="tiny"
                status="info"
                accessoryRight={CopyIcon}>
                复制地址
              </Button>
              <Button
                size="tiny"
                status="info"
                onPress={refreshKey}
                accessoryRight={RefreshIcon}>
                刷新密钥
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
        <Button status="danger" style={styles.button} onPress={logout}>
          退出登录
        </Button>
      </Layout>
      <Modal
        visible={isShowModal}
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        onBackdropPress={() => setIsShowModal(false)}>
        <View
          style={{
            justifyContent: 'space-around',
            height: 120,
            width: width - 48,
            paddingHorizontal: 24,
            backgroundColor: '#fff',
            paddingVertical: 16,
            borderRadius: 16,
          }}>
          <Input
            style={{
              borderColor: 'rgba(0, 0, 0, 0.6)',
              color: 'rgba(0, 0, 0, 0.6)',
            }}
            textStyle={{color: 'rgba(0, 0, 0, 0.6)'}}
            status="control"
            placeholder="输入新的节目标题"
            value={newTitle}
            onChangeText={setNewTitle}
            placeholderTextColor="rgba(0, 0, 0, 0.6)"
          />
          <Button status="info" size="tiny" onPress={changeTitle}>
            修改标题
          </Button>
        </View>
      </Modal>
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

  const enjectedIndex = useCallback(
    props => <Index setIsLogin={setIsLogin} {...props} />,
    [],
  );

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
          component={enjectedIndex}
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
