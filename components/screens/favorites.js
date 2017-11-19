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
  Dimensions,
  Image,
  ListView
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import firebaseApp from '../firebase.js';
import { NavigationActions } from 'react-navigation';
import styles from '../baseStyles';

const backAction = NavigationActions.back();

var { width, height } = Dimensions.get('window');

export default class favorites extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;
        this.state = {
            dataSource  : new ListView.DataSource({
                rowHasChanged : (row1, row2) => true
            }),

            cords : {
                latitude  :   0,
                longitude :   0
            },

            user: userData,

            text: "",

            hiking: require('../../images/hiking.png'),
            jogging: require('../../images/jogging.png'),
            biking: require('../../images/biking.png'),
            climbing: require('../../images/climbing.png'),
            paddling: require('../../images/paddling.png'),
            ski: require('../../images/ski.png'),
        }
        this.favoritMarkerList = firebaseApp.database().ref('markers/');
    }

    static navigationOptions = {
        title: 'Favorites',
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    };

    componentDidMount() {
        this.listenForItems();

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.setState({
                cords : {
                  latitude  :   position.coords.latitude,
                  longitude :   position.coords.longitude
                },
            });
            },
            (error) => alert(error.message),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    }

    componentWillUnmount() {
        this.favoritList.off();
    };

    listenForItems() {
        this.favoritList = firebaseApp.database().ref('users/' + this.state.user.uid + '/favorits');
        this.favoritList.on('value', (snap) => {
            var items = [];
            snap.forEach((childVar) => {
                var spesificMarker = this.favoritMarkerList.child(childVar.val().key);
                spesificMarker.once('value', (superChild) => {
                    items.push({
                            title: superChild.val().title,
                            coordinates : {
                                latitude  :   superChild.val().coordinates.latitude,
                                longitude :   superChild.val().coordinates.longitude,
                            },
                            cords: superChild.val().cords,
                            color : superChild.val().color,
                            laji : superChild.val().laji,
                            description: superChild.val().description,
                            diff: superChild.val().diff,
                            _key: superChild.key
                    });
                });
            });

            this.setState({
                dataSource  : this.state.dataSource.cloneWithRows(items)
            });
        });
   }

    _renderRow(rowData, sectionID, rowID) {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.rowStyle}>
                <TouchableOpacity
                            style={{flexDirection: 'row', backgroundColor: "white", flex: 1}}
                            onPress={() => navigate('Marker', { info: rowData, distance: this.getDistance(  this.state.cords.latitude,
                                                                                                           this.state.cords.longitude,
                                                                                                           rowData.coordinates.latitude,
                                                                                                           rowData.coordinates.longitude
                                                                                               )})}
                >
                    <Image style={{width: 20, height: 22, marginRight: 20}} source={this.state[rowData.laji]} />
                    <Text>  {rowData.title} </Text>
                </TouchableOpacity>
            </View>
        );
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

    render() {
        const {navigate} = this.props.navigation;
        return (
            <View style={styles.container}>
                <View   style={styles.listView}>
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.state.dataSource}
                        renderRow={this._renderRow.bind(this)}
                    />
                </View>
            </View>
        );
    }
}
