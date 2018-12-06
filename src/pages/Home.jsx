import React, { Component } from 'react';
import Draw from '../components/Draw';
import * as tf from '@tensorflow/tfjs';

const DRAW_TITLE = 'Start by drawing a symbol in the box:';
const symbols = new Array();

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.clear = this.clear.bind(this);
    this.tempImg = this.tempImg.bind(this);
    this.add = this.add.bind(this);
    this.predict = this.predict.bind(this);
    this.loadModel();
    
  }

  async loadModel(){
    this.model = await tf.loadModel('https://s3-eu-west-1.amazonaws.com/symbolorum/static/Keras/model.json');
  }

  clear(){
    this.setState({
      number: false,
      clear: true
    });

    if(typeof this.props.onClear === 'function'){
      this.props.onClear();
    }
  }
  
  tempImg(imageData) {
    this.setState({
      img: imageData,
      clear: false
    })
  }
  
  add(){
    
    symbols.push(this.img);
    
    this.setState({ symbols, clear: false });

    if(typeof this.props.onAdd === 'function'){
      this.props.onAdd(symbols);
    }
  }
  
  async predict() {
    if(!this.model){
      this.setState({
        number: "model not loaded",
        clear: false
      });
      return;
    }

    await tf.tidy(() => {
      let maxProb = 0;
      let number;
      let img = tf.fromPixels(this.state.img, 1);
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
      
      this.setState({ number, clear: false });

      if(typeof this.props.onPredict === 'function'){
        this.props.onPredict(number);
      }
    });
  }

  render() {

    return (
      <React.Fragment>
        <h5>{this.props.title || DRAW_TITLE}</h5>
        <div>
          <Draw 
            brushColor={'grey'}
            clear={this.state.clear}
            height={this.props.height}
            width={this.props.width}
            lineWidth={5}
            onGetImage={this.tempImg}
          />
        </div>
        
        <h5>You can store up to five symbols:</h5>
        <button onClick={this.predict}>
            {this.props.buttonText || 'Add'}
        </button>
        <button onClick={this.clear}>
            {this.props.buttonText || 'Clear'}
        </button>
        <h1>{this.state.number}</h1>
      </React.Fragment>
    )
  }
}
