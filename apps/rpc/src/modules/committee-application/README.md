# Committee application interview matching

We assign applicants to interview times for the committees they have applied to. The goal is to fit as many
interviews as possible, then give as many applicants as possible at least one interview, then avoid interviews with
less than 24 hours' notice, and finally prefer times close to noon. These goals have that
order of priority. We then group each committee's interviews into compact daily sessions without worsening the
earlier priorities. A better interview time must never cost us an
otherwise possible interview.

The implementation is in [committee-application-interview-matching.ts](./committee-application-interview-matching.ts).
The service loads the application period through the repository and returns a proposed schedule. Matching does not
write interviews to the database, so calling it again lets us calculate a new proposal from the current data.

## Turning availability into possible interviews

Each committee's interview blocks are split into complete 20- or 30-minute slots, depending on its configured
duration. Any leftover time shorter than an interview is discarded. Identical intervals for the same committee
are combined, and their capacity is the number of distinct room names. Duplicate blocks for the same room do not
give us more capacity.

We merge touching and overlapping applicant availability before checking slots. This means that availability from
09:00–09:15 and 09:15–09:30 can cover one 30-minute interview. A slot must fit completely inside the merged
availability, and the applicant must have selected that committee.

For every feasible applicant, committee, slot, and room combination, we create a binary assignment variable. Its value is either zero or one. Zero means the assignment is unused, and one means the interview is scheduled. HiGHS chooses these values together, so it can rearrange one applicant's interviews to make room for another.

NOTE: `candidateCount` is the number of these feasible combinations. It is not the number of applicants, wanted
interviews, or interviews eventually scheduled. Two rooms for the same feasible interview contribute two candidates.

## Rules every schedule must satisfy

- A committee cannot schedule more interviews in an exact slot than it has distinct rooms for that slot.
- A committee cannot double-book the same room, including differently aligned overlapping slots.
- An applicant can have at most one interview with each selected committee.
- An applicant cannot have overlapping interviews, and must have at least 15 minutes between interviews.

EXAMPLE: An interview ending at 10:20 can be followed by another starting at 10:35. A second interview at 10:34
cannot be used for that applicant. These are hard constraints, so a preference can never override them.

Each assignment includes an actual room and interview block. We constrain overlapping assignments in the same
committee room, then return the solver's chosen block. This prevents double-booking even when two blocks start
at different times. Rooms are identified by committee and location name; names are not global room identifiers.

## Why we solve more than once

We solve the model in up to five passes. Each pass can choose a completely new schedule. What carries forward is
an optimal value expressed as an additional constraint, rather than the previous assignments.

We establish the interview count separately because subtracting penalties from the count can make an interview
score negative. A single solve could then prefer leaving that interview unscheduled. Fixing the maximum count
first makes the penalties decide where interviews happen without letting them reduce how many happen.

1. **Maximize interview count.** Every assignment has weight one. If the maximum feasible count is 69, we add a
  constraint requiring exactly 69 interviews in all following passes.
2. **Maximize applicant coverage.** With the interview count fixed, we maximize the number of applicants receiving
   at least one interview. A binary coverage variable is one exactly when an applicant has an assigned interview.
   We then require the same maximum coverage in all remaining passes. Applicants with no feasible slot do not
   contribute a coverage variable. This prevents time preferences from leaving someone without an interview when
   we could serve them while keeping the maximum interview count.
3. **Minimize the short-notice penalty.** With interview count and applicant coverage fixed, we find the smallest
   total short-notice penalty. We add a
  constraint that keeps the penalty at or below this optimum, with a numerical allowance of `1e-7`. This uses the
   unscaled penalty so the allowance does not grow with the candidate count.
4. **Optimize noon placement.** With the maximum interview count, applicant coverage, and best short-notice penalty
   preserved, we maximize the
  combined preference score. Both penalties still appear in this score, but the short-notice constraint prevents us
   from trading a worse short-notice score for a better noon score beyond the numerical allowance.
5. **Group committee interviews.** We preserve the best noon penalty with the same numerical allowance, then
   minimize the sum of each committee's daily spans: the time from its earliest interview start to its latest
   interview end. Empty days contribute zero. This gives us a reason to close gaps even when two schedules have
   identical short-notice and noon scores. Parallel rooms share the committee's span; we do not optimize each room
   separately.

