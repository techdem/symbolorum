import React, { Component } from 'react';
import Draw from '../components/Draw';
import * as tf from '@tensorflow/tfjs';

const DRAW_TITLE = 'Start by drawing a symbol in the box:';
const symbols = new Array();
var counter = -1;
let number = 0;

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.symbols = [null, null, null, null, null];
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
    
    if (counter == 0) {
      this.symbols[4] = this.symbols[3];
      this.symbols[3] = this.symbols[2];
      this.symbols[2] = this.symbols[1];
      this.symbols[1] = this.symbols[0];
    } else {
      counter++;
    }
    
    this.predict();
    
    this.symbols[counter] = number++;;
    
    this.setState({
      symbols
    })
    
    if(typeof this.props.onAdd === 'function'){
      this.props.onAdd();
    }
  }
  
  async predict() {
    if(!this.model){
      this.setState({
        number: 99,
        clear: false
      });
      return;
    }
    
    await tf.tidy(() => {
      let maxProb = 0;
      let number;
      let tensor = tf.fromPixels(this.state.img, 1);
      tensor = tensor.reshape([1, 28, 28, 1]);
      tensor = tf.cast(tensor, 'float32');
    
      const output = this.model.predict(tensor);
      const predictions = Array.from(output.dataSync());
        
      predictions.forEach((prob, num) => {
        if(prob > maxProb){
          maxProb = prob;
          number = num;
        }
      });
      
      this.setState({ number, tensor, clear: false });

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
            onGetImage={this.tempImg,this.predict}
          />
        </div>
        
        <button onClick={this.add}>
            {this.props.buttonText || 'Add'}
        </button>
        <button onClick={this.clear}>
            {this.props.buttonText || 'Clear'}
        </button>
        
        <h5>You can store up to five symbols!</h5>
        
        <h1>List:</h1>
        <h4>First:</h4><div>{this.symbols[0]}</div>
        <h4>Second:</h4><div>{this.symbols[1]}</div>
        <h4>Third:</h4><div>{this.symbols[2]}</div>
        <h4>Fourth:</h4><div>{this.symbols[3]}</div>
        <h4>Fifth:</h4><div>{this.symbols[4]}</div>
      </React.Fragment>
    )
  }
}
