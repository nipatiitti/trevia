'use strict'
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Picker,
  Dimensions,
  Switch,
  Platform,
  ActionSheetIOS
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { MapView } from 'expo';
import styles from '../baseStyles.js';
import firebaseApp from '../firebase.js';
import Polyline from '@mapbox/polyline';

var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const LATITUDE = 60.4491;
const LONGITUDE = 22.3027;

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

export default class addView extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;

        this.state = {
          user: userData,
          title :   "",

          color : "",
          laji : "",
          esittely : "",
          diff: "",

        };

        this.root = firebaseApp.database().ref();
        this.items = this.root.child('markers/');
    }

    static navigationOptions = ({ navigation }) => ({
        title: 'Add new marker',
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    });

    componentDidMount() {
        if (!this.state.user) {
          alert("Pls log in first!");
          this.props.navigation.goBack();
        }
    }

    _addTask() {

      if (!this.state.user) {
        alert("Pls log in first!");
        this.props.navigation.goBack();
        return
      }

      if(  this.state.title == ""
        || isNaN(parseFloat(this.props.navigation.params.cords.latitude))
        || isNaN(parseFloat(this.props.navigation.params.cords.longitude))
        || this.state.laji == ""
        || this.state.esittely == ""
        || this.state.diff == ""
        || this.props.navigation.params.poCords.length <= 0) {
          alert('You have one or more empty fields!');
          return
      }

      this.items.push({
        title :   this.state.title,
        cords : {
          latitude  :   parseFloat(this.state.coordinates.latitude),
          longitude :   parseFloat(this.state.coordinates.longitude)
        },
        color : this._getColor(this.state.laji),
        laji : this.state.laji,
        madeBy: this.state.user.email,
      })
      .then((snap) => {

          this.root.child('users/' + this.state.user.uid + '/made/').push({
            key: snap.key
          });

          this.root.child('data/' + snap.key).push({
            description: this.state.esittely,
            poCords: this.props.navigation.params.poCords,
            difficulty: this.state.diff
          });
      });

      alert("Added marker " + this.state.title + " Succesfully");
      this.props.navigation.goBack();
    }

    _getColor(laji) {
      switch(laji) {
        case("hiking"): return "red";
        case("biking"): return "blue";
        case("climbing"): return "aqua";
        case("jogging"): return "green";
        case("paddling"): return "yellow";
        default: return "purple";
      }
    }

    showActionSheetSport() {
      var buttons = ["Biking", "Climbing", "Hiking", "Jogging", "Paddling", "Sking", "Cancel"]
      ActionSheetIOS.showActionSheetWithOptions({
        options: buttons,
        cancelButtonIndex: 7,
      },
      (buttonIndex) => {
        switch(buttons[buttonIndex].toString()) {
          case "Biking": {
            var laji = "biking";
            break
          }
          case "Climbing": {
            var laji = "climbing";
            break
          }
          case "Hiking": {
            var laji = "hiking";
            break
          }
          case "Jogging": {
            var laji = "jogging";
            break
          }
          case "Paddling": {
            var laji = "paddling";
            break
          }
          case "Sking": {
            var laji = "ski";
            break
          }
          default:
            var laji = this.state.laji
        }
        this.setState({laji : laji });
      });
    }

    showActionSheetDifficulty() {
      var buttons = ["Hard", "Normal", "Easy", "Cancel"]
      ActionSheetIOS.showActionSheetWithOptions({
        options: buttons,
        cancelButtonIndex: 4,
      },
      (buttonIndex) => {
        var diff = buttons[buttonIndex]
        if (diff == "Cancel")
          diff = this.state.diff;
        this.setState({diff : diff });
      });
    }


    render() {
        const {navigate} = this.props.navigation;

        const picker = Platform.OS == 'ios' ?
                    <View>
                      <TouchableOpacity onPress={() => this.showActionSheetSport()} style={styles.button}
                        <Text style={styles.buttonText}>Pick a sport: {this.state.laji}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.showActionSheetDifficulty()} style={styles.button}
                        <Text style={styles.buttonText}>Pick difficulty: {this.state.diff}</Text>
                      </TouchableOpacity>
                    </View>
                  :
                    <View>
                      <Picker
                        selectedValue={this.state.laji}
                        style = {this.button}
                        onValueChange={(itemValue, itemIndex) => this.setState({laji: itemValue})}>
                        <Picker.Item label="Pick a sport..." value="" />
                        <Picker.Item label="Biking" value="biking" />
                        <Picker.Item label="Climbing" value="climbing" />
                        <Picker.Item label="Hiking" value="hiking" />
                        <Picker.Item label="Jogging" value="jogging" />
                        <Picker.Item label="Paddling" value="paddling" />
                        <Picker.Item label="Sking" value="ski" />
                      </Picker>

                      <Picker
                        selectedValue={this.state.diff}
                        style = {this.button}
                        onValueChange={(itemValue, itemIndex) => this.setState({diff: itemValue})}>
                        <Picker.Item label="Pick difficulty..." value="" />
                        <Picker.Item label="Hard" value="Hard" />
                        <Picker.Item label="Normal" value="Normal" />
                        <Picker.Item label="Easy" value="Easy" />
                      </Picker>
                    </View>
          ;
        return (
            <View style={styles.container} >
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => this.setState({title: text})}
                value={this.state.title}
                returnKeyType = 'next'
                maxLength = {25}
                placeholder={"Name..."} />

              <TextInput
                style={styles.textInput}
                value={this.state.esittely}
                multiline = {true}
                numberOfLines = {4}
                maxLength = {800}
                onChangeText={(text) => this.setState({esittely: text})}
                placeholder={"Description..."} />

              {picker}

              <TouchableHighlight onPress={()=>this._addTask()} style={styles.button}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableHighlight>
        </View>
      );
    }
}
