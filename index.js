/* eslint-disable no-undef */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const Person = require('./models/person');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
// log all stuff using tiny, but show data when post?
app.use(
  morgan((tokens, req, res) => {
    // What's a better way to conditionally log data based on the request method?
    let postData = '';
    if (req.method === 'POST') {
      postData = JSON.stringify(req.body);
    }
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      postData,
    ].join(' ');
  }),
);

// Defining :data as a custom token in Morgan
// The response body is a json object so stringify turns it into a string,
// The return on morgan.token() MUST be a string value
// morgan.token("data", (req, res) => JSON.stringify(req.body));

app.post('/api/persons', (req, res, next) => {
  const { name } = req.body;
  const { number } = req.body;
  // if (req.body.content === undefined) {
  //   return res.status(400).json({ error: "content missing" });
  // }
  if (!name) {
    return res.status(400).json({
      error: 'You must provide a name',
    });
  }
  if (!number) {
    return res.status(400).json({
      error: 'You must provide a number',
    });
  }
  const validatedPerson = new Person({
    name,
    number,
  });
  validatedPerson
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => res.json(savedAndFormattedPerson))
    .catch((error) => next(error));
});

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        console.log(req.params.id);
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name } = request.body;
  const { number } = request.body;
  if (!name) {
    return res.status(400).json({
      error: 'You must provide a name',
    });
  }
  if (!number) {
    return res.status(400).json({
      error: 'You must provide a number',
    });
  }
  const validatedPerson = {
    name,
    number,
  };
  Person.findByIdAndUpdate(request.params.id, validatedPerson)
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get('/info', (req, res) => {
  Person.estimatedDocumentCount().then((count) => res.send(`<p>Phonebook has info for ${count} people</p><p>${Date()}</p>`));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);
