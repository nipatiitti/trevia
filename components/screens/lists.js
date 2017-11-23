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

export default class lists extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;
        this.state = {
            dataSource  : new ListView.DataSource({
                rowHasChanged : (row1, row2) => true
            }),

            cords : {
                latitude  :   0.0,
                longitude :   0.0
            },

            user: userData,
            loading: true,

            link: this.props.navigation.state.params.link,

            text: "",

            hiking: require('../../images/hiking.png'),
            jogging: require('../../images/jogging.png'),
            biking: require('../../images/biking.png'),
            climbing: require('../../images/climbing.png'),
            paddling: require('../../images/paddling.png'),
            ski: require('../../images/ski.png'),
        }
        this.markers = firebaseApp.database().ref('markers/');
    }

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.link}`,
        headerStyle: {backgroundColor: 'black'},
        headerTintColor: 'white',
    });

    async componentDidMount() {
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

      await this.listenForItems();
    }

    componentWillUnmount() {

    };

    async listenForItems() {
        let likedList = firebaseApp.database().ref('users/' + this.state.user.uid + '/'+this.state.link);
        let keys = [];
        let items = [];

        await likedList.once('value', (snap) => {
          snap.forEach((childVar) => {
            keys.push(childVar.val().key)
          });
        });

        console.log(keys + ", keys");

        for(let key of keys){
          await firebaseApp.database().ref('markers/' + key).once('value', (child) => {
            items.push({
              title: child.val().title,
              cords : child.val().cords,
              color : child.val().color,
              laji : child.val().laji,
              _key: child.key
            });
          });
        }

        console.log(items + ", items");

        this.setState({
          dataSource  : this.state.dataSource.cloneWithRows(items),
          loading : false
        });
   }

    _renderRow(rowData, sectionID, rowID) {
        const { navigate } = this.props.navigation;
        return (
          <View style={styles.rowStyle}>
            <TouchableOpacity style={styles.row} onPress={() => navigate('Marker', { key: rowData._key, cords: this.state.cords, title: rowData.title })}>
              <Image style={{width: 20, height: 22}} source={this.state[rowData.laji]} />
              <Text>  {rowData.title}, </Text>
              <Text style={{color : rowData.color}}>
                {this.getDistance(  this.state.cords.latitude,
                                    this.state.cords.longitude,
                                    rowData.cords.latitude,
                                    rowData.cords.longitude
                                  )} km
              </Text>
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

        const toRender = this.state.loading?
          <View style={[styles.row, styles.spaceAround]}>
            <ActivityIndicator/>
          </View>
          :
          <View style={styles.listView}>
              <ListView
                  enableEmptySections={true}
                  dataSource={this.state.dataSource}
                  renderRow={this._renderRow.bind(this)}
              />
          </View>
          ;

        return (
            <View style={styles.container}>
              {toRender}
            </View>
        );
    }
}
