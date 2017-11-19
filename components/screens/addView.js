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

          coordinates : {
            latitude  :   LATITUDE,
            longitude :   LONGITUDE
          },

          poCords: [],

          road: true,

          color : "",
          laji : "",
          esittely : "",
          diff: "",

          region: {
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          },
        };

        this.root = firebaseApp.database().ref();
        this.items = this.root.child('markers/');
        this.key = "";
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
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.setState({
                region: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA
                },
                coordinates : {
                  latitude  :   position.coords.latitude,
                  longitude :   position.coords.longitude
                },
            });
            },
            (error) => alert(error.message),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    }

    onRegionChange(region) {
      this.setState({ region });
    };

    onPress(e) {
        if(this.state.road) {
          if (this.state.poCords.length < 1)
            var start = this.state.coordinates.latitude.toString() + "," + this.state.coordinates.longitude.toString();
          else
            var start = this.state.poCords[this.state.poCords.length - 1].latitude.toString() + "," + this.state.poCords[this.state.poCords.length - 1].longitude.toString();
          var end = e.nativeEvent.coordinate.latitude.toString() +  "," + e.nativeEvent.coordinate.longitude.toString()

          this.getDirections(start, end)
        } else {
          var joined = this.state.poCords.concat(e.nativeEvent.coordinate);
          this.setState({
              poCords: joined
          });
        }

    }

    async getDirections(startLoc, destinationLoc) {
        try {
            let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }`)
            let respJson = await resp.json();
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
            let coords = points.map((point, index) => {
                return  {
                    latitude : point[0],
                    longitude : point[1]
                }
            });

            var joined = this.state.poCords.concat(coords);

            this.setState({
              poCords: joined
            })

            return coords

        } catch(error) {
            alert(error)
            return error
        }
    }

    popArray() {
        var joined = this.state.poCords.slice();
        joined.pop();
        this.setState({
            poCords: joined
        });
    }

    onDragEnd(e) {
      this.setState({
        coordinates: e.nativeEvent.coordinate
      })
      var joined = this.state.poCords.slice();
      joined.shift();
      joined.unshift(e.nativeEvent.coordinate);
      this.setState({
        poCords: joined
      });
    }

    _addTask() {

      if (!this.state.user) {
        alert("Pls log in first!");
        this.props.navigation.goBack();
        return
      }

      if(  this.state.title == ""
        || isNaN(parseFloat(this.state.coordinates.latitude))
        || isNaN(parseFloat(this.state.coordinates.longitude))
        || this.state.laji == ""
        || this.state.esittely == ""
        || this.state.diff == ""  ) {
        alert('You have one or more empty fields!');
        return
      }

      this.items.push({
        title :   this.state.title,
        coordinates : {
          latitude  :   parseFloat(this.state.coordinates.latitude),
          longitude :   parseFloat(this.state.coordinates.longitude)
        },
        color : this._getColor(this.state.laji),
        laji : this.state.laji,
        description: this.state.esittely,
        cords: this.state.poCords,
        madeBy: this.state.user.email,
        diff: this.state.diff
      })
      .then((snap) => {
          var keyToItem = snap.key;
          var userRef = this.root.child('users/' + this.state.user.uid + '/');

          userRef.child('made/').push({key: keyToItem});
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

        const stuff = Platform.OS == 'ios' ?
                    <View>
                      <Text onPress={() => this.showActionSheetSport()} style={styles.textButton}>
                        Pick sport: {this.state.laji}
                      </Text>

                      <Text onPress={() => this.showActionSheetDifficulty()} style={styles.textButton}>
                        Pick difficulty: {this.state.diff}
                      </Text>
                    </View>
                  :
                    <View>
                      <Picker
                        selectedValue={this.state.laji}
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
              <View style={styles.body, {flexDirection: 'column'}}>
                  <TextInput
                    style={{width: width, margin: 5}}
                    onChangeText={(text) => this.setState({title: text})}
                    value={this.state.title}
                    returnKeyType = 'next'
                    maxLength = {25}
                    placeholder={"Name..."} />

                  <TextInput
                    style={{height: 25, margin: 5}}
                    value={this.state.esittely}
                    multiline = {true}
                    numberOfLines = {4}
                    maxLength = {800}
                    onChangeText={(text) => this.setState({esittely: text})}
                    placeholder={"Description..."} />

                  {stuff}

                  <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end'}} >
                    <Text style={{fontSize: 10, margin: 5, color: 'grey'}}>Tap the map to add route</Text>
                    <Text style={{fontSize: 10, margin: 5, color: 'grey'}}>Route trough roads</Text>
                    <Switch
                      onValueChange={() => this.setState({road: !this.state.road})}
                      value={this.state.road}
                      style={{margin: 5}}
                    />

                  </View>
                  <MapView
                      ref="map"
                      mapType="terrain"
                      style={{width: width, height: height/2.25}}
                      region={this.state.region}
                      onRegionChange={this.onRegionChange.bind(this)}
                      onPress={e => this.onPress(e)}
                  >

                    <MapView.Polyline
                      key="polyline"
                      coordinates={this.state.poCords}
                      strokeColor="#F00"
                      fillColor="rgba(255,0,0,0.5)"
                      strokeWidth={1}
                    />

                    <MapView.Marker draggable
                      coordinate={this.state.coordinates}
                      onDragEnd={e => this.onDragEnd(e)}
                    />

                  </MapView>

                  <TouchableOpacity onPress = {() => this.popArray()} style = {styles.iconButton} >
                      <Text style = {styles.text}><Icon name="undo" size={30} color="black" /></Text>
                  </TouchableOpacity>

                  <TouchableHighlight onPress={this._addTask.bind(this)} style={styles.submitButton}>
                    <Text style={styles.transparentButtonText}>Submit</Text>
                  </TouchableHighlight>
                </View>
            </View>
        );
    }
}
