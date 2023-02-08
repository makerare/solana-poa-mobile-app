import React, { Component, useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableHighlight,
    LayoutAnimation,
    Platform,
    UIManager,
    Linking,
    TouchableWithoutFeedback,
    RefreshControl,
    NativeModules,
    StatusBarIOS
} from "react-native"

import { useIsFocused } from '@react-navigation/native';

import { COLORS, SIZES, FONTS, ENV, icons, images } from "../constants"

import { Shadow } from 'react-native-shadow-2';

import { useStoreState } from "../hooks/storeHooks";

import { accountFromSeed, maskedAddress } from "../utils";
import FlashMessage, {showMessage,} from "react-native-flash-message";

import {StatusBarHeight} from '../StatusBarHeight'
const { StatusBarManager } = NativeModules


import {
  SPL_TOKEN,
  getBalance,
  getHistory,
  getSolanaPrice,
  getTokenBalance,
} from "../api";



class ExpandableBtn extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
    };
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  changeLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const renderAssets = ( item ) => {
      if(!item.assets.length) {
        return (
          <View>
          </View>
        );
      } else {
        return (
          <View style={{ justifyContent: 'center',
                         alignItems: 'center',
                         flexDirection: 'row',
                         borderWidth: 2,
                         borderRadius: 10,
                         paddingVertical: 2,
                         paddingHorizontal: 5,
                         borderColor: (item.assets[0].incoming ? COLORS.incoming : COLORS.outgoing),
                         backgroundColor: (item.assets[0].incoming ? COLORS.incoming : COLORS.outgoing),
                      }}>
            <Text style={{ //...FONTS.h4, fontSize: 22,
            fontWeight: "bold",
            textShadowOffset: {width: -1, height: 1},
             lineHeight: 25,
            textShadowRadius: 5,
            color: COLORS.white }}>{(item.assets[0].incoming ? "+" : "-")}</Text>
            <Text style={{ //...FONTS.h4, fontSize: 19,
            fontWeight: "bold",
            textShadowOffset: {width: -1, height: 1},
             lineHeight: 25,
            textShadowRadius: 5,
            color: COLORS.white}}>{item.assets.length}</Text>
            <Text style={{ //...FONTS.body4, fontSize: 15,
            fontWeight: "bold",
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 5,
             lineHeight: 25,
            color: COLORS.white}}>  asset</Text>
          </View>
        );
      }
    };
    const item = this.props.item;
    return (
      <Shadow
        distance={5}
        startColor={'#00000015'}
        containerViewStyle={{marginVertical: 10}}
        radius={15}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={this.changeLayout}
              style={{
                              marginVertical: 0,
                              width: SIZES.width * 0.86,
                              flexDirection: 'column',
                              backgroundColor: COLORS.darkgray,
                              borderRadius: 15,
                              backgroundColor: 'white', }}
            >
            <View style={{
                height: 100, width: "100%", flexDirection: 'row'}}>
            <View
                style={{
                    height: 100,
                    width: "25%",
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={icons[item.type]}
                    resizeMode="contain"
                    style={{
                      tintColor: item.type == 'contract' ? '#ff7800' : (item.amountIncoming ? COLORS.incoming : COLORS.outgoing),
                        width: 40,
                        height: 40,
                    }}
                />
            </View>

            <View style={{ width: "50%",justifyContent: 'center',
                           alignItems: 'center',}}>
               <View style={{ justifyContent: 'center',
                              alignItems: 'center',
                              postion: "absolute",
                              flexDirection: 'row'}}>
                              <Text style={{ //...FONTS.h4,
                                fontSize: 22,
                                color: (item.amountIncoming ? COLORS.incoming : COLORS.outgoing),
                                fontWeight: 'bold',}}>
                                  {(item.amountIncoming ? "" : "-") + item.amountInt}{(item.amountFloat == "" ? "" : ".")}
                              </Text>
                              <Text style={{ //...FONTS.h4,
                                fontSize: 19,
                                color: (item.amountIncoming ? COLORS.incoming : COLORS.outgoing),
                                fontWeight: 'bold',}}>
                                  {item.amountFloat}
                              </Text>
                              <Text style={{ //...FONTS.body1, fontSize: 12,
                                fontWeight: 'bold',
                                color: (item.amountIncoming ? COLORS.incoming : COLORS.outgoing),}}>  SOL</Text>
                </View>
                {!this.state.expanded && renderAssets(item)}
            </View>
            <View style={{ width: "25%",
                           justifyContent: 'center',
                           }}>
              <Text style={{ //...FONTS.body4,
                                width: "100%",
                                textAlign: 'right',
                                paddingRight: "20%",
                                fontSize: 9, }}>{item.date}</Text>
              <Text style={{ //...FONTS.body4,
                                width: "100%",
                                textAlign: 'right',
                                paddingRight: "20%",
                              fontSize: 12, }}>{item.time}</Text>
            </View>
            </View>
            <View
              style={{
                height: this.state.expanded ? null : 0,
                overflow: "hidden",
                width: '100%',
                alignItems: 'center',
              }}
            >
            <TransferedNFTs assets={item.assets}/>
            <Text style={{ fontSize: 15 ,
                           width: '100%',
                           alignItems: 'center',
                           textAlign: 'center',
                           paddingBottom: 20}}>
              <Text style={{ color: COLORS.black,
                             textDecorationLine: "underline"}}
                    onPress={()=>Linking.openURL('https://explorer.solana.com/tx/'+item.txId+'?cluster=' + ENV.network) }
              >
                View on explorer
              </Text>
            </Text>
            </View>
            </TouchableOpacity>

      </Shadow>
    );
  }
}


