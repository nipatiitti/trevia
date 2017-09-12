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

import mainView from './mainView';
import logIn from './components/login';
import signIn from './components/signin';
import settings from './components/settings';
import markerView from './components/markerView';
import addView from './components/addView';
import favorites from './components/favorites';
import liked from './components/liked';
import madeByMe from './components/madeByMe';

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
		Marker: { screen: markerView },
		SignIn: { screen: signIn },
		//Menu: { screen: menu },
		LogIn: { screen: logIn},
		Add: { screen: addView },
		Favorites: { screen: favorites},
		Liked: { screen: liked},
  		MadeByMe: { screen: madeByMe}
	},{
  		initialRouteParams: { right: null }
  });

export default class App extends Component {
  render() {
  	console.log("I have started!!!")
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