/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState, useCallback, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Button,
  Picker,
  Switch,
  DatePickerAndroid,
  ProgressBarAndroid,
  DrawerLayoutAndroid,
  TimePickerAndroid,
  requireNativeComponent,
  ToolbarAndroid,
  ViewPagerAndroid,
  Linking,
  ToastAndroid,
} from 'react-native';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {
  initialize,
  startDiscoveringPeers,
  getAvailablePeers,
} from 'react-native-wifi-p2p';
initialize();
const App = () => {
  const [switchValue, setStateValue] = useState(false);
  var navigationView = (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Text style={{margin: 10, fontSize: 15, textAlign: 'left'}}>
        I'm in the Drawer!
      </Text>
    </View>
  );
  console.log(typeof ToolbarAndroid);
  useEffect(() => {
    const f = async () => {
      const initialURL = await Linking.getInitialURL();
      console.log(initialURL);
      const some = await startDiscoveringPeers();
      console.log(some);
      const fff = await getAvailablePeers();
      console.log(fff)
    };
    console.log(StatusBar.popStackEntry());
    f();
  });

  return (
    <>
      <StatusBar barStyle="default" translucent />
      <View style={{flex: 1}}>
        <View>
          <TextInput defaultValue="123" placeholder="请输入你是谁" />
        </View>
        <Button
          title="123"
          onPress={async () => {
            const {action, year, month, day} = await DatePickerAndroid.open({
              // 要设置默认值为今天的话，使用`new Date()`即可。
              // 下面显示的会是2020年5月25日。月份是从0开始算的。
              date: new Date(),
            });
            console.log({action, year, month, day});
          }}
        />
        <Picker style={{height: 100, width: 200, backgroundColor: '#F0F'}}>
          <Picker.Item label="Java" value="java" />
          <Picker.Item label="JavaScript" value="js" />
        </Picker>
        <Switch
          value={switchValue}
          onValueChange={() => {
            setStateValue(!switchValue);
          }}
        />
        <ProgressBarAndroid styleAttr="Horizontal" color="#2196F3" />
        <ProgressBarAndroid
          styleAttr="Inverse"
          indeterminate={false}
          progress={0.5}
        />
        <DrawerLayoutAndroid
          drawerWidth={100}
          drawerPosition="left"
          renderNavigationView={() => navigationView}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={{margin: 10, fontSize: 15, textAlign: 'right'}}>
              Hello world
            </Text>
            <Text style={{margin: 10, fontSize: 15, textAlign: 'right'}}>
              World is a dog
            </Text>
          </View>
        </DrawerLayoutAndroid>
        <Button
          onPress={() => {
            ToastAndroid.showWithGravityAndOffset(
              'hhhhhhhhhhh',
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50,
            );
          }}
          title="hhh"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  pageStyle: {
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
