<!--
.. title: ADTs in Practice
.. slug: adts-in-practice
.. date: 2020-04-19 17:50:02 UTC+02:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
-->

In [previous post](/posts/introduction-to-adts) we defined ADTs as

> Algebraic Data Types (or ADTs) model the flow of a program (or a system) in terms of data & functions that describe the complete behaviour and states the data can go through.

In this post, we will work through defining ADTs for an API service.

![How to design ADT for a request-response flow?](/images/adt-server.png)

API service will return User's Information by:

- Extracting user id & password from the request
- Checks them against an authorization service
- Retrieves user's information from database
- Returns User Information in response

{{% promptmid %}}

In order to write the ADTs we first need to understand the possible states in each layer.

We know that the authentication server & our own server will respond with one of the typical HTTP statuses (we will use a simpler set for this example). We will similarly assume smaller set of states for the database.

![States of Response, Auth Server & Database](/images/adts-per-layer.png)

We can describe the flow of our system as

## Server

```scala

import cats.effect.IO

class Server(http: Http, database: Database) {

  def process(request: Request): IO[Response] = {

    val respF =
      for {
        creds <- request.getCredentials()
        authorizedCreds <- authenticateUser(creds)
        userInfo <- getUserInfo(authorizedCreds)
        successfulResponse <- toSuccessfulResponse(userInfo)
      } yield successfulResponse

    respF.handleErrorWith(toFailedResponse)
  }

  def authenticateUser(creds: UserCredentials): IO[AuthCredentials] = ???

  def getUserInfo(authCreds: AuthCredentials): IO[UserInfo] = ???

  def toFailedResponse(err: Throwable): IO[Response] = ???

  def toSuccessfulResponse(userInfo: UserInfo): IO[UserInfoResponse] = ???

}

```

## Traits

```scala

trait Request {
    def getCredentials(): IO[UserCredentials]
}

trait Http {
    def post(userCreds: UserCredentials): IO[AuthCredentials]
}

trait Database{
    def queryUser(userName: String): IO[UserInfo]
}
```

## Credentials

```scala

final case class UserCredentials(userId: String, password: String)

final case class AuthCredentials(userId: String, userName: String)

final case class UserInfo()

```

# Arrows & Sets

Let's define our system in terms of functions & ADTs


# Defining ADTs

We can define our `Response` types as

```scala

sealed trait Response
final case class UserInfoResponse(userInfo: UserInfo) extends Response

final case class CredentialsMissing(msg: String) extends RuntimeException(msg) with Response
final case class UnauthorizedUser(msg: String) extends RuntimeException(msg) with Response
final case class NotFound(msg: String) extends RuntimeException(msg) with Response
final case class Forbidden(msg: String) extends RuntimeException(msg) with Response
final case class InternalServerError(msg: String) extends RuntimeException(msg) with Response
```

`AuthResponse` types

```scala

sealed trait AuthResponse
final case class AuthCredentialsResponse(authCredentials: AuthCredentials) extends AuthResponse

final case class UnauthorizedAuthUser(msg: String) extends RuntimeException(msg: String) with AuthResponse
final case class AuthUserNotFound(msg: String) extends RuntimeException(msg: String) with AuthResponse
final case class AuthServerError(msg: String) extends RuntimeExtends(msg: String) with AuthResponse
```

`Database` types

```scala

sealed trait DBResponse

final case class UserInfoFound() extends DBResponse
final case class UserInfoNotFound() extends DBResponse

final case class DBError(msg: String) extends RuntimeException(msg) with DBResponse
```