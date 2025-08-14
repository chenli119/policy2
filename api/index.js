const axios = require('axios');

/**
 * 简化的CORS代理Serverless Function
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // 获取目标URL
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        usage: 'Add ?url=<target_url> to your request'
      });
    }
    
    // 准备请求头（过滤掉一些不需要的头）
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host;
    delete forwardHeaders['x-forwarded-for'];
    delete forwardHeaders['x-forwarded-proto'];
    delete forwardHeaders['x-vercel-id'];
    
    // 发送代理请求
    const response = await axios({
      method: req.method,
      url: url,
      headers: forwardHeaders,
      data: req.body,
      timeout: 10000, // 10秒超时
      validateStatus: () => true // 接受所有状态码
    });
    
    // 设置响应头
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });
    
    // 返回响应
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('代理请求错误:', error.message);
    res.status(500).json({ 
      error: '代理请求失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};