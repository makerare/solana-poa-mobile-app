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
    Button,
    NativeModules,
    StatusBarIOS
} from "react-native"
import LinearGradient from 'react-native-linear-gradient'

import {useStoreState} from "../hooks/storeHooks"

import QRCode from "react-native-qrcode-svg";

import { accountFromSeed, maskedAddress } from "../utils";

import { NumberKeyboard, Header } from "../components";


import { COLORS, SIZES, FONTS, icons, images } from "../constants"
import { StatusBar } from 'react-native';


import Clipboard from '@react-native-clipboard/clipboard';

import {StatusBarHeight} from '../StatusBarHeight'
const { StatusBarManager } = NativeModules

const Recieve = ({ navigation }) => {

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight)
  useEffect(()=>
    {
      if (Platform.OS === 'ios')
  StatusBarManager.getHeight(response =>
            setStatusBarHeight(response.height))
    }
  );
  const wallet = useStoreState((state) => state.wallet);
  const accounts = useStoreState((state) => state.accounts);

  const [account, setAccount] = useState({});

  useEffect(() => {
    async function generate() {
      const currentAccount = accounts[0];
      setAccount({
        index: currentAccount.index,
        title: currentAccount.title,
        keyPair: accountFromSeed(
          wallet.seed,
          currentAccount.index,
          currentAccount.derivationPath,
          0
        ),
      });
      // }
    }

    generate();
  }, []);



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={[COLORS.lime, COLORS.emerald]}
                style={{ flex: 1 }}
            >

              <ScrollView style={{marginHorizontal: 0,}}
                          scrollEnabled={false}
                          contentContainerStyle={{flexGrow: 1, justifyContent: 'center',alignItems: 'center'}}>
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
                        flex: 1,
                          height: 200,
                          backgroundColor:'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: 250,
                      }}
                  >

                  <Text style={{ fontFamily: "Roboto-Black",
                                 top: 150,
                                 textAlign: 'center',
                                 color: 'white',
                                 fontSize: 40,
                                 paddingBottom:15,
                                 fontWeight: 'bold',
                                 top:0,
                                 marginBottom:20 }}>SOLANA wallet
                  </Text>

                  <View style={{
                    width: "100%",
                    alignItems: "center",
                    borderWidth: 10,
                    borderRadius: 50,
                    borderColor: '#FFFFFF33',
                  }}>
                    <View style={{width: "100%", paddingHorizontal: 30, paddingVertical: 20, flex: 1, alignContent: 'center', justifyContent: 'center'}}>
                      <View style={{ width:'100%', padding: 10, backgroundColor: "transparent",flex: 1, alignItems: 'center' , justifyContent: 'center' }}>
                        <QRCode color= 'white' backgroundColor='transparent' value={account?.keyPair?.publicKey?.toString()} size={190} />
                      </View>
                    </View>

                      <View style={{
                        width: "100%",
                        height: 10,
                        backgroundColor: '#FFFFFF33',
                      }}></View>

                    <TouchableOpacity onPress={() => Clipboard.setString(account.keyPair.publicKey.toString())} style={{ backgroundColor: '#FFFFFF33', borderBottomLeftRadius:40, borderBottomRightRadius:40, width: "100%", paddingBottom: 10, flex: 1, alignContent: 'center', justifyContent: 'center'}}>
                      <View
                        style={{
                          width: "100%",
                          paddingHorizontal: 10,
                          alignItems: 'center'
                      }}>
                        <Text style={{ textAlign: 'center',color: 'white',width: '100%', fontSize: 16, paddingBottom:10, fontWeight: 'bold', marginTop: 10}}>{(account?.keyPair?.publicKey?.toString() )}
                          </Text>
                          <Image source={icons.copy}
                                 resizeMode="contain"
                                 style={{ tintColor: "white",
                                          height: 25,
                                          width: 25,
                                 }}
                           />
                      </View>
                    </TouchableOpacity>
                    </View>
                  </View>
              </ScrollView>
            </LinearGradient>

        </KeyboardAvoidingView>
    )
}

export default memo(Recieve);
