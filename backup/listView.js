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
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import firebaseApp from './firebase.js';

export default class DynamicList extends Component {

    constructor(props) {
        super(props);
        const userData = firebaseApp.auth().currentUser;

        this.state = {
            dataSource  : new ListView.DataSource({
                rowHasChanged : (row1, row2) => true
            }),
            user: userData,
            text: "",
            hiking: require('../images/hiking.png'),
            jogging: require('../images/jogging.png'),
            biking: require('../images/biking.png'),
            climbing: require('../images/climbing.png'),
            paddling: require('../images/paddling.png'),
            ski: require('../images/ski.png'),
            data: []
        }
    }

    componentDidMount() {
        this._refresh();
    }

    _refresh() {
        this.setState({
            dataSource  : this.state.dataSource.cloneWithRows(this._sortByDistance()),
            text: ""
        });
    }

    componentWillReceiveProps(nextProps) {
        if(JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data))
        {
               this.setState(
                 data
               )
        }
    }

    _sortByDistance (){
        var _data = this.props.data.sort((a,b) => {
            a = this.getDistance(
                                    this.props.lat,
                                    this.props.lon,
                                    a.coordinates.latitude,
                                    a.coordinates.longitude
                                );
            b = this.getDistance(
                                    this.props.lat,
                                    this.props.lon,
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

    _renderHeader(){
        const { navigate } = this.props.navigation;
        const userIcon = this.state.user ?
                    <TouchableOpacity onPress = {()=> navigate('LogIn')} style = {styles.icon} >
                        <Text style = {styles.text}><Icon name="sign-in" size={30} color="black" /></Text>
                    </TouchableOpacity>
                :
                    <TouchableOpacity onPress = {()=> navigate('LogIn')} style = {styles.icon} >
                        <Text style = {styles.text}><Icon name="user" size={30} color="black" /></Text>
                    </TouchableOpacity>


    	return(
    		<View style = {styles.container} >
                <View style = {styles.container, {flexDirection: 'row-reverse'}}>
                    {userIcon}
                    <TouchableOpacity onPress = {()=> navigate('Add')} style = {styles.icon} >
                        <Text style = {styles.text}><Icon name="plus" size={30} color="black" /></Text>
                    </TouchableOpacity>
                </View>
                <View style = {styles.container, {flexDirection: 'row'}}>
    				<TextInput
    			        onChangeText={(text) => this._filter(text)}
    			    	placeholder="Search.."
                        value={this.state.text}
                        style = {{flex: 3}}
    			    />
                    <TouchableOpacity onPress={this._refresh.bind(this)}
                        style = {{flex: 1, justifyContent: 'center',}}
                    >
                        <Text style = {{textAlign: 'center'}}>
                            <Icon name="refresh" size={15} color="grey" />
                        </Text>
                    </TouchableOpacity>
                </View>
			</View>
    	);
    }

    _filter (text){
        this.setState({text: text});
    	if (text == "") {
    		this.setState({
	            dataSource  : this.state.dataSource.cloneWithRows(this._sortByDistance())
	        });
    	} else {
    		this.setState({
	            dataSource  : this.state.dataSource.cloneWithRows(this._returnValue(text))
	        });
    	}
    }

    _returnValue(text){
    	return this._sortByDistance().filter((data) =>
	    	data.title.toLowerCase().indexOf(text.toLowerCase()) > -1 || data.laji.toLowerCase().indexOf(text.toLowerCase()) > -1
	    )
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <View style={styles.rowStyle}>
                <TouchableOpacity
                            style={styles.container, {flexDirection: 'row', backgroundColor: "white"}}
                            onPress={ () => {
                                this.props.call(
                                            rowData.coordinates.latitude,
                                            rowData.coordinates.longitude)}}
                >
                    <Image style={{width: 20, height: 22}} source={this.state[rowData.laji]} />
                    <Text>  {rowData.title}, </Text>
                    <Text style={{color : rowData.color}}>
                        {this.getDistance(  this.props.lat,
                                            this.props.lon,
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
}

const styles = StyleSheet.create({
    container : {
        flex            : 1,
        flexDirection 	: 'column'
    },
    flex: {
        flex: 1,
    },
    icon: {
        flex: 1,
        justifyContent: 'center'
    },
    text: {
        textAlign: 'center',
        padding: 5
    },
    noData    : {
        color     : '#000',
        fontSize  : 18,
        alignSelf : 'center',
        top       : 200
    },

    rowStyle : {
        backgroundColor   : '#FFF',
        paddingVertical   : 15,
        paddingHorizontal : 10,
        borderBottomColor : '#ccc',
        borderBottomWidth : 1,
        flexDirection     : 'row',
        flex              : 1,
        alignItems        : 'center'
    },
});
