# Monolithic-Backend

## DockerHub
## 

The image is uploaded in DockerHub repository noeliabentancor/my-expenses-app.

If any changes which need to be applied to the backend are made, use the following commands so as to build the image and push changes to DockerHub.

1. `docker build --tag noeliabentancor/my-expenses-app .`

2. `docker push noeliabentancor/my-expenses-app`

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
![](https://i.imgur.com/wpaRFuh.png)

