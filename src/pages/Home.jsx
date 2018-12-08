import React, { Component } from 'react';
import Draw from '../components/Draw';
import * as tf from '@tensorflow/tfjs';

const symbols = new Array();
var counter = -1;

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.symbols = [null, null, null, null, null];
    this.clear = this.clear.bind(this);
    this.tempImg = this.tempImg.bind(this);
    this.add = this.add.bind(this);
    this.predict = this.predict.bind(this);
    this.generate = this.generate.bind(this);
    this.new = this.new.bind(this);
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
  
  new() {
    const canvas = this.refs.painting;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  tempImg(imageData) {
    this.setState({
      img: imageData,
      clear: false
    });
  }
  
  add(imageData){
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');
    
    if (counter === 0) {
      this.symbols[4] = this.symbols[3];
      this.symbols[3] = this.symbols[2];
      this.symbols[2] = this.symbols[1];
      this.symbols[1] = this.symbols[0];
    } else {
      counter++;
    }
    
    ctx.putImageData(this.state.img, 0, 0);
    this.symbols[counter] = canvas.toDataURL();

    this.setState({
      symbols
    });
    
    if(typeof this.props.onAdd === 'function'){
      this.props.onAdd();
    }
  }
  
  async predict(imageData) {
    console.log(imageData);
    if(!this.model){
      console.log(this.state.img);
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
      tensor = tensor.reshape([1, 50, 50, 1]);
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

  generate() {
    const canvas = this.refs.painting;
    const ctx = canvas.getContext('2d');
    
    // ctx.drawImage(this.symbols[0], 0, 0);
    
    var img = new Image;
    
    for (var i = -1; i < 20; i ++) {
      console.log("looping outer");
      for (var j = -1; j < 12; j++) {
        console.log("looping inner");
        //img.onload = function(){
          console.log("creatingimage");
          ctx.drawImage(img,i*25,j*25);
        //};
        img.src = this.symbols[0];
      }
    }
  }
  
  render() {
    const style = {
      cursor: 'arrow',
      border: '1px black solid',
    };
    
    return (
      <React.Fragment>
        <h5>{this.props.title || 'Start by drawing a symbol in the box:'}</h5>
        <div>
          <Draw
            brushColor={'grey'}
            clear={this.state.clear}
            height={200}
            width={200}
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
        
        <h5>You can store up to five symbols!</h5>
        
        <h1>List: </h1>
          <div>
            <p> Adding: </p>
            ^<canvas ref="canvas" width={50} height={50} />^
          </div>
        <h5>First:</h5>
          <div>
            <img src={this.symbols[0]} />
          </div>
        <h5>Second:</h5>
          <div>
            <img src={this.symbols[1]} />
          </div>
        <h5>Third:</h5>
          <div>
            <img src={this.symbols[2]} />
          </div>
        <h5>Fourth:</h5>
          <div>
            <img src={this.symbols[3]} />
          </div>
        <h5>Fifth:</h5>
          <div>
            <img src={this.symbols[4]} />
          </div>
        
        <button onClick={this.generate}>
            {this.props.buttonText || 'Generate'}
        </button>
        <button onClick={this.new}>
            {this.props.buttonText || 'Clear'}
        </button>
          
        <h5>Generate a painting using the stored symbols:</h5>
          
        <canvas ref="painting"
          width={500}
          height={300}
          style={style}
        />
        
      </React.Fragment>
    );
  }
}
