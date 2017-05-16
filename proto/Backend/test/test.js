var assert = require('assert');
import 'babel-polyfill';
import { constructHarbor } from "../lib/harbor_builder";

describe('Harbor Builder', function() {
    describe('constructHarbor(configs, laypaths)', function() {
        it('should return 1 edge between a storage and a dock', function() {
            let configs = {
                docks: [{
                    id: "d1" // other properties can be omitted
                }],
                storages: [{
                    id: "st1"
                }],
            }

            let harbor = constructHarbor(configs);
            assert.equal(1, harbor.edges.length);
        });
    });
});