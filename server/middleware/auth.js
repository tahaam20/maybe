const crypto = require('crypto');

const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now() });
  return token;
}

function purgeExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(token);
    }
  }
}

function verifyPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || 'goya-admin';
  return password === expected;
}

function requireAdmin(req, res, next) {
  purgeExpiredSessions();

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'لطفاً وارد پنل شوید.' });
  }

  const token = header.slice(7);
  const session = sessions.get(token);
  if (!session || Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return res.status(401).json({ error: 'نشست منقضی شده است. دوباره وارد شوید.' });
  }

  next();
}

module.exports = {
  createSession,
  verifyPassword,
  requireAdmin,
};
