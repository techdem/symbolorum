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
    this.model = await tf.loadModel('https://github.com/techdem/symbolorum/blob/master/src/assets/Keras.json');
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
    
    if (counter > 3) {
      this.symbols[0] = this.symbols[1];
      this.symbols[1] = this.symbols[2];
      this.symbols[2] = this.symbols[3];
      this.symbols[3] = this.symbols[4];
      counter = 4;
      number++;
    }
    else {
      counter++;
      number++;
    }
    
    this.symbols[counter] = number;
    
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
        number: "model not loaded",
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
            onGetImage={this.tempImg}
          />
        </div>
        
        <button onClick={this.add}>
            {this.props.buttonText || 'Add'}
        </button>
        <button onClick={this.clear}>
            {this.props.buttonText || 'Clear'}
        </button>
        
        <h5>You can store up to five symbols:</h5>
        
        <h1>{this.symbols.length}</h1>
        <h1>{this.symbols[0]}{this.symbols[1]}{this.symbols[2]}{this.symbols[3]}{this.symbols[4]}</h1>
      </React.Fragment>
    )
  }
}
