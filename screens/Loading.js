import React, { memo, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    TextInput,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StatusBar,
    RefreshControl
} from "react-native"
import LinearGradient from 'react-native-linear-gradient'

import FlashMessage, {showMessage,} from "react-native-flash-message";

import SystemNavigationBar from 'react-native-system-navigation-bar';

import {StatusBarHeight} from '../StatusBarHeight'

import { useIsFocused } from '@react-navigation/native';
import { NumberKeyboard, Header, Spinner } from "../components";
import { useStoreActions } from "../hooks/storeHooks";

import { COLORS, SIZES, FONTS, icons, images } from "../constants"

const Loading = ({ navigation }) => {
  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
        >
        <StatusBar backgroundColor={COLORS.limer} barStyle="light-content" />
            <LinearGradient
                colors={[COLORS.lime, COLORS.emerald]}
                style={{ flex: 1 }}
            >
                <ScrollView style={{marginHorizontal: 0,}}
                            scrollEnabled={false}
                            contentContainerStyle={{ flexGrow: 1,
                                                     alignitems: 'center',
                                                     justifyContent: 'center'}}>
                                                     <View
                                                         style={{
                                                             alignItems: 'center',
                                                             justifyContent: 'center'
                                                         }}
                                                     >
                                                  <View style={{ alignItems: 'center',
                                                                 width: 250,
                                                                 justifyContent: 'center'}}>

                <View style={{ marginTop: 50,
                               alignItems: 'center',
                               textAlign: 'center',
                               justifyContent: 'center',
                               width: 250}}>

                               <Spinner
                               visible={true}
                               overlayColor={"#00000000"}
                             />
                </View>
                </View>
                                </View>
                </ScrollView>
            </LinearGradient>
            {useIsFocused()  && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
        </KeyboardAvoidingView>
    )
}

export default memo(Loading);
