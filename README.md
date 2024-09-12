## Apply Digital - Product API

### Requirements

- Docker 4+

### Stack

- Node.js 20
- PostgreSQL 12+
- Nest 10

### Environment Variables

- NODE_ENV: node environment
- PORT: Defaults to 3000
- POSTGRES_HOST: Postgres host
- POSTGRES_USER: Postgres user
- POSTGRES_PASSWORD: Postgres password
- POSTGRES_DB: Postgres DB name
- POSTGRES_PORT: Postgres DB port
- CONTENTFUL_SPACE_ID
- CONTENTFUL_ACCESS_TOKEN
- CONTENTFUL_ENVIRONMENT
- CONTENTFUL_CONTENT_TYPE

### Run

- Build containers
  `$ docker compose up --build`
- Go to the container terminal and run the migrations
  `$ npm run migration:run`
- Check if API is up visiting the health check  
  `GET http://localhost:3000/api/health`

### Docs

- Swagger: GET /api/docs

### Accessing private module

- Get an access token to view the product stats
  `GET http://localhost:3000/api/auth/login`
- On Postman

1. Access "Authorization" tab
2. Select "Type: Bearer"
3. Place the access token on field "Token"

### License

These files are licensed under the [MIT License](LICENSE)
