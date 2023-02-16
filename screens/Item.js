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
         Linking,
         NativeModules,
         StatusBarIOS
        } from "react-native";

import LinearGradient from 'react-native-linear-gradient'
import Clipboard from '@react-native-clipboard/clipboard';

import { StatusBarHeight } from '../StatusBarHeight'

import { useIsFocused } from '@react-navigation/native';

import { useStoreState } from "../hooks/storeHooks"

import { sign_nft_ownership } from "../api";

import { COLORS, SIZES, FONTS, icons, images, ENV } from "../constants"

const { StatusBarManager } = NativeModules

import Video from "react-native-video";

import {
  NumberKeyboard,
  Header,
  BackButton,
} from "../components";


const ItemAttributes = ( {attributes} ) => {
  const returned_items = [];
  let incrAttr = 0;
  for (const attribute of Object.keys(attributes)) {
    incrAttr++;
    returned_items.push(
      <View key={incrAttr} style={{borderWidth: 1, borderColor: COLORS.primary, borderRadius: 25, justifyContent: 'center', alignItems: 'center', padding: 6, marginBottom: 20}}>
        <Text style={{ fontFamily: "Poppins-SemiBold", color: COLORS.primary, marginTop: 3, fontSize: 16, lineHeight: 25}}>
          {attribute}
        </Text>
        <Text style={{ fontFamily: "Poppins-Light", color: COLORS.primary, marginTop: 3, fontSize: 16, lineHeight: 25}}>
          {attributes[attribute]}
        </Text>
      </View>
    );
  }
  return returned_items;
}


