'use strict';
import React, {
  StyleSheet,
  Dimensions
} from 'react-native';

var { width, height } = Dimensions.get('window');

const colors = {
  white: "#FFF",
  grey: "#ccc",
  black: "#1e1e1e",
  darkGrey: "#262626",
}

module.exports = StyleSheet.create({
  container : {
      flex            : 1,
      flexDirection 	: 'column'
  },

  row : {
      flex            : 1,
      flexDirection 	: 'row'
  },

  settingsButton: {
    backgroundColor : colors.white,
    margin          : 10,
    justifyContent  : 'space-between',
    alignItems      : 'center',
    padding         : 10,
  },

  button: {
    backgroundColor : colors.darkGrey,
    margin          : 10,
    marginHorizontal: 20,
    justifyContent  : 'center',
    alignItems      : 'center',
    padding         : 10,
    borderColor     : colors.darkGrey,
    borderWidth     : 1,
    borderRadius    : 5,
  },

  transparentBackground: {
    backgroundColor: 'transparent'
  },

  buttonText: {
    color: colors.white
  },

  greyText: {
    color: colors.grey,
  },

  flex: {
    flex: 1,
  },

  flex2: {
    flex: 2,
  },

  text: {
    color: colors.black,
  },

  size10: {
    fontSize: 10,
  },

  textBold: {
    fontWeight: 'bold',
  },

  textMiddle: {
    textAlign: 'center',
  },

  textRight: {
    textAlign: 'right',
  },

  margin: {
    margin: 10,
  },

  rowStyle : {
      backgroundColor   : colors.white,
      paddingVertical   : 15,
      paddingHorizontal : 10,
      borderBottomColor : colors.grey,
      borderBottomWidth : 1,
      flexDirection     : 'row',
      flex              : 1,
      alignItems        : 'center'
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  spaceAround: {
    justifyContent: 'space-around',
  },

  spaceCenter: {
    justifyContent: 'center',
  },

  end: {
    justifyContent: 'flex-end'
  },

  textInput: {
    paddingVertical   : 15,
    paddingHorizontal : 5,
    margin            : 5,
    backgroundColor   : colors.white,
  },

  roundBorder: {
    borderColor       : colors.black,
    borderWidth       : 1,
    borderRadius      : 5,
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
  },

  map: {
    position      : 'absolute',
    top           : 0,
    left          : 0,
    right         : 0,
    bottom        : 0,
  },
});
