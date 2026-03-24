const imageInput = document.getElementById('imageInput');
const pixelSizeInput = document.getElementById('pixelSize');
const pixelSizeValue = document.getElementById('pixelSizeValue');
const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('downloadBtn');
const usedPaletteContainer = document.getElementById('usedPalette');
const allPaletteContainer = document.getElementById('allPalette');
const selectedColorPreview = document.getElementById('selectedColorPreview');
const usedCodeList = document.getElementById('usedCodeList');

const ctx = canvas.getContext('2d');
const sampledCanvas = document.createElement('canvas');
const sampledCtx = sampledCanvas.getContext('2d', { willReadFrequently: true });

function hexToRgb(hex) {
  const parsed = hex.replace('#', '');
  return {
    r: Number.parseInt(parsed.slice(0, 2), 16),
    g: Number.parseInt(parsed.slice(2, 4), 16),
    b: Number.parseInt(parsed.slice(4, 6), 16),
  };
}

const MARD_SERIES_HEX = {
  A: ['#FAF4C8', '#FFFFD5', '#FEFF8B', '#FBED56', '#F4D738', '#FEAC4C', '#FE8B4C', '#FFDA45', '#FF995B', '#F77C31', '#FFDD99', '#FE9F72', '#FFC365', '#FD543D', '#FFF365', '#FFFF9F', '#FFE36E', '#FEBE7D', '#FD7C72', '#FFD568', '#FFE395', '#F4F57D', '#E6C9B7', '#F7F8A2', '#FFD67D', '#FFC830'],
  B: ['#E6EE31', '#63F347', '#9EF780', '#5DE035', '#35E352', '#65E2A6', '#3DAF80', '#1C9C4F', '#27523A', '#95D3C2', '#5D722A', '#166F41', '#CAEB7B', '#ADE946', '#2E5132', '#C5ED9C', '#9BB13A', '#E6EE49', '#24B88C', '#C2F0CC', '#156A6B', '#0B3C43', '#303A21', '#EEFCA5', '#4E846D', '#8D7A35', '#CCE1AF', '#9EE5B9', '#C5E254', '#E2FCB1', '#B0E792', '#9CAB5A'],
  C: ['#E8FFE7', '#A9F9FC', '#A0E2FB', '#41CCFF', '#01ACEB', '#50AAF0', '#3677D2', '#0F54C0', '#324BCA', '#3EBCE2', '#28DDDE', '#1C334D', '#CDE8FF', '#D5FDFF', '#22C4C6', '#1557A8', '#04D1F6', '#1D3344', '#1887A2', '#176DAF', '#BEDDFF', '#67B4BE', '#C8E2FF', '#7CC4FF', '#A9E5E5', '#3CAED8', '#D3DFFA', '#BBCFED', '#34488E'],
  D: ['#AEB4F2', '#858EDD', '#2F54AF', '#182A84', '#B843C5', '#AC7BDE', '#8854B3', '#E2D3FF', '#D5B9F8', '#361851', '#B9BAE1', '#DE9AD4', '#B90095', '#8B279B', '#2F1F90', '#E3E1EE', '#C4D4F6', '#A45EC7', '#D8C3D7', '#9C32B2', '#9A009B', '#333A95', '#EBDAFC', '#7786E5', '#494FC7', '#DFC2F8'],
  E: ['#FDD3CC', '#FEC0DF', '#FFB7E7', '#E8649E', '#F551A2', '#F13D74', '#C63478', '#FFDBE9', '#E970CC', '#D33793', '#FCDDD2', '#F78FC3', '#B5006D', '#FFD1BA', '#F8C7C9', '#FFF3EB', '#FFE2EA', '#FFC7DB', '#FEBAD5', '#D8C7D1', '#BD9DA1', '#B785A1', '#937A8D', '#E1BCE8'],
  F: ['#FD957B', '#FC3D46', '#F74941', '#FC283C', '#E7002F', '#943630', '#971937', '#BC0028', '#D5524E', '#8A4526', '#5A2121', '#FD4E6A', '#F35744', '#FFA9AD', '#D30022', '#FEC2A6', '#E69C79', '#D37C46', '#C1444A', '#CD9391', '#F7B4C6', '#FDC0D0', '#F67E66', '#E698AA', '#E54B4F'],
  G: ['#FFE2CE', '#FFC4AA', '#F4C3A5', '#E1B383', '#EDB045', '#E99C17', '#9D5B3E', '#753832', '#E6B483', '#D98C39', '#E0C593', '#FFC890', '#B7714A', '#8D614C', '#FCF9E0', '#F2D9BA', '#78524B', '#FFE4CC', '#E07935', '#A94023', '#B88558'],
  H: ['#FDFBFF', '#FEFFFF', '#B6B1BA', '#89858C', '#48464E', '#2F2B2F', '#000000', '#E7D6DB', '#EDEDED', '#EEE9EA', '#CECDD5', '#FFF5ED', '#F5ECD2', '#CFD7D3', '#98A6A8', '#1D1414', '#F1EDED', '#FFFDF0', '#F6EFE2', '#949FA3', '#FFFBE1', '#CACAD4', '#9A9D94'],
  M: ['#BCC6B8', '#8AA386', '#697D80', '#E3D2BC', '#D0CCAA', '#B0A782', '#B4A497', '#B38281', '#A58767', '#C5B2BC', '#9F7594', '#644749', '#D19066', '#C77362', '#757D78'],
};

