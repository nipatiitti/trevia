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
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { MapView } from 'expo';
import firebaseApp from '../firebase.js';
import styles from '../baseStyles';

var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class markerView extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;
        this.markers = firebaseApp.database().ref('markers/');

        this.state = {
          user: userData,

          likes: 0,
          icons: {
            like: "thumbs-o-up",
            fav: "star-o"
          },

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

          marker: {
            title: "",
            cords : {
              latitude  :   0.0,
              longitude :   0.0,
            },
            poCords: [],
            laji : "",
            color: "",
            description: "",
            diff: "",
          },

          loading: true,

          length: 0.0,
          distance: 0.0,

          hiking: require('../../images/hiking.png'),
          jogging: require('../../images/jogging.png'),
          biking: require('../../images/biking.png'),
          climbing: require('../../images/climbing.png'),
          paddling: require('../../images/paddling.png'),
          ski: require('../../images/ski.png'),
        };

        this.rootRef = firebaseApp.database().ref();
        this.data = firebaseApp.database().ref('markers/' + this.props.navigation.state.params._key + '/');
        this.likes = this.rootRef.child('likes/' + this.props.navigation.state.params._key + '/');
        this.mapRef = null;
    }

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.info.title}`,
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    });

    componentDidMount() {
      this.listenForItems(this.likes);
      this.countDistance();

      this.alreadyFavorit = false;
      this.alreadyLiked = false;

      if(this.state.user) {
        this.prep();
      }

      this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.setState({
          cords : {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      });

    }

    getMarker() {
      let marker = this.state.marker;
      this.rootRef.child('markers/').orderByChild('key').equalTo(this.props.navigation.state.params.key).once('value', (snap) => {
       snap.forEach((child) => {
         marker.title = child.val().title;
         marker.cords = {
           latitude  :   child.val().cords.latitude,
           longitude :   child.val().cords.longitude,
         };
         marker.color = child.val().color;
         marker.laji = child.val().laji;
       });
      });

      this.rootRef.child('data/').orderByChild('key').equalTo(this.props.navigation.state.params.key).once('value', (snap) => {
       snap.forEach((child) => {
         marker.poCords = child.val().poCords;
         marker.description = child.val().description;
         marker.difficulty = child.val().diff;
       });
       this.setState({
         marker: marker,
         loading: false,
         distance: this.getDistance(this.props.navigation.state.params.cords.latitude,
                                    this.props.navigation.state.params.cords.longitude,
                                    marker.cords.latitude,
                                    marker.cords.longitude),
        length: this.countDistance(marker.poCords).toPrecision(2),
       });
      });


     }

    prep() {
      this.userLiked = this.rootRef.child('users/' + this.state.user.uid + '/liked/');
        this.userLiked.on('value', (snap) => {
          snap.forEach((child) => {
            if (child.val().key == this.props.navigation.state.params.info._key) {
              this.alreadyLiked = true;
              this.setState({
                icons: {
                  like: "thumbs-up",
                  fav: this.state.icons.fav
                }
              })
            }
          });
        });

        this.userFavorit = this.rootRef.child('users/' + this.state.user.uid + '/favorits/');
        this.userFavorit.on('value', (snap) => {
          snap.forEach((child) => {
            if (child.val().key == this.props.navigation.state.params.info._key) {
              this.alreadyFavorit = true;
              this.setState({
                icons: {
                  like: this.state.icons.like,
                  fav: "star"
                }
              })
            }
          });
        });
    }

    countDistance(points) {
      var length = 0.0;
      for(var i = 1; i < points.length; i++){
        var lat1 = points[i-1].latitude;
        var lon1 = points[i-1].longitude;
        var lat2 = points[i].latitude;
        var lon2 = points[i].longitude;

        length += this.getDistance(lat1,lon1,lat2,lon2);
      }
      return length;
    }

    componentWillUnmount() {
      if(this.state.user) {
        this.userFavorit.off();
        this.userLiked.off();
        this.likes.off();
      }
      navigator.geolocation.clearWatch(this.watchID);
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

    onLayout() {
      if (this.state.marker.poCords) {
        this.mapRef.fitToCoordinates(
          this.state.marker.poCords,
          false,
        );
      }
    }

    listenForItems(itemsRef) {
      itemsRef.on('value', (snap) => {
        this.items = [];
        snap.forEach((child) => {
          this.items.push({
            user: child.val().user,
          });
      });
        this.setState({
          likes: this.items.length,
        })
      });
    }

    _like(){
      if (!this.state.user) {
        alert('You must log in to like');
        return;
      } else if (!this.alreadyLiked) {
          this.likes.push({user: this.state.user.uid});
          this.userLiked.push({
            key: this.props.navigation.state.params.info._key,
          });
          this.alreadyLiked = true;
          this.setState({
            icons: {
              like: "thumbs-up",
              fav: this.state.icons.fav
            }
          })
        } else {
          this.likes.orderByChild('user').equalTo(this.state.user.uid)
            .once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                this.likes.child(childSnapshot.key).remove();
            });
          });
          this.userLiked.orderByChild('key').equalTo(this.props.navigation.state.params.info._key)
            .once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                this.userLiked.child(childSnapshot.key).remove();
            });
          });
          this.alreadyLiked = false;
          this.setState({
            icons: {
              like: "thumbs-o-up",
              fav: this.state.icons.fav
            }
          })
        }
    }

    _love(){
      if (!this.state.user) {
        alert('You must log in to add favorites');
        return;
      } else if (!this.alreadyFavorit) {
        this.userFavorit.push({key: this.props.navigation.state.params.info._key});
        this.alreadyFavorit = true;
        this.setState({
          icons: {
            like: this.state.icons.like,
            fav: "star"
          }
        })
      } else {
        this.userFavorit.orderByChild('key').equalTo(this.props.navigation.state.params.info._key)
            .once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                this.userFavorit.child(childSnapshot.key).remove();
            });
        });
        this.alreadyFavorit = false;
        this.setState({
          icons: {
            like: this.state.icons.like,
            fav: "star-o"
          }
        })
      }
    }

    onRegionChange(region) {
      this.setState({ region });
    };

    render() {
        const { params } = this.props.navigation.state;

        const toRender = this.state.loading ?
        <View>
          <ActivityIndicator>
        </View>
        :
        <View style={styles.container}>
            <View style={{
                flexDirection: 'row',
                margin: 10,
                justifyContent: 'space-around',
                alignItems: 'center',
                borderColor: 'grey',
                borderBottomWidth: 1,
              }}>

                <View style={{flex: 2}}>
                  <Text style={{color: 'black', fontSize: 13, alignSelf: 'center'}}>
                      <Text style={{fontWeight: 'bold'}}>{this.state.distance}</Text> km away
                  </Text>
                </View>
                <View style={{flex: 2}}>
                  <Text style={{color: 'black', fontSize: 13, alignSelf: 'center'}}>
                      <Text style={{fontWeight: 'bold'}}>{this.state.length}</Text> km long
                  </Text>
                </View>
                <View style={{flex: 2}}>
                  <Text style={{color: 'black', fontSize: 14, fontWeight: 'bold', alignSelf: 'center'}} >
                      {this.state.marker.info.diff}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => this._like()} style={{flex: 2, margin: 5}}>
                  <Text style={{color: 'black', fontSize: 20}}> {this.state.likes} <Icon name={this.state.icons.like} size={30} color={this.state.marker.info.color} /></Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this._love()} style={{flex: 1}}>
                  <Text><Icon name={this.state.icons.fav} size={30} color="gold" /></Text>
                </TouchableOpacity>

            </View>

            <ScrollView contentContainerStyle={{flex: 1}}>
              <Text style={{fontSize: 13, margin: 5, color: 'grey'}}>
                  Description:{"\n"}
                    <Text style={{fontSize: 16, margin: 5, color: '#404040'}}>
                      {this.state.marker.description}
                    </Text>
              </Text>
            </ScrollView>

            <MapView
                  onLayout = {() => this.onLayout()}
                  ref={(ref) => { this.mapRef = ref }}
                  mapType="terrain"
                  style={{width: width, height: height/2.25}}
                  region={this.state.region}
                  onRegionChange={this.onRegionChange.bind(this)}
              >

                <MapView.Polyline
                  key="polyline"
                  coordinates={this.state.poCords}
                  strokeColor="#F00"
                  fillColor="rgba(255,0,0,0.5)"
                  strokeWidth={1}
                />

                <MapView.Marker
                  coordinate={this.state.cords}
                  image={require('../../images/locationmarker.png')}
                />

                <MapView.Marker
                  coordinate={params.info.coordinates}
                  image={this.state[params.info.laji]}
                />

              </MapView>

        </View>

        return (

        );
    }
}
