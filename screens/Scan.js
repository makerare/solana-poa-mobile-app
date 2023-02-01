import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    NativeModules,
    StatusBarIOS
} from "react-native"
import { RNCamera } from 'react-native-camera'
import QRCodeScanner from 'react-native-qrcode-scanner';

import LinearGradient from 'react-native-linear-gradient'

import {useStoreState} from "../hooks/storeHooks"

import { COLORS, FONTS, SIZES, ENV, icons, images } from "../constants";

import { Spinner } from "../components";

import { accountFromSeed } from "../utils";

import { isValidAddress, claim_nft_api } from "../api";


import { useIsFocused } from '@react-navigation/native';

import FlashMessage, {showMessage,} from "react-native-flash-message";

import {StatusBarHeight} from '../StatusBarHeight'
const { StatusBarManager } = NativeModules


let first = true;

const get_url_params = (fullUrl) => {
  const urlParts = fullUrl.split('?');
  const urlParams = urlParts[urlParts.length - 1].split('&')
  const out_obj = {};

  for (const paramFull of urlParams) {
    const paramFullSlipt = paramFull.split('=');
    if (paramFullSlipt[0].length == 0)
      continue;
    if (paramFullSlipt.length == 1)
      out_obj[paramFullSlipt[0]] = "";
    else
      out_obj[paramFullSlipt[0]] = paramFullSlipt[1];
  }
  return out_obj;

}


const claim_nft = async (claim_id, pubKey, nftClaimInProcess, setNftClaimInProcess) => {
  if (nftClaimInProcess)
    return;
  setNftClaimInProcess(true)
  try{

    const result_apicall = await claim_nft_api(claim_id, pubKey);
    console.log("Minted NFT");
    console.log(result_apicall);
     if (result_apicall.data?.success === undefined)
        throw "Unkown.";

    showMessage({
                message: "Success",
                description: "You just generated a new asset.",
                type: "success",
                icon: "success",
                position: 'top',
                duration: 3000
              });
  } catch (e) {
    showMessage({
                message: "Error during mint:",
                description: "" + e,
                type: "danger",
                icon: "danger",
                position: 'top',
                duration: 3000
              });
  }

  setNftClaimInProcess(false)
}


const Scan = ( props ) => {
  //const [isScreenActive, setIsScreenActive] = useState(false);
  const wallet = useStoreState((state) => state.wallet);
  const accounts = useStoreState((state) => state.accounts);
  const [nftClaimInProcess, setNftClaimInProcess] = useState(false);

  const [statusBarHeight, setStatusBarHeight]  = useState(StatusBarHeight);
  useEffect(()=>
    {
      if (Platform.OS === 'ios')
  StatusBarManager.getHeight(response =>
            setStatusBarHeight(response.height))
    }
  );


  props.navigation.addListener('willFocus', () =>
     setIsScreenActive(true)
   );
   props.navigation.addListener('willFocus', () =>
      setIsScreenActive(false)
    );

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', paddingHorizontal: SIZES.padding * 3, position: 'absolute', top: statusBarHeight, }}>
                <TouchableOpacity
                    style={{
                        width: 45,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                      try {
                        props.navigation.goBack()
                      } catch (e) {
                        props.navigation.navigate("Home")
                      }
                    }}
                >
                        <Image
                            source={icons.close}
                            style={{
                                height: 20,
                                width: 20,
                                tintColor: 'white'
                            }}
                    />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={ {
                        fontSize: 22,
                        color: '#FFFFFF',
                        fontFamily: 'Poppins Regular',
                        lineHeight:32
                      } }> Scan QR code </Text>
                </View>

                <View
                    style={{
                        height: 45,
                        width: 45,
                        backgroundColor: COLORS.transparent,
                    }}
                >
                </View>
            </View>
        )
    }

    function renderScanFocus() {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Image
                    source={images.focus}
                    resizeMode="stretch"
                    style={{
                        width: 200,
                        height: 250
                    }}
                />
            </View>
        )
    }

    function renderBottomContent() {
        return (
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 150,
                    padding: SIZES.padding * 3,
                    width: SIZES.width,
                    borderTopLeftRadius: SIZES.radius,
                    borderTopRightRadius: SIZES.radius,
                    backgroundColor: COLORS.white
                }}
            >
              <View style={{ flex: 1, alignItems: 'center'}}>
                  <Text style={{ ...FONTS.h4 }}>Scan to claim NFT or make transaction</Text>
              </View>
            </View>
        )
    }

    const onSuccessScan = async (e) => {
      try {
        if (e.data.startsWith('http')) {
          const urlParams = get_url_params(e.data)
          if (urlParams.claimid != undefined) {
            const claim_id = urlParams.claimid;
            const currentAccount = accounts[0];
            const keyPair = accountFromSeed(
                wallet.seed,
                currentAccount.index,
                currentAccount.derivationPath,
                0);
            const res = await claim_nft(claim_id,
                                        keyPair.publicKey.toString(),
                                        nftClaimInProcess,
                                        setNftClaimInProcess
            );
            return;
          }
          throw 'Error';
        }

        if (await isValidAddress(e.data)) {
          const passedData = props.route?.params ? props.route?.params : {}
          passedData.toAddress = e.data;
          props.navigation.navigate('Send',
                                    passedData)
          return;
        }
        throw 'Error';
      } catch(err){
        console.log(err)
        showMessage({
                    message: "Invalid QR code.",
                    description: "QR code data was not recognized.",
                    type: "danger",
                    icon: "danger",
                    position: 'top',
                    duration: 3000
                  });
      }

    };


  return (
      <View style={{flex: 1, backgroundColor: COLORS.black,}}>
      { useIsFocused()  && <FlashMessage position={"top"} hideStatusBar={false} statusBarHeight={Platform.OS === "ios" ? null : statusBarHeight} />}
      { useIsFocused()  && <QRCodeScanner
        flashMode={RNCamera.Constants.FlashMode.off}
        style={{ flex: 1, position: 'absolute', top: 0,  }}
        reactivate={true}
        reactivateTimeout={60000}
        showMarker={true}
        customMarker={renderScanFocus()}
        captureAudio={false}
              onRead={onSuccessScan}
              containerStyle={{height:SIZES.height + 65}}
              cameraStyle={[{height:SIZES.height + 65}]}
              cameraContainerStyle={{ position: 'absolute', top: 0, height: SIZES.height + 65
            }}
              topViewStyle={{height: 0}}
              bottomViewStyle={{height: 0}}
            />}
        {renderHeader()}
        { useIsFocused() && <Spinner
        visible={nftClaimInProcess}
        textContent={'Mint in progess...'}
        textStyle={
          {color: 'white'}
        }
        overlayColor={"#000000AA"}
      />}
      </View>
  )

}



export default Scan;
