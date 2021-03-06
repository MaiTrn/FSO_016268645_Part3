const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fso_016268645:${password}@016268645.ax5mt.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log("Phonebook: ");
    result.forEach((person) => {
      console.log(person.name, " ", person.number);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  const person = new Person({
    name: String(process.argv[3]),
    number: String(process.argv[4]),
  });

  person.save().then(() => {
    console.log(
      `Added ${person.name} number ${person.number} to the phonebook`
    );
    mongoose.connection.close();
  });
} else {
  console.log(
    "Please provide the correct arguments: node mongo.js <password> <name> <number> or node mongo.js <password>"
  );
  process.exit(1);
}
