import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export const COLORS = {
    // base colors
    primary: "#000000", // green 2F0F51
    secondary: "#555555",   // dark green 392f3e

    green: "#66D59A",
    lightGreen: "#E6FEF0",

    lime: "#000000",
    limer: "#000000",
    emerald: "#222222",

    sendBorders: "#3F3F3F",
    rectifiedSendBorder: "#888888",

    red: "#FF4134",
    lightRed: "#FFF1F0",

    purple: "#6B3CE9",
    lightpurple: "#555555", //#594370

    yellow: "#FFC664",
    lightyellow: "#FFF9EC",

    black: "#1E1F20",
    white: "#FFFFFF",

    lightGray: "#dddddd",
    gray: "#C1C3C5",
    darkgray: "#C3C6C7",

    transparent: "transparent",

    incoming: "#5FC88F",
    outgoing: "#FF6464",
};

export const SIZES = {
    // global sizes
    base: 8,
    font: 14,
    radius: 30,
    padding: 10,
    padding2: 12,

    // font sizes
    largeTitle: 50,
    h1: 30,
    h2: 22,
    h3: 20,
    h4: 26,
    body1: 30,
    body2: 20,
    body3: 16,
    body4: 14,
    body5: 12,

    // app dimensions
    width,
    height,
};

export const FONTS = {
    largeTitle: { fontFamily: "Roboto-regular", fontSize: SIZES.largeTitle, lineHeight: 55 },
    h1: { fontFamily: "Poppins Regular", fontSize: SIZES.h1, lineHeight: 36 },
    h2: { fontFamily: "Poppins ExtraBold", fontSize: SIZES.h2, lineHeight: 30 },
    h3: { fontFamily: "Poppins SemiBold", fontSize: SIZES.h3, lineHeight: 22 },
    h4: { fontFamily: "Poppins Light", fontSize: SIZES.h4, },
    body1: { fontFamily: "Poppins Regular", fontSize: SIZES.body1, lineHeight: 36 },
    body2: { fontFamily: "RobotoCondensed-LightItalic", fontSize: SIZES.body2, lineHeight: 30 },
    body3: { fontFamily: "Poppins Medium", fontSize: SIZES.body3, lineHeight: 22 },
    body4: { fontFamily: "Poppins Regular", fontSize: SIZES.body4, lineHeight: 22 },
    body5: { fontFamily: "Poppins Regular", fontSize: SIZES.body5, lineHeight: 22 },
    h5: { fontFamily: "Poppins Regular", fontSize: SIZES.h5, lineHeight: 22 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;
