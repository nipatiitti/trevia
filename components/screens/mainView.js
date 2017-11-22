'use strict'
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TextInput,
  TouchableOpacity,
  Image,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../baseStyles';
import firebaseApp from '../firebase.js';

export default class mainView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            dataSource  : new ListView.DataSource({
                rowHasChanged : (row1, row2) => true
            }),

            userIn: false,

            text: "",

            hiking: require('../../images/hiking.png'),
            jogging: require('../../images/jogging.png'),
            biking: require('../../images/biking.png'),
            climbing: require('../../images/climbing.png'),
            paddling: require('../../images/paddling.png'),
            ski: require('../../images/ski.png'),

            data: [],

            cords: {
              latitude: 0.0,
              longitude: 0.0
            },
        }

        this.itemsRef = firebaseApp.database().ref('markers/');
    }

    static navigationOptions = {
      header: null,
    };

    async componentDidMount() {
      this.listenForItems();

      this.unsubscribe = firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          this.setState({userIn: true})
        } else {
          this.setState({userIn: false})
        }
      });

      try {
        let longitude = await AsyncStorage.getItem('@trevia:latitude');
        if (latitude !== null){
          console.log(value)
        } else {
          await AsyncStorage.setItem('@trevia:latitude', 0.0);
          latitude = 0.0;
        }

        var longitude = await AsyncStorage.getItem('@trevia:longitude');
        if (longitude !== null){
          console.log(value);
        } else {
          await AsyncStorage.setItem('@trevia:longitude', 0.0);
          longitude = 0.0;
        }

        this.setState({
          cords: {
            latitude: latitude,
            longitude: longitude
          },
        })
      } catch (error) {
        console.log(error);
      }

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
      this.unsubscribe();
      navigator.geolocation.clearWatch(this.watchID);
      await AsyncStorage.setItem('@trevia:longitude', this.state.cords.longitude.toPrecision(7));
      await AsyncStorage.setItem('@trevia:latitude', this.state.cords.latitude.toPrecision(7));
    };

    listenForItems() {
       this.itemsRef.once('value', (snap) => {
         var items = [];
         snap.forEach((child) => {
           items.push({
             title: child.val().title,
             cords : {
               latitude  :   child.val().coordinates.latitude,
               longitude :   child.val().coordinates.longitude,
             },
             color : child.val().color,
             laji : child.val().laji,
             _key: child.key
           });
         });
         this.setState({
          data: items,
         })
         this._refresh();
        });
     }

    _refresh() {
        this._filter("");
    }

    _sortByDistance (data){
        var _data = data.sort((a,b) => {
            a = this.getDistance(
                                    this.state.cords.latitude,
                                    this.state.cords.longitude,
                                    a.coordinates.latitude,
                                    a.coordinates.longitude
                                );
            b = this.getDistance(
                                    this.state.cords.latitude,
                                    this.state.cords.longitude,
                                    b.coordinates.latitude,
                                    b.coordinates.longitude
                                );
            if (a < b) {
                return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;
        });
        return _data;
    }

    _filter (text){
      this.setState({text});
      if (this.state.text == "") {
        this.setState({
          dataSource  : this.state.dataSource.cloneWithRows(this._sortByDistance(this.state.data))
        });
      } else {
        this.setState({
          dataSource  : this.state.dataSource.cloneWithRows(this._returnValue(text))
        });
      }
    }

    _returnValue(text){
      return this._sortByDistance(this.state.data).filter((data) =>
        data.title.toLowerCase().indexOf(text.toLowerCase()) > -1 || data.laji.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }

    _renderHeader(){
        const { navigate } = this.props.navigation;
        let userIcon = !this.state.userIn ?
                    <TouchableOpacity onPress = {()=> navigate('LogIn')} style = {styles.flex} >
                        <Text style = {styles.textMiddle}><Icon name="sign-in" size={30} color="black" /></Text>
                    </TouchableOpacity>
                :
                    <TouchableOpacity onPress = {()=> navigate('LogIn')} style = {styles.flex} >
                        <Text style = {styles.textMiddle}><Icon name="user" size={30} color="black" /></Text>
                    </TouchableOpacity>;

        let loading = this.state.data.length ?
                    <TouchableOpacity onPress = {() => navigate( 'Map', { cords: this.state.cords, items: this.state.data })} style = {styles.flex}>
                      <Text style = {styles.textMiddle}><Icon name="map" size={30} color="black" /></Text>
                    </TouchableOpacity>
                :
                  <ActivityIndicator style={styles.flex}/>;
    	return (
    		<View style = {styles.container}>
          <View style = {[styles.row, styles.margin]}>
            {userIcon}

            {loading}

            <TouchableOpacity onPress = {() => navigate('Add')} style = {styles.flex} >
              <Text style = {styles.textMiddle}><Icon name="plus" size={30} color="black" /></Text>
            </TouchableOpacity>
          </View>

          <View style = {[styles.row, styles.textInput, styles.roundBorder]}>
    				<TextInput
    			      onChangeText={(text) => this._filter(text)}
    			    	placeholder="Search.."
                value={this.state.text}
                style={styles.flex2}
    			   />

            <TouchableOpacity onPress={() => this._refresh()} style = {{flex: 1, justifyContent: 'center',}}>
              <Text style = {styles.textMiddle}> <Icon name="times" size={15} color="grey" /> </Text>
            </TouchableOpacity>
          </View>
			  </View>
    	);
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <View style={styles.rowStyle}>
              <TouchableOpacity style={styles.row} onPress={() => this.props.navigation.navigate('Marker', { key: rowData._key, cords: this.state.cords })}>
                <Image style={{width: 20, height: 22}} source={this.state[rowData.laji]} />
                <Text>  {rowData.title}, </Text>
                <Text style={{color : rowData.color}}>
                  {this.getDistance(  this.state.cords.latitude,
                                      this.state.cords.longitude,
                                      rowData.coordinates.latitude,
                                      rowData.coordinates.longitude
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
        return (
          <View style={styles.container}>
			       <View 	style={styles.listView}>
			    	     <ListView
                        enableEmptySections={true}
                        dataSource={this.state.dataSource}
                        renderRow={this._renderRow.bind(this)}
                        renderHeader={this._renderHeader.bind(this)}
                  />
			       </View>
          </View>
        );
    }
}
