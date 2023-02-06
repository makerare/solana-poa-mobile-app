import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    NativeModules,
} from "react-native"
import { COLORS, SIZES, FONTS, icons, images } from "../constants"

import FlashMessage, {showMessage,} from "react-native-flash-message";



import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import {StatusBarHeight} from '../StatusBarHeight'

let { StatusBarManager } = NativeModules


import {useStoreState} from "../hooks/storeHooks"

import { getBottomSpace } from 'react-native-iphone-x-helper'

import { useIsFocused } from '@react-navigation/native';

import {
  SPL_TOKEN,
  getBalance,
  getSolanaPrice,
  getAllTokens
} from "../api";


import { accountFromSeed, maskedAddress } from "../utils";

import Video from "react-native-video";

let isMountedHome = false;



const Home = ( props ) => {
  const wallet = useStoreState((state) => state.wallet, (prev, next) => prev.wallet.seed === next.wallet.seed);
  const accounts = useStoreState((state) => state.accounts);

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight)
  const [ownedNfts, setOwnedNfts] = React.useState([])
  const [isNftsRefreshing, setIsNftsRefreshing] = useState(false);

  const screenVisible = useIsFocused()
  const [screenActive, setScreenActive] = useState(false);
  const [isTransactionsRefreshing, setIsTransactionsRefreshing] = useState(false);

  const setScreenActiveState = {
    screenActive,
    setScreenActive
  }

  useEffect(()=>
    {
      if (Platform.OS === 'ios')
        StatusBarManager.getHeight(
          response => setStatusBarHeight(response.height)
        )
    }
   );



      useEffect(() => {
        const unsubscribeFocus = props.navigation.addListener('focus', async () => {
          setScreenActive(true);
          setScreenActiveState.screenActive = true;

          if (global.successTx) {
            global.successTx = false
            global.errorMsg = null
            await new Promise(r => setTimeout(r, 700));
            showMessage({
                        message: "Success.",
                        description: "Operation successful.",
                        type: "success",
                        icon: "success",
                        position: 'top',
                        duration: 3000
                      });
         } else if (global.errorMsg){
           const err = global.errorMsg
           global.errorMsg = null
           await new Promise(r => setTimeout(r, 700));

           showMessage({
                       message: "Error",
                       description: err + "",
                       type: "danger",
                       icon: "danger",
                       position: 'top',
                       duration: 3000
                     });
         }
       })

         const unsubscribeBlur = props.navigation.addListener('blur', async () => {
           setScreenActive(true);
           setScreenActiveState.screenActive = true;
          });

        return () => {
          unsubscribeFocus();
          unsubscribeBlur();
        }
      }, [props.navigation]);


   async function tryBreed() {
     try{
       if(!ownedNfts.length)
        throw ""
       setScreenActive(false);
       setScreenActiveState.screenActive = false;
       props.navigation.navigate('Breed')
     }catch (e) {
       showMessage({
         message: "Nothing to breed",
         description: "Get assets first!",
         type: "danger",
         icon: "danger",
         position: 'top',
         duration: 3000
       });
     }
   }

    async function refreshNfts() {
      setIsNftsRefreshing(true)
      try {
       const currentAccount = accounts[0];
       const keyPair = accountFromSeed(
           wallet.seed,
           currentAccount.index,
           currentAccount.derivationPath,
           0
         );
         let tokenBalance = (await getAllTokens(keyPair.publicKey.toString()));
       const newOwnedNfts = [];
       let incrNfts = 0;
       for (const token of tokenBalance) {
         incrNfts++;
         newOwnedNfts.push( {
               id: incrNfts,
               img: token.image,
               video: token.video,
               attributes: token.attributes,
               collection: token.collection?.name,
               description: token.description,
               external_url: token.external_url,
               category: token.category,
               name: token.name,
               mint: token.mint,
               symbol: token.symbol,
               sellerFeeBasisPoints: token.sellerFeeBasisPoints,
               pubkey: String(token.pubkey)
         },)
       }
       if(!isMountedHome) return setIsNftsRefreshing(false)
       setOwnedNfts(newOwnedNfts);
     } catch(e) {
       console.log(e);
     }
       setIsNftsRefreshing(false)
   }

  useEffect(() => {
    isMountedHome = true
    //refreshNfts();
    const unsubscribeFocus = props.navigation.addListener('focus', async () => {
      refreshNfts();
     });

    return () => {
      unsubscribeFocus();
      isMountedHome = false;
    }
  }, []);