const TransferedNFTs =  ( props ) => {
  if (props.assets.length == 0)
    return (
      <View style={{ width: 0,
                     height: 0}}>
      </View>
    );

  const returnedComps = [];
  let incrProp = 0;
  for (const asset of props.assets) {
    incrProp += 1;
    returnedComps.push(
      <View key={incrProp}
            style={{ justifyContent: 'center',
                     alignItems: 'center',
                     marginBottom: 10,
                     flex: 1,
                  }}>
                    <View style={{flex: 1,
                        width: "80%",
                        alignItems: "center",
                        justifyContent: 'center',
                        flexDirection: 'row',
                        borderWidth: 3,
                        borderColor: (asset.incoming ? COLORS.incoming : COLORS.outgoing),
                        borderRadius: 15,
                        padding: 5
                    }}>
                    <View
                        style={{
                            flex: 1,
                            width: '50%',
                            padding: 10,
                            justifyContent: 'center',
                            textAlign: 'right',
                        }}
                    >
                      <Text style={{ //...FONTS.h4,
                        textAlign: 'center', fontSize: 21, lineHeight: 25, textDecorationLine: 'underline', color:'#505050'}}>{asset.data.name}</Text>

                      <View style={{width:"100%", flexDirection: "row",}}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color:'#505050',width: "100%",textAlign: 'center'}}>
                          Collection
                        </Text>
                        <Text style={{ //...FONTS.body4,
                           fontSize: 16,textAlign: 'center', marginLeft: 'auto', color:'#505050', width:"100%"}}>
                          {'\n '+asset.data.collection.name}
                        </Text>
                      </View>
                    </View>
                    <View
                        style={{
                            height: 100,
                            width: '50%',
                            padding: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                      <View
                          style={{
                            height: 100,
                            width: 100,
                            borderRadius: 15,
                            overflow: 'hidden',
                            backgroundColor: COLORS.black,
                          }}
                      >
                          <Image
                              source={{uri: asset.data.image}}
                              resizeMode="contain"
                              style={{
                                backgroundColor: 'black',
                                height: 100,
                                width: 100,
                              }}
                          />
                        </View>
                    </View>
                      </View>
      </View>
    );
  }

  return returnedComps;
}

