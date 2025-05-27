import Visit from '../models/Visit.js';

export const getLast15DaysVisits = async (req, res) => {
  try {
    const today = new Date();
    const past15Days = new Date(today);
    past15Days.setDate(today.getDate() - 14);

    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(past15Days);
    const endDateStr = formatDate(today);

    const visits = await Visit.aggregate([
      {
        $match: {
          visitDate: { $gte: startDateStr, $lte: endDateStr }
        }
      },
      {
        $group: {
          _id: '$visitDate',
          totalUsers: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const resultsMap = {};
    visits.forEach(v => {
      resultsMap[v._id] = v.totalUsers;
    });

    let results = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(past15Days);
      d.setDate(past15Days.getDate() + i);
      const dateStr = formatDate(d);
      results.push({
        date: dateStr,
        totalUsers: resultsMap[dateStr] || 0
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Get Visits Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
