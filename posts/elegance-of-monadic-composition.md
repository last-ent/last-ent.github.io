<!--
.. title: Elegance of Monadic Composition
.. slug: elegance-of-monadic-composition
.. date: 2019-11-02 04:19:08 UTC+01:00
.. tags:
.. category:
.. link:
.. description:
.. type: text
-->

Functional programming has many interesting concepts but it can be hard to find practical applications for it in everyday work. In this post, I will explain how Monadic Composition can be used write elegant and easy to understand code.

Consider an API `Donatron` that accepts donations. The API's algorithm is as follows:

1. Accepts donations as list of strings
2. Should have a few valid integer donations
    - **Else** goto `6`. **Response**: `No Valid Ints`
3. Should have a few donations of value 10 or above
    - **Else** goto `6`. **Response**: `No Acceptable Donations Found`
4. Valid donations to external service should succeed
    - **Else** `RuntimeException`
5. Log all accepted submissions
6. Log Response
7. Return Response

End goal is to be able to execute `Donatron.donate` function and get correct response.

**Algorithm as a flowchart**
![Expected flow of Donatron](/images/donatron-flow.png)

Using `IO` we can model the algorithm by using

- `flatmap` on success
- `IO.raiseError` on failure

```scala
import cats.effect.IO

class Donatron() {

  def donate(req: Request): IO[Response] =
    checkForValidInts(req)
      .flatMap(checkForMinimumDonationAmount)
      .flatMap(submitDonations)
      .flatMap(logAndReturnAcceptedDonations)
      .flatMap(logAndReturnResponse)

  def checkForValidInts(req: Request): IO[ValidDonationsFound] = ???

  def checkForMinimumDonationAmount(data: ValidDonationsFound): IO[DonationsAboveMinimumFound] = ???

  def submitDonations(data: DonationsAboveMinimumFound): IO[AcceptedDonations] = ???

  def checkForAboveMaxDonationAmount(data: List[String]): IO[List[String]] = ???

  def logAndReturnResponse(data: RawData): IO[Response] =
    logResponse(data) >> IO.delay(data.toResponse)

  def logResponse(data: RawData): IO[Unit] =
    IO.delay(println(s"Response: ${data.toLogMessage}"))

  def logAndReturnAcceptedDonations(donations: AcceptedDonations): IO[AcceptedDonations] =
    IO
      .delay(println(s"Valid Donations: ${donations.toLogMessage}"))
      .map(_ => donations)
}
```

Complete code can be found at [Donatron Example: IO](https://github.com/last-ent/donatron/blob/io/src/main/scala/donatron/Donatron.scala)

At first this seems to solve our problem but we are logging & returning response only in case of success because `IO.raiseError` will short circuit the chain and hence, further functions will not be called.

**IO Algorithm Flowchart**
![IO flow](/images/donatron-io.png)

We can design our system
