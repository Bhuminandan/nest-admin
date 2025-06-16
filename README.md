# Transaction Management System

A NestJS-based web admin application with role-based access control for managing users and transactions (including PDF file storage).

## Features

- **Role-Based Access Control** with 5 distinct roles:

  - Super Admin (1 global superuser - auto-seeded on first run)
  - Group Admin (per-group administrators)
  - Power Users (can view all user data)
  - Users (can create/manage their own transactions)
  - Support Desk (read-only access to all transactions)

- **Secure Authentication**:

  - Token-based authentication (JWT)
  - One-time password links for new users via email
  - Password change enforcement on first login

- **Transaction Management**:

  - Create transactions with title, description
  - PDF file storage capability
  - User-specific transaction isolation

- **Group Isolation**:

  - Admins only see data from their assigned group
  - Clean data separation between groups

- **Developer Friendly**:
  - Clean Architecture implementation
  - Comprehensive unit tests
  - Code coverage reporting
  - Swagger/OpenAPI documentation
  - Postman collection for easy API testing

## Tech Stack

- **Backend**: NestJS
- **Database**: PostgreSQL (TypeORM)
- **Authentication**: JWT
- **API Documentation**: Swagger UI
- **Testing**: Jest (unit tests)
- **Email Service**: Nodemailer (configure your own SMTP)

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Bhuminandan/nest-admin
   cd nest-admin
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp env.sample .env
   ```

   Edit the `.env` file with your own values

4. Database setup:

   ```bash
   psql -U postgres -h localhost -p 5432 -d your_db_name -f admin_backup.sql
   ```

5. Start the application:
   ```bash
   npm run start:dev
   ```

### Automatic Super Admin Creation

On first run, the system automatically seeds a Super Admin user with these credentials:

- Email: `superadmin@example.com`
- Password: `SuperAdmin123!` (change immediately after first login)

## API Testing Options

### 1. Swagger UI

Access interactive API documentation at:  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### 2. Postman Collection

Import `NEST ADMIN.postman_collection.json` into Postman

## Database Backup/Restore

To restore from SQL backup:

```bash
psql -U postgres -h localhost -p 5432 -d your_db_name -f admin_backup.sql
```

## Role Permissions Overview

| Role         | Create Users | Manage Groups | View All Data  | Create Transactions |
| ------------ | ------------ | ------------- | -------------- | ------------------- |
| Super Admin  | ✓            | ✓             | ✓              | ✗                   |
| Group Admin  | ✓            | ✗             | ✗ (Group only) | ✗                   |
| Power User   | ✗            | ✗             | ✓              | ✗                   |
| User         | ✗            | ✗             | ✗              | ✓ (Own only)        |
| Support Desk | ✗            | ✗             | ✓ (Read-only)  | ✗                   |

## Important Notes

1. Configure email service in `.env` to test user invitation flows
2. Change Super Admin password immediately after first login
3. Never commit your `.env` file
   ``

### NESTJS

<!-- NEST JS -->
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
