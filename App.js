/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Sending']);
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

import NavigationApp from "./navigationapp";


import store from "./store";


import { StoreProvider } from "easy-peasy";


const App = () => {
    return (
      <StoreProvider store={store}>
        <NavigationApp />
      </StoreProvider>
    )
}

export default App;
