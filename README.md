# BuddyCount API

Here you'll find some recommendations to run the api locally and access the database.

## Project setup

```bash
$ npm install
```

## Compile and run the project

First, launch the PostgreSQL database and Adminer (a tool to manage the db).

```
docker compose up -d
```

Then, start the actual API.

```bash
$ npm run start:dev
```

You can access the API using :

- `http://localhost:3000` is the API's root endpoint. From there, you can access */group*, */expense*, ...
- `http://localhost:3000/swagger` for the Swagger UI. This is the most convenient way to test and see the API's endpoints.
- `http://localhost:8080/` for the Adminer UI. This is the most convenient way to manage the database. To access it, login with these settings : system=PostgreSQL, server=db, username=backend, password=backend, database=backend.

### Run using Docker

You can also run the api inside a docker container. First, build the image :

```
docker build -t buddycount-api:latest .
```

Run the container

```
docker run -p 3000:3000 buddycount-api:latest
```
(use `--rm` to remove the container after it stops)

You can also run the image directly from the GitHub Container Registry :

```
docker run -p 3000:3000 ghcr.io/buddycount/buddycount-api:latest
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).