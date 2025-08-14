// 简化的测试版本
module.exports = async (req, res) => {
  try {
    console.log('Request received:', req.method, req.url);
    console.log('Query params:', req.query);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }
    
    return res.status(200).json({
      message: 'Test endpoint working',
      method: req.method,
      url: req.url,
      query: req.query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};