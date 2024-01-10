const table = document.getElementById('leaderboard');

const Btd6GameId = 'nd2er3ed';
const BlackBorderPercent = 'jdze5erd';
const fullLeaderboardData = [];
let leaderboardData = {};

const state = {
  sort: 'default',
  ascending: true,
};

async function fetchData(url = 'https://www.speedrun.com/api/v1/games/nd2er3ed/records?top=1&max=200&offset=0') {
  const response = await fetch(url);
  const data = await response.json();
  fullLeaderboardData.push(...data.data.filter((speedrun) => speedrun.category !== BlackBorderPercent));

  if (data.pagination.links[0].rel === 'next') {
    await fetchData(data.pagination.links[0].uri);
  } else {
    await fetchCoopRuns();
    leaderboardData = formatData(fullLeaderboardData.filter((speedrun) => speedrun.runs[0]?.run.players.length === 1));
  }
  return 0;
}
async function fetchCoopRuns() {
  const list = fullLeaderboardData.filter((speedrun) => speedrun.runs[0]?.run.players.length > 1);
  for (let i = 0; i < list.length; i++) {
    const data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${Btd6GameId}/level/${list[i].level}/${list[i].category}?var-rn1gp51n=192x250q`);
    const response = await data.json();
    response.data.runs = response.data.runs.filter((speedrun) => speedrun.run.players.length === 1);
    fullLeaderboardData.push(response.data);
  }
}

function formatData(data) {
  const formattedData = {};

  data.forEach((speedrun) => {
    const [map, difficulty] = speedrun.weblink.split('/').at(-1).split('#');
    const run = speedrun.runs[0].run;

    if (!formattedData[map]) {
      formattedData[map] = {};
    }

    formattedData[map][difficulty] = {
      playerId: run.players[0].id,
      date: run.submitted,
      formattedTime: formatTime(run.times.primary_t),
      time: run.times.primary_t,
      frames: Math.round(run.times.primary_t * 180),
    };
  });
  for (const mapKey in formattedData) {
    if (formattedData.hasOwnProperty(mapKey)) {
      const map = formattedData[mapKey];
      let totalFrames = 0;
      for (const difficultyKey in map) {
        if (map.hasOwnProperty(difficultyKey) && map[difficultyKey].frames) {
          totalFrames += map[difficultyKey].frames;
        }
      }
      map['totalFrames'] = totalFrames;
    }
  }
  return formattedData;
}

function clearTable() {
  table.innerHTML = `<tr>
    <th>Map</th>
    <th>Easy</th>
    <th>Medium</th>
    <th>Hard</th>
    <th>Impoppable</th>
    <th>Chimps</th>
    <th>Total</th>
  </tr>
  <tr>
    <th>Frames until next barrier</th>
    <th id="EasyBarrier">N/A</th>
    <th id="MediumBarrier">N/A</th>
    <th id="HardBarrier">N/A</th>
    <th id="ImpoppableBarrier">N/A</th>
    <th id="ChimpsBarrier">N/A</th>
    <th id="TotalBarrier">N/A</th>
  </tr>
  <tr>
    <th>Average</th>
    <th id="EasyAverage">N/A</th>
    <th id="MediumAverage">N/A</th>
    <th id="HardAverage">N/A</th>
    <th id="ImpoppableAverage">N/A</th>
    <th id="ChimpsAverage">N/A</th>
    <th id="TotalAverage">N/A</th>
  </tr>`;
  Array.from(document.querySelector('#leaderboard tr').children).forEach((element) => {
    element.addEventListener('click', () => {
      populateLeaderboard(element.innerText);
    });
  });
}

function populateLeaderboard(sort) {
  clearTable();
  let maps;
  if (state.sort === sort) {
    state.ascending = !state.ascending;
  } else {
    state.ascending = true;
  }
  state.sort = sort;
  switch (sort) {
    case 'Map':
      maps = Object.entries(leaderboardData).sort(([a], [b]) => a.localeCompare(b));
      break;
    case 'Total':
      // eww
      maps = Object.entries(leaderboardData).sort(([, a], [, b]) => (a?.Easy?.frames || Infinity) + (a?.Medium?.frames || Infinity) + (a?.Hard?.frames || Infinity) + (a?.Impoppable?.frames || Infinity) + (a?.Chimps?.frames || Infinity) - ((b?.Easy?.frames || Infinity) + (b?.Medium?.frames || Infinity) + (b?.Hard?.frames || Infinity) + (b?.Impoppable?.frames || Infinity) + (b?.Chimps?.frames || Infinity)));
      break;
    default:
      maps = Object.entries(leaderboardData).sort(([, a], [, b]) => (a?.[sort]?.frames || Infinity) - (b?.[sort]?.frames || Infinity));
  }
  maps = state.ascending ? maps : maps.reverse();
  for (let i = 0; i < maps.length; i++) {
    const map = maps[i][0];
    const difficulties = maps[i][1];

    const row = table.insertRow();
    const mapCell = row.insertCell();
    mapCell.innerText = map.replaceAll('_', ' ');
    let frameCount = 0;
    for (const column of ['Easy', 'Medium', 'Hard', 'Impoppable', 'Chimps']) {
      const cell = row.insertCell();
      frameCount += difficulties[column]?.frames || 324000;
      cell.innerText = difficulties[column]?.formattedTime || '30:00.000';
    }
    row.insertCell().innerText = formatTime(frameCount / 180);
    document.querySelector(`#TotalAverage`).innerText = formatTime(
      Math.round(
        Object.values(leaderboardData)
          .map((x) => x.totalFrames)
          .reduce((a, b) => a + b) / Object.keys(leaderboardData).length
      ) / 180
    );
  }

  for (const id of ['Easy', 'Medium', 'Hard', 'Impoppable', 'Chimps']) {
    document.querySelector(`#${id}Average`).innerText = formatTime(
      Object.values(leaderboardData)
        .map((map) => (map[id]?.frames || 324000) / (180 * Object.values(leaderboardData).filter((speedrun) => speedrun[id]).length))
        .reduce((a, b) => a + b)
    );
    document.querySelector(`#${id}Barrier`).innerText = Math.ceil((parseFloat(document.querySelector(`#${id}Average`).innerText.split(':').at(-1)) % 1) * 180 * Object.values(leaderboardData).length) || 0;
    const mod = Object.values(leaderboardData).length * 18; // Prettier is removing parenthesis so I have to extract it into a variable. Probably for the better anyways
    if (id === 'Easy') document.querySelector(`#${id}Barrier`).innerText += '/' + (Math.ceil((parseFloat(document.querySelector(`#${id}Average`).innerText.split(':').at(-1)) % 1) * 180 * Object.values(leaderboardData).length) % mod) || 0;
  }
  document.querySelector(`#TotalBarrier`).innerText = Math.ceil((parseFloat(document.querySelector(`#TotalAverage`).innerText.split(':').at(-1)) % 1) * 180 * Object.values(leaderboardData).length) || 0;
}

function formatTime(time) {
  if (!time) return `N/A`;
  let result = new Date(time.toFixed(3) * 1000).toISOString().slice(11, 23);
  for (let i = 0; i < result.length; i++) {
    if (result[0] === '0' || result[0] === ':' || result[0] === '.') {
      result = result.slice(1);
    } else {
      break;
    }
  }
  return result;
}

async function populatePlayers() {
  for (const user of ['noneleft', 'SummerPi314159', 'Arisune', 'FroSteeMate', 'Uniquepotatoes', 'Muzgrob']) {
    let result = [];
    let offset = 0;
    while (true) {
      const response = await fetch(`https://www.speedrun.com/api/v1/runs?game=${Btd6GameId}&user=${user}&max=200&offset=${offset}`);
      const data = await response.json();
      result.push(...data.data);
      offset += 200;
      if (data.pagination.size < 200) break;
    }
    console.log(result);
  }
}

async function main() {
  await fetchData();
  populateLeaderboard('easy');
  // populatePlayers();
}
main();
