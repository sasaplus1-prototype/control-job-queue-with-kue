'use strict';

var spawn = require('child_process').spawn;

var express = require('express'),
    kue = require('kue');

var app = express(),
    queue = kue.createQueue();

queue.process('print random', function(job, done) {
  var command = spawn('printf', ['%d', job.data.random]),
      result;

  command.stdout.on('data', function(data) {
    console.log('output / id: %d, data: %s', job.id, data);
    result = data;
  });
  command.stderr.on('data', function(data) {
    console.error('error / id: %d, data: %s', job.id, data);
  });
  command.on('close', function(code) {
    console.log('close / id: %d, code: %d', job.id, code);
    done(null, result);
  });
});

app.disable('x-powered-by');

app.get('/', function(req, res, next) {
  res.send('Please send POST method to /register or /cleanup');
});

app.post('/register', function(req, res) {
  queue
    .create('print random', {
      title: 'print random value',
      random: Math.floor(Math.random() * 1000)
    })
    .on('promotion', function() {
      console.log('promotion print random');
    })
    .on('enqueue', function() {
      console.log('enqueue print random');
    })
    .on('complete', function(result) {
      console.log('complete print random');
      console.log('result / %j', result);
      console.log('result / %s', new Buffer(result.data).toString());
    })
    .delay(1000 + Math.random() * 3000)
    .removeOnComplete(false)
    .save();

  res.sendStatus(200);
});

app.post('/cleanup', function(req, res) {
  Promise
    .resolve()
    .then(function() {
      return new Promise(function(resolve, reject) {
        // see: https://github.com/Automattic/kue/blob/0.10.3/lib/queue/job.js#L134-L136
        kue.Job.rangeByState('complete', 0, -1, 'asc', function(err, jobs) {
          if (err) {
            return reject(err);
          }

          Promise
            .all(jobs.map(function(job) {
              return new Promise(function(resolve, reject) {
                // remove job
                job.remove(function() {
                  resolve(job.id);
                });
              });
            }))
            .then(resolve);
        });
      });
    })
    .then(function(ids) {
      ids.forEach(function(id) {
        // id of removed job
        console.log('cleanup: %d', id);
      });
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
});

kue.app.listen(3001, function() {
  console.log('Kue UI starting at 127.0.0.1:3001');
});

app.listen(3000, function() {
  console.log('server starting at 127.0.0.1:3000');
});
