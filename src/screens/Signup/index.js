import React, {useState, useMemo, useCallback} from 'react';
import {Button, Input, Text, Icon} from '@ui-kitten/components';
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableWithoutFeedback,
  Alert,
  ToastAndroid,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {ImageOverlay} from '../../components/ImageOverlay';
import createIcon from '../../utils/createIcon';
import isAlphaAndNumericSequence from '../../utils/isAlphaAndNumeric';
import {KeyboardAvoidingView} from '../../components/KeyboardAvoidingView';
import config from '../../../config/config';
import fetchJSON from '../../utils/fetchJSON';
import AsyncStorage from '@react-native-community/async-storage';

const PersonIcon = createIcon('person');
const AlertIcon = createIcon('alert-circle-outline');
const TVIcon = createIcon('tv');

export default ({navigation, setIsLogin}) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [channelName, setChannelName] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSignupButtonPress = async () => {
    if (id.trim() === '') {
      ToastAndroid.show('[账号ID] 格式错误', '[账号ID] 不能为空');
      return;
    } else if (!isAlphaAndNumericSequence(id.trim())) {
      ToastAndroid.show('[账号ID] 格式错误', '[账号ID] 应由字母与数字组成');
      return;
    }
    if (password.trim() === '') {
      ToastAndroid.show('[密码] 格式错误', '[密码] 不能为空');
      return;
    } else if (password.trim().length < 8) {
      ToastAndroid.show('[密码] 格式错误', '[密码] 不能少于8位');
      return;
    } else if (!isAlphaAndNumericSequence(password.trim())) {
      ToastAndroid.show('[密码] 格式格式错误', '[密码] 格式应由字母与数字组成');
      return;
    }
    if (channelName.trim() === '') {
      ToastAndroid.show('[频道名] 格式错误', '[频道名] 不能为空');
      return;
    }
    try {
      const {isSuccess, error} = await fetchJSON(
        config.httpHost + config.signupRouter,
        {
          method: 'POST',
          body: JSON.stringify({
            id: id.trim(),
            password: password.trim(),
            channelName: channelName.trim(),
          }),
        },
      );
      if (!isSuccess) {
        ToastAndroid.show(error);
        return;
      }
      ToastAndroid.show('注册成功，正在跳转');
      AsyncStorage.setItem('isLogin', JSON.stringify(true)).then(() => {
        setIsLogin(true);
      });
    } catch (err) {
      console.err(err);
    }
  };

  const onLoginButtonPress = () => {
    navigation && navigation.navigate('login');
  };

  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };

  const renderPasswordIcon = props => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={!passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('transparent');
    }, []),
  );

  return (
    <KeyboardAvoidingView>
      <ImageOverlay
        style={styles.container}
        source={require('./imgs/image-background.jpg')}>
        <View style={styles.headerContainer}>
          <Text category="h1" status="control">
            注册
          </Text>
          <Text style={styles.signInLabel} category="s1" status="control">
            探索新的世界
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            status="control"
            placeholder="用户ID"
            accessoryRight={PersonIcon}
            value={id}
            onChangeText={setId}
            caption="[用户ID] 由数字与字母组成"
            captionIcon={AlertIcon}
            textContentType="username"
            autoCompleteType="username"
          />
          <Input
            style={styles.passwordInput}
            status="control"
            placeholder="密码"
            accessoryRight={renderPasswordIcon}
            value={password}
            secureTextEntry={!passwordVisible}
            onChangeText={setPassword}
            autoCompleteType="password"
            caption="[密码] 由数字与字母组成，不得少于8位"
            captionIcon={AlertIcon}
            textContentType="password"
            keyboardType="ascii-capable"
          />
          <Input
            style={styles.passwordInput}
            status="control"
            placeholder="频道名"
            accessoryRight={TVIcon}
            value={channelName}
            onChangeText={setChannelName}
            autoCompleteType="name"
            caption="[频道名] 将会显示在频道列表"
            captionIcon={AlertIcon}
            textContentType="nickname"
          />
        </View>
        <Button
          style={styles.signInButton}
          size="giant"
          onPress={onSignupButtonPress}>
          注册
        </Button>
        <Button
          style={styles.signUpButton}
          appearance="ghost"
          status="control"
          onPress={onLoginButtonPress}>
          已经有账号？点此登录
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    minHeight: 216,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  signInLabel: {
    marginTop: 16,
  },
  passwordInput: {
    marginTop: 16,
  },
  signInButton: {
    marginHorizontal: 16,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forgotPasswordButton: {
    paddingHorizontal: 0,
  },
  signUpButton: {
    marginVertical: 12,
    marginBottom: 24,
  },
  socialAuthContainer: {
    marginTop: 32,
  },
  socialAuthButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  socialAuthHintText: {
    alignSelf: 'center',
    marginBottom: 16,
  },
});
