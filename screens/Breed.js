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

import { Spinner } from "../components";

import { accountFromSeed } from "../utils";

import { breed_nft } from "../api";


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
  const initialMessage = "Breed assets";
  const [headerMessage, setHeaderMessage] = useState(initialMessage);
  const [pin, setPin] = useState([]);
  const [pinOk, setPinOk] = useState(false);
  const accounts = useStoreState((state) => state.accounts);

  const [txInProgress, setTxInProgress] = useState(false);

  const [mnemonic, setMnemoic] = useState([]);

  const wallet = useStoreState((state) => state.wallet);

  const isFoc = useIsFocused();

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
    async function makeBreed() {
      if (pin.join("") === wallet.passcode) {
        setTxInProgress(true)
        // MAKE BREED
        try{
          const currentAccount = accounts[0];
          const keyPair = accountFromSeed(
              wallet.seed,
              currentAccount.index,
              currentAccount.derivationPath,
              0);
          const res = await breed_nft(
            keyPair.publicKey.toString(),
          );

          if (res.data?.error !== undefined)
             throw "" + res.data?.error;

          global.successTx = true


        }catch (e) {
          global.errorMsg = "" + e
          global.successTx = false
        }
        setTxInProgress(false)
        navigation.navigate('Home');
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
      makeBreed();
    }
  }, [pinOk]);

  const words = () => {
    return (
      <></>
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

            { isFoc && <Spinner
            visible={txInProgress}
            textContent={'Transaction in progess...'}
            textStyle={
              {color: 'white'}
            }
            overlayColor={"#000000AA"}
          />}

        </LinearGradient>
       { isFoc  && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
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
