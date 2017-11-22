'use strict'
import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
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

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class addView extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;

        this.state = {
          user: userData,

          cords : {
            latitude  :   this.props.navigation.params.cords.latitude,
            longitude :   this.props.navigation.params.cords.longitude
          },

          poCords: this.props.navigation.params.poCords,

          road: true,

          region: {
            latitude: this.props.navigation.params.cords.latitude,
            longitude: this.props.navigation.params.cords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          },
        };
    }

    static navigationOptions = ({ navigation }) => ({
        title: 'Draw route',
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    });

    componentDidMount() {
        if (!this.state.user) {
          alert("Pls log in first!");
          this.props.navigation.goBack();
        }

    }

    onRegionChange(region) {
      this.setState({ region });
    };

    onPress(e) {
        if(this.state.road) {
          if (this.state.poCords.length < 1)
            var start = this.state.cords.latitude.toString() + "," + this.state.cords.longitude.toString();
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

    _submit() {
      this.props.navigation.navigate("Add", {poCords: this.state.poCords, cords: this.state.cords})
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
        cords: e.nativeEvent.coordinate
      })
      var joined = this.state.poCords.slice();
      joined.shift();
      joined.unshift(e.nativeEvent.coordinate);
      this.setState({
        poCords: joined
      });
    }

    render() {
        return (
            <View style={styles.container} >
              <View style={[styles.container, styles.spaceAround]} >
                <Text style={styles.text}>Tap the map to add route</Text>
                <Text style={styles.text}>Route trough roads</Text>
                <Switch
                  onValueChange={() => this.setState({road: !this.state.road})}
                  value={this.state.road}
                  style={{margin: 5}}
                />
              </View>

              <MapView
                ref="map"
                mapType="terrain"
                style={styles.map}
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
                  coordinate={this.state.cords}
                  onDragEnd={e => this.onDragEnd(e)}
                />
              </MapView>

              <TouchableOpacity onPress = {() => this.popArray()} style = {styles.button} >
                <Text style = {styles.buttonText}><Icon name="undo" size={30} color="white" /></Text>
              </TouchableOpacity>

              <TouchableOpacity onPress{() => this._submit()} style={styles.button} >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
        );
    }
}
