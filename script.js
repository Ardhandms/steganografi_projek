
function toggleForms(action) {
  var form1 = document.getElementById("form1");
  var form2 = document.getElementById("form2");

  if (action === "decode") {
    form1.style.display = "block";
    form2.style.display = "none";
  } else if (action === "encode") {
    form1.style.display = "none";
    form2.style.display = "block";
  }
}



//function stepanoghrapy
document.getElementById('encodeButton').addEventListener('click', function() {
  const fileInput = document.getElementById('fileInputEncode');
  const messageInput = document.getElementById('messageInput').value;

  if (!fileInput.files || !fileInput.files[0]) {
      alert('Please select an image file.');
      return;
  }

  if (!messageInput) {
      alert('Please enter a secret message.');
      return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const modifiedImageData = hideMessageInImage(imageData, messageInput);
          ctx.putImageData(modifiedImageData, 0, 0);

          const downloadLink = document.getElementById('downloadLink');
          downloadLink.href = canvas.toDataURL();
          downloadLink.download = 'encoded_image.png';
          downloadLink.style.display = 'block';
      }
  }

  reader.readAsDataURL(file);
});

document.getElementById('decodeButton').addEventListener('click', function() {
  const fileInput = document.getElementById('fileInputDecode');
  if (!fileInput.files || !fileInput.files[0]) {
      alert('Please select an image file.');
      return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          let extractedText = '';

          for (let i = 0; i < pixels.length; i += 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              extractedText += (r & 1);
              extractedText += (g & 1);
              extractedText += (b & 1);
          }

          extractedText = extractedText.match(/.{1,8}/g).map(byte => {
              const charCode = parseInt(byte, 2);
              return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '';
          }).join('');

          document.getElementById('output').innerText = extractedText;
      }
  }

  reader.readAsDataURL(file);
});

document.getElementById('resetButtonEncode').addEventListener('click', function() {
  document.getElementById('fileInputEncode').value = '';
  document.getElementById('messageInput').value = '';
  document.getElementById('downloadLink').style.display = 'none';
});

document.getElementById('resetButtonDecode').addEventListener('click', function() {
  document.getElementById('fileInputDecode').value = '';
  document.getElementById('output').innerText = '';
});


function hideMessageInImage(imageData, message) {
const pixels = imageData.data;
let messageBits = '';

// Convert message to binary
for (let i = 0; i < message.length; i++) {
const charCode = message.charCodeAt(i);
if (charCode >= 32 && charCode <= 126) { // Hanya karakter ASCII yang valid
  const binaryChar = charCode.toString(2).padStart(8, '0');
  messageBits += binaryChar;
}
}

let messageIndex = 0;
for (let i = 0; i < pixels.length; i += 4) {
for (let j = 0; j < 3; j++) { // Loop through RGB
  if (messageIndex < messageBits.length) {
      const pixelBit = pixels[i + j] & 1; // Get LSB of color value
      const messageBit = parseInt(messageBits[messageIndex]);

      // Modify LSB of color value to match message bit
      pixels[i + j] = (pixels[i + j] & ~1) | messageBit;
      messageIndex++;
  } else {
      // Set remaining LSBs to their original values
      pixels[i + j] = pixels[i + j] & ~1;
  }
}
}

return imageData;
}