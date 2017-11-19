'use strict'
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../baseStyles.js';
import firebaseApp from '../firebase.js';
import { NavigationActions } from 'react-navigation';

const resetAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Main'})
  ]
})


export default class logIn extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;

        this.state = {

          user: userData,
          loading: false,

          email: '',
          password: '',
        };
    }

    static navigationOptions = {
        title: 'User info',
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    };

    componentDidMount() {

    }

    login(){
        this.setState({
          loading: true
        });

        firebaseApp.auth().signInWithEmailAndPassword(this.state.email, this.state.password
        ).then((userData) => {
            this.setState({
                loading: false
            });

            alert("Login successful");
            this.props.navigation.dispatch(resetAction);
        }
        ).catch((error) => {
            this.setState({
                loading: false
            });

            alert('Login Failed. Please try again');
        });
    }

    logout() {
      firebaseApp.auth().signOut().then(() => {
        alert('Log out successful');
        this.props.navigation.dispatch(resetAction);
      });
    }

    render() {
        const {navigate} = this.props.navigation;
        const content = this.state.loading ? <ActivityIndicator size="large"/> :
            this.state.user ?
                <View style={[styles.container, styles.spaceAround]}>
                    <Text style={[styles.margin, styles.textMiddle]}>Logged in as: {this.state.user.email} </Text>

                    <TouchableOpacity style={[styles.row, styles.settingsButton, styles.roundBorder]} onPress={() => navigate('Favorites')}>
                        <Text style={styles.text}><Icon name="star" size={30} color="gold" />   Favorites</Text>
                        <Text style={[styles.text, styles.textRight]}><Icon name="angle-right" size={30} color="black" /></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, styles.settingsButton, styles.roundBorder]} onPress={() => navigate('Liked')}>
                        <Text style={styles.basicText}><Icon name="thumbs-o-up" size={30} color="black" />   Liked</Text>
                        <Text style={[styles.text, styles.textRight]}><Icon name="angle-right" size={30} color="black" /></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, styles.settingsButton, styles.roundBorder]} onPress={() => navigate('MadeByMe')}>
                        <Text style={styles.basicText}><Icon name="user-o" size={30} color="black" />   Made by me</Text>
                        <Text style={[styles.text, styles.textRight]}><Icon name="angle-right" size={30} color="black" /></Text>
                    </TouchableOpacity>

                    <TouchableHighlight style={[styles.row, styles.settingsButton, styles.roundBorder, styles.spaceCenter]} onPress={() => this.logout()}>
                        <Text style={styles.textMiddle}>Logout</Text>
                    </TouchableHighlight>
                </View>
            :
                <View style={[styles.container, styles.spaceCenter]}>
                    <TextInput
                        style={[styles.textInput, styles.roundBorder]}
                        onChangeText={(text) => this.setState({email: text})}
                        value={this.state.email}
                        placeholder={"Email Address"} />
                    <TextInput
                        style={[styles.textInput, styles.roundBorder]}
                        onChangeText={(text) => this.setState({password: text})}
                        value={this.state.password}
                        secureTextEntry={true}
                        placeholder={"Password"} />
                    <TouchableHighlight style={styles.button} onPress={() => this.login()}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={{}} onPress={() => navigate('SignIn')}>
                        <Text style={[styles.text, styles.margin, styles.textMiddle]}>New here?</Text>
                    </TouchableHighlight>
                </View>
        ;

        return (
          <View style={styles.container}>
            {content}
          </View>
        );
    }
}
