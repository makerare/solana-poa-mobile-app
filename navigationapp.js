/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
//import * as React from 'react';

import { SignUp,
         Wallet,
         Backup,
         Recieve,
         Send,
         Import,
         Item,
         Breed,
         Loading } from "./screens";

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Tabs from "./navigation/tabs";
import store from "./store";

import {useStoreState} from "./hooks/storeHooks"

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        border: "transparent",
    },
};
import FlashMessage, {showMessage,} from "react-native-flash-message";

import { useStoreRehydrated } from "easy-peasy";


const Stack = createStackNavigator();

const NavigationApp = () => {

  const isRehydrated = useStoreRehydrated();


  SystemNavigationBar.navigationHide();
  const hasWallet = useStoreState((state) => state.hasWallet);

  if ( !isRehydrated )
      return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
                initialRouteName={'Loading'}
            >
            <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
          </Stack.Navigator>
      </NavigationContainer>
      );

  if (hasWallet) {
    return (
      <>
        <NavigationContainer theme={theme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarVisible:false,
                }}
                initialRouteName={'Home'}
            >
                <Stack.Screen name="Tabs" component={Tabs} />
                <Stack.Screen name="Backup" component={Backup} />
                <Stack.Screen name="Import" component={Import} />
                <Stack.Screen name="Breed" component={Breed} />
                <Stack.Screen name="Recieve" component={Recieve} />
                <Stack.Screen name="Send" component={Send} />
                <Stack.Screen name="Item" component={Item} />
            </Stack.Navigator>
        </NavigationContainer>
      </>
    )
  }else {
    return (
      <NavigationContainer theme={theme}>
        <Stack.Navigator
              screenOptions={{
                  headerShown: false
              }}
              initialRouteName={'SignUp'}
        >
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default NavigationApp;
