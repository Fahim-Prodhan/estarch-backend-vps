import Visit from '../models/Visit.js';

const visitMiddleware = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const now = new Date();
    const visitDate = now.toISOString().split('T')[0];

    let visitRecord = await Visit.findOne({ ip, visitDate });

    if (visitRecord) {
      const diffMinutes = (now - visitRecord.lastVisit) / 1000 / 60;
      if (diffMinutes >= 10) {
        visitRecord.lastVisit = now;
        visitRecord.visitCount += 1;
        await visitRecord.save();
      }
    } else {
      visitRecord = new Visit({
        ip,
        lastVisit: now,
        visitDate,
        visitCount: 1
      });
      await visitRecord.save();
    }

    next();
  } catch (err) {
    console.error('Visit Middleware Error:', err);
    next(err);
  }
};

export default visitMiddleware;
