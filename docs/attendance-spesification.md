## Concepts

A pool with a capacity of 0 can be referred to as a a _0-pool_.

A pool with a capacity of more than 0 can be referred to as a _capacity pool_.

A user whos year matches a capacity pool can be referred to as a _target user_.

A user whose year matches a 0-pool can be referred to as a _reserve user_.

A user whose year does not match any pool can be referred to as an _unassigned user_.

A target user with a prikk is called a _marked target user_.

A reserve user with a prikk is called a _marked reserve user_.

The pool which is created at the time of merging is called the _merge pool_.

## Pools

The registration for an event consists of pools.

A pool has a capacity and a rule for which year students can register for the pool.

The capacity of an event is the total capacity of all its pools.

## Pools with 0 capacity (0-pools)

Reserve users are those whose year matches a pool with a capacity of zero (0-pool). They cannot directly register for an event because their designated pool doesn't have any slots available.

Despite not having a direct slot in the event due to the 0-pool status, reserve users can sign up for the waiting list for what will become the merge pool once all pools merge at a predefined merge time. Their registration time for the waiting list on the merge pool is set to the time of the merge + the time they took to register after the initial main registration start.

This means that, in practice, registering earlier gives a reserve user a better position on the waiting list for the merge pool compared to other reserve users, acknowledging the initiative of signing up sooner even though the users may not have a direct slot in the event.

## Prikker

> TODO: this is not finished. I don't remember exactly how we decided to implement this.

A user with a prikk cannot register for an event until 24 hours after the registration start.

If functionality is created for all users to be able to click "sign me up" at the start of registration, the real registration time will be set to the registration time + 24h. 

When determining the order of a user with a prikk and a reserve user, the user with a prikk will be prioritized and placed in front.

## Waiting List

Each pool has its own waiting list. A user can sign up for the waiting list for a pool if the pool is full. If a spot becomes available in a pool, users on that pool's waiting list will get the spot. This applies even if someone registered on another pool's waiting list before that user. 

## Merging

As an organizer, you can set a time when all the pools in an event merge into one pool. This pool is called the merge pool. The merge pool has a capacity equal to the sum of the capacities of the pools that merged, and the rule for which year students can register for the pool is the same as the union of the pools that merged (including 0-pools).

The pool created at the time of merging is just a regular pool. It is not mandatory to set a merge time.

### Rules for forming the attendance list for the merge pool

All of the attended users will switch pool to the merge pool.  The attendance list will just be all of the users who are registered. There is no extra logic applied here.

### Rules for forming the waiting list for the merge pool

The following are the rules for how the order of the waiting list for the merge pool is determined. Users within each gruop are ordered by the time they registered on the waiting list.

1. Target users on the waiting list

2. Marked target users

3. reserve users

4. reserve marked users

## Bumping

The organizer can choose to make changes to the waiting list and registration list during the registration for the event. This is called bumping.

This is the actions the organizer can take based on the situation of the user.

#### Target user on waiting list for their designated pool

The overall capacity of the event is not changed by bumping. 

Bump user to being registered for the event
- User takes the place of a registered user. The registered user ends up at the top of the waiting list

Bump user to the top of the waiting list
- Users who were above the user in waiting are moved down one position.

#### Target user which is not on waiting list

Should be be added to the waiting list, then [### Target user on waiting list for their designated pool](#target-user-on-waiting-list-for-their-designated-pool) applies.

#### Reserve user on waiting list for the merge pool / not on waiting list

No actions available. In the future, actions might be added here.

#### Unassigned user

No actions available