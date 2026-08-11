const sinon = require("sinon");

const createMockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

module.exports = { createMockRes };