const Balance =  ( props ) => {
  if (props.balData.ready){
    return (
      <View
          style={{
              flexDirection: "row",
              width: '100%',
              justifyContent: 'center',
              alignItems: 'flex-end',
              textAlignVertical: 'bottom'
          }}
      >
        <Text style={{ //fontFamily: 'Poppins-Regular' ,
                      top: 10,
                      fontSize: 38,
                      color: COLORS.white,
                    }}>{props.balData.intVal.toString()}</Text>
        <Text style={{ //fontFamily: 'Poppins-Regular',
                      fontSize: 32,
                      color: COLORS.white,
                      top: 7,
                    }}>{props.balData.floatVal.toString()} </Text>
        <Text style={{ //fontFamily: 'Poppins-Regular',
                      fontSize: 20,
                      color: COLORS.white,
                    }}>SOL</Text>
      </View>
    );
  } else {
    return (
      <View
          style={{
            flexDirection: "row",
            width: '100%',
            justifyContent: 'center',
            alignItems: 'flex-end',
            textAlignVertical: 'bottom'
          }}
      >
      <Text style={{ ...FONTS.body1,
                    fontSize: 36,
                    color: COLORS.white,
                    top: 7,
                  }}>- </Text>
      <Text style={{ //...FONTS.h1,
                    fontSize: 20,
                    color: COLORS.white,
                  }}>SOL</Text>
      </View>
    );
  }
}


class WalletManagementMenu extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
      expanded_over: false,
    };
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  changeLayoutMenu = () => {
    let animTime = 100;
    let animeType= "opacity";

    if (Platform.OS === "android")
      animeType = "scaleXY"

    LayoutAnimation.configureNext(LayoutAnimation.create(animTime, 'easeInEaseOut', animeType));

    var that = this;
    const myTimeout = setTimeout(  function myStopFunction() {
        that.setState({ expanded: that.state.expanded, expanded_over: that.state.expanded });
      }, animTime);


    this.setState({ expanded: !this.state.expanded, expanded_over: this.state.expanded_over });
  };

  closeLayoutMenu = () => {
    if(this.state.expanded) {
      this.changeLayoutMenu();
    }
  };

  render() {

  return (
      <React.Fragment>
      {this.state.expanded && <TouchableWithoutFeedback onPress={this.closeLayoutMenu}>
        <View style={{width: SIZES.width, height: SIZES.height,  position: 'absolute', left: 0, top: 0}} />
      </TouchableWithoutFeedback>}


        <View style={{ position: 'absolute',
                       left: 10,
                       top: 0,
                       width: this.state.expanded ? null : 0,
                       height: this.state.expanded ? null : 0 }}>
            <TouchableOpacity
                onPress={this.changeLayoutMenu}
                style={{
                    height: 40,
                    width: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: COLORS.transparent,
                    borderColor: COLORS.white,
                    borderRadius: 15,
                    backfaceVisibility: 'visible',
                }}
            >
                <Image
                    source={icons.dots}
                    style={{
                        width: 20,
                        height: 20,
                        tintColor: COLORS.white
                    }}
                />
            </TouchableOpacity>
        </View>

         <View style={{ position: 'absolute',
                        left: 45,
                        top: 40,
                        width: this.state.expanded ? null : 0,
                        height: this.state.expanded ? null : 0, }}>
            <TouchableOpacity
                onPress={()=>{
                  if (!this.state.expanded)
                    return;


                  this.props.setScreenActiveState.setScreenActive(false);
                  this.props.setScreenActiveState.screenActive = false;

                  this.props.navigation.navigate('Backup')
                  this.closeLayoutMenu();
                }}
                style={{
                    margin: 0,
                    width: this.state.expanded ? null : 0,
                    height: this.state.expanded ? 40 : 0,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.primary,
                    paddingHorizontal: 15,
                    borderWidth: this.state.expanded ? 3 : 0,
                    borderBottomWidth: this.state.expanded ? 1 : 0,
                    borderTopRightRadius: 15,
                    backfaceVisibility: 'visible',
                }}
            >
                          <Text style={{ //...FONTS.body1,
                            fontSize: 16,
                            color: this.state.expanded_over ? COLORS.primary : 'transparent' ,}}>Export wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={async ()=>{
                  if (!this.state.expanded)
                    return;
                  this.props.setScreenActiveState.setScreenActive(false);
                  this.props.setScreenActiveState.screenActive = false;

                  this.props.navigation.navigate('Import')
                  this.closeLayoutMenu();
                }}
                style={{
                    width: this.state.expanded ? null : 0,
                    height: this.state.expanded ? 40 : 0,
                    flexWrap: 'wrap',
                    margin: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: COLORS.white,
                    paddingHorizontal: 15,
                    borderColor: COLORS.primary,
                    borderWidth: this.state.expanded ? 3 : 0,
                    borderTopWidth: this.state.expanded ? 1 : 0,
                    borderBottomLeftRadius: 15,
                    borderBottomRightRadius: 15,
                    backfaceVisibility: 'visible',
                }}
            >
            <Text style={{ //...FONTS.body1,
                          fontSize: 16,
                          flexWrap: 'wrap',
                          color: this.state.expanded_over ? COLORS.primary : 'transparent',}}>Import wallet</Text>
            </TouchableOpacity>
        </View>
      </React.Fragment>
  );
}
}

