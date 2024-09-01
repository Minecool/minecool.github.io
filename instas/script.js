const SetSeed = new URLSearchParams(window.location.search).get('seed');
const SetStart = new URLSearchParams(window.location.search).get('start');
const SetEnd = new URLSearchParams(window.location.search).get('end');
if (SetSeed && SetStart && SetEnd) {
  document.querySelector('#seed').value = SetSeed;
  document.querySelector('#start').value = SetStart;
  document.querySelector('#end').value = SetEnd;
}
if (new URLSearchParams(window.location.search).get('dev')) {
  document.querySelector('#inputs').style.display = 'block';
  setInterval(ShowData, 100);
}

function i32(str) {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = (result * 10 + (str.charCodeAt(i) - 48)) | 0;
  }
  return result;
}

function GetSeed(id) {
  let charCodes = '';
  for (let i = 0; i < id.length; i++) {
    charCodes += id.charCodeAt(i);
  }
  charCodes = charCodes.slice(0, 18);
  return Math.abs(i32(charCodes));
}

let currentSeed;

function NextDouble(seed) {
  const multiplier = 16807;
  const modulus = 2147483647;
  const number = ((seed * multiplier) % modulus) / (modulus - 1);
  currentSeed = (currentSeed * multiplier) % modulus;
  return number;
}

function ShuffleSeeded(seed) {
  const list = ['Alchemist', 'BananaFarm', 'BombShooter', 'BoomerangMonkey', 'Druid', 'GlueGunner', 'HeliPilot', 'IceMonkey', 'MonkeyAce', 'MonkeyBuccaneer', 'MonkeySub', 'MonkeyVillage', 'NinjaMonkey', 'SniperMonkey', 'SpikeFactory', 'SuperMonkey', 'TackShooter', 'WizardMonkey', 'MortarMonkey', 'EngineerMonkey', 'DartlingGunner', 'BeastHandler', 'Mermonkey'];
  currentSeed = seed;
  const length = list.length;
  let idx_2 = list.length;

  while (true) {
    if (--idx_2 < 0) return list;
    idx = Math.floor(NextDouble(currentSeed) * (length - 1));
    [list[idx_2], list[idx]] = [list[idx], list[idx_2]];
  }
}

document.addEventListener('change', (e) => {
  if (!e.target.files) return;
  GetCollectionFromFile(e.target.files[0]);
  e.target.value = null;
});

document.addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    const copyText = `${window.location.origin}${window.location.pathname}?seed=${document.querySelector('#seed').value}&start=${document.querySelector('#start').value}&end=${document.querySelector('#end').value}`;
    navigator.clipboard.writeText(copyText);
    alert('Copied the link to your clipboard:\n' + copyText);
  }
});

function ShowData() {
  document.querySelector('#cycle').innerHTML = '';
  const cycle = ShuffleSeeded(GetSeed(document.querySelector('#seed').value));
  for (let i = 0; i < cycle.length * 30; i += 4) {
    const row = document.createElement('div');
    row.classList.add('row');

    const p = document.createElement('p');
    const time = 1 * document.querySelector('#start').value + (i / 4) * 8 * 60 * 60 * 1000;
    if (time >= document.querySelector('#end').value) return;
    p.innerText = `${new Date(time).toDateString()}\n${new Date(time).toLocaleTimeString()}`;
    row.appendChild(p);
    for (let j = 0; j < 4; j++) {
      const img = document.createElement('img');
      img.src = `./images/000-${cycle[(i + j) % cycle.length]}Insta.png`;
      row.appendChild(img);
      document.querySelector('#cycle').appendChild(row);
    }
  }
}

function GetCollectionFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const json = JSON.parse(decode(e.target.result));
    const decompressed = atob(json.Data);
    let bytes = new Uint8Array(decompressed.length);
    for (let i = 0; i < decompressed.length; i++) {
      bytes[i] = decompressed.charCodeAt(i);
    }
    const collectionEvent = JSON.parse(JSON.parse(decode(bytes)).data)
      .settings.events.filter((x) => x.type == 'collectableEvent')
      .sort((a, b) => b.start - a.start);
    if (!collectionEvent.length) alert('No Collection Event Found.');
    document.querySelector('#seed').value = collectionEvent[0].id;
    document.querySelector('#start').value = collectionEvent[0].start;
    document.querySelector('#end').value = collectionEvent[0].end;
  };
  reader.readAsArrayBuffer(file);
}

function decode(buf) {
  const data = new Uint8Array(buf);
  for (let i = 14; i < data.length; i++) {
    data[i] = data[i] - 21;
    data[i] = data[i] - ((i - 14) % 6);
  }
  const enc = new TextDecoder('utf-8');
  return enc.decode(data).slice(14);
}

ShowData();