const Item = ( props ) => {
  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);
  const wallet = useStoreState((state) => state.wallet, (prev, next) => prev.wallet.seed === next.wallet.seed);
  const accounts = useStoreState((state) => state.accounts);

  useEffect(()=>
    {
      if (Platform.OS === 'ios')
  StatusBarManager.getHeight(response =>
            setStatusBarHeight(response.height))
    }
  );

  const item = props.route?.params;

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, backgroundColor: COLORS.lightGray, }}>

        <View style={{
                      position: 'absolute',
                      width:'100%',
                      height: statusBarHeight,
                      backgroundColor: COLORS.primary,}}></View>
        <View style={{
                      width:'100%',
                      height: 60,
                      backgroundColor: COLORS.primary,
                      marginTop: StatusBarHeight,
                       flexDirection: 'row'}}>

            <View style={{flexDirection: 'row',  }}>
              <TouchableOpacity style={{
                                         justifyContent: 'center',
                                         marginLeft: 10,
                                      }}
                                onPress={() => props.navigation.goBack()} >


                <Image
                  source={images.goback}
                  resizeMode="contain"
                  style={{
                     width: 40,
                  }}
                />
                </TouchableOpacity>
              <View style={{ alignItems: 'center',
                             justifyContent: 'center',
                             marginLeft: 15,}}>
                <Text style={{ color: "white",
                               fontFamily: 'Poppins-SemiBold',
                               fontSize: 22,
                               lineHeight: 30}}>
                {props.route?.params.name}

                </Text>
              </View>

            </View>
        </View>

        <ScrollView>
        <View
            style={{
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
        <View style={{
            width: "90%"
        }}>
          <View style={{
              alignItems: 'center',
              justifyContent: 'center',
          }}>
            <TouchableOpacity
                style={{
                    maxWidth: 300,
                    width: "100%",
                    borderRadius: 25,
                    backgroundColor: 'transparent',
                    overflow: "hidden",
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onPress={
                  ()=>Linking.openURL(
                    item.video ? item.video : item.img
                  )
                }
            >

            {item.video ?
              <Video
                source={{ uri: item.video }}
                style={{
                  backgroundColor: "black",
                  maxWidth: 300,
                  width: "100%",
                  height: 300,
                  padding: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                resizeMode={"contain"}
                controls={false}
                audioOnly={false}
                repeat={true}
                volume={0}
                autoplay={true}
                paused={false}
                loop={true}
                muted={true}
                poster={ item.img }
                ref={(ref) => {
                  this.player = ref
                }}
              />
            :
              <Image
                  source={{uri: item.img}}
                  resizeMode="contain"
                  style={{
                    backgroundColor: "black",
                    maxWidth: 300,
                    width: "100%",
                    height: 300,
                    padding: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
              />
            }
            </TouchableOpacity>

            {(item.external_url) && <View style={{ marginTop: 10,
                           justifyContent: 'center',
                           alignItems: 'center'}}>
              <Text onPress={()=>Linking.openURL(item.external_url) }
              style={{ textDecorationLine: "underline",
                       fontFamily: "Poppins-SemiBold",
                       color: COLORS.primary,
                       marginTop: 3,
                       fontSize: 20,
                       lineHeight: 38,
                       marginBottom: 5,
                       justifyContent: 'center',
                       alignItems: 'center',}}>
                {item.external_url.replace(/(^\w+:|^)\/\//, '').split('/')[0]}
              </Text>

            </View>}

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async ()=>{
                const currentAccount = accounts[0];
                const keyPair = accountFromSeed(
                    wallet.seed,
                    currentAccount.index,
                    currentAccount.derivationPath,
                    0
                  );

                const {
                  message,
                  signature,
                  pubkey
                } = sign_nft_ownership(item.mint, keyPair);

                Linking.openURL(
                  `${ENV.claim_url}`
                  +`&message=${message}`
                  +`&signature=${signature}`
                  +`&pubkey=${pubkey}`
                )
              }}
              style={{ width: 150,
                      height: 75,
                       alignItems: 'center',
                       marginTop: 10,
                                     height: 70,
                                     flexDirection: 'column',
                                     borderRadius: 30,
                                     border: 30,
                                     backgroundColor:  COLORS.primary,
                                     alignItems: 'center',
                                     justifyContent: 'center', }}
            >
            <View style={{ width: "100%",}}>

              <View style={{ width: "100%"
                             }}>
                 <View style={{ justifyContent: 'center',
                                alignItems: 'center',
                                postion: "absolute",
                                height: 65,
                                flexDirection: 'row',
                              }}>
                                <Image
                                    source={icons.claim}
                                    resizeMode="contain"
                                    style={{
                                      tintColor: 'white',
                                        width: 30,
                                        height: 30,
                                    }}
                                />
                                <Text style={{ fontFamily: "Poppins-Medium", color: "white", marginTop: 3, fontSize: 22}}>
                                  &nbsp;&nbsp;USE&nbsp;&nbsp;
                                </Text>
                  </View>
              </View>
            </View>
            </TouchableOpacity>


            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async ()=>{
                props.navigation.navigate('Send',
                                          { selectedNFT: item.mint })
              }}
              style={{ width: 150,
                      height: 75,
                       alignItems: 'center',
                       marginTop: 10,
                                     height: 70,
                                     flexDirection: 'column',
                                     borderRadius: 30,
                                     border: 30,
                                     backgroundColor:  COLORS.primary,
                                     alignItems: 'center',
                                     justifyContent: 'center', }}
            >
            <View style={{ width: "100%",}}>

              <View style={{ width: "100%"
                             }}>
                 <View style={{ justifyContent: 'center',
                                alignItems: 'center',
                                postion: "absolute",
                                height: 65,
                                flexDirection: 'row',
                              }}>
                                <Image
                                    source={icons.send}
                                    resizeMode="contain"
                                    style={{
                                      tintColor: 'white',
                                        width: 30,
                                        height: 30,
                                    }}
                                />
                                <Text style={{ fontFamily: "Poppins-Medium", color: "white", marginTop: 3, fontSize: 22}}>
                                  &nbsp;&nbsp;SEND&nbsp;&nbsp;
                                </Text>
                  </View>
              </View>
            </View>
            </TouchableOpacity>

          </View>

          <View
              style={{
                  marginTop: 20
              }}
          >
          <View style={{}}>
            <Text style={{ fontFamily: "Poppins-SemiBold", color: COLORS.primary, marginTop: 3, fontSize: 25, lineHeight: 34}}>
              Collection
            </Text>
            <Text style={{ fontFamily: "Poppins-Light", color: COLORS.primary, marginTop: 3, fontSize: 20, lineHeight: 30}}>
              <Text style={{fontFamily: "Poppins-LightItalic"}}>[{item.symbol}]</Text> {item.collection}
            </Text>
          </View>

            <View style={{}}>
              <Text style={{  fontFamily: "Poppins-SemiBold", color: COLORS.primary, marginTop: 15, fontSize: 25, lineHeight: 34}}>
                Description
              </Text>
              <Text style={{ fontFamily: "Poppins-Light", color: COLORS.primary, marginTop: 3, fontSize: 20, lineHeight: 30}}>
                {item.description}
              </Text>
            </View>

            <View style={{}}>
              <Text style={{ fontFamily: "Poppins-SemiBold", color: COLORS.primary, marginTop: 15, fontSize: 25, lineHeight: 34}}>
                Royalties
              </Text>
              <Text style={{ fontFamily: "Poppins-Light", color: COLORS.primary, marginTop: 3, fontSize: 20, lineHeight: 30}}>
                {item.sellerFeeBasisPoints/100}%
              </Text>
            </View>


            <View style={{marginTop: 10}}>
              <Text style={{ fontFamily: "Poppins-SemiBold", color: COLORS.primary, marginTop: 3, fontSize: 25, lineHeight: 38, marginBottom: 5}}>
                Attributes
              </Text>

              <ItemAttributes attributes={item.attributes} />
            </View>


            <View style={{ marginTop: 10,
                           marginBottom: 30,
                           justifyContent: 'center',
                           alignItems: 'center'}}>
              <Text onPress={()=>Linking.openURL('https://explorer.solana.com/address/'+item.mint+'?cluster=' + ENV.network) }
              style={{ textDecorationLine: "underline",
                       fontFamily: "Poppins-SemiBold",
                       color: COLORS.primary,
                       marginTop: 3,
                       fontSize: 20,
                       lineHeight: 38,
                       marginBottom: 5,
                       justifyContent: 'center',
                       alignItems: 'center',}}>
                View on explorer
              </Text>

            </View>

          </View>

        </View>
        </View>
          </ScrollView>

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

export default memo(Item);
