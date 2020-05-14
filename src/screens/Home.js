import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomNavigation, BottomNavigationTab} from '@ui-kitten/components';
import ChannelList from './ChannelList';
import {createStackNavigator} from '@react-navigation/stack';

import Me from './Me';
import Pusher from './Pusher';

const {Navigator, Screen} = createBottomTabNavigator();

const BottomTabBar = ({navigation, state}) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title="频道列表" />
    <BottomNavigationTab title="我" />
  </BottomNavigation>
);

const TabScreens = () => (
  <Navigator tabBar={props => <BottomTabBar {...props} />}>
    <Screen
      name="channelList"
      options={{headerShown: false}}
      component={ChannelList}
    />
    <Screen name="me" component={Me} />
  </Navigator>
);

const {Navigator: RootNavigator, Screen: RootScreen} = createStackNavigator();

const Home = () => (
  <RootNavigator screenOptions={{headerShown: false}}>
    <RootScreen name="tabScreens" component={TabScreens} />
    <RootScreen name="pusher" component={Pusher} />
  </RootNavigator>
);

export default Home;
