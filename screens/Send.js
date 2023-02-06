import React, { memo, useEffect, useState, Component } from "react";
import { View,
         StyleSheet,
         Text,
         Image,
         StatusBar,
         NativeModules,
         StatusBarIOS,
         TouchableOpacity,
         TouchableWithoutFeedback,
         TextInput,
         Modal,
         FlatList,
         KeyboardAvoidingView,
         ScrollView,
         Platform,
         LayoutAnimation,
         Button,
         UIManager,
        } from "react-native";

import LinearGradient from 'react-native-linear-gradient'
import Clipboard from '@react-native-clipboard/clipboard';

import FlashMessage, {showMessage, } from "react-native-flash-message";
import { Spinner } from "../components";
import { SpinnerNoModal } from "../components";
import {Shadow} from 'react-native-shadow-2';


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

import { getBalance,
         getSolanaPrice,
         transaction,
         getAllTokens,
         getFeesAndBalance,
         isValidAddress,
         sendTx } from "../api";


import { accountFromSeed, maskedAddress } from "../utils";



function makeIntoValidAmount(x) {
  const strFixed = x
                   .toFixed(9)
                   .toString()
                   .replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');
  const parsedFl = parseFloat(strFixed)


  if (parsedFl == 0) {
    return "0";
  }

  if (parsedFl <= 0.000000001 && parsedFl != 0)
    return "0.000000001";
  return strFixed;
}


class ExpandableBtn extends Component {

