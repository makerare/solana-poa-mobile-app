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
    StatusBar
} from "react-native"
import LinearGradient from 'react-native-linear-gradient'

import {StatusBarHeight} from '../StatusBarHeight'

import FlashMessage, {showMessage,} from "react-native-flash-message";

import SystemNavigationBar from 'react-native-system-navigation-bar';


import { useIsFocused } from '@react-navigation/native';
import { NumberKeyboard, Header } from "../components";
import { useStoreActions } from "../hooks/storeHooks";

import { COLORS, SIZES, FONTS, icons, images } from "../constants"

import { generateMnemonic, mnemonicToSeed } from "../utils";

const SignUp = ({ navigation }) => {
  SystemNavigationBar.navigationHide();
  const initialMessage = "Create your passcode";
  const confirmMessage = "Confirm your passcode";
  const [pinMessage, setPinMessage] = useState(initialMessage);

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);
  const [pin, setPin] = useState([]);
  const [pin1, setPin1] = useState([]);
  const [pinOk, setPinOk] = useState(false);

  const addWallet = useStoreActions((actions) => actions.addWallet);
  const addDefaultAccount = useStoreActions(
    (actions) => actions.addDefaultAccount
  );

  const addAccount = useStoreActions((actions) => actions.addAccount);

  useEffect(() => {
    if (pin.length === 4 && pin1.length === 0) {
      setPin1(pin);
      setPin([]);
      setPinMessage(confirmMessage);
    }

    if (pin.length === 4 && pin1.length === 4) {
      if (JSON.stringify(pin) === JSON.stringify(pin1)) {
        setPinOk(true);
      } else {
        showMessage({
                    message: "Pin codes do not match.",
                    description: "Both pin codes must be the same.",
                    type: "danger",
                    icon: "danger",
                    position: 'top',
                    duration: 3000
                  });
        setPinMessage("Create your passcode");
        setPin([]);
        setPin1([]);
      }
    }
  }, [pin]);

  const _onPressNumber = (n: number) => {
    setPin([...pin, n]);
  };

  useEffect(() => {
    async function generate() {
      const mnemonic = await generateMnemonic();
      const seed = await mnemonicToSeed(mnemonic);
      addWallet({
        passcode: pin.join(""),
        mnemonic: mnemonic,
        seed: seed,
      });

      addDefaultAccount();
    }

    if (pinOk) {
      generate();
    }
  }, [pinOk]);

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
                  <Header>{pinMessage}</Header>

                  <NumberKeyboard onPress={_onPressNumber} pin={pin} />

                </View>
                </View>
                                </View>
                </ScrollView>
            </LinearGradient>
            {useIsFocused()  && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
        </KeyboardAvoidingView>
    )
}

export default memo(SignUp);
