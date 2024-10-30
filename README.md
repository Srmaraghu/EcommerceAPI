# EcommerceAPI





## Features
- User authentication with JWT
- CRUD operations for products and orders
- Search functionality for products
- Image upload to Cloudinary
- Role-based access control

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for authentication
- Cloudinary for image storage
- Express Validator for request validation

## Installation


### Prerequisites
- Node.js
- MongoDB
- Cloudinary account for image storage

### Steps to Set Up
1. Clone the repository:
  
Install dependencies:


npm install



Create a .env file in the root directory with the following variables:

MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME= <your_cloudinary_name>
CLOUDINARY_API_KEY =  <your_cloudinary_apikey>
CLOUDINARY_API_SECRET =  <your_cloudinary_apisecret>

Start the application:


npm run dev

Access the application at http://localhost:8000


MONGO_URI: MongoDB connection string.
JWT_SECRET: Secret key for JWT signing.
CLOUDINARY_URL: Cloudinary credentials for image uploads.
Contributing
Contributions are welcome! Please fork the repository and create a pull request.

License
This project is licensed under the MIT License.