let isMounted = false;

const Wallet = ( props ) => {
  const wallet = useStoreState((state) => state.wallet);
  const accounts = useStoreState((state) => state.accounts);
  const screenVisible = useIsFocused()
  const [screenActive, setScreenActive] = useState(false);
  const [isTransactionsRefreshing, setIsTransactionsRefreshing] = useState(false);

  const setScreenActiveState = {
    screenActive,
    setScreenActive
  }

  async function refreshTransactions() {
     setIsTransactionsRefreshing(true)
     try {
       const currentAccount = accounts[0];
       const keyPair = accountFromSeed(
           wallet.seed,
           currentAccount.index,
           currentAccount.derivationPath,
           0
         );
       const bal = String(await getBalance(keyPair.publicKey.toString()));
       const parts = bal.split('.');
       const isInt = parts.length == 1;

       if(!isMounted) return setIsTransactionsRefreshing(false)
       setBalance({ ready: true,
                    intVal: parts[0] + (isInt ? '' : '.'),
                    floatVal: (isInt ? '' : parts[1]),
                    isInt: isInt,
                    value: bal,
       });

       const history = await getHistory(keyPair.publicKey.toString());

       if(!isMounted) return setIsTransactionsRefreshing(false)
       setTransactions(history);
     } catch(e) {
      console.log(e);
     }
     setIsTransactionsRefreshing(false)

  }

   useEffect(() => {
     isMounted = true;
     const unsubscribeFocus = props.navigation.addListener('focus', async () => {
       setScreenActive(true);
       setScreenActiveState.screenActive = true;

       refreshTransactions()
       if (global.successTx) {
         global.successTx = false
         global.errorMsg = null
         await new Promise(r => setTimeout(r, 700));
         showMessage({
                     message: "Success",
                     description: "Transaction was successefuly submitted.",
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
                    message: "Cannot proceed to breeding",
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
     //refreshTransactions();

     return () => {
       unsubscribeFocus();
       unsubscribeBlur();
       isMounted = false // Let's us know the component is no longer mounted.
     }
   }, [props.navigation]);


  const [transactions, setTransactions] = React.useState([])
  const [balance, setBalance] = React.useState({ready: false})

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight)
  useEffect(()=>
    {
      if (Platform.OS === 'ios')
  StatusBarManager.getHeight(response =>
            setStatusBarHeight(response.height))
    }
  );

  const btnHeight = 70;
  const btnWidth = 70;
  const btnMargin = 30;
  const btnPadding = 18;

function renderHeaderWallet() {
    return (
      <>
      <View style={{
                    position:  (Platform.OS === "ios") ? 'absolute' : 'relative',
                    width:'100%',
                    height: statusBarHeight,
                    backgroundColor: COLORS.primary,}}></View>
        <View style={{
                      zIndex:100,
                      elevation: 100,
                      backgroundColor: 'blue',
                      width:'100%',
                       height: 190,
                       left: 0,
                       backgroundColor: COLORS.primary,
                       borderBottomLeftRadius: SIZES.radius,
                       borderBottomRightRadius: SIZES.radius,}}>

            <View style={{}}>
              <View style={{marginTop: 0}}>
                <Balance balData={balance}/>
              </View>
              <View
                  style={{
                    marginTop: 15,
                      justifyContent: 'center',
                      flexDirection: "row"
                  }}>

                            <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={()=>{
                              setScreenActive(false);
                              setScreenActiveState.screenActive = false;
                              props.navigation.navigate('Send')
                            }}
                                style={{
                                    height: btnHeight,
                                    maxWidth: btnWidth,
                                    marginHorizontal: btnMargin,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: COLORS.lightpurple,
                                    borderRadius: btnWidth,
                                    backfaceVisibility: 'visible',
                                    flex: 1
                                }}
                            >
                                <Image
                                    source={icons.send}
                                    style={{
                                        width: btnWidth - 2 * btnPadding,
                                        height: btnWidth - 2 * btnPadding,
                                        tintColor: COLORS.white
                                    }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                            activeOpacity={0.5}
                                onPress={()=>{
                                  setScreenActive(false);
                                  setScreenActiveState.screenActive = false;
                                  props.navigation.navigate('Recieve')
                                }}
                                style={{
                                    height: btnHeight,
                                    maxWidth: btnWidth,
                                    marginHorizontal: btnMargin,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: COLORS.lightpurple,
                                    borderRadius: btnWidth,
                                    backfaceVisibility: 'visible',
                                    flex: 2
                                }}
                            >
                                <Image
                                    source={icons.recieve}
                                    style={{
                                        width: btnWidth - 2 * btnPadding,
                                        height: btnWidth - 2 * btnPadding,
                                        tintColor: COLORS.white
                                    }}
                                />
                            </TouchableOpacity>

              </View>

            </View>

            <View style={{alignItems: 'center', }}>
            <View
                style={{
                  height: 60,
                  marginTop: 20,
                  justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: COLORS.white,
                    width: 250,
                    borderRadius: 20,
                    zIndex: 150,
                }}
            >
            <Text style={{ fontFamily: "Poppins-Light",
                          color: COLORS.primary,
                          backgroundColor: COLORS.white,
                          fontSize: 24,
                          lineHeight: 34
                        }}>TRANSACTIONS</Text>
            </View>
            </View>
          <WalletManagementMenu statusBarHeight={statusBarHeight} navigation={props.navigation} setScreenActiveState={setScreenActiveState} />
        </View>
      </>
    )
}


function renderTransactions() {
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

   const noTransactions = (
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
            }}>No History</Text>
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

    const renderAssets = ( item ) => {
      if(!item.assets) {
        return (
          <View>
          </View>
        );
      } else {
        return (
          <View style={{ justifyContent: 'center',
                         alignItems: 'center',
                         flexDirection: 'row'}}>
            <Text style={{ ...FONTS.h4, fontSize: 22,textShadowColor: COLORS.primary,
            backgroundColor: COLORS.white,
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 5 }}>{(item.amountIncoming ? "" : "-")}</Text>
            <Text style={{ ...FONTS.h4, fontSize: 19, textShadowColor: COLORS.primary,
            backgroundColor: COLORS.white,
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 5}}>{item.assets.length}</Text>
            <Text style={{ ...FONTS.body4, fontSize: 15, textShadowColor: COLORS.primary,
            backgroundColor: COLORS.white,
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 5}}>  asset</Text>
          </View>
        );
      }
    };

    const renderItem = ({ item }) => (
      <ExpandableBtn item={item}/>
    )
    return (
        <FlatList
          style={{ paddingTop: (Platform.OS === 'android') ? 35 : null,
                   zIndex: 20,
                   marginBottom: 15,
                 }}
            contentContainerStyle={{ zIndex: 20,
                                     alignItems: 'center' }}
            data={transactions}
            contentInset={{top: 30}}
            refreshControl={<RefreshControl
                    colors={[COLORS.lightpurple]} // for android
                    tintColor={COLORS.lightpurple}
                    refreshing={isTransactionsRefreshing}
                    bounces={false}
                    onRefresh={refreshTransactions}
                    progressViewOffset={30} />}
            keyExtractor={item => `${item.id}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              (transactions.length === 0) ?
                <>{noTransactions}</>
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
      { screenActive && screenVisible ? (<FlashMessage
        position={"top"}
        hideStatusBar={false}
        statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight}
      />) : null}
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightGray}}>
            {renderHeaderWallet()}
            {renderTransactions()}
        </SafeAreaView>
</>
    )
}


export default Wallet;
