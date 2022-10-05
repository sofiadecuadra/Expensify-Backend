# Expensify

```
Authors 

Noelia Bentancor
Sofía Decuadra
Agustin Ferrari
```
[Deployment Configuration](#DeploymentConfiguration)

# Introduction

Expensify app is a monolithic api developed in the context of Software Architecture in Practice.

The aims of this app is to manage family expenses
# Deployment Configuration
# <div id='DeploymentConfiguration' ></div>


## Configuration
## 

The image is uploaded in DockerHub repository noeliabentancor/my-expenses-app.

If any changes which need to be applied to the backend are made, use the following commands so as to build the image and push changes to DockerHub.

1. `docker build --tag noeliabentancor/my-expenses-app`

2. `docker push noeliabentancor/my-expenses-app`

3. Run task definition expensify-app in cluster

4. Attach instance to target group
After pushing the image, a new task should be started in order to apply changes to the server.

## RDS

RDS is in a private subnet, for consequence it can't be accessed from Internet. 
A tunnel connection needs to be set up, so as to connect to it.

**Endpoint for production**


```
my-expenses-prod.c8njidzohjqg.us-east-1.rds.amazonaws.com

```

## Backend configuration
## 
![](https://i.imgur.com/hmHNBqD.png)

![](https://i.imgur.com/wpaRFuh.png)

