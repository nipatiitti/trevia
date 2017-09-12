import React, { Component } from 'react';
import {
  Animated,
  View,
  Dimensios
} from 'react-native';

class FadeInView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),          
  }
  componentDidMount() {
    Animated.timing(                            
      this.state.fadeAnim,                      
      {
        toValue: Dimensios.get('window').width*(2/3),
      }
    ).start();                                  
  }
  render() {
    return (
      <Animated.View                            
        style={{
          ...this.props.style,
          width: this.state.fadeAnim,
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

module.exports = FadeInView;