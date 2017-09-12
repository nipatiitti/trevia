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
  Dimensions
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './baseStyles.js';
import firebaseApp from './firebase.js';
import { NavigationActions } from 'react-navigation'

const backAction = NavigationActions.back();

var { width, height } = Dimensions.get('window');

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
            this.props.navigation.dispatch(backAction);
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
        this.props.navigation.dispatch(backAction);
      });
    }

    render() {
        const {navigate} = this.props.navigation;
        const content = this.state.loading ? <ActivityIndicator size="large"/> :
            this.state.user ?
                <View style={{flex: 1, flexDirection:'column', alignItems:'center', justifyContent:'space-around', backgroundColor: '#F5FCFF'}}>
                    <Text style={{margin: 10}}>Logged in as: {this.state.user.email} </Text>
                    <TouchableOpacity style={styles.button} onPress={() => navigate('Favorites')}>
                        <Text style={styles.basicText}><Icon name="star" size={30} color="gold" />   Favorites</Text>
                        <Text style={styles.basicText, styles.textRight}><Icon name="angle-right" size={30} color="black" /></Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => navigate('Liked')}>
                        <Text style={styles.basicText}><Icon name="thumbs-o-up" size={30} color="black" />   Liked</Text>
                        <Text style={styles.basicText, styles.textRight}><Icon name="angle-right" size={30} color="black" /></Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => navigate('MadeByMe')}>
                        <Text style={styles.basicText}><Icon name="user-o" size={30} color="black" />   Made by me</Text>
                        <Text style={styles.basicText, styles.textRight}><Icon name="angle-right" size={30} color="black" /></Text>
                    </TouchableOpacity>
                    <TouchableHighlight onPress={this.logout.bind(this)} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Logout</Text>
                    </TouchableHighlight>
                </View>
            :
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
                    <TouchableHighlight onPress={this.login.bind(this)} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Login</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => navigate('SignIn')} style={styles.transparentButton}>
                        <Text style={styles.transparentButtonText}>New here?</Text>
                    </TouchableHighlight>
                </View>
        ;

        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    {content}
                </View>
            </View>
        );
    }
}