function renderHeader() {
    return (
      <>
      <View style={{
                    position:  (Platform.OS === "ios") ? 'absolute' : 'relative',
                    width:'100%',
                    height: statusBarHeight,
                    backgroundColor: COLORS.primary,}}></View>
                          <StatusBar backgroundColor={COLORS.limer} barStyle="light-content" />
        <View style={{
                      zIndex:100,
                      elevation: 100,
                      width:'100%',
                       height: 130,
                       left: 0,
                       backgroundColor: COLORS.primary,
                       borderBottomLeftRadius: SIZES.radius,
                       borderBottomRightRadius: SIZES.radius,}}>
            <View style={{ flex: 1 }}>
            <View
                style={{
                  marginTop: 15,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
            <Image
                source={images.logo}
                resizeMode="contain"
                style={{
                  width: 200,
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
            />
            </View>
            </View>

            {true &&
            <View style={{ position: 'absolute', right: 20, top: 5, }}>
                <TouchableOpacity
                    style={{
                        height: 40,
                        width: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: COLORS.transparent,
                        borderColor: COLORS.white,
                        borderRadius: 15,
                        backfaceVisibility: 'visible',
                        borderWidth: 1,
                    }}
                    onPress={tryBreed}
                >
                    <Image
                        source={icons.bell}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: COLORS.white,
                        }}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            top: -3,
                            right: -3,
                            height: 10,
                            width: 10,
                            backgroundColor: COLORS.red,
                            borderRadius: 5,
                            opacity: !ownedNfts.length ? 0 : null
                        }}
                    >
                    </View>
                </TouchableOpacity>
            </View>}

            <View style={{ flex: 1 }}>
            <View
                style={{
                  marginTop: 31,
                  height: 60,
                  justifyContent: 'center',
                  left: '50%',
                    alignItems: 'center',
                    backgroundColor: COLORS.white,
                    width: 250,
                    marginLeft: -125,
                    marginRight: 'auto',
                    borderRadius: 20,
                    zIndex: 150,
                          elevation: 0
                }}
            >
            <Text style={{ ...FONTS.h4,
                          color: COLORS.primary,
                          backgroundColor: COLORS.white,
                        }}>ASSETS</Text>
            </View>
            </View>

        </View>
      </>
    )
}

function renderNfts() {
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{
                marginVertical: SIZES.base,
                width: SIZES.width / 2.5,
                alignItems: "center",
                justifyContent: 'center',
            }}
            onPress={() => props.navigation.navigate('Item', item)}
        >
            <View
                style={{
                    height: 160,
                    width: '100%',
                    maxWidth: 150,
                    borderRadius: 20,
                    backgroundColor: 'transparent',
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: 'center',
                }}
            >
            {item.video ?
              <Video
                source={{ uri: item.video }}
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: 150,
                  alignItems: "center",
                  justifyContent: 'center',
                  resizeMode: 'contain',
                  flex: 1,
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
                  resizeMode="cover"
                  style={{
                      backgroundColor: "black",
                      width: "100%",
                      height: "100%",
                      maxWidth: 150,
                      padding: 0,
                      alignItems: "center",
                      justifyContent: 'center',
                  }}
              />
            }
            </View>

            <View
                style={{
                    padding: SIZES.padding,
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20
                }}
            >
                <Text style={{
                              lineHeight: 20,
                              fontFamily: "Poppins SemiBold",
                              fontSize: 16,
                              textAlign: "center",
                              marginBottom: 5,
                              textTransform: 'uppercase'}}>{item.collection}</Text>
                <Text style={{ fontFamily: "Poppins Light",
                               lineHeight: 22,
                               fontSize: 20,
                               textAlign: "center", }}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    )



    const noNfts = (
      <View>
         <View style={{
             width: '100%',
             height: '50%',
             alignItems: "center",
             justifyContent: 'center',
             marginTop: 50
         }}>
         <Text
             style={{
               ...FONTS.body1, fontSize: 22, paddingBottom: 5, color: COLORS.lightpurple, fontWeight: 'normal',
             }}>No Asset</Text>
           <Image
               source={icons.empty}
               resizeMode="contain"
               style={{
                   tintColor: COLORS.lightpurple,
                   width: 35,
                   height: 35,
               }}/>
           </View>
         </View>
      );

    return (
        <FlatList
          style={{paddingTop: (Platform.OS === 'android') ? 35 : null, zIndex: 20, marginBottom: 15, backgroundColor: COLORS.lightGray}}
            contentContainerStyle={{ zIndex: 20, paddingHorizontal:  SIZES.width / 15, }}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentInset={{top: 30}}
            refreshControl={
              <RefreshControl
                colors={[COLORS.lightpurple]} // for android
                tintColor={COLORS.lightpurple}
                refreshing={isNftsRefreshing}
                onRefresh={refreshNfts}
                progressViewOffset={30}
              />
            }
            data={ownedNfts}
            keyExtractor={item => `${item.id}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              (ownedNfts.length == 0) ?
                <>{noNfts}</>
              :
              <>
              </>
            }
            ListFooterComponent={
              <View style={{height: (Platform.OS === 'android') ? 100 : 50}}>
              </View>
            }
        />
    )
}

    return (
      <>
      { (screenActive && screenVisible) ? (<FlashMessage
        position={"top"}
        hideStatusBar={false}
        statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight}
        />) : null}
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightGray}}>
            {renderHeader()}
            {renderNfts()}
        </SafeAreaView>
      </>
    )
}

export default Home;
