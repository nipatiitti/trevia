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

export default class poCords extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;

        this.state = {
          user: userData,

          cords : {
            latitude  :   this.props.navigation.state.params.cords.latitude,
            longitude :   this.props.navigation.state.params.cords.longitude
          },

          distance: 0.0,

          poCords: [this.props.navigation.state.params.cords],

          road: true,

          region: {
            latitude: this.props.navigation.state.params.cords.latitude,
            longitude: this.props.navigation.state.params.cords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          },
        };
    }

    static navigationOptions = {
      title: 'Draw Route',
      headerStyle: {backgroundColor: 'black'},
      headerTintColor: 'white',
    };

    componentDidMount() {
        if (!this.state.user) {
          alert("Pls log in first!");
          this.props.navigation.goBack();
        }

    }

    onRegionChange(region) {
      this.setState({ region });
    };

    async onPress(e) {

        let joined = [];

        if(this.state.road) {
          if (this.state.poCords.length < 1)
            var start = this.state.cords.latitude.toString() + "," + this.state.cords.longitude.toString();
          else
            var start = this.state.poCords[this.state.poCords.length - 1].latitude.toString() + "," + this.state.poCords[this.state.poCords.length - 1].longitude.toString();
          var end = e.nativeEvent.coordinate.latitude.toString() +  "," + e.nativeEvent.coordinate.longitude.toString()

          joined = await this.getDirections(start, end)

        } else {

          joined = this.state.poCords.concat(e.nativeEvent.coordinate);
        }

        this.setState({
            poCords: joined
        });

        this.countDistance(joined);

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

            return joined;

        } catch(error) {
            alert(error)
            return error
        }
    }

    _submit() {
      this.props.navigation.navigate("Add", {poCords: this.state.poCords, cords: this.state.cords})
    }

    countDistance(points) {
      let length = 0.0;
      for(var i = 1; i < points.length; i++){
        var lat1 = points[i-1].latitude;
        var lon1 = points[i-1].longitude;
        var lat2 = points[i].latitude;
        var lon2 = points[i].longitude;

        length += this.getDistance(lat1,lon1,lat2,lon2);
      }
      this.setState({
        distance: length.toPrecision(3)
      })
    }

    getDistance(lat1,lon1,lat2,lon2) {
       var R = 6371; // Radius of the earth in km
       var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
       var dLon = this.deg2rad(lon2-lon1);
       var a =
         Math.sin(dLat/2) * Math.sin(dLat/2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon/2) * Math.sin(dLon/2)
         ;
       var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
       var d = R * c; // Distance in km
       var y = Math.round(d*100)/100;
       return y;
    }

    deg2rad(deg) {
       return deg * (Math.PI/180)
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
            <View style={[styles.container, styles.end]} >
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

              <Text style={[styles.text, {top: 0, textAlign: 'center'}, styles.transparentBackground]}>{this.state.distance}, km long</Text>
              <View style={[styles.row, {flex: 0}]}>
                <View style={[styles.row, styles.button, {marginHorizontal: 2}]} >
                  <Text style={styles.buttonText}>Route trough roads</Text>
                  <Switch
                    onValueChange={() => this.setState({road: !this.state.road})}
                    value={this.state.road}
                    style={{margin: 5}}
                  />
                </View>

                <TouchableOpacity onPress = {() => this.popArray()} style = {[styles.button, {marginHorizontal: 2}]} >
                  <Text style = {styles.buttonText}><Icon name="undo" size={30} color="white" /></Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => this._submit()} style={[styles.button, {marginHorizontal: 2}]} >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
        );
    }
}
