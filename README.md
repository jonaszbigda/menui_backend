# Menui

#### Usage guidelines

<br>

## **1. Data structures**

#### Model schemes used in backend.

<br>

- ### **Restaurant**

  - ##### **\_id**: _mongoose.Types.ObjectId_
  - ##### **name**: _String_ (max: 128, required)
  - ##### **city**: _String_ (max: 128, required)
  - ##### **adress**: _String_ (max: 128, required)
  - ##### **location**
    - ##### **type**: _String_ (enum: ["Point"], required)
    - ##### **coordinates**: [Number] required
  - ##### **placesId**: _String_
  - ##### **imgUrl**: _String_ (required)
  - ##### **workingHours**:
    - ##### **pn**: String
    - ##### **wt**: String
    - ##### **sr**: String
    - ##### **cz**: String
    - ##### **pt**: String
    - ##### **sb**: String
    - ##### **nd**: String
  - ##### **description**: _String_
  - ##### **tags**
    - ##### **cardPayments**: _Boolean_
    - ##### **petFriendly**: *B*oolean\*
    - ##### **glutenFree**: _Boolean_
    - ##### **vegan**: _Boolean_
    - ##### **vegetarian**: _Boolean_
    - ##### **alcohol**: _Boolean_
    - ##### **delivery**: _Boolean_
  - ##### **links**
    - ##### **facebook**: _String_
    - ##### **instagram**: _String_
    - ##### **www**: _String_
  - ##### **phone**: _Number_
  - ##### **hidden**: _Boolean_
  - ##### **subscriptionActive**: _Boolean_
  - ##### **subscriptionStarted**: _String_
  - ##### **subscriptionDue**: _String_
  - ##### **categories**: [String]

- ##### **lunchHours**: String
- ##### **lunchMenu**:
  - ##### **lunchSetName**: _String_
  - ##### **lunchSetPrice**: _String_
  - ##### **lunchSetDishes**: [{ dishId: mongoose.Types.ObjectId, quantity: String }]
- ##### **dishes**: [*mongoose.Types.ObjectId*]

<br>

- ### **Dish**

  - ##### **\_id**: _mongoose.Types.ObjectId_
  - ##### **restaurantId**: _mongoose.Types.ObjectId_
  - ##### **name**: _String_ (max: 128, required)
  - ##### **category**: _String_ (max: 64, required)
  - ##### **prices**: (max elements 3)
    - ##### **priceName**: _String_ (required)
    - ##### **price**: _String_ (required)
  - ##### **notes**: _String_ (max: 128)
  - ##### **imgUrl**: _String_ (required)
  - ##### **hidden**: _Boolean_
  - ##### **weight**: String
  - ##### **allergens**
    - ##### **gluten**: _Boolean_
    - ##### **lactose**: _Boolean_
    - ##### **soy**: _Boolean_
    - ##### **eggs**: _Boolean_
    - ##### **seaFood**: _Boolean_
    - ##### **peanuts**: _Boolean_
    - ##### **sesame**: _Boolean_
  - ##### **ingredients**: String
  - ##### **glicemicIndex**: String
  - ##### **kCal**: String
  - ##### **vegan**: _Boolean_
  - ##### **vegetarian**: _Boolean_
  <br>

- ### **User**
  - ##### **\_id**: _mongoose.Types.ObjectId_
  - ##### **email**: _String_ (required)
  - ##### **password**: _String_ (required)
  - ##### **firstname**: _String_ (required)
  - ##### **lastname**: _String_ (required)
  - ##### **billing**
    - ##### **NIP**: _String_
    - ##### **adress**: _String_
    - ##### **companyName**: _String_
  - ##### **restaurants**: [*mongoose.Types.ObjectId*]
  - ##### **trialUsed**: _Boolean_
  <br>

## **2. API**

<br>

- ### **/dish**

  - #### **GET**
    Takes a **dishId** query and if dish exists in a database, returns a **JSON**. Else returns **404**.
  - #### **POST**
    Takes in **restaurantId**, **dish** document, and a JWT **token (header)** as parameters and tries to create a new dish document inside a database. Returns **201** on success. Else returns **401** on bad token, or **400** on wrong **restaurantId**.
  - #### **PUT**
    Takes in **dishId**, **restaurantId**, **dish** document, and a JWT **token (header)** and tries to update specified document in a database. Returns **304** on success. Else returns **204** on bad document, or **401** on bad token.
  - #### **DELETE**

    Takes in **dishId**, and JWT **token (header)** and tries to remove specified dish from database. If everything goes OK, it returns **200**.

    <br>

