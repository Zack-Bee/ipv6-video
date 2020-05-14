import React, {useState, useMemo, useCallback} from 'react';
import {Button, Input, Text, Icon} from '@ui-kitten/components';
import {ImageOverlay} from '../../components/ImageOverlay';
import {KeyboardAvoidingView} from '../../components/KeyboardAvoidingView';
import createIcon from '../../utils/createIcon';
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableWithoutFeedback,
  ToastAndroid,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import fetchJSON from '../../utils/fetchJSON';
import config from '../../../config/config';
import AsyncStorage from '@react-native-community/async-storage';
import isAlphaAndNumericSequence from '../../utils/isAlphaAndNumeric';

const PersonIcon = createIcon('person');

export default ({navigation, setIsLogin}) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onSignUpButtonPress = () => {
    navigation && navigation.push('signup');
  };

  const renderPasswordIcon = props => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={!passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  const onSignInButtonPress = async () => {
    if (id.trim() === '') {
      ToastAndroid.show('账号ID格式错误', 'ID不能为空');
      return;
    } else if (!isAlphaAndNumericSequence(id.trim())) {
      ToastAndroid.show('账号ID格式错误', '账号ID应由字母与数字组成');
      return;
    }
    if (password.trim() === '') {
      ToastAndroid.show('密码格式错误', '密码不能为空');
      return;
    } else if (password.trim().length < 8) {
      ToastAndroid.show('密码格式错误', '密码不少于8位');
      return;
    } else if (!isAlphaAndNumericSequence(password.trim())) {
      ToastAndroid.show('密码格式格式错误', '密码格式应由字母与数字组成');
      return;
    }
    try {
      const {isSuccess, error} = await fetchJSON(
        config.httpHost + config.loginRouter,
        {
          method: 'POST',
          body: JSON.stringify({id: id.trim(), password: password.trim()}),
        },
      );
      if (!isSuccess) {
        ToastAndroid.show(error);
        return;
      }
      ToastAndroid.show('登录成功，正在跳转');
      AsyncStorage.setItem('isLogin', JSON.stringify(true)).then(() => {
        setIsLogin(true);
      });
    } catch (err) {
      console.err(err);
    }
  };

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
            登录
          </Text>
          <Text style={styles.signInLabel} category="s1" status="control">
            分享你的生活
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            status="control"
            placeholder="用户ID"
            accessoryRight={PersonIcon}
            value={id}
            onChangeText={setId}
            autoCompleteType="username"
            textContentType="username"
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
            textContentType="password"
          />
        </View>
        <Button
          style={styles.signInButton}
          size="giant"
          onPress={onSignInButtonPress}>
          登录
        </Button>
        <Button
          style={styles.signUpButton}
          appearance="ghost"
          status="control"
          onPress={onSignUpButtonPress}>
          还没有账号？点此注册
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
