require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const Person = require("./models/person");

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
// log all stuff using tiny, but show data when post?
app.use(
  morgan(function (tokens, req, res) {
    // What's a better way to conditionally log data based on the request method?
    let postData = "";
    if (req.method == "POST") {
      postData = JSON.stringify(req.body);
    }
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      postData,
    ].join(" ");
  })
);
// Defining :data as a custom token in Morgan
// The response body is a json object so stringify turns it into a string,
// The return on morgan.token() MUST be a string value
// morgan.token("data", (req, res) => JSON.stringify(req.body));

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

app.post("/api/persons", (req, res) => {
  const id = Math.floor(Math.random() * 10000);
  const name = req.body.name;
  const number = req.body.number;
  if (!name) {
    return res.status(400).json({
      error: "You must provide a name",
    });
  }
  if (!number) {
    return res.status(400).json({
      error: "You must provide a number",
    });
  }
  // name is not unique
  const isNameUnique = () => !persons.some((person) => person.name == name);
  if (!isNameUnique()) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }
  let validatedPerson = { id: id, name: name, number: number };
  persons.push(validatedPerson);
  res.send(validatedPerson);
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id == id);
  if (person) {
    res.json(person);
  } else {
    res.status(404);
    res.send("There was no person found with the given id.");
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.send(`deleted ${id}`);
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p>
		<p>${Date()}</p>`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
