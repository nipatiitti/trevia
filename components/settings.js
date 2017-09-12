'use strict'
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TextInput,
  TouchableOpacity,
  Alert,
  ListViewDataSource,
  InteractionManager, 
  RefreshControl, 
  Platform, 
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './baseStyles.js';
import firebaseApp from './firebase.js';

export default class settings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    }
  }

  componentWillMount() {
    this.setState({
      loading: false
    });
  }

    static navigationOptions = {
        title: 'Settings',
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    };

    render() {
      const {navigate} = this.props.navigation;
      return (
        <View style={styles.container}>
          <View style={styles.body}>
          </View>
        </View>
      );
    }
}