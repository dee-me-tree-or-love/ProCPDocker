const expect = require('chai').expect;
const loader = require('./');
describe('Ship Loading Algorithm', function(){

    it('should load containers in 4x4 correctly', function(){

        expect(loader).to.respondsTo('getBestPostion');
    });
});