# Domain Driven Design

The codebase and project attempts to follow the principles of Domain Driven Design (DDD) as much as possible, and
wherever it makes sense. DDD is a software development approach that focuses on the domain, the problem that the
software is trying to solve, and the business logic that drives the problem.

It is a way of thinking and a set of priorities, aimed at accelerating software projects that have to deal with
complex domains that are constantly changing.

- [Principles of DDD](#principles-of-ddd)
- [Hexagonal Architecture](#hexagonal-architecture)
- [Implemented in code](#implemented-in-code)

## Principles of DDD

Below is a very quick primer to the primary principles of DDD. For a more in-depth understanding, please refer to
Evans' book on DDD or the many resources available online.

- Evans
  Book: [Domain Driven Design: Tackling Complexity in the Heart of Software](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- Martin Fowler's Blog: https://martinfowler.com/bliki/DomainDrivenDesign.html
    - See other articles, Martin has written A LOT about DDD and related paradigms.
- Wikipedia: https://en.wikipedia.org/wiki/Domain-driven_design

A domain is a sphere of knowledge, influence, or activity. The domain model is a set of concepts that are used in the
domain and the relationships between them.

Domains consist of entities, which are the objects that are used in the domain, and the relationships between them.
Within the domain, there are several use-cases, which are the tasks that the software is trying to accomplish.

To give an example, consider a banking system. The domain model would consist of entities such as `Account`, `Customer`,
`Transaction`, etc. The use-cases would consist of tasks such as `Open Account`, `Close Account`, `Deposit`, `Withdraw`,
`Transfer`, etc.

The next section describes the primary principles of DDD.

### Focus on the Core Domain

The core domain is the part of the software that provides the most value to the business. It is the part of the
software that is most complex and most important to the business. The core domain is where the business logic
resides.

### Base design on a Model of the Domain

The domain model is a set of concepts that are used in the domain and the relationships between them. The domain
model tries to capture the real-world concepts and relationships that are important to the business as well as
possible, and is thus very similar to entities in the real-world domain.

### Do not let the domain model be influenced by technical concerns

The domain model should be based on the real-world concepts and relationships, and should not be influenced by
technical concerns such as databases, user interfaces, etc.

There is no specific framework or library involved because again, we do not care how the service logic is written. It
should be written in a way that it's easy to refactor, maintain, and possibly separate out.

### Continuously refine the model

The domain model is not something that is set in stone. It is something that evolves over time as the business
changes. In terms of code, this means that the implementation should be easy to change and refactor.

## Hexagonal Architecture

Hexagonal architecture is a code organization pattern that is often associated with domain-driven-design because it
helps to enforce the separation of concerns between the domain and the rest of the system. A simple diagram of
hexagonal architecture is shown below:

[Hexagonal Architecture](./attachments/hexagonal-architecture.png)

As seen in the model, the domain is at the center of the hexagon, and the domain model is the most important part of
the system. The domain model is surrounded by the application services, which are the use cases of the system. The
application services are surrounded by the adapters, which are the interfaces to the outside world.

The main idea here, is that dependencies should always point inwards towards the domain, and never outwards. This
means that the domain model is not dependent on anything else in the system, and can be easily tested and refactored.

The domain entities define the data structures that are in the domain, and naturally, any use-cases that are defined
in the domain, will use these entities (in other words, there is a dependency on the entities by the use-cases).

External systems such as databases, client applications, API gateways, etc. are all considered to be adapters, and
they are the ones that depend on the domain model. Due to how the dependencies are set up, the external systems can
be easily swapped out for other systems, and the domain model will not be affected.

There are many other resources available online that go into more detail about hexagonal architecture, and why you
should care.

Another common paradigm, similar to hexagonal architecture, is the onion architecture. You can read more about it
on the web :)

## Implemented in code

Our domain entities are defined in the `/packages/types` directory (which also happens to be used by the web apps). The
use-cases are declared in `packages/core` inside service classes. Methods on the service classes correspond to a
specific use-case within the domain.

Adapters are also defined inside `/packages/core`, and are used to interact with the outside world. For example,
various repositories such as [user-repository.ts](../packages/core/src/modules/user/user-repository.ts) are used to
interact with the database.

External systems such as SDKs are also considered adapters, and are in code, also repositories. For example,
[s3-repository.ts](../packages/core/src/modules/external/s3-repository.ts) is used to interact with the Amazon S3
service.

Note that so far, we have not even talked about which HTTP framework we are using, or which database we are using.
This is because the domain model is not concerned with these details. The domain model is concerned with the business
logic, and the business logic only.

We happen to use tRPC as our HTTP framework, which means that the HTTP layer is also an adapter. The HTTP layer
depends on the use-cases, and the different RPC methods simply call into the different use-cases.

### Error handling

Error handling is also a concern that is often overlooked. In DDD, it is important to handle errors in a way that
makes sense to the domain.

We have decided to use custom exception types for every single error that can occur within the use-cases of the domain.
This is to give a strongly typed interface to the errors that can occur, and to make it easy to handle these errors
in a consistent way.
