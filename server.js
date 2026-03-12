const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'habits.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ habits: [] }, null, 2));
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calculateStreak(completions) {
  const completionSet = new Set(completions || []);
  let streak = 0;
  const date = new Date(todayKey());

  while (true) {
    const key = date.toISOString().slice(0, 10);
    if (!completionSet.has(key)) {
      break;
    }

    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function normalizeHabit(habit) {
  return {
    ...habit,
    streak: calculateStreak(habit.completions),
    completedToday: (habit.completions || []).includes(todayKey())
  };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (_error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getStaticContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  return 'application/octet-stream';
}

function serveStatic(reqPath, res) {
  const safePath = reqPath === '/' ? '/index.html' : reqPath;
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    const html = fs.readFileSync(indexPath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  const data = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': getStaticContentType(filePath) });
  res.end(data);
}

async function requestHandler(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && pathname === '/api/habits') {
    const data = readData();
    const habits = data.habits.map(normalizeHabit);
    sendJson(res, 200, { habits });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/habits') {
    try {
      const body = await readBody(req);
      const name = typeof body.name === 'string' ? body.name.trim() : '';

      if (!name) {
        sendJson(res, 400, { error: 'Habit name is required.' });
        return;
      }

      const data = readData();
      const habit = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
        completions: []
      };

      data.habits.push(habit);
      writeData(data);
      sendJson(res, 201, { habit: normalizeHabit(habit) });
      return;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/habits/') && pathname.endsWith('/toggle')) {
    const id = pathname.split('/')[3];
    const data = readData();
    const habit = data.habits.find((item) => item.id === id);

    if (!habit) {
      sendJson(res, 404, { error: 'Habit not found.' });
      return;
    }

    const key = todayKey();
    habit.completions = habit.completions || [];

    if (habit.completions.includes(key)) {
      habit.completions = habit.completions.filter((item) => item !== key);
    } else {
      habit.completions.push(key);
      habit.completions.sort();
    }

    writeData(data);
    sendJson(res, 200, { habit: normalizeHabit(habit) });
    return;
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/habits/')) {
    const id = pathname.split('/')[3];
    const data = readData();
    const before = data.habits.length;
    data.habits = data.habits.filter((item) => item.id !== id);

    if (data.habits.length === before) {
      sendJson(res, 404, { error: 'Habit not found.' });
      return;
    }

    writeData(data);
    sendNoContent(res);
    return;
  }

  if (req.method === 'GET') {
    serveStatic(pathname, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

function startServer(port = PORT) {
  ensureDataFile();
  const server = http.createServer((req, res) => {
    requestHandler(req, res).catch((error) => {
      sendJson(res, 500, { error: error.message || 'Internal server error' });
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer().then(() => {
    console.log(`Loop Habit Tracker Lite running at http://localhost:${PORT}`);
  });
}

module.exports = { calculateStreak, startServer };
