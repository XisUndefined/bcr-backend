# README.md

## Endpoints

### Auth

- POST `api/v1/auth/signup` Signup new user (Customer).
- POST `api/v1/auth/login` Login the user account.
- POST `api/v1/auth/logout` Logout the user account.

### Admin

- POST `api/v1/admin/auth/signup` Signup new user (Admin).
- GET `api/v1/admin/cars` Get car list.
- POST `api/v1/admin/cars` Create new car data.
- GET `api/v1/admin/cars/:id` Get car data by ID (Admin).
- PATCH `api/v1/admin/cars/:id` Update car data by ID.
- DELETE `api/v1/admin/cars/:id` Delete car data by ID.
- GET `api/v1/admin/cars/:category` Get list of car data by category.

### Cars

- GET `api/v1/cars/search` Search car for customer.
- GET `api/v1/cars/:id` Get car data by ID (Customer).

### Order

- GET `api/v1/order` Get list of order.
- POST `api/v1/order` Create new order for customer.
- GET `api/v1/order/:orderId` Get order data by ID.
- PATCH `api/v1/order/:orderId` Update order data by ID.

### User

- GET `api/v1/user/profile` Get current user profile.
- PATCH `api/v1/user/profile` Update current user profile.

### Docs

- GET `api/v1/docs` Swagger Open API documentation

## Entity Relationship Diagram (ERD)

![binar-car-rental (1)](https://github.com/XisUndefined/24001143-synrgy7-muh-bcr-ch5/assets/91261170/a2c3f01f-d1df-48e4-8007-48b3d69d2466)
