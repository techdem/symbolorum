import React, { Component } from 'react';
import Amplify, {Storage} from 'aws-amplify';
import { S3Album } from 'aws-amplify-react';
import Draw from '../components/Draw';
import * as tf from '@tensorflow/tfjs';

import aws_exports from '../aws-exports.js';
Amplify.configure(aws_exports);

Storage.configure({ level: 'private' });

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
    this.uploadImage = this.uploadImage.bind(this);
    this.save = this.save.bind(this);
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
    
    for (var i = -1; i < 21; i ++) {
      console.log("looping outer");
      for (var j = -1; j < 12; j++) {
        //img.onload = function(){
          ctx.drawImage(img,i*25,j*25);
        //};
        img.src = this.symbols[Math.floor(Math.random()*4)];
      }
    }
  }
  
  save() {
    const canvas = this.refs.painting;
    
    var saveImage = canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, "");
    //var ext = buffer.split(';')[0].match(/jpeg|png|gif/)[0];
    //var data = buffer.replace(/^data:image\/\w+;base64,/, "");
    var buffer = new Buffer(saveImage, 'base64');
    var fileName = (Date.now()).toString() + '.png';

    Storage.put(fileName, buffer).then(() => {
      this.setState({ file: fileName });
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
            lineWidth={5}
            onGetImage={this.tempImg}
          />
        </div>
        
        <button onClick={this.add}> {'Add'} </button>
        <button onClick={this.clear}> {'Clear'} </button>
        
        <h5>You can store up to five symbols!</h5>
        <div>
            <p> Adding: </p>
            ^<canvas ref="canvas" width={50} height={50} />^
          </div>
        <h1>List: </h1>
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
        
        <button onClick={this.generate}> {'Generate'} </button>
        <button onClick={this.uploadImage}> {'Clear'} </button>
          
        <h5>Generate a painting using the stored symbols:</h5>
          
        <canvas ref="painting"
          width={500}
          height={300}
          style={style}
        />

        <h5>You can save the paintings you like to a personal album!</h5>
        {!user && <h6>Please Login!</h6> }
        {user && <button onClick={this.save}> {'Save to Album'} </button> }
      </React.Fragment>
    );
  }
}