EXAMPLE: If 69 interviews can serve 40 applicants or 42 applicants, we require 42 applicants before optimizing
times. If all 69 can then receive at least 24 hours' notice, the third pass finds a short-notice penalty of zero.
The remaining passes choose noon placement and compact sessions without moving interviews into the penalized
window. When some short-notice interviews are necessary to reach 69, they remain available and we push them later
where possible before considering noon or grouping.

NOTE: The short-notice objective minimizes the sum of the exponential penalties. It does not separately minimize
the number of interviews within 24 hours. The final schedule must have the maximum interview count and the
maximum applicant coverage achievable at that count. This does not guarantee an interview for every applicant
when availability or capacity prevents it, or equal numbers of interviews per applicant.

If no feasible assignment has a short-notice penalty, the third pass would change nothing, so we skip it. If there
are no candidates at all, we return an empty optimal result without loading the solver. Every executed pass must
return an optimal status; otherwise matching throws an error instead of returning an unproven schedule.

## Short-notice penalty

For every interview, we measure the elapsed time from `interviewsPublishedAt` to the slot's start. Interviews with
less than 24 hours' notice receive a penalty that decreases exponentially as the notice increases. Exactly
24 hours and later have zero penalty. This applies across calendar dates: a late Monday publication can penalize
Tuesday morning, and a Monday evening interview can have enough notice even when Monday morning does not.

We normalize the curve to one at publication and zero at 24 hours. Its decay scale is 12 hours. This gives early
interviews a stronger penalty while continuing to reward preparation time throughout the whole window. It has
no all-day baseline and no jump in the short-notice penalty at the cutoff. These constants are policy choices
that we can adjust without changing the five-pass priority order.

For `noticeHours` between zero and 24, the formula is:

```text
shortNoticePenalty = (exp((24 - noticeHours) / 12) - 1) / (exp(24 / 12) - 1)
```

The implementation uses `Math.expm1` for accuracy near the 24-hour boundary. Notice before publication is clamped
to zero, giving a maximum penalty of one, rather than increasing without bound.

| Notice before interview | Unscaled short-notice penalty |
| --- | ---: |
| 0 hours | 1.00 |
| 6 hours | 0.545 |
| 12 hours | 0.269 |
| 18 hours | 0.102 |
| 24 hours and later | 0.00 |

EXAMPLE: When interviews are published Sunday at 23:00, Monday 09:00 has ten hours' notice, Monday 17:00 has eighteen
hours, and Tuesday 09:00 has thirty-four. Their penalties are approximately 0.346, 0.102, and zero. Thursday
10:00 also has zero penalty. We prefer the later options when they preserve maximum interview count and coverage.

NOTE: We calculate elapsed time with date-fns, so crossing midnight or a daylight saving change does not reset
the notice or turn a 23-hour gap into 24 hours. The period's calendar dates do not anchor the penalty;
publication and each actual slot's start determine it.

## Noon preference and reported score

The noon preference is disabled for each interview with less than 24 hours' notice. Within that window,
preparation time determines time preferences. At 24 hours, noon scoring resumes, even on the same calendar day.

The noon calculation compares time of day against **12:00 UTC**, independent of the interview's calendar date.
This corresponds to 14:00 in Oslo during summer time and 13:00 during winter time.
We measure the distance from noon to the interview interval:

- For a slot ending before noon: `noon − end`
- For a slot spanning noon: `0`
- For a slot starting after noon: `start − noon`

The distance is divided by 12 hours.

NOTE: The noon preference favors individual times near noon. The final grouping pass handles gaps separately,
after preserving the noon score. Grouping cannot move an interview outside applicant or committee availability,
break the 15-minute buffer, or worsen any of the earlier priorities beyond the numerical allowance. Some gaps may
therefore remain. It also does not guarantee fewer interview days when two schedules have the same total span.

The final per-assignment coefficient is:

```text
coefficient = 1 - (clusteringPenalty + shortNoticePenalty) / candidateCount
```

`objectiveValue` is the sum of these coefficients for the selected assignments. It is a preference score, not the
number of interviews, and it can be negative. `matchedInterviews` is the actual maximum feasible count, while
`totalWantedInterviews` counts all committee selections, including those with no feasible slot. We also check
that the returned assignments have exactly the interview count established in the first pass and applicant
coverage established in the second pass.