const MARD_COLORS = Object.entries(MARD_SERIES_HEX).flatMap(([series, hexes]) =>
  hexes.map((hex, index) => ({
    code: `${series}${index + 1}`,
    hex,
    name: `Mard_${series}${index + 1}`,
    series,
    rgb: hexToRgb(hex),
  }))
);

const colorByCode = Object.fromEntries(MARD_COLORS.map((item) => [item.code, item]));

const state = {
  image: null,
  pixelSize: Number(pixelSizeInput.value),
  cols: 0,
  rows: 0,
  mappedGrid: [],
  selectedColorCode: null,
};

function colorDistance(a, b) {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function getNearestColor(r, g, b) {
  const input = { r, g, b };
  let best = MARD_COLORS[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const color of MARD_COLORS) {
    const dist = colorDistance(input, color.rgb);
    if (dist < bestDistance) {
      bestDistance = dist;
      best = color;
    }
  }

  return best;
}

function rebuildPixelGridFromImage() {
  if (!state.image) return;

  const maxDimension = 900;
  const scale = Math.min(maxDimension / state.image.width, maxDimension / state.image.height, 1);
  const displayWidth = Math.max(1, Math.round(state.image.width * scale));
  const displayHeight = Math.max(1, Math.round(state.image.height * scale));

  state.cols = Math.max(1, Math.round(displayWidth / state.pixelSize));
  state.rows = Math.max(1, Math.round(displayHeight / state.pixelSize));

  sampledCanvas.width = state.cols;
  sampledCanvas.height = state.rows;
  sampledCtx.imageSmoothingEnabled = true;
  sampledCtx.clearRect(0, 0, state.cols, state.rows);
  sampledCtx.drawImage(state.image, 0, 0, state.cols, state.rows);

  const sampledData = sampledCtx.getImageData(0, 0, state.cols, state.rows).data;
  const mappedGrid = [];

  for (let y = 0; y < state.rows; y += 1) {
    const row = [];
    for (let x = 0; x < state.cols; x += 1) {
      const pixelIndex = (y * state.cols + x) * 4;
      const nearest = getNearestColor(sampledData[pixelIndex], sampledData[pixelIndex + 1], sampledData[pixelIndex + 2]);
      row.push(nearest.code);
    }
    mappedGrid.push(row);
  }

  state.mappedGrid = mappedGrid;
}

function drawMappedGrid() {
  if (!state.mappedGrid.length) return;

  canvas.width = state.cols * state.pixelSize;
  canvas.height = state.rows * state.pixelSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      const code = state.mappedGrid[y][x];
      const color = colorByCode[code];
      if (!color) continue;
      ctx.fillStyle = color.hex;
      ctx.fillRect(x * state.pixelSize, y * state.pixelSize, state.pixelSize, state.pixelSize);
    }
  }
}

