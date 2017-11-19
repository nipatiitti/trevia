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
  Image,
  Button
} from 'react-native';

import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../baseStyles';

var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class mapView extends Component {
	constructor(props) {
	    super(props);

	    this.state = {
        region: {
          latitude: this.props.navigation.state.params.cords.latitude,
          longitude: this.props.navigation.state.params.cords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        },
        cords : {
          latitude: this.props.navigation.state.params.cords.latitude,
          longitude: this.props.navigation.state.params.cords.longitude,
        },

        hiking: require('../../images/hiking.png'),
        jogging: require('../../images/jogging.png'),
        biking: require('../../images/biking.png'),
        climbing: require('../../images/climbing.png'),
        paddling: require('../../images/paddling.png'),
        ski: require('../../images/ski.png'),
        items: this.props.navigation.state.params.items
      };
	};

  static navigationOptions = {
    title: 'Map',
    headerStyle: {backgroundColor: 'black'},
    headerTintColor: 'white',
  };

  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition(
    	(position) => {
    		this.setState({
          cords : {
					  latitude: position.coords.latitude,
          	longitude: position.coords.longitude,
					},
        })
      },
      (error) => {
        alert("Can't get location")
        console.log(error.message);
      },
      {enableHighAccuracy: true, timeout: 1000, maximumAge: 1000, distanceFilter: 10 });
 	}

 	async componentWillUnmount() {
   	navigator.geolocation.clearWatch(this.watchID);
    await AsyncStorage.setItem('@trevia:longitude', this.state.cords.longitude.toPrecision(7));
    await AsyncStorage.setItem('@trevia:latitude', this.state.cords.latitude.toPrecision(7));
  };

  onRegionChange(region) {
   	this.mapView.state.region = region;
  };


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

  animate(coordinate){
       let newRegion = {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: this.mapView.state.region.latitudeDelta - this.mapView.state.region.latitudeDelta/2,
            longitudeDelta: this.mapView.state.region.longitudeDelta - this.mapView.state.region.longitudeDelta/2,
        };
        this.mapView._root.animateToRegion(newRegion, 1000);
    }

  render() {
    const { navigate } = this.props.navigation;

    return (
     	<View style={styles.container}>
        <MapView
          ref = {(ref)=>this.mapView=ref}
          onClusterPress={(coordinate)=>{
              this.animate(coordinate);
          }}
          clusterBorderWidth={1}
          radius={17}
          mapType="terrain"
          showsUserLocation = {true}
          zoomEnabled = {true}
          showsMyLocationButton = {true}
          showsCompass = {true}
          showScale = {true}
          style={styles.map}
          region={this.state.region}
          onRegionChange={(region) => this.onRegionChange(region)}
        >

          {this.state.items.map(marker => (
            <Marker
              key={marker._key}
   				    coordinate={marker.coordinates}
              onPress={() => navigate('Marker', { info: marker, cords: this.state.cords })}
   				    image = {this.state[marker.laji]}
            />
			    ))}
        </MapView>

	      <View style={styles.bottom}>
          <Text style={styles.textMiddle}>
            {`${this.state.region.latitude.toPrecision(7)}, ${this.state.region.longitude.toPrecision(7)}`}
          </Text>
        </View>
   	</View>
   );
 }
}
