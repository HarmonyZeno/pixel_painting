const imageInput = document.getElementById('imageInput');
const pixelSizeInput = document.getElementById('pixelSize');
const pixelSizeValue = document.getElementById('pixelSizeValue');
const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('downloadBtn');

const ctx = canvas.getContext('2d');
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');

const state = {
  image: null,
  pixelSize: Number(pixelSizeInput.value),
};

function fitCanvasToImage(image) {
  const maxWidth = 1200;
  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
}

function renderPixelArt() {
  if (!state.image) return;

  const pixelSize = state.pixelSize;
  const sampleWidth = Math.max(1, Math.ceil(canvas.width / pixelSize));
  const sampleHeight = Math.max(1, Math.ceil(canvas.height / pixelSize));

  offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
  offCtx.drawImage(state.image, 0, 0, offscreen.width, offscreen.height);

  const sampledCanvas = document.createElement('canvas');
  sampledCanvas.width = sampleWidth;
  sampledCanvas.height = sampleHeight;
  const sampledCtx = sampledCanvas.getContext('2d');

  sampledCtx.imageSmoothingEnabled = true;
  sampledCtx.drawImage(offscreen, 0, 0, sampleWidth, sampleHeight);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sampledCanvas, 0, 0, sampleWidth, sampleHeight, 0, 0, canvas.width, canvas.height);
}

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files ?? [];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.image = image;
      fitCanvasToImage(image);
      renderPixelArt();
      downloadBtn.disabled = false;
    };
    image.src = fileReader.result;
  };

  fileReader.readAsDataURL(file);
});

pixelSizeInput.addEventListener('input', (event) => {
  const nextValue = Number(event.target.value);
  state.pixelSize = nextValue;
  pixelSizeValue.textContent = String(nextValue);

  if (state.image) {
    renderPixelArt();
  }
});

downloadBtn.addEventListener('click', () => {
  if (!state.image) return;
  const link = document.createElement('a');
  link.download = `pixel-art-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});
