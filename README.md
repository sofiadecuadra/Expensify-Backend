# Expensify

## Authors
- Noelia Bentancor 242970
- Sofía Decuadra 233397
- Agustin Ferrari 240503

## Table of contents
- [Introduction](#introduction)
- [Functional requirements](#functional-requirements)
- [Local setup](#local-setup)
  - [Prerequisites:](#prerequisites)
  - [Steps:](#steps)
    - [Load test data (optional):](#load-test-data-optional)
      - [MongoDB logs:](#mongodb-logs)
      - [MySQL database:](#mysql-database)
  

## Introduction

  
Monolithic backend developed in the context of Human-Computer Interaction.

  

The aim of this app is to manage family expenses.

  

## Functional requirements

  

**RF1: Administrator Registration:** Anyone can register as a family admin through the app.

  

**RF2: User registration by invitation:** Admins can invite other members and admins to the platform by sending them an email or Whatsapp with a link to join the family.

  

**RF3: User authentication:** Users can authenticate by filling a login form that asks for their email and login password.

  
**RF4: Category CRUD:** 

***RF4.1: Add Category*** The application allows administrator user creating categories with the following fields:
*   Name (unique by family)
*   Description 
*   Image representing the category (it can be selected , either from the gallery or taking a picture with the cellphone camera)

***RF4.3: Modify Category*** The application should allow the administrators user modify any category field, keeping the uniquity of the name.
  

***RF4.3: Delete Category*** The application should allow users deleting the category in a logic way so as to track historical expenses.
  

  
**RF5: Display alert when exceeding monthly budget :** Administrators user will recive a notification in their cellphones in case that monthly budget has been exceeded.


**RF6: Expenses CRUD :** 

 ***RF6.1: Add Expense*** The application allows administrator users creating categories with the following fields:
*   Description 
*   Produced Date
*   Invoice image  (it can be selected , either from the gallery or taking a picture with the cellphone camera)

 ***RF6.2: Modify Expense*** The application should allow administrator users (excluding the user who has created the expense) modify any field of the expense.

***RF6.2: Delete Expense*** The application should allow users deleting the expenses.

**RF7: Family Home Page:** Upon login into the application, users are directed to the home page of their family. In this page, they can see the expenses registered for the month and have the possibility to filter them by date. 

**RF8: Data Analysis:**  A graph is displayed that groups the expenses by the given period of the category.

  

## Local setup

### Prerequisites:
- nodejs: 16.15.0
- docker

### Steps:
```
git clone https://github.com/ORTISP/Expensify-Backend.git
cd Expensify-Backend
npm i
docker-compose up
```

##### MySQL database:
1. Connect to the MySQL instance through MySQL Workbench using the next credentials:	
```
hostname: 127.0.0.1
port: 3306
username: user
password: wjMZTZe6f6j45GA
```	
2. Navigate to Server>Data Import>Import from Self-Contained File and select the path to `./testData/database.sql` 
3. Press import data.

## Run locally

1. Create .env file on the root folder with all the env vars. (An example can be found annexed on the documentation PDF).
2. `node index`
  
