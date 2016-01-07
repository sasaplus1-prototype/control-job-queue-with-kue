# control-job-queue-with-kue

control job queue with [Kue](http://automattic.github.io/kue/)

## Setup

install dependencies.

```sh
$ npm install
```

start [Redis](http://redis.io/) server.

```sh
$ redis-server
```

start server with other terminal session.

```sh
$ npm start
```

http server starting at `http://127.0.0.1:3000/` and Kue WebUI starting at `http://127.0.0.1:3001/`.

## Commands

### register

register queue.

```sh
$ curl -X POST http://127.0.0.1:3000/register
```

### cleanup

cleanup queue data from redis.

```sh
$ curl -X POST http://127.0.0.1:3000/cleanup
```

## Libraries

- [Express](http://expressjs.com/)
- [Kue](http://automattic.github.io/kue/)

## License

The MIT license. Please see LICENSE file.
