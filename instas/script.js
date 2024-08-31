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
  const list = ['Alchemist', 'BananaFarm', 'BombShooter', 'BoomerangMonkey', 'DartMonkey', 'Druid', 'GlueGunner', 'HeliPilot', 'IceMonkey', 'MonkeyAce', 'MonkeyBuccaneer', 'MonkeySub', 'MonkeyVillage', 'NinjaMonkey', 'SniperMonkey', 'SpikeFactory', 'SuperMonkey', 'TackShooter', 'WizardMonkey', 'MortarMonkey', 'EngineerMonkey', 'DartlingGunner', 'BeastHandler', 'Mermonkey'];
  currentSeed = seed;
  const length = list.length;
  let idx_2 = list.length;

  while (true) {
    if (--idx_2 < 0) return list;
    idx = Math.floor(NextDouble(currentSeed) * (length - 1));
    [list[idx_2], list[idx]] = [list[idx], list[idx_2]];
  }
}

document.addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    document.querySelector('#cycle').innerHTML = '';
    const cycle = ShuffleSeeded(GetSeed(document.querySelector('#seed').value));
    for (let i = 0; i < cycle.length * 30; i += 4) {
      const row = document.createElement('div');
      row.classList.add('row');

      const p = document.createElement('p');
      const time = new Date(1 * document.querySelector('#time').value + (i / 4) * 8 * 60 * 60 * 1000);
      p.innerText = `${time.toDateString()}\n${time.toLocaleTimeString()}`;
      row.appendChild(p);
      for (let j = 0; j < 4; j++) {
        const img = document.createElement('img');
        img.src = `./images/000-${cycle[(i + j) % 24]}Insta.png`;
        row.appendChild(img);
        document.querySelector('#cycle').appendChild(row);
      }
    }
  }
});
