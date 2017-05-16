// draft for validator

let doggie = {
    name: "Balthazar",
    age: 171238,
    favorite_food: "people"
}

let dogAttributes = {
    options: ["name", "age", "owner", "favorite_food", "gender"],
}


for (let i = 0; i < dogAttributes.options.length; i++) {
    if (doggie[dogAttributes.options[i]] == undefined) {
        console.log("AAAAH >:C YOOOOOOU!! you don't have a " + dogAttributes.options[i]);
    } else {
        console.log("Alrgithghy, then I assume your " + dogAttributes.options[i] + " is " + doggie[dogAttributes.options[i]])
    }
    console.log(i);
}