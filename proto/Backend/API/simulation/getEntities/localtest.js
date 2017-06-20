const expect = require('chai').expect;
const DockRetriever = require('./').DockRetriever


describe('Local tests for core functionality', () => {
    it('Creates the associative list of docks on setDocks', () => {

        let DR = new DockRetriever("", "");
        let docks = [{ id: "Mr", name: "Carl" }, { id: "Mrs", name: "Saskia" }];
        DR.setDocks(docks);

        expect(DR.docksById).to.have.property("Mr");
        expect(DR.docksById).to.have.property("Mrs");
        expect(DR.docksById["Mr"]).to.be.deep.equal(docks[0]);
        expect(DR.docksById["Mrs"]).to.be.deep.equal(docks[1]);
    })
})