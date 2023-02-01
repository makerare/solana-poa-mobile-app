import React, { memo, useEffect, useState } from "react";
import { View,
         StyleSheet,
         Button,
         Text,
         KeyboardAvoidingView,
         ScrollView,
         Image,
         TouchableOpacity,
         StatusBar,
         NativeModules,
         StatusBarIOS
        } from "react-native";

import LinearGradient from 'react-native-linear-gradient'
import Clipboard from '@react-native-clipboard/clipboard';

import FlashMessage, {showMessage, } from "react-native-flash-message";

import { useIsFocused } from '@react-navigation/native';

import { COLORS, SIZES, FONTS, icons, images, ENV } from "../constants"

import {
  NumberKeyboard,
  Header,
  BackButton,
} from "../components";


import {StatusBarHeight} from '../StatusBarHeight'
const { StatusBarManager } = NativeModules

import {useStoreState} from "../hooks/storeHooks"



const Backup = ({ navigation }) => {
  const initialMessage = "Enter your passcode";
  const [headerMessage, setHeaderMessage] = useState(initialMessage);
  const [pin, setPin] = useState([]);
  const [pinOk, setPinOk] = useState(false);

  const [mnemonic, setMnemoic] = useState([]);

  const wallet = useStoreState((state) => state.wallet);

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);
  useEffect(()=>
    {
      if (Platform.OS === 'ios')
        StatusBarManager.getHeight(response =>
                  setStatusBarHeight(response.height))
    }
  );


  useEffect(() => {
    if (pin.length === 4) {
      setPinOk(true);
    }
  }, [pin]);

  const _onPressNumber = (n: number) => {
    setPin([...pin, n]);
  };

  useEffect(() => {
    async function getMnemonic() {
      if (pin.join("") === wallet.passcode) {
        setMnemoic(wallet.mnemonic.split(" "));
        setHeaderMessage("Your recovery phrase");
      } else {
        showMessage({
                    message: "Wrong passcode.",
                    description: "Try again!",
                    type: "danger",
                    icon: "danger",
                    position: 'top',
                    duration: 3000
                  });
        setPin([]);
        setPinOk(false);
      }
    }
    if (pinOk) {
      getMnemonic();
    }
  }, [pinOk]);

  const words = () => {
    return (
      <View style={styles.container}>
        <View style={{flex: 1,}}>
          <Text>
            {mnemonic.slice(0, ENV.seed_length/2).map((word, index) => (
              <Text style={{  fontSize: 18,
                              lineHeight: 30,
                              color: "white",
                              textAlign: "left",
                              fontWeight: "bold"}} key={index + 1}>{`${index + 1}. ${word}`}{"\n"}</Text>
            ))}
          </Text>
        </View>
        <View style={{justifyContent:'flex-end'}}>
          <Text>
            {mnemonic.slice(ENV.seed_length/2, ENV.seed_length).map((word, index) => (
              <Text style={{  fontSize: 18,
                              lineHeight: 30,
                              color: "white",
                              textAlign: "left",
                              marginBottom: 2,
                              fontWeight: "bold",
                            }} key={index + ENV.seed_length/2 +1} >{`${
                index + ENV.seed_length/2 + 1
              }. ${word}`}{"\n"}</Text>
            ))}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, }}
    >

        <LinearGradient
            colors={[COLORS.lime, COLORS.emerald]}
            style={{ flex: 1, }}
        >
            <ScrollView style={{marginHorizontal: 0,}}
                        scrollEnabled={false}
                        contentContainerStyle={{ flexGrow: 1,
                                                 alignitems: 'center',
                                                 justifyContent: 'center'}}>

                                                 <TouchableOpacity style={{ width: 40,
                                                                            position: "absolute",
                                                                            left: 15,
                                                                            top: statusBarHeight
                                                                         }}
                                                                   onPress={() => navigation.goBack()} >

                                                   <Image
                                                     source={images.goback}
                                                     resizeMode="contain"
                                                     style={{
                                                         width: "100%",
                                                     }}
                                                   />
                                                 </TouchableOpacity>
               <View
                   style={{
                       alignItems: 'center',
                       justifyContent: 'center'
                   }}
               >
            <View style={{ alignItems: 'center',
                           width: 250,
                           justifyContent: 'center'}}>
              <Header>{headerMessage}</Header>
              {mnemonic.length === 0 ? (
                <NumberKeyboard onPress={_onPressNumber} pin={pin} />
              ) : (
                words()
              )}

            </View>

            </View>
            </ScrollView>
        </LinearGradient>
        {useIsFocused()  && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignContent: "space-between",
  },
});

export default memo(Backup);
