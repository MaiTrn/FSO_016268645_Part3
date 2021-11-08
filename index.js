const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

morgan.token("body", (request) => {
  return (request.body.name || request.body.number) ? JSON.stringify(request.body) : "";
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

app.get("/api/persons", (request, response) => {
  response.json(persons);
});
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else response.status(404).send(`Person with id ${id} does not exist`);
});
app.get("/info", (request, response) => {
  response.send(
    `<p> Phonebook has info for ${persons.length} people</p>
     <p>${new Date()}</p>`
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

const generateID = () => {
  let id = Math.floor(Math.random() * 100);
  if (persons.find((p) => p.id === id)) id = generateID();
  return id;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(404).json({ error: "Name or Number is missing!" });
  }
  if (persons.find((p) => p.name === body.name)) {
    return response
      .status(404)
      .json({ error: "Person already exist in the phonebook!" });
  }
  if (!body.number.match("[0-9]{3}-[0-9]{3}-[0-9]{4}")) {
    return response
      .status(404)
      .json({ error: "Phone number must be in the format of XXX-XXX-XXXX!" });
  }
  if (!body.name.match("[a-zA-Z\\s]+")) {
    return response
      .status(404)
      .json({ error: "Name should only contain alphabet characters!" });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateID(),
  };
  persons = persons.concat(person);
  response.json(person);
});
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
