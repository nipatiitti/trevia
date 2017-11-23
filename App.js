import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  PropTypes,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  AsyncStorage,
} from 'react-native';

import { StackNavigator,
		 TabNavigator,
 } from 'react-navigation';

import { Constants } from 'expo';

import mainView from './components/screens/mainView';
import mapView from './components/screens/mapView';
import logIn from './components/screens/login';
import signIn from './components/screens/signin';
import settings from './components/screens/settings';
import markerView from './components/screens/markerView';
import addView from './components/screens/addView';
import poCords from './components/screens/poCords'
import favorites from './components/screens/favorites';
import lists from './components/screens/lists';
import madeByMe from './components/screens/madeByMe';

//const menu = TabNavigator({
//		LogIn: { screen: logIn},
//		Settings: { screen: settings},
//	} , {
//		tabBarOptions: {
//	        inactiveTintColor: '#4d4d4d',
//	        pressColor: '#e6e6e6',
//	        indicatorStyle: {
//	    	    backgroundColor: 'black',
//	        },
//	        labelStyle: {
//	        	fontSize: 12,
//	        },
//	        style: {
//	    	    backgroundColor: 'white',
//	        },
//	    },
//});

const TreviaApp = StackNavigator({
		Main: { screen: mainView },
    Map: {screen: mapView},
		Marker: { screen: markerView },
		SignIn: { screen: signIn },
		//Menu: { screen: menu },
		LogIn: { screen: logIn},
    Cords: {screen: poCords},
		Add: { screen: addView },
		Favorites: { screen: favorites},
		Lists: { screen: lists},
  	MadeByMe: { screen: madeByMe}
	});

export default class App extends Component {
  render() {
    return (
      <View style = {styles.container}>
        <TreviaApp />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
	  position 	: 'absolute',
	  top 		: 0,
	  left 		: 0,
	  right 		: 0,
	  bottom 		: 0,
	  paddingTop: Constants.statusBarHeight,
  },
})
