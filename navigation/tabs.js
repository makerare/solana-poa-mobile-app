import React, {useEffect} from "react";
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from "react-native";
import { createBottomTabNavigator, BottomTabBar } from "@react-navigation/bottom-tabs"
import Svg, {
    Path
} from 'react-native-svg'
import { isIphoneX } from 'react-native-iphone-x-helper'

import { StatusBar, Keyboard, TextInput } from 'react-native';


import { Home, Scan, Wallet } from "../screens"
import { COLORS, SIZES, icons } from "../constants"

import SystemNavigationBar from 'react-native-system-navigation-bar';


const Tab = createBottomTabNavigator()

const TabBarCustomButton = ({ accessibilityLabel, accessibilityState, children, onPress }) => {

    var isSelected = accessibilityState.selected;

    if (isSelected) {
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                    style={{
                        flexDirection: 'row',
                        position: 'absolute',
                        top: 0
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: COLORS.primary }}></View>
                    <Svg
                        width={74}
                        height={61}
                        viewBox="0 0 75 61"
                    >
                        <Path
                            d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9.5-4 3.9-7.1 7.9-7.1h-.1z"
                            fill={COLORS.primary}
                        />
                    </Svg>
                    <View style={{ flex: 1, backgroundColor: COLORS.primary }}></View>
                </View>

                <TouchableOpacity
                    style={{
                        top: -22.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: COLORS.primary,
                        ...styles.shadow
                    }}
                    onPress={onPress}
                >
                    {children}
                </TouchableOpacity>
            </View>
        )
    } else {
        return (
            <TouchableOpacity
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 50,
                    height: 50,
                    backgroundColor: COLORS.primary
                }}
                activeOpacity={1}
                onPress={onPress}
            >
                {children}
            </TouchableOpacity>
        )
    }
}

const CustomTabBar = (props) => {

  useEffect(() => {

    if (global.showBar)
      SystemNavigationBar.navigationShow();
    else
      SystemNavigationBar.navigationHide();

      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', ()=>{global.showBar = true; SystemNavigationBar.navigationShow()});
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', ()=>{global.showBar = false; SystemNavigationBar.navigationHide()});

      return (()=>{
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      })
  }, []);




        return (
          <>
          <View style={{postion: 'absolute', bottom: 0, width: SIZES.width, height: 20, backgroundColor: COLORS.primary}}>
          </View>
          <View>
            <BottomTabBar {...props.props} />
          </View>
          </>
        )

}

const Tabs = () => {
    return (
        <Tab.Navigator
            tabBarOptions={{
              safeAreaInsets: { bottom: 0, top: 0 },
                showLabel: false,
                style: {
                    position: 'absolute',
                    bottom: 20,
                    borderColor: COLORS.primary,
                    borderWidth: 10,
                    left: 0,
                    right: 0,
                    backgroundColor: "transparent",
                    elevation: 0
                }
            }}
            tabBar={(props) => (
                <CustomTabBar
                    props={props}
                />
            )}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={icons.more}
                            resizeMode="contain"
                            style={{
                                width: 25,
                                height: 25,
                                tintColor: focused ? COLORS.white : COLORS.white
                            }}
                        />
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Scan"
                component={Scan}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={icons.scan}
                            resizeMode="contain"
                            style={{
                                width: 25,
                                height: 25,
                                tintColor: focused ? COLORS.white : COLORS.white
                            }}
                        />
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Wallet"
                component={Wallet}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={icons.user}
                            resizeMode="contain"
                            style={{
                                width: 25,
                                height: 25,
                                tintColor: focused ? COLORS.white : COLORS.white
                            }}
                        />
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    )
                }}
            />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    }
})

export default Tabs;
