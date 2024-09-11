# Invoice App

A simple web application designed to manage invoices. It allows users to create, edit, view, and manage invoices seamlessly.

## Features

- **Landing Page**: Introduction and navigation options.
- **Invoice List**: Displays a list of all created invoices.
- **Create/Edit Invoice**: Interface to add or modify invoices.
- **Invoice Detail Page**: Detailed view of a specific invoice.

## Screenshots

### Landing Page

![Landing Page](/assets/image_1.png)

### Invoice List Page

![Invoice List Page](/assets/image.png)

### Create/Edit Invoice Page

![Create/Edit Invoice](/assets/image-1.png)

### Invoice Detail Page

![Invoice Detail Page](/assets/image-2.png)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/invoice-app.git
   ```
2. Navigate into the project directory & install all dependencies:

   ```bash
   cd invoice-app
   cd frontend
   npm i
   cd ..
   cd backend
   npm i
   ```

3. Add Your POSTGRESSQL_DB_URL in Backend Folder

4. Migrate the DB

   ```bash
   cd backend
   npx prisma migrate dev init
   ```

5. Run the Local Development Server
   ```bash
   cd frontend
   npm run dev
   cd backend
   npm run dev
   ```

## Technologies Used

**Frontend**: React, Typescript , Zod , Tailwind CSS
**Backend**: Node.js, Express , Typescript , Zod , Prisma
**Database**: Postgres
