## Concepts
A pool with a capacity of 0 is called a 0-pool.
A user whos year matches _a pool with capacity_, is a wanted user, also just called user.
A user whose year matches a 0-pool is a semi-wanted user.
A user whose year does not match any pool is an unwanted user.
A user with a prikk and with a year that matches a pool is called a marked wanted user.
The pool which is created at the time of merging is called the merge pool.

## Pools
The registration for an event consists of pools.

A pool has a capacity and a rule for which year students can register for the pool.

The capacity of an event is the total capacity of all its pools.

## Pools with 0 capacity (0-pools)

A semi-wanted user can sign up for the waiting list for the merge-pool such that they will have a sign-up time of the merge time.

Thus:

A semi-wanted user who registers 5 minutes after the registration start and a semi-wanted user who registers 5 minutes after the consolidation time will have an equal starting point on the final waiting list / opportunities to get into the event.

However, the final order between the semi-wanted users is determined by the absolute time they register. In this way, it matters when you register, even if you do not have a reserved spot.


## Prikker

A user with a prikk cannot register for an event until 24 hours after the registration start.

If functionality is created for all users to be able to click "sign me up" at the start of registration, the real registration time will be set to the registration time + 24h. 

When determining the order of a user with a prikk and a semi-wanted user, the user with a prikk will be prioritized and placed in front.

## Waiting List

Each pool has its own waiting list. A user can sign up for the waiting list for a pool if the pool is full. If a spot becomes available in a pool, users on that pool's waiting list will get the spot. This applies even if someone registered on another pool's waiting list before that user. 

## Merging

As an organizer, you can set a time when all the pools in an event merge into one pool. This pool is called the merge pool. The merge pool has a capacity equal to the sum of the capacities of the pools that merged, and the rule for which year students can register for the pool is the same as the union of the pools that merged (including 0-pools).

The pool created at the time of merging is just a regular pool. It is not mandatory to set a merge time.

### Rules for forming the attendance list for the merge pool

All of the attended users will switch pool to the merge pool.  The attendance list will just be all of the users who are registered. There is no extra logic applied here.

### Rules for forming the waiting list for the merge pool

The following are the rules for how the order of the waiting list for the consolidated pool is determined. Users within each gruop are ordered by the time they registered on the waiting list.

1. Wanted users on the waiting list

2. Marked wanted users

3. Semi-wanted users

4. Semi-wanted marked users

## Bumping

The organizer can choose to make changes to the waiting list and registration list during the registration for the event. This is called bumping.

This is the actions the organizer can take based on the situation of the user.

#### Registered user

No action available

#### Wanted user on waiting list

Bump user to being registered for the event
- User takes the place of a registered user. The registered user ends up at the top of the waiting list

Bump user to the top of the waiting list
- Users who were above the user in waiting are moved down one position.

#### Semi-wanted user on waiting list

No actions available

#### User which is not registered or on waiting list

Same as for [### Registered user](#registered-user), logically speaking

#### Semi-wanted user, not on waiting list

No actions available

#### Not wanted user

No actions available