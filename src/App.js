import React, {Component} from 'react';
import Particles from 'react-particles-js';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';



// for particles effect
const particlesOptions = {
  "particles": {
 	       "number": {
 	            "value": 50,
              density:{
                enable: true,
                value_area: 800
              }
 	        }

 	    },
 	    "interactivity": {
 	        "events": {
 	            "onhover": {
 	                "enable": true,
 	                "mode": "repulse"
 	            }
 	        }
 	    }
}

const initialState = {
  input:'',
  imageUrl:'',
  box:{},
  route: 'signin',
  isSignedIn:false,
  user:{
    id:'',
    name:'',
    email:'',
    entries:0,
    joined: '',
  }
}


class App extends Component{
  constructor(){
    super();
    this.state = initialState
  }

  loadUser = (data) =>{
    this.setState({
      user:{
        id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined,
      }
    })
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    const width = Number(image.width);
    const height = Number(image.height)
    // console.log(width,height)
    return {
      leftCol : clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }
  displayFaceBox = (box) =>{
    // console.log(box)
    this.setState({box:box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input})
    fetch('https://damp-lake-46246.herokuapp.com/imageurl',{
      method:'post',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        input:this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
      if (response){
        fetch('https://damp-lake-46246.herokuapp.com/image',{
          method:'put',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            id:this.state.user.id
          })
          // we are just sending the id in this put method
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count})) // this is done to just specificly update the entries count .
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err))
  }
// routes - signin, signout,register and home
  onRouteChange =(route) =>{
    if (route ==='signout'){
      this.setState(initialState)
    } else if (route === 'home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route:route});
  }
  render(){
    const {isSignedIn,imageUrl,route,box} = this.state
  return (
    <div className="App">
      <Particles className="particles" params={particlesOptions} />
      <Navigation isSignedIn={isSignedIn}onRouteChange={this.onRouteChange}/>
      {route ==='home'
      ?<div>
          <Logo/>
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange}
            onButtonSubmit = {this.onButtonSubmit}/>
          <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
      :(
        route ==="signin" // if route=signin show signin, else, means route is register, hence show register.
        ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )
    }
    </div>
  );
  }
}
export default App;
