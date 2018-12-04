import React, { Component } from 'react';
import { Lead } from 'bootstrap-4-react';
import { BSpan } from 'bootstrap-4-react';
import Draw from '../components/Draw'
import * as tf from '@tensorflow/tfjs'
const DRAW_TITLE = 'Start by drawing a symbol in the box:';

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.clear = this.clear.bind(this);
    this.loadModel();
  }

  async loadModel(){
    this.model = await tf.loadModel('./assets/model.json');
  }

  async predict(imageData) {
    if(!this.model){
        return;
    }

    await tf.tidy(() => {
      let maxProb = 0;
      let number;
      let img = tf.fromPixels(imageData, 1);
      img = img.reshape([1, 28, 28, 1]);
      img = tf.cast(img, 'float32');
    
      const output = this.model.predict(img);
      const predictions = Array.from(output.dataSync());
        
      predictions.forEach((prob, num) => {
        if(prob > maxProb){
            maxProb = prob;
            number = num;
        }
      });
      this.setState({ number, predictions, clear: false });

      if(typeof this.props.onPredict === 'function'){
        this.props.onPredict(number, predictions);
      }
    });
  }

  clear(){
    this.setState({
      clear: true,
    });

    if(typeof this.props.onClear === 'function'){
      this.props.onClear();
    }
  }
  
  render() {

    return (
      <React.Fragment>
        <h5>{this.props.title || DRAW_TITLE}</h5>
        <div>
          <Draw 
            brushColor={'grey'}
            add={this.state.save}
            clear={this.state.clear}
            height={this.props.height}
            width={this.props.width}
            lineWidth={25}
          />
        </div>
        
        <h5>You can store up to five symbols:</h5>
        <button onClick={this.add}>
            {this.props.buttonText || 'Store'}
        </button>
        <button onClick={this.clear}>
            {this.props.buttonText || 'Clear'}
        </button>
          
          
      </React.Fragment>
    )
  }
}
