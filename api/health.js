module.exports = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'fairshift-platform',
    version: '1.0.0',
    sdgTarget: 'SDG 8: Decent Work & Economic Growth',
    deployedOn: 'Vercel Edge & Serverless Network',
    timestamp: new Date().toISOString()
  });
};