* ### **/dish/hidden**

  - #### **POST**
    Takes a **dishId, visible(bool)** parameters, and JWT **token (header)**, tries to set dish visibility. Returns **200** on success.

  <br>

* ### **/restaurant**

  - #### **GET**
    Takes **restaurantId** query and returns a specific restaurant **JSON** if found. Else returns **400** if restaurantId is invalid, or **404** if specified restaurantId is not found.
  - #### **POST**
    Takes a **restaurant** document, and JWT **token (header)**, tries to create new restaurant in a database, and also add it to user restaurants list. Returns **201** on success. Else returns **401** on invalid token, and **400** on general error while adding restaurant.
  - #### **PUT**
    Takes a **restaurantId** and updates it with a supplied document.

  <br>

  - ### **/restaurant/category**

  * #### **POST**
    Takes a **restaurantId, category, action (add / delete)** parameters, and JWT **token (header)**, tries to create or remove a supplied category.

  <br>

  - ### **/restaurant/lunch**

  * #### **POST**
    Takes a **restaurantId, dishId, action (add / delete)** parameters, and JWT **token (header)**, tries to create or remove a supplied dish from/to the lunch menu.

  <br>

- ### **/restaurant/dishes**

  - #### **GET**

    Takes a **restaurantId** query and returns **all** dishes from a restaurant in a single **JSON** document. If failed returns **400** on invalid restaurant ID, **404** on restaurant not found, and **500** on general server error.

    <br>

- ### **/restaurant/delete**

  - #### **POST**

    Takes a **restaurantId** parameter **!!!should also check password!!!** and a **JWT token(header)**, and tries to remove the restaurant from the database and from user. If successfull returns **200**, if failed returns error with a code.

    <br>

- ### **/restaurant/visibility**

  - #### **POST**

    Takes a **restaurantId, visible** parameters and a **JWT token(header)**, and tries to set restaurant visibility.

    <br>

- ### **/restaurant/trial**

  - #### **POST**

    Takes a **restaurantId** parameters and a **JWT token(header)**, and tries to activate trial (if not already used).

    <br>

* ### **/img**

  - #### **POST**

    Takes an **image** in the form of a **multipart/form-data**, a JWT **token (header)** and tries to save the image to the cloud. If succeeded, returns a **imgURL** string and a **200** response code. Else returns **401** for invalid token, **204** for no image, and **500** for unknown error.

    <br>

- ### **/user/login**

  - #### **POST**

    Takes **email** and **password** parameters and returns an **JWT** token and basic user **data** if succeeded. Else returns **404** for no such user, **401** on wrong password, and **500** on general server error.

    <br>

- ### **/user/refreshtoken**

  - #### **POST**

    Takes no parameters as it reads the **refreshToken** from a cookie. If refresh token is valid, then returns new auth token in a header and sets new refresh token cookie. **500** on error.

    <br>

* ### **/user/register**

  - #### **POST**

    Takes **email, password, firstname, lastname** parameters and tries to register the user in the database. Returns **201** if succeeded. Else returns **409** on email taken, and **500** on unknown error.

    <br>

* ### **/user/forgotpassword**

  - #### **POST**

    Takes **email** parameter and if it exists, generates and sends an pass reset link via the email to the owner of the account.

    <br>

* ### **/user/resetpass**

  - #### **POST**

    Takes **token, email, newPass** parameters and if everything checks out, changes user password to the supplied **newPass**.

    <br>

* ### **/user/changepass**

  - #### **POST**

    Takes **token, email, newPass, pass** parameters and if everything checks out, changes user password to the supplied **newPass**.

    <br>

- ### **/search**

  - #### **GET**

    Takes a **string** query and returns and array of **JSON** documents with restaurants which names or cities contain specified string query. If nothing found returns nothing. Else returns **500** for unknown error\*\*.

    <br>

* ### **/search/autocomplete**

  - #### **GET**

    Takes a **string** query and returns an **array** of cities and names (cities first) matching specified query. Returns nothing if nothing found.

    <br>

* ### **/search/location**

  - #### **GET**

    Takes a **lon, lat, and radius** query parameters and returns an **array** of restaurants in a specified radius from supplied location.

    <br>

## **3. Important functions**

</br>

- #### **newError(message, status)**

  Returns an error object to be handled by "handleError" function.
  </br>

- #### **handleError(error, responseObject)**
  Takes the error message and status from the error object and sends it via the supplied express response object.
  </br>
