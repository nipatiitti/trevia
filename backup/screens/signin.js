'use strict'
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './baseStyles.js';
import firebaseApp from './firebase.js';
import { NavigationActions } from 'react-navigation'

const resetAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Main'})
  ]
})

export default class signIn extends Component {

    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          email: '',
          password: ''
        }
    }

    static navigationOptions = {
        title: 'Sign In',
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    };

    signup() {
      this.setState({
        loading: true
      });

      firebaseApp.auth().createUserWithEmailAndPassword(
          this.state.email,
          this.state.password).then(() => {
              alert('Your account was created!');
              this.setState({
                email: '',
                password: '',
                loading: false
              });
              this.props.navigation.dispatch(resetAction);
          }).catch((error) => {
            this.setState({
              loading: false
            });
            alert("Account creation failed: " + error.message );
          });
    }

    render() {
        const {navigate} = this.props.navigation;
        const content = this.state.loading ? <ActivityIndicator size="large"/> :
            <View>
                <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => this.setState({email: text})}
                    value={this.state.email}
                    placeholder={"Email Address"} />
                <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => this.setState({password: text})}
                    value={this.state.password}
                    secureTextEntry={true}
                    placeholder={"Password"} />
                <TouchableHighlight onPress={this.signup.bind(this)} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Signup</Text>
                </TouchableHighlight>
            </View>;
            return (
                <View style={styles.container}>
                    <View style={styles.body}>
                      {content}
                    </View>
                </View>
            )
      }
}