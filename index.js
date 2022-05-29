const openEls = document.querySelectorAll("[data-open]");
const isVisible = "is-visible";

for (const el of openEls) {
  el.addEventListener("click", function () {
    const modalId = this.dataset.open;
    document.getElementById(modalId).classList.add(isVisible);
  });
}



const closeEls = document.querySelectorAll("[data-close]");
// const isVisible = "is-visible";

for (const el of closeEls) {
  el.addEventListener("click", function () {
    this.parentElement.parentElement.parentElement.classList.remove(isVisible);
  });
}


document.addEventListener("keyup", e => {
  if (e.key == "Escape" && document.querySelector(".modal.is-visible")) {
    document.querySelector(".modal.is-visible").classList.remove(isVisible);
  }
});

document.getElementById("open_camera").addEventListener("click", () => {
  Webcam.set({
    width: 550,
    height: 450,
    image_format: 'jpeg', jpeg_quality: 90
  })
  Webcam.attach("#camera")
})


document.getElementById("close_camera").addEventListener("click", () => {
  Webcam.reset()
  document.getElementById("camera").style.height = 0;
  document.getElementById("camera").style.width = 0;
})

let imageAnk = ""
function take_snapshot() {
  Webcam.snap(function (data_uri) {
    imageAnk = data_uri
    document.getElementById('results').innerHTML = '<img src="' + data_uri + '"/>';
  });
}

/*  
  Functuin doe base 64 to file[0]
  @params base64
*/
function dataURLtoFile(dataurl) {

  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], "ïmage.jpg", { type: mime });
}
var file
document.getElementById("submit").addEventListener("click", () => {
  if (imageAnk != null) {
    //console.log(imageAnk);
    document.getElementById('results').innerHTML ="";
    file = dataURLtoFile(imageAnk);
    //console.log(file);
  } else {
    alert("All fiedls are required")
  }
})

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.body.append('Loaded')



  document.getElementById("submit").addEventListener("click", async () => {

    if (image) image.remove()
    image = await faceapi.bufferToImage(file)
    canvas = faceapi.createCanvasFromMedia(image)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      if (result.label != "unknown") {
        console.log(result.label, "is present")
        let url = "http://127.0.0.1:5000/log?present="+result.label
        fetch(url).then(function () {
          console.log(result.label + " is logged present")
        });
        alert(result.label + " is marked present")
      }

      else {

        alert("Sorry, can't recognise face")

      }

    })
  })
}

function loadLabeledImages() {
  const labels = ['Ayush Garg(01)', 'Salman Khan(02)', 'Akshay Kumar(03)', 'Aamir Khan(04)', 'Narendra Modi(05)', 'Amit Shah(06)']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 0; i <= 1; i++) {
        const img = await faceapi.fetchImage(`Images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }



      return new faceapi.LabeledFaceDescriptors(label, descriptions)


    })
  )
}