  constructor(props) {
    super();

    this.state = {
      expanded: props.selectedNFT != 'none',
      btnPressed: false
    };


    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  changeLayout = () => {
    if (this.state.expanded) {
      this.props.setSelectedNFT('none')
    }
    this.setState({ expanded: !this.state.expanded,
                    btnPressed: this.state.btnPressed });
    LayoutAnimation.configureNext(LayoutAnimation.create(100, 'easeInEaseOut', 'opacity'));
  };

  render() {
    return (
      <View style={{ width: "100%",
                     alignItems: 'center',
                     justifyContent: 'center', }} >
            <View style={{ width: "100%",
                           height: this.state.expanded ? null : 60,
                           paddingTop: this.state.expanded ? 0 : 10,
                           flexDirection: 'column',
                           borderColor: COLORS.sendBorders,
                           borderTopWidth: this.state.expanded ? 10 : 6,
                           borderBottomWidth: this.state.expanded ? 10 : 5,
                           backgroundColor: "rgba(52, 52, 52, 0.6)",
                           alignItems: 'center',
                           justifyContent: 'center',
                          }}>
            <TouchableOpacity
              onPressIn={()=>{ this.state.btnPressed = true;
                               this.setState( { expanded: this.state.expanded,
                                                btnPressed: true
                               });
              }}
              onPressOut={()=>{ this.state.btnPressed = false;
                               this.setState( { expanded: this.state.expanded,
                                                btnPressed: false
                               });
              }}
              activeOpacity={0.2}
              onPress={this.changeLayout}
              style={{ width: "100%",
                       height: this.state.expanded ? 39 : 65,

                       alignItems: 'center', }}
            >
            <View style={{ width: "100%",}}>

              <View style={{ width: "100%",
                             }}>
                 <View style={{ justifyContent: 'center',
                                alignItems: 'center',
                                postion: "absolute",
                                backgroundColor: COLORS.sendBorders,
                                borderColor: COLORS.sendBorders,
                                flexDirection: this.state.expanded ? 'row' : 'column',
                                borderTopWidth: this.state.expanded ? 0 : 5,
                                borderBottomWidth: this.state.expanded ? 10 : 5,
                                borderBottomColor: (this.state.expanded & this.state.btnPressed) ? COLORS.rectifiedSendBorder : COLORS.sendBorders ,
                              }}>

                                  <Image
                                      source={this.state.expanded ? icons.minus : icons.plus}
                                      resizeMode="contain"
                                      style={{
                                        tintColor: COLORS.white,
                                          width: 20,
                                          height: 20,
                                      }}
                                   />
                                <Text style={{ color: 'white', fontWeight: "bold", marginTop: 3, fontSize: 18,}}>
                                  &nbsp;&nbsp;ASSET&nbsp;&nbsp;
                                </Text>
                  </View>
              </View>
            </View>
            </TouchableOpacity>

            {this.state.expanded && <View
              style={{
                height: this.state.expanded ? null : 0,
                overflow: "hidden",
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >

              <NFTs selectedNFT={this.props.selectedNFT}
                    setSelectedNFT={this.props.setSelectedNFT}/>
            </View>

          }

            </View>

          </View>
    );
  }
}

const NFTs = ({ selectedNFT, setSelectedNFT }: Props) => {
  const [ownedAssets, setownedAssets] = React.useState('loading');

  const wallet = useStoreState((state) => state.wallet);
  const accounts = useStoreState((state) => state.accounts);

  useEffect(() => { // getAllTokens
      let isMountedHome = true
      async function generateSendNFT() {
        const currentAccount = accounts[0];
        const keyPairPriv = accountFromSeed(
            wallet.seed,
            currentAccount.index,
            currentAccount.derivationPath,
            0);

        let tokenBalance = (await getAllTokens(keyPairPriv.publicKey.toString()));
        const newownedAssets = [];
        let incrNfts = 0;
        for (const token of tokenBalance) {
          incrNfts++;
          newownedAssets.push( {
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

        if(!isMountedHome) return
          setownedAssets(newownedAssets);
     }
     if (intervalIdSendNFT == undefined)
      generateSendNFT();
     var intervalIdSendNFT = setInterval(() => {generateSendNFT()}, 5000);
     return () => {
       clearInterval(intervalIdSendNFT);
       isMountedHome = false;
       this.props.setSelectedNFT('none')
     }
    }, []);
    if (ownedAssets == 'loading')
      return (
        <View style={{
            alignItems: "center",
            justifyContent: 'center',
        }}>
        <View style={{
          width: 10,
          height: 10,
          marginVertical: 30
        }}>
          <SpinnerNoModal visible={true} />
          {/*<Image
              source={images.loading}
              resizeMode="contain"
              style={{
                width: 20,
                height: 20,
                marginVertical: 15
              }}/>*/}
          </View>
          </View>
      );
    if (ownedAssets.length == 0)
      return (
        <View style={{marginVertical: 15, alignItems: 'center', justifyContent:'center',    flex: 1,
    flexDirection: "row",}}>
    <Image
source={icons.empty}
resizeMode="contain"
style={{
width: 20,
height: 20,
tintColor: 'white'
}}/>
          <Text style={{  fontSize: 18,
                          color: 'white',
                        fontStyle: 'italic', alignItems: 'center', justifyContent:'center'}}> No asset owned. </Text>
        </View>
      );
    const returnedComps = [];
    let incProp = 0;
    for (const ownedAsset of ownedAssets) {
      incProp += 1;
      returnedComps.push(
          <TouchableOpacity
              key={ String(incProp)}
              activeOpacity={0.5}
              style={{
                  width: 80,
                  padding: 5,
                  borderRadius: 10,
                  marginHorizontal: 3,
                  marginVertical: 5,
                  borderWidth: 3,
                  borderColor: (ownedAsset.mint == selectedNFT) ? 'white' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center'
              }}
              onPress={() => setSelectedNFT(ownedAsset.mint)}
          >
          <View style={{ borderRadius: 15,
            height: 60,
            width: 60,
          backgroundColor: COLORS.black,
          marginHorizontal: 3,
          marginBottom: 5 }}>


          <Image
              source={{uri: ownedAsset.img}}
              resizeMode="cover"
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
                borderRadius: 10,
              }}
          />

          </View>
            <View>
              <Text style={{ fontWeight: "bold", color: 'white', textAlign: 'center' }}>
              {ownedAsset.name}
              </Text>
            </View>
          </TouchableOpacity>
      );
    }
    return (
      <View style={{ width: '100%', paddingHorizontal: 20, marginVertical: 15,}}>
        <ScrollView horizontal={true}
                    scrollEnabled={true}
                    contentOffset={{x: 0, y: 0}}
                    style={{ borderWidth: 1,
                             borderColor: COLORS.lightpurple,
                             borderRadius: 15,
                             backgroundColor: '#FFFFFF20',
                             flexDirection: "row",}}>
            {returnedComps}
        </ScrollView>
      </View>
    );
}



const Send = ( props ) => {
  const initialMessage = "Enter your passcode";
  const [headerMessage, setHeaderMessage] = useState(initialMessage);
  const [pin, setPin] = useState([]);
  const [pinOk, setPinOk] = useState(false);

  const [mnemonic, setMnemoic] = useState([]);

  const wallet = useStoreState((state) => state.wallet);
  const accounts = useStoreState((state) => state.accounts);

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);


  const [toAddress, setToAddress] = useState(
    props.route?.params?.toAddress ? props.route.params.toAddress : ""
  );

  const [toAddressContent, setToAddressContent] = useState(
    props.route?.params?.toAddress ? props.route.params.toAddress : ""
  );

  const [txInProgress, setTxInProgress] = useState(
    false
  );

  const [amount, setAmount] = useState(
    props.route?.params?.amount ? props.route.params.amount : ""
  );
  const [amountContent, setAmountContent] = useState(
    props.route?.params?.amount ? props.route.params.amount : ""
  );

  const [fees, setFees] = useState("");


  const [selectedNFT, setSelectedNFT] = React.useState(
    props.route?.params?.selectedNFT ? props.route.params.selectedNFT : "none"
  );

  const [notReadyTx, setNotReadyTx] = React.useState(false);

  const [account, setAccount] = useState({});


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

  const isFoc = useIsFocused();
  if (mnemonic.length === 0)
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
                                                                     onPress={() => props.navigation.goBack()} >

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
                <NumberKeyboard onPress={_onPressNumber} pin={pin} />
              </View>
              </View>
              </ScrollView>
          </LinearGradient>
          { isFoc && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
      </KeyboardAvoidingView>
    );
    else{
      async function changeAmount(amountRec){
        setNotReadyTx(true);
        try{
            let gottenAmount = Number(makeIntoValidAmount(Number(amountContent.replace(',', '.'))));
            if (amountRec.amount != undefined)
              gottenAmount = Number(makeIntoValidAmount(Number(amountRec.amount)));
            if (amountContent == "") {
              setNotReadyTx(false)
              return setAmountContent("");
            }
            if (isNaN(gottenAmount))
            {
              setAmountContent("");
              showMessage({
                          message: "Wrong amount.",
                          description: "Amount must be a number (in SOL)",
                          type: "danger",
                          icon: "danger",
                          position: 'top',
                          duration: 3000
                        });
              setNotReadyTx(false)
              return;
            }
            //const balance = Number(await getBalance(account.keyPair.publicKey.toString()));
            //if (balance > gottenAmount)

            const resFeesAndBalance = await getFeesAndBalance(account.keyPair, toAddress, selectedNFT, gottenAmount);
            if (resFeesAndBalance.empty) {
              setAmountContent("");
              showMessage({
                          message: "Empty wallet.",
                          description: "No SOL in your wallet.",
                          type: "danger",
                          icon: "danger",
                          position: 'top',
                          duration: 3000
                        });
              setNotReadyTx(false)
              return;
            }
            if (resFeesAndBalance.transactionEmpty) {
              setAmountContent(strFixed);
              setAmount(strFixed);
            }

            if (resFeesAndBalance.invalidRent) {
              showMessage({
                          message: "Sent amount too small.",
                          description: "Minimum rent amount required not achieved.",
                          type: "danger",
                          icon: "danger",
                          position: 'top',
                          duration: 3000
                        });
                setAmount(makeIntoValidAmount(resFeesAndBalance.minAmount));
                setAmountContent(makeIntoValidAmount(resFeesAndBalance.minAmount));
                setNotReadyTx(false)
                changeAmount( {amount: makeIntoValidAmount(resFeesAndBalance.minAmount)} );
                return;
            }
            const biggestVal = makeIntoValidAmount(resFeesAndBalance.balance - resFeesAndBalance.fees);
            if (parseFloat(biggestVal) < gottenAmount) {
              setAmount(String(biggestVal));
              setAmountContent(biggestVal.toString());
              showMessage({
                          message: "Insuficient funds.",
                          description: "Amount had to be reduced due to insufficient funds.",
                          type: "danger",
                          icon: "danger",
                          position: 'top',
                          duration: 3000
                        });
              setNotReadyTx(false)
              return;
            }
        const strFixed = makeIntoValidAmount(gottenAmount);
        setAmountContent(strFixed);
        setAmount(strFixed);
      }catch(e) {
        console.log(e)
      }
      setNotReadyTx(false);
        //this.updateText(Number(text))/* CHECK NUMBER  return setAmount(Number(text)) */
      }

        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : null}
                style={{ flex: 1 }}
            >
            {isFoc  && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
                <LinearGradient
                    colors={[COLORS.lime, COLORS.emerald]}
                    style={{ flex: 1 }}
                >
                  <TouchableOpacity style={{ width: 40,
                                             position: "absolute",
                                             left: 15,
                                             top: statusBarHeight
                                          }}
                                    onPress={() => props.navigation.goBack()} >
                    <Image
                      source={images.goback}
                      resizeMode="contain"
                      style={{
                          width: "100%",
                      }}
                    />
                  </TouchableOpacity>
                  <ScrollView scrollEnabled={false} refreshControl={false} showsVerticalScrollIndicator={false} style={{marginHorizontal: 70,}} contentContainerStyle={{flexGrow: 1, width: '100%',justifyContent: 'center',alignItems: "center",}}>
                      <View
                          style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              width: '100%',
                          }}
                      >
                      <Text style={{ fontFamily: "Roboto-Black",
                                     top: 150,
                                     textAlign: 'center',
                                     color: 'white',
                                     fontSize: 40,
                                     paddingBottom: 15,
                                     fontWeight: 'bold',
                                     top: 0,
                                     marginBottom:20 }}>Send to
                      </Text>
                      <View style={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: 'center',
                        borderWidth: 10,
                        borderRadius: 50,
                        borderColor: '#FFFFFF33',
                      }}>
                      <View style={{
                        width: "100%", flexDirection: 'row'}}>
                          <TextInput
                            mode="outlined"
                            value={toAddressContent}
                            placeholder="Address"
                            onChangeText={(text) => (setToAddressContent(text))}
                            onBlur={async () => {
                              if (toAddressContent == "")
                                return setToAddress("");
                              const validityRes = await isValidAddress(toAddressContent);
                              if (!validityRes.valid) {
                                showMessage({
                                            message: "Invalid address.",
                                            description: "Address must be a valid Solana Address",
                                            type: "danger",
                                            icon: "danger",
                                            position: 'top',
                                            duration: 3000
                                          });
                                setToAddress("");
                                setToAddressContent("");
                                return;
                              }
                              if(!validityRes.balance) {
                                showMessage({
                                            message: "Receiving address has empty balance.",
                                            description: "Make sure it is correct.",
                                            type: "warning",
                                            icon: "warning",
                                            position: 'top',
                                            duration: 3000
                                });
                              }
                              setToAddress(toAddressContent);
                            }}
                            placeholderTextColor="#ffffff"
                            returnKeyType='done'
                            style={ {
                              width: "100%",
                              backgroundColor: "rgba(52, 52, 52, 0.6)",
                              fontSize: 20,
                              color:"white",
                               borderTopLeftRadius:40,
                               borderTopRightRadius:40,
                               paddingLeft: 20,
                               paddingVertical: 20,
                               paddingRight: 60
                            }}
                            theme={{
                              colors: {
                                placeholder: "white",
                              },
                            }}
                          />
                              <TouchableOpacity style={{ width: 30,
                                                        height: "100%",
                                                         position: "absolute",
                                                         right: 15,
                                                         top:0,
                                                         alignItems: 'center',
                                                         justifyContent: 'center',
                                                      }}
                                                onPress={() => props.navigation.navigate('Scan', { amount: amount,
                                                                                                   selectedNFT: selectedNFT})} >
                                <Image
                                  source={icons.scan2}
                                  resizeMode="contain"
                                  style={{
                                      tintColor: "white",
                                      width: "100%",
                                      width: 30,
                                      height: 30,
                                  }}
                                />
                              </TouchableOpacity>
                        </View>


                          <ExpandableBtn account={account}
                                         selectedNFT={selectedNFT}
                                         setSelectedNFT={setSelectedNFT} />


                          <View style={{
                            width: "100%", flexDirection: 'row'}}>
                              <TextInput
                                mode="outlined"
                                placeholder="SOL"
                                value={amountContent}
                                onChangeText={(text) => (setAmountContent(text))}
                                placeholderTextColor="#ffffff"
                                onBlur={changeAmount}
                                keyboardType='numeric'
                                returnKeyType='done'
                                style={ {
                                  width: "100%",
                                  backgroundColor: "rgba(52, 52, 52, 0.6)",
                                  fontSize: 20,
                                  color:"white",
                                   borderBottomLeftRadius:40,
                                   borderBottomRightRadius:40,
                                   paddingLeft: 20,
                                   paddingVertical: 20,
                                   paddingRight: 60
                                }}
                                theme={{
                                  colors: {
                                    placeholder: "white",
                                  },
                                }}
                              />
                                  <TouchableOpacity style={{ width: 30,
                                                            height: "100%",
                                                             position: "absolute",
                                                             right: 15,
                                                             top:0,
                                                             alignItems: 'center',
                                                             justifyContent: 'center',
                                                          }}
                                                    onPress={async () => {
                                                      //const balance = Number(await getBalance(account.keyPair.publicKey.toString()));
                                                      //if (balance > gottenAmount)
                                                      let resFeesAndBalance = {};
                                                      try {
                                                        resFeesAndBalance = await getFeesAndBalance(account.keyPair, toAddress, selectedNFT, 1e-8);
                                                        console.log(resFeesAndBalance)
                                                      } catch (e) {
                                                        console.log('Error when fetching fees and balance.' + e)
                                                      }

                                                      if (resFeesAndBalance.empty) {
                                                        setAmountContent("");
                                                        showMessage({
                                                                    message: "Empty wallet.",
                                                                    description: "No SOL in your wallet.",
                                                                    type: "danger",
                                                                    icon: "danger",
                                                                    position: 'top',
                                                                    duration: 3000
                                                                  });
                                                        return;
                                                      }
                                                      if (resFeesAndBalance.transactionEmpty) {
                                                        return;
                                                      }
                                                      if (resFeesAndBalance.invalidRent) {
                                                        showMessage({
                                                                    message: "Sent amount too small.",
                                                                    description: "Minimum rent amount required not achieved.",
                                                                    type: "danger",
                                                                    icon: "danger",
                                                                    position: 'top',
                                                                    duration: 3000
                                                                  });
                                                          setAmountContent("");
                                                          return;
                                                      }

                                                      const biggestVal = Number((resFeesAndBalance.balance - resFeesAndBalance.fees).toFixed(9));
                                                      if (biggestVal <= 0) {
                                                        setAmountContent("");
                                                        showMessage({
                                                                    message: "Insuficient funds.",
                                                                    description: "Not enough SOL in your wallet.",
                                                                    type: "danger",
                                                                    icon: "danger",
                                                                    position: 'top',
                                                                    duration: 3000
                                                                  });
                                                        return;
                                                      }
                                                      setAmount(biggestVal);
                                                      setAmountContent(biggestVal.toString());
                                                      return;
                                                    }} >
                                                    <Image
                                                      source={icons.all}
                                                      resizeMode="contain"
                                                      style={{
                                                          tintColor: "white",
                                                          width: "100%",
                                                          width: 36,
                                                          height: 36,
                                                      }}
                                                    />
                                  </TouchableOpacity>
                            </View>
                        </View>
                          <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={async ()=>{
                              if (!toAddress)
                                return showMessage({
                                            message: "No receiving address.",
                                            description: "Address feild is mandatory.",
                                            type: "danger",
                                            icon: "danger",
                                            position: 'top',
                                            duration: 3000
                                          });
                              if (notReadyTx)
                                return
                              if (txInProgress)
                                return showMessage({
                                            message: "Error",
                                            description: "A transaction is already in progress.",
                                            type: "danger",
                                            icon: "danger",
                                            position: 'top',
                                            duration: 3000
                                          });
                              setTxInProgress(true);
                              try {
                                await sendTx(account.keyPair, toAddress, selectedNFT, amount);
                              } catch (e) {
                                return showMessage({
                                    message: "Error",
                                    description: "" + e,
                                    type: "danger",
                                    icon: "danger",
                                    position: 'top',
                                    duration: 3000
                                  });
                              }
                              setTxInProgress(false);

                              setAmount("0");
                              setAmountContent("0");

                              setToAddress("");
                              setToAddressContent("");

                              setFees("")
                              global.successTx = true
                              props.navigation.navigate('Wallet');

                            }}
                            style={{ width: "100%",
                            height: 75,
                                     alignItems: 'center',
                                     marginTop: 30,
                                                   width: "100%",
                                                   height: 70,
                                                   flexDirection: 'column',
                                                   borderColor: COLORS.lightpurple,
                                                   borderWidth:  5,
                                                   borderRadius: 75,
                                                   backgroundColor: "rgba(52, 52, 52, 0.6)",
                                                   backgroundColor:  COLORS.lightpurple,
                                                   alignItems: 'center',
                                                   justifyContent: 'center', }}
                          >
                          <View style={{ width: "100%",}}>

                            <View style={{ width: "100%",
                                           }}>
                               <View style={{ justifyContent: 'center',
                                              alignItems: 'center',
                                              postion: "absolute",
                                              height: 65,
                                              flexDirection: 'row',
                                            }}>
                                              {!notReadyTx &&<Image
                                                  source={icons.send}
                                                  resizeMode="contain"
                                                  style={{
                                                    tintColor: 'white',
                                                      width: 30,
                                                      height: 30,
                                                  }}
                                              />}
                                              {!notReadyTx &&
                                              <Text style={{ color: "white", fontWeight: "bold", marginTop: 3, fontSize: 18}}>
                                                &nbsp;&nbsp;Send&nbsp;&nbsp;
                                              </Text>}
                                              {notReadyTx && <SpinnerNoModal visible={notReadyTx} /> }
                                </View>
                            </View>
                          </View>
                          </TouchableOpacity>

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
            </KeyboardAvoidingView>
        )


    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignContent: "space-between",
  },
});

export default memo(Send);
