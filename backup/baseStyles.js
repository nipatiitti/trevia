'use strict';
import React, {
  StyleSheet,
  Dimensions
} from 'react-native';

var { width, height } = Dimensions.get('window');

module.exports = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1
  },

  body: {
    flex: 9,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#F5FCFF',
  },

  textInput: {
    height: 40,
    width: 200,
  },

  flex: {
    flex: 1,
  },

  bubbleButton: {
    padding: 10,
    margin: 10,
    borderRadius: 20,
    borderColor: 'red',
    borderWidth: 1,
    backgroundColor: 'blue',
    flex: 1,
    justifyContent  : 'space-around'
  },

  button: {
    backgroundColor   : '#FFF',
    paddingVertical   : 15,
    paddingHorizontal : 10,
    flexDirection     : 'row',
    marginBottom      : 10,
    width: width,
    height: height/7,
    alignItems        : 'center',
    justifyContent    : 'space-between'
  },

  basicText: {
    flex: 1,
    color: 'black',
    textAlign: 'left',
    margin: 5,
    fontSize: 18
  },

  textRight: {
    textAlign: 'right',
  },

  transparentButton: {
    marginTop: 10,
    padding: 15
  },

  transparentButtonText: {
    color: '#0485A9',
    textAlign: 'center',
    fontSize: 16
  },

  submitButton: {
    margin: 10,
    padding: 15,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
  },

  primaryButton: {
    margin: 10,
    padding: 15,
    backgroundColor: '#529ecc',
  },

  textButton: {
    margin: 2,
    padding: 4,
    backgroundColor: '#529ecc',
  },

  mapButton: {
    margin: 10,
    padding: 15,
    backgroundColor: '#529ecc',
    flex: 1
  },

  iconButton: {
    margin: 10,
    height: 30,
    marginTop: -35,
    alignSelf: 'flex-end', 
  },

  primaryButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 18,
    marginLeft: 20,
    marginRight: 20
  },

  image: {
    width: 100,
    height: 100
  }
});