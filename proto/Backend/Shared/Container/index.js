const uuid = require('uuid/v4');
const random = require('random-js')();

class ContainerFactory{
	
	static create(number, id){
		
		if(isNaN(number)){
			
			number = 1;
		}
		let getRandomType = () => {
			
			let options = ['type1','type2','type3'];
			return options[random.integer(0,options.length - 1)];
		};
		let createContainer = () => {
			
			return {
				id: uuid(),
				descritpion:"",
				address:{
					location_id: id ? id : '',
					x:0,
					y:0,
					z:0
				},
				weight:random.integer(2400, 30500),
				cargo_type:getRandomType(),
			};
		};

		let containers = [];
		for(let i = 0; i < number; i++){
			
			containers.push(createContainer());
		}
		return containers;
	}
}

module.exports = ContainerFactory;