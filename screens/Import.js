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
         StatusBarIOS,
         TextInput,
         Platform
        } from "react-native";

import { SpinnerNoModal } from "../components";

import LinearGradient from 'react-native-linear-gradient'
import Clipboard from '@react-native-clipboard/clipboard';

import {useStoreState} from "../hooks/storeHooks"

import { useIsFocused } from '@react-navigation/native';

import FlashMessage, {showMessage,} from "react-native-flash-message";

import { mnemonicToSeed } from "../utils";


import { COLORS, SIZES, FONTS, icons, images, ENV } from "../constants"

import { useStoreActions } from "../hooks/storeHooks";

import {
  NumberKeyboard,
  Header,
  BackButton,
} from "../components";

import { isValidPhrase, isValidWord } from "../utils";


import {StatusBarHeight} from '../StatusBarHeight'
const { StatusBarManager } = NativeModules


const Import = ({ navigation }) => {
  let inputsRefs = {};
  const initialMessage = "Enter your passcode";

  const [headerMessage, setHeaderMessage] = useState(initialMessage);
  const [pin, setPin] = useState([]);
  const [pinOk, setPinOk] = useState(false);

  const [mnemonic, setMnemoic] = useState([]);

  const wallet = useStoreState((state) => state.wallet);

  const [notReadyButton, setNotReadyButton] = React.useState(false);

  const [newWords, setNewWords] = useState(([...Array(ENV.seed_length,).keys()]).map(() => ''));
  const [newWordsColors, setNewWordsColors] = useState(([...Array(ENV.seed_length,).keys()]).map(() => 'white'));
  const [newWordsContent, setNewWordsContent] = useState(([...Array(ENV.seed_length,).keys()]).map(() => ''));

  const addWallet = useStoreActions((actions) => actions.addWallet);
  const reset = useStoreActions((actions) => actions.reset);

  const addDefaultAccount = useStoreActions(
    (actions) => actions.addDefaultAccount
  );

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);
  useEffect((() =>
    {
      //console.log(store.getState())
      if (Platform.OS === 'ios')
        StatusBarManager.getHeight(response =>
                  setStatusBarHeight(response.height)
      )
    }), []
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
        setHeaderMessage("Recovery phrase");Platform
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

  const onWordSubmit = (index) => {
    if (newWordsContent[index] == "")
      return
    if(isValidWord(newWordsContent[index])){
      let newNewWordsColors = [...newWordsColors];
      newNewWordsColors[index] = '#89ff00';
      setNewWordsColors(newNewWordsColors);
      if (index < ENV.seed_length - 1)
        return inputsRefs[index + 1].focus()
      return
    }
    let newNewWordsColors = [...newWordsColors];
    newNewWordsColors[index] = '#f25206';
    setNewWordsColors(newNewWordsColors);
  }
  const onWordBlur = (index) => {
    if (newWordsContent[index] == "")
      return
    if(isValidWord(newWordsContent[index])){
      let newNewWordsColors = [...newWordsColors];
      newNewWordsColors[index] = '#89ff00';
      setNewWordsColors(newNewWordsColors);
      return
    }
    let newNewWordsColors = [...newWordsColors];
    newNewWordsColors[index] = '#f25206';
    setNewWordsColors(newNewWordsColors);
  }

  const onWordFocus = (index) => {
    let newNewWordsColors = [...newWordsColors];
    newNewWordsColors[index] = 'white';
    setNewWordsColors(newNewWordsColors);
  }


  const words = () => {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, }}>
        { ([...Array(ENV.seed_length/2).keys()]).map((index) => (
          <View style={{width: '80%'}} key={index}>
            <TextInput
              ref={(input) => { inputsRefs[index] = input; }}
              mode="outlined"
              value={newWordsContent[index]}
              placeholder={"Word " + (index+1)}
              autoCorrect={false}
              autoCapitalize="none"
              secureTextEntry={Platform.OS === 'ios' ? false : true}
              keyboardType={Platform.OS === 'ios' ? null : 'visible-password'}
              onChangeText={
                (text) => {
                    setNewWordsContent(wordCont => {
                      let newWordCont = [...wordCont]
                      newWordCont[index] = String(text).toLowerCase();
                      return newWordCont;
                    })
                }}
              onSubmitEditing={() => onWordSubmit(index)}
              onBlur={()=>onWordBlur(index)}
              onFocus={()=>onWordFocus(index)}
              placeholderTextColor="#ffffff"
              returnKeyType='done'
              style={ {
                backgroundColor: "transparent",
                textAlign: 'center',
                borderBottomWidth: 2,
                borderBottomColor: newWordsColors[index],
                fontSize: 20,
                 paddingVertical: 10,
                 margin: 0,
                 color: 'white',
              }}
              theme={{
                colors: {
                  placeholder: "white",
                },
              }}
            />
          </View>)
      )
      }

        </View>
        <View style={{flex: 1, width: "10%",}}>
        { ([...Array(ENV.seed_length/2).keys()]).map((index) => (
          <View style={{width: '80%', alignSelf: 'flex-end'}} key={index+ENV.seed_length/2}>
            <TextInput
              ref={(input) => { inputsRefs[index+ENV.seed_length/2] = input; }}
              mode="outlined"
              onFocus={()=>onWordFocus(index+ENV.seed_length/2)}
              value={newWordsContent[index+ENV.seed_length/2]}
              placeholder={"Word " + (index+ENV.seed_length/2+1)}
              autoCorrect={false}
              autoCapitalize="none"
              secureTextEntry={Platform.OS === 'ios' ? false : true}
              keyboardType={Platform.OS === 'ios' ? null : 'visible-password'}
              onChangeText={
                (text) => {
                  setNewWordsContent(wordCont => {
                    let newWordCont = [...wordCont]
                    newWordCont[index+ENV.seed_length/2] = String(text).toLowerCase();
                    return newWordCont;
                  }
                )}}
              onSubmitEditing={() => onWordSubmit(index+ENV.seed_length/2)}
              onBlur={()=>onWordBlur(index+ENV.seed_length/2)}
              placeholderTextColor="#ffffff"
              returnKeyType='done'
              style={ {

                backgroundColor: "transparent",
                textAlign: 'center',
                borderBottomWidth: 2,
                color: 'white',
                fontSize: 20,
                paddingVertical: 10,
                borderBottomColor: newWordsColors[index+ENV.seed_length/2],
              }}
              theme={{
                colors: {
                  placeholder: "white",
                },
              }}
            />
         </View>
        ))
      }
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
                           width: (mnemonic.length === 0) ? 250 : 250,
                           justifyContent: 'center'}}>
              <Header>{headerMessage}</Header>
              {mnemonic.length !== 0 &&<Text style={{
                fontSize: 16,
                justifyContent: 'center',
                textAlign: 'center',
                color: '#f25206',
                marginBottom: 14,
              }}>Your former wallet will be replaced.</Text>}
              {mnemonic.length === 0 ? (
                <NumberKeyboard onPress={_onPressNumber} pin={pin} />
              ) : (
                words()
              )}



              {mnemonic.length !== 0 &&
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={async ()=>{
                    if (notReadyButton)
                      return
                    setNotReadyButton(true);
                    try {
                      const newMnemonic = newWordsContent.join(' ');
                      if (! isValidPhrase(newMnemonic)) {
                        setNotReadyButton(false);
                        return showMessage({
                                    message: "Invalid mnemonic.",
                                    description: "Check your words are valid.",
                                    type: "danger",
                                    icon: "danger",
                                    position: 'top',
                                    duration: 3000
                                  });
                      }
                      const seed = await mnemonicToSeed(newMnemonic);


                      //const store = require('../store').default;
                      //store.dispatch.reset();

                      reset()

                      addWallet({
                        passcode: pin.join(""),
                        mnemonic: newMnemonic,
                        seed: seed,
                      });

                      addDefaultAccount();
                      showMessage({
                                  message: "Success",
                                  description: "Wallet imported.",
                                  type: "success",
                                  icon: "success",
                                  position: 'top',
                                  duration: 3000
                                });
                    } catch(e){
                      setNotReadyButton(false);
                      return showMessage({
                                  message: "Error during import.",
                                  description: "Unknown error : " + e,
                                  type: "danger",
                                  icon: "danger",
                                  position: 'top',
                                  duration: 3000
                                });
                    }
                    setNotReadyButton(false);
                  }}
                  style={{ width: "100%",

                  height: 75,
                           alignItems: 'center',
                           marginTop: 40,
                                         width: "100%",
                                         height: 70,
                                         flexDirection: 'column',
                                         borderColor: COLORS.lightpurple,
                                         borderWidth:  5,
                                         borderRadius: 75,
                                         backgroundColor: COLORS.lightpurple,
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
                                      {!notReadyButton &&<Image
                                          source={icons.restore}
                                          resizeMode="contain"
                                          style={{
                                            tintColor: 'white',
                                              width: 30,
                                              height: 30,
                                          }}
                                      />}
                                      {!notReadyButton &&
                                      <Text style={{ color: "white", fontWeight: "bold", marginTop: 3, fontSize: 18}}>
                                        &nbsp;&nbsp;Restore&nbsp;&nbsp;
                                      </Text>}
                                      {notReadyButton && <SpinnerNoModal visible={notReadyButton} /> }
                        </View>
                    </View>
                  </View>
                </TouchableOpacity> }




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

export default memo(Import);
