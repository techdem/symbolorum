import React, { Component } from 'react';
import Amplify, {Storage} from 'aws-amplify';
import Draw from '../components/Draw';
import * as tf from '@tensorflow/tfjs';

import aws_exports from '../aws-exports.js';
Amplify.configure(aws_exports);

Storage.configure({ level: 'public' });

const symbols = new Array();
const size = new Array();

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.symbols = [null, null, null, null, null];
    this.size = [null, null, null, null, null];
    this.clear = this.clear.bind(this);
    this.tempImg = this.tempImg.bind(this);
    this.add = this.add.bind(this);
    this.predict = this.predict.bind(this);
    this.generate = this.generate.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.save = this.save.bind(this);
    this.loadModel();
  }
  
  async loadModel(){
    this.model = await tf.loadModel('https://s3-eu-west-1.amazonaws.com/symbolorum/static/Keras/model.json');
  }

  clear(){
    this.setState({
      clear: true
    });

    if(typeof this.props.onClear === 'function'){
      this.props.onClear();
    }
  }
  
  uploadImage() {
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
  
  async add(){
    await this.predict();
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');
    
    this.symbols[4] = this.symbols[3];
    this.symbols[3] = this.symbols[2];
    this.symbols[2] = this.symbols[1];
    this.symbols[1] = this.symbols[0];
    this.size[4] = this.size[3];
    this.size[3] = this.size[2];
    this.size[2] = this.size[1];
    this.size[1] = this.size[0];
    
    ctx.putImageData(this.state.img, 0, 0);
    this.symbols[0] = canvas.toDataURL();
    this.size[0] = this.state.number+1;

    this.setState({
      symbols, size
    });
    
    if(typeof this.props.onAdd === 'function'){
      this.props.onAdd();
    }
  }
  
  async predict() {
    if(!this.model){
      this.setState({
        number: "check model",
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
      this.setState({ number, predictions, clear: false });

      if(typeof this.props.onPredict === 'function'){
        this.props.onPredict(number, predictions);
      }
    });
  }

  generate() {
    const canvas = this.refs.painting;
    const ctx = canvas.getContext('2d');
    
    var img = new Image();
    for (var i = -1; i < 21; i ++) {
      for (var j = 0; j < 12; j++) {
        let randomise = Math.floor(Math.random()*5);
        img.src = this.symbols[randomise];
        ctx.drawImage(img,i*25,j*25, this.size[randomise]*5, this.size[randomise]*5);
      }
    }
  }
  
  save() {
    const canvas = this.refs.painting;
    
    var saveImage = canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, "");
    var buffer = new Buffer(saveImage, 'base64');
    var fileName = (Date.now()).toString() + '.png';
    
    Storage.put(fileName, buffer, 'Private Content', {
      level: 'private'
    });
  }
  
  render() {
    const { user } = this.props;
    const style = {
      cursor: 'arrow',
      border: '1px black solid',
    };
    
    return (
      <React.Fragment>
        <h5>{'Start by drawing a symbol in the box:'}</h5>
        <div>
          <Draw
            brushColor={'grey'}
            clear={this.state.clear}
            height={200}
            width={200}
            lineWidth={15}
            onGetImage={this.tempImg}
          />
        </div>
        
        <button onClick={this.add}> {'Add'} </button>
        <button onClick={this.clear}> {'Clear'} </button>
        <h5>{this.state.number}</h5>
        <h5>You can store up to five symbols!</h5>
        <div>
          <p> Adding: </p>
          >_ <canvas ref="canvas" width={50} height={50} />
        </div>
          
        <h1>List: </h1>
        
        <div>
        <h5>I : <img src={this.symbols[0]} /></h5>
        <h5>II : <img src={this.symbols[1]} /></h5>
        <h5>III : <img src={this.symbols[2]} /></h5>
        <h5>IV : <img src={this.symbols[3]} /></h5>
        <h5>V : <img src={this.symbols[4]} /></h5>
        </div>
        
        <button onClick={this.generate}> {'Generate'} </button>
        <button onClick={this.uploadImage}> {'Clear'} </button>

        <h5>Generate a painting using the stored symbols:</h5>
          
        <canvas ref="painting"
          width={500}
          height={300}
          style={style}
        />

        <h5>You can save the paintings you like for everyone to see!</h5>
        {!user && <h6>Please Login!</h6> }
        {user && <button onClick={this.save}> {'Save to Album'} </button> }
      </React.Fragment>
    );
  }
}
