# Introduction

This document describes the rules and logic for how the attendance system works. The document is intended to be used as a reference for the implementation of the attendance and waiting list functionality in the frontend and backend.

## Brief overview

The attendance system is used to manage the registration and waiting list for events. The system is designed to handle events with multiple pools, where each pool has a capacity and a rule for which year students can register for the pool. The system has a merge functionality, where all pools merge into one pool at a predefined time. The system also has a waiting list functionality, where users can sign up for the waiting list for a pool if the pool is full. If a spot becomes available in a pool, users on that pool's waiting list will get the spot.

## Definitions

A pool with a capacity of 0 can be referred to as a a _0-pool_.

A pool with a capacity of more than 0 can be referred to as a _capacity pool_.

A pool that was created due to a merge of other pools can be referred to as a _merge pool_.

A user whos year matches a capacity pool can be referred to as a _target user_.

A user whose year matches a 0-pool can be referred to as a _reserve user_.

A user whose year does not match any pool can be referred to as an _unassigned user_.

A target user with a prikk is called a _marked target user_.

A reserve user with a prikk is called a _marked reserve user_.


## Pools

The registration for an event consists of pools. A pool has a capacity and a rule for which year students can register for the pool. The capacity of an event is the total capacity of all its pools.

Reserve users can sign up for the waiting list for what will become the merge pool once all pools merge at a predefined merge time. Their registration time for the waiting list on the merge pool is set to the time of the merge + the time they took to register after the initial main registration start.

This means that, in practice, registering earlier gives a reserve user a better position on the waiting list for the merge pool compared to other reserve users, encouraging reserve users to sign up sooner even though the users may not have a direct slot in the event.

## Prikker

> TODO: this is not finished. I don't remember exactly how we decided to implement this.

A user with a prikk cannot register for an event until 24 hours after the registration start.

If functionality is created for all users to be able to click "sign me up" at the start of registration, the real registration time will be set to the registration time + 24h. 

When determining the order of a user with a prikk and a reserve user, the user with a prikk will be prioritized and placed in front.

## Waiting List

Each pool has its own waiting list. A user can sign up for the waiting list for a pool if the pool is full. If a spot becomes available in a pool, users on that pool's waiting list will get the spot. 

Technically, reserve users sign up for the waiting list for their designated 0-pool. In practice though, reserve users only sign up for the waiting list to be able to get a spot in the merge pool.

## Merging

As an organizer, you can set a time when all the pools in an event merge into one pool. This pool is called the merge pool. The merge pool has a capacity equal to the sum of the capacities of the pools that merged, and the rule for which year students can register for the pool is the same as the union of the pools that merged (including 0-pools).

After the merge pool attendance list and waiting list is formed, the merge pool is treated as a normal pool.

Users who were previously reserve users will now be target users for the merge pool. Users who were previously unassigned users will still be unassigned users for the merge pool.

It is not mandatory to set a merge time for an event.

### Rules for forming the attendance list for the merge pool

All of the attended users will switch pool to the merge pool. The attendance list will just be all of the users who are registered. There is no extra logic applied here.

### Rules for forming the waiting list for the merge pool

> TODO: This needs to be elaborated upon with more details.

The following are the prioritizatoin for the ordering of the waiting list for the merge pool. Users within each gruop are ordered by the time they registered on the waiting list.

1. Target users on the waiting list

2. Marked target users

3. Reserve users

4. Reserve marked users


## Bumping

The organizer can choose to make changes to the waiting list and registration list during the registration for the event. This is called bumping.

This is the actions the organizer can take based on the situation of the user.

#### Target user on waiting list for their designated pool

> The overall capacity of an event is not changed by bumping. 

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