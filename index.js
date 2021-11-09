require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
app.use(express.static("build"));
app.use(express.json());
app.use(cors());

morgan.token("body", (request) => {
  return request.body.name || request.body.number
    ? JSON.stringify(request.body)
    : "";
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((result) => {
      if (result) {
        response.json(result);
      } else {
        response.status(500).end();
      }
    })
    .catch((error) => next(error));
});
app.get("/info", (request, response) => {
  Person.count({}).then((length) =>
    response.send(
      `<p> Phonebook has info for ${length} people</p>
     <p>${new Date()}</p>`
    )
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then((result) => {
      return response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or Number is missing!" });
  }
  // if (!body.number.match("[0-9]{3}-[0-9]{3}-[0-9]{4}")) {
  //   return response
  //     .status(400)
  //     .json({ error: "Phone number must be in the format of XXX-XXX-XXXX!" });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});
app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const body = request.body;
  if (!body.number) {
    return response.status(404).json({ error: "Name or Number is missing!" });
  }
  const person = {
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformed id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