function getUsedColorCodes() {
  const used = new Set();
  state.mappedGrid.forEach((row) => row.forEach((code) => used.add(code)));
  return Array.from(used);
}

function createSwatch(color) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'swatch';
  button.dataset.code = color.code;
  button.style.background = color.hex;
  button.textContent = color.code;
  button.addEventListener('click', () => {
    state.selectedColorCode = color.code;
    refreshSelection();
  });
  return button;
}

function refreshSelection() {
  document.querySelectorAll('.swatch').forEach((swatch) => {
    swatch.classList.toggle('is-active', swatch.dataset.code === state.selectedColorCode);
  });

  if (!state.selectedColorCode) {
    selectedColorPreview.textContent = '未选择色号';
    selectedColorPreview.style.background = 'transparent';
    selectedColorPreview.style.color = '';
    return;
  }

  const selected = colorByCode[state.selectedColorCode];
  selectedColorPreview.textContent = `${selected.code} · ${selected.hex} · ${selected.name}`;
  selectedColorPreview.style.background = selected.hex;
  selectedColorPreview.style.color = '#111827';
}

function renderUsedPaletteAndList() {
  const usedCodes = getUsedColorCodes();
  const usedColors = MARD_COLORS.filter((color) => usedCodes.includes(color.code));

  usedPaletteContainer.innerHTML = '';
  usedCodeList.innerHTML = '';

  usedColors.forEach((color) => {
    usedPaletteContainer.appendChild(createSwatch(color));

    const tag = document.createElement('span');
    tag.className = 'code-tag';
    tag.style.borderColor = color.hex;
    tag.textContent = `${color.code} (${color.hex})`;
    usedCodeList.appendChild(tag);
  });
}

function renderAllPalette() {
  allPaletteContainer.innerHTML = '';
  Object.entries(MARD_SERIES_HEX).forEach(([series]) => {
    const section = document.createElement('section');
    section.className = 'series-group';

    const title = document.createElement('h4');
    title.textContent = `${series} 区`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'palette-grid';

    MARD_COLORS.filter((color) => color.series === series).forEach((color) => {
      grid.appendChild(createSwatch(color));
    });

    section.appendChild(grid);
    allPaletteContainer.appendChild(section);
  });
}

function renderAll() {
  drawMappedGrid();
  renderUsedPaletteAndList();
  refreshSelection();
}

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files ?? [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.image = image;
      rebuildPixelGridFromImage();
      renderAll();
      downloadBtn.disabled = false;
    };
    image.src = reader.result;
  };

  reader.readAsDataURL(file);
});

pixelSizeInput.addEventListener('input', (event) => {
  state.pixelSize = Number(event.target.value);
  pixelSizeValue.textContent = String(state.pixelSize);

  if (!state.image) return;
  rebuildPixelGridFromImage();
  renderAll();
});

canvas.addEventListener('click', (event) => {
  if (!state.selectedColorCode || !state.mappedGrid.length) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const clickY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const gridX = Math.floor(clickX / state.pixelSize);
  const gridY = Math.floor(clickY / state.pixelSize);

  if (gridX < 0 || gridY < 0 || gridX >= state.cols || gridY >= state.rows) return;

  state.mappedGrid[gridY][gridX] = state.selectedColorCode;
  renderAll();
});

downloadBtn.addEventListener('click', () => {
  if (!state.mappedGrid.length) return;
  const link = document.createElement('a');
  link.download = `pixel-art-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

renderAllPalette();
refreshSelection();
