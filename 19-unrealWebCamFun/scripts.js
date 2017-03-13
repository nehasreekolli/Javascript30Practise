const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d'); //ctx is canvas context
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo(){
   navigator.mediaDevices.getUserMedia({ video: true, audio: false }) //The MediaDevices.getUserMedia() method prompts
   //the user for permission to use one video and/or one audio input device such as a camera or screensharing and/or
   //a microphone. If the user provides permission, then the returned Promise is resolved with the resulting MediaStream
  // object. If the user denies permission, or media is not available, then the promise is rejected with PermissionDeniedError
   //or NotFoundError respectively.
  .then(localMediaStream => {
    console.log(localMediaStream); // this gives id, active:true and lot of data
    video.src = window.URL.createObjectURL(localMediaStream); // convert media stream to something that video frame understand
    // above line doestn't play video it only gives a frame with out using .play()
    video.play(); //  video plays
  })
  .catch(err => {
    console.error('OH No!!!!', err); // this catches error if there is any error like if user doesn't give access to web cam
  });
}

// Next we are taking video and painting to canvas (actuval page we are seeing)
function paintToCanvas(){
  const width = video.videoWidth; // video width
  const height = video.videoHeight; //video height
  // console.log(width,height);
  canvas.width = width; // setting width and height of canvas to videos width and height
  canvas.height = height;
 // here we are setting video interval to load every 16 milli seconds
   return setInterval(() => { // we used return beacuse if ever we want to stop interval we can call clear setInterval
    ctx.drawImage(video, 0, 0, width, height); //we drawing images by taking video starting at 0,0 top left corner up to width and height of video
    //take pixels out
    let pixels = ctx.getImageData(0,0, width,height); // getting pixels of our image (large data)
    //mess with them
    // console.log(pixels); // when we open the data it have like 1,2,3,4,5,6,7,8,9.10,11 ..... i.e it represents as 1-red,2-green,3-blue,4-alpha... 5-red,6-green,7-blue,8-alpha....

    // pixels = redEffect(pixels); // commenting to see other effects

    pixels = rgbaEffect(pixels);
    // ctx.globalAlpha = 0.1; // alpha is transperency(gives some gostly effect) (stacking stacking and follows u arround)
    //put them back

    // pixels = greenScreen(pixels);

    ctx.putImageData(pixels, 0, 0);
  }, 16); // interval 16 milli seconds
}

function takePhoto(){ // this function takes photo
  //played the sound
  snap.currentTime = 0;
  snap.play();

  //take the data out of canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;  // when we take a photo and open it in seperate page then u will find photo is not stored in local computer it is open with data in url with image
  link.setAttribute('download', 'beautiful'); // beutiful is name of snapshopt we are going to take
  link.textContent = 'Download Image'; // when we downloaded the image it is saved as beautiful .It is now downloaded in local computer
  link.innerHTML = `<img src="${data}" alt="Beautiful photo" />`;
  strip.insertBefore(link, strip.firstChild);
  // console.log(data); // this gives data attributes about photo in text form
}
// now we will work with filters which are related to pixels. i.e, we take pixels out of photo

function redEffect(pixels){ // we are giving different color effects we are giving
  for(let i= 0; i<pixels.data.length; i+= 4){
    pixels.data[i + 0] = pixels.data[i + 0] + 100; //red  // we are +100 it gives red efefct if it is -100 it gives green color image effect (we can play with different values for r,g,b)
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
}

function rgbaEffect(pixels){ // we are giving different color effects we are giving
  for(let i= 0; i<pixels.data.length; i+= 4){
    pixels.data[i - 150] = pixels.data[i + 0];  //red  // here we are taking r,g,b 's and giving different pixes by pulling sides so that we can see effects clearly in image
    pixels.data[i + 500] = pixels.data[i + 1];  //green// we can change -150, +100 values to any values
    pixels.data[i - 150] = pixels.data[i + 2];  //blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {}; // levels holds all min and max values of greens

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });
  // console.log(levels); // gives all min and max values

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}


getVideo();


video.addEventListener('canplay', paintToCanvas); // once video starts i.e can play is lisened then paintToCanvas() is triggered
