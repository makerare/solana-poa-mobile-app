import React, { memo } from "react";
import { StyleSheet, Text } from "react-native";

import { COLORS, SIZES, FONTS } from "../constants"

const Header = ( {children} ) => (
  <Text style={styles.header}>{children}</Text>
);

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.white,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default memo(Header);
