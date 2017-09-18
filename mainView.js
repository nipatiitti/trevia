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

import { MapView } from 'expo';
import Icon from 'react-native-vector-icons/FontAwesome';
import DynamicList from './components/listView.js';
import firebaseApp from './components/firebase.js';

var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const LATITUDE = 60.4491;
const LONGITUDE = 22.3027;

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class mainView extends Component {
	constructor(props) {
	    super(props);

	    this.state = {
	    	region: {
			    latitude: LATITUDE,
			    longitude: LONGITUDE,
			    latitudeDelta: LATITUDE_DELTA,
			    longitudeDelta: LONGITUDE_DELTA
			  },
  			cords : {
  				latitude: LATITUDE,
  			  longitude: LONGITUDE,
  			},
  			lat : LATITUDE,
  			lon : LONGITUDE,
  			animation : new Animated.Value(),
  			text : "chevron-left",
  			open : false,

        hiking: require('./images/hiking.png'),
        jogging: require('./images/jogging.png'),
        biking: require('./images/biking.png'),
        climbing: require('./images/climbing.png'),
        paddling: require('./images/paddling.png'),
        ski: require('./images/ski.png'),
        data: [],
        items: []
      };

    this.itemsRef = firebaseApp.database().ref('markers/');
    this.data = [];

	};

  static navigationOptions = {
    title: 'Maps',
    headerStyle: {backgroundColor: 'black'},
    headerTintColor: 'white',
    //header: ({ state }) => {
    //    return {
    //        right: (state.params.right)
    //    };
    //}
  };

  componentDidMount() {
    const params = {
            right: (
                <Button
                    onPress={() => { () => this._touchHandler() }}
                    title={"Save"}
                />
            ),
        };

    this.props.navigation.setParams(params);

    this.listenForItems(this.itemsRef);
  	this.state.animation.setValue(0);
   	navigator.geolocation.getCurrentPosition(
     		(position) => {
       		this.setState({
         			region: {
             			latitude: position.coords.latitude,
             			longitude: position.coords.longitude,
             			latitudeDelta: LATITUDE_DELTA,
             			longitudeDelta: LONGITUDE_DELTA
           			},
           			lat : position.coords.latitude,
           			lon : position.coords.longitude,
           			cords : {
  					      latitude: position.coords.latitude,
             			longitude: position.coords.longitude,
  				}
         		});
       		},
       		(error) => alert(error.message),
     	{enableHighAccuracy: true, timeout: 1000, maximumAge: 1000}
    );

    this.watchID = navigator.geolocation.watchPosition(
    	(position) => {
    		this.setState({
          cords : {
					  latitude: position.coords.latitude,
          	longitude: position.coords.longitude,
					},
					lat : position.coords.latitude,
          lon : position.coords.longitude,
        })
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 1000, maximumAge: 1000, distanceFilter: 10 });

    this.props.navigation.setParams({
      buttonPress: this._touchHandler.bind(this)
    });

 	}

 	componentWillUnmount() {
   	navigator.geolocation.clearWatch(this.watchID);
    this.itemsRef.off();
  };

  onRegionChange(region) {
   	this.setState({ region });
  };

  onTouchChange(lat, long) {
   	this.setState({
         			region: {
           			latitude: lat ,
           			longitude: long,
           			latitudeDelta: 0.1,
           			longitudeDelta: LATITUDE_DELTA * ASPECT_RATIO
         			}});
   	this._closeSide();
  };

 	_touchHandler(){
 		if (!this.state.open) {
 			this.setState({ open : true,
 							        text : "chevron-right"});
 			this.state.animation.setValue(0);
  		Animated.spring(
 				this.state.animation,
 				{
 		  		toValue: width/2,
 		  	},
		  ).start();
 		} else {
 			this._closeSide();
  	};
 	};

  _closeSide(){
 		if (this.state.open) {
 			this.setState({ open : false,
                       text : "chevron-left"});
 			this.state.animation.setValue(width/2);
  		Animated.timing(
	  		this.state.animation,
	  		{
	  			toValue: 0,
	  		},
		  ).start();
  	};
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

  listenForItems(itemsRef) {
     itemsRef.on('value', (snap) => {
       var items = [];
       snap.forEach((child) => {
         items.push({
           title: child.val().title,
           coordinates : {
             latitude  :   child.val().coordinates.latitude,
             longitude :   child.val().coordinates.longitude,
           },
           cords: child.val().cords,
           color : child.val().color,
           laji : child.val().laji,
           description: child.val().description,
           diff: child.val().diff,
           _key: child.key
         });
       });
       this.data = items;
       this.setState({
        items: items
       })
       console.log( "Fetched succesfully");
      });
   }

  render() {
    const { navigate } = this.props.navigation;

    return (
     	<View style={styles.container}>
        <MapView
          	ref="map"
          	mapType="terrain"
          	style={styles.map}
          	region={this.state.region}
          	onRegionChange={this.onRegionChange.bind(this)}
          	onPress={() => this._closeSide()}
        >

        	<MapView.Marker
			  	coordinate={this.state.cords}
			  	image={require('./images/locationmarker.png')}
			    />

				    {this.state.items.map(marker => (
   				    <MapView.Marker
   				    	  key={marker._key}
   				      	coordinate={marker.coordinates}
                  onPress={() => navigate('Marker', { info: marker, distance: this.getDistance(  this.state.cords.latitude,
                                                                                                   this.state.cords.longitude,
                                                                                                   marker.coordinates.latitude,
                                                                                                   marker.coordinates.longitude
                                                                                               )})}
   				      	image = {this.state[marker.laji]}
               />
			      ))}
        </MapView>

	      <View style={styles.bubble}>
          <Text style={{ textAlign: 'center'}}>
            {`${this.state.region.latitude.toPrecision(7)}, ${this.state.region.longitude.toPrecision(7)}`}
          </Text>
        </View>

		    <Animated.View
          style={[styles.list, {width : this.state.animation}]}
	      >
	    	<DynamicList
          lat={this.state.lat}
	    		lon={this.state.lon}
	    		styles={styles.list}
	    		call={this.onTouchChange.bind(this)}
	    		data={this.state.items}
          navigation={this.props.navigation}
	    	/>
	    </Animated.View>

		  <Animated.View style={[styles.button, {right : this.state.animation}]}>
		    <TouchableOpacity onPress = {()=> this._touchHandler()} >
	      	<Text style={{backgroundColor: 'transparent'}}><Icon name={this.state.text} size={30} color="black" /></Text>
	      </TouchableOpacity>
	      <TouchableOpacity onPress = {()=> this.onTouchChange(this.state.lat, this.state.lon)} >
           <Text style={{backgroundColor: 'transparent'}}><Icon name="location-arrow" size={30} color="black" /></Text>
         </TouchableOpacity>
	    </Animated.View>
   	</View>
   );
 }
}

var styles = StyleSheet.create({
  container: {
	  position 	: 'absolute',
	  top 		: 0,
	  left 		: 0,
	  right 		: 0,
	  bottom 		: 0,
	  justifyContent: 'flex-end',
	  alignItems 	: 'center',
  },

  list : {
  	position : 'absolute',
  	backgroundColor: 'snow',
  	top 		: 0,
    right 		: 0,
    bottom 		: 0,
  },

  button : {
  	position : 'absolute',
  	padding : 10,
  	paddingBottom: 60,
  	alignItems 	 : 'center',
  	flexDirection 	: 'column-reverse',
  	justifyContent	: 'center'
  },

  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },

});
