# DEX (Decentralized Exchange)
A minimum viable product (MVP) demo of a **Decentralized Exchange**, with a **Automated Market Maker** using **Constant Product Market Maker** and a **Liquidity Pool**.

## Tech Stack
- NodeJs
- Express
- Typescript 
- JWT 
- Zod
- Prisma
- Postgres
- IORedis
- Docker
- Github Action (CI/CD)

## Running the project
- Using **Docker**
    - Clone the repo `https://github.com/Deepjyoti-Sarmah/DEX.git`
    - Make a copy of `.env.example` file contents to `.env`
    - Install Docker and Docker Compose, if not. [Find Instructions Here](https://docs.docker.com/install/).
    - Execute `docker-compose up -d` in a terminal from the repo directory.
    - Run `npm run dev` or `npm run start`in another terminal from the repo directory.
    - _If having any issue in running postgres instance_ then make sure `5432` port is not occupied else provide a different port in **.env** file.
    - _If having any issue in running redis instance_ then make sure `6379` port is not occupied else provide a different port in **.env** file.
    - _If having any issue in running node server instance_ then make sure `3000` port is not occupied else provide a different port in **.env** file.

- Using **Source Code**
    - Clone the repo `https://github.com/Deepjyoti-Sarmah/DEX.git`
    - Make a copy of `.env.example` file contents to `.env`
    - Install `NodeJs` and `npm` on your local machine, if not. [Find Instructions Here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
    - From the root directory of the project folder execute the command `npm install` in a terminal 
    - Install `Postgres` in your machine
    - Change the `DATABASE_URL` to the url of your local postgres instance
    - Install `Redis` in your machine
    - Change the `REDIS_DATABASE_URL` to the url of your local redis instance
    - Run `npm run dev` or `npm run start` in another terminal from the repo directory.
    - _If having any issue in node server running_ then make sure `3000` port is not occupied else provide a different port in **.env** file.

## API Examples

- Signup

  - Routes
  ```
  POST http://localhost:3000/api/v1/user/signup-user 
  ```

  - Request Body:
  ```json
        {
            "username": "Jhon",
                "email": "Jhon@gmail.com",
                "password": "12345678"
        }
  ```

  - Response Body: 
  ```json
        {
            "statusCode": 200,
            "data": {
                "id": 7,
                "username": "Jhon",
                "email": "Jhon@gmail.com",
                "password": "$2b$10$/pdGyfusK83boJxjCTcX7.",
                "refreshToken": null
            },
            "message": "User registered successfully",
            "success": true
        }
  ```


- Login 
  - Routes
  ```
  POST http://localhost:3000/api/v1/user/login-user
  ```

  - Request Body:
  ```json
        {
            "username": "Jhon",
            "email": "Jhon@gmail.com",
            "password": "12345678"
        }
  ```
  - Response Body: 
  ```json
        {
            "statusCode": 200,
            "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ny.-4",
                "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW"
            },
            "message": "user logged in successfully",
            "success": true
        }
  ```
   

- Add Asset to users Account
  - Routes
  ```
  POST http://localhost:3000/api/v1/user/add-asset-user

  ```

  - Request Body:
  ```json
        {
            "eth": 50,
            "usdc": 200000
        }
  ```
  - Response Body: 
  ```json
        {
            "statusCode": 201,
            "data": {
                "id": 5,
                "userId": 7,
                "eth": "50",
                "usdc": "200000"
            },
            "message": "asset created successfully",
            "success": true
        }
  ```
   

- Give Quote
  - Routes
  ```
  POST http://localhost:3000/api/v1/asset/quote
  ```

  - Request Body:
  ```json
        {
            "side": "buy",
            "quantity": 1
        }
  ```

  - Response Body: 
  ```json
        {
            "statusCode": 200,
            "data": {
                "quote": 3517.5879396984924,
                "message": "To buy 1 ETH, you need 3517.5879396984924 USDC"
            },
            "message": "quotation of the asked quantity",
            "success": true
        }
  ```
   

-  Buy Asset
  - Routes
  ```
  POST http://localhost:3000/api/v1/asset/buy-asset
  ```

  - Request Body:
  ```json
        {
          "quantity": 1
        }
  ```
  - Response Body: 
  ```json
        {
            "statusCode": 200,
            "data": "You paid 3517.5879396984924 USDC for 1 ETH",
            "message": "Success",
            "success": true
        }
  ```
   

- Sell Asset
  - Routes
  ```
  POST http://localhost:3000/api/v1/asset/sell-asset
  ```

  - Request Body:
  ```json
        {
            "quantity": 1
        }
  ```
  - Response Body: 
  ```json
        {
            "statusCode": 200,
            "data": "You received 3517.5879396984924 USDC for 1 ETH",
            "message": "Success",
            "success": true
        }
  ```
   
- Add Liquidity
  - Routes
  ```
  POST http://localhost:3000/api/v1/asset/add-asset-liquidity
  ```

  - Request Body
  ```json
        {
            "eth": 1,
            "usdc": 1
        }
  ```
  - Response Body: 200
  ```json
        {
            "statusCode": 200,
            "data": "Updated ETH: 200 and USDC: 700000",
            "message": "Success",
            "success": true
        }
  ```
   

