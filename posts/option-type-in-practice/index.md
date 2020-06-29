<!--
.. title: FP for Sceptics: Option Type in Practice
.. slug: option-type-in-practice
.. date: 2020-06-29 18:00:00 UTC+02:00
.. tags: software design, functional programming, programming, scala, FP for sceptics
.. category: 
.. link: 
.. description: A pragmatic look at where to use Option Type in real world applications like a Web API.
.. type: text
-->

In [previous post](/posts/introduction-to-option-type/) we defined FP & error handling

> Functional Programming (FP) is based around mathematical concepts like **Type Theory** - _We define our system in terms of ADTs, data flow & functions._

> FP promotes using types for error handling
> 
  - `Option`
  - `Either`
  - `Monad`
  - _etc._

Previous post also explained `Option` type and how it works.

[ADTs in Practice](/posts/adts-in-practice/) took a practical system[^1] and designed ADTs for it.

In this post, we will reuse the same system but try to figure out where `Option` type makes most sense to use.

![Option Type: Where to use it?](/images/option-practice-title.png)

{{% promptmid %}}

# Practical System Overview

Let's start by defining the flow of our system.

![Overview of web api](/images/adt-flow-overview.png)

Defined by the code[^2]

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

# Using `Option` type

Let's consider `getUserInfo` which connects to the database to retrieve `UserInfo`

```scala
// Database ADTs

final case class UserInfoFound() extends DBResponse
final case class UserInfoNotFound() extends DBResponse

final case class DBError(msg: String)
    extends RuntimeException(msg)
    with DBErrorResponse
```

It is possible for an authenticated user to not have `UserInfo`[^3] in database.

If we look at definition of `Option` type

> `Option` type denotes presence (`Some(value)`) or absence (`None`) of a value.[^4]

We can see that `UserInfoFound` and `UserInfoNotFound` are two ADTs used to describe presence and absence of `UserInfo`.

Instead of using two different `case class`es which don't give us any extra useful information, we can replace them with a single `Option` type.

Here's what the new code would look like.

```scala
import cats.effect.IO

class Server(http: Http, database: Database) {

  // Changed
  def getUserInfo(authCreds: AuthCredentials): IO[Option[UserInfo]] = ???

  // toSuccessfulResponse can do a pattern match 
  // or .getOrElse on userInfoOpt to extract
  // the value and convert it to UserInfoResponse
  def toSuccessfulResponse(userInfoOpt: Option[UserInfo]): IO[UserInfoResponse] = ???


  // Unchanged
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

  def toFailedResponse(err: Throwable): IO[Response] = ???
}
```

# When not to use `Option` type

A question one might ask is

> Why not rewrite the complete system to use `Option` or `OptionT`[^5]?

The answer revolves around understanding the **granularity of our exception handling** in the system.

Let's consider another component, `Auth Service` which has either successful or error states.

![Auth Service ADTs](/images/option-auth-service.png)

Defined by 

```scala
def authenticateUser(creds: UserCredentials): IO[AuthCredentials] = ???

// Success
final case class AuthCredentialsResponse(
    authCredentials: AuthCredentials
) extends AuthResponse

// Failure
final case class UnauthorizedAuthUser(msg: String)
    extends RuntimeException(msg: String)
    with AuthErrorResponse
final case class AuthUserNotFound(msg: String)
    extends RuntimeException(msg: String)
    with AuthErrorResponse
final case class AuthServerError(msg: String)
    extends RuntimeException(msg: String)
    with AuthErrorResponse
```

Here's what high granularity tells us:

![authenticateUser: High granularity with ADTs](/images/option-auth-adts.png)

If we modify `authenticateUser` to use `Option` type and stop raising erros for `AuthErrorResponse` ADTs.

```scala
def authenticateUser(creds: UserCredentials): IO[Option[AuthCredentials]] = ???
```

A lot of information is lost:

![authenticateUser: Low granularity with `Option` Type](/images/option-auth-opt.png)

This was not an issue for `getUserInfo` because we used `Option` type to only denote presence or absence of `UserInfo`.

We did not use it for exception handling where having extra information can be quite vital.

{{% promptend %}}

# Conclusion

In this post we looked at where `Option` type can be used in a system and more importantly, where NOT to use it.

In later posts, I will cover `Either`/`EitherT`, which is the most practical & useful type construct.

{{% promptbook %}}

[^1]: ![Practical Server: Thumbnail](/images/option-server.png)

[^2]: Complete code ref can be found at [Github Gist.](https://gist.github.com/last-ent/ec183a09b5fa496cb7421b59fbce057b)

[^3]: Imagine a bookmark system, `UserInfo` can mean list of bookmarks and hence can be empty.

[^4]: [Introduction to `Option` Type](/posts/introduction-to-option-type)

[^5]: In Scala (Cats), `OptionT` is a wrapper over `IO[Option]` to make it easier to work in `IO` context. I won't be covering it in this post but if you are curious, have a look at [Cats' Official Documentation](https://typelevel.org/cats/datatypes/optiont.html)
