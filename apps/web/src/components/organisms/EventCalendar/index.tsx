import { FC } from 'react';
import { CalendarData } from './types';
import EventCalendarItem from './EventCalendarItem';
import Link from 'next/link';
import { Icon } from "@dotkomonline/ui";

interface CalendarProps {
  cal: CalendarData;
}

function getWeekNum(date: Date): number {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const currentDate = new Date(date.getTime());
  currentDate.setUTCDate(currentDate.getUTCDate() + 3 - ((currentDate.getUTCDay() + 6) % 7));

  const startOfYear = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 4));
  const startYearThursday = new Date(startOfYear);
  startYearThursday.setUTCDate(startYearThursday.getUTCDate() - ((startYearThursday.getUTCDay() + 6) % 7));

  const daysDifference = Math.floor((currentDate.getTime() - startYearThursday.getTime()) / (24 * 60 * 60 * 1000));

  return Math.ceil((daysDifference + 1) / 7);
}

function isWeekActive(weekNumber: number): boolean {
  const getCurrentWeekNumber = (): number => {
    const today = new Date();
    today.setUTCDate(today.getUTCDate() + 3 - ((today.getUTCDay() + 6) % 7));

    const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 4));
    const startYearThursday = new Date(startOfYear);
    startYearThursday.setUTCDate(startYearThursday.getUTCDate() - ((startYearThursday.getUTCDay() + 6) % 7));

    const daysDifference = Math.floor((today.getTime() - startYearThursday.getTime()) / (24 * 60 * 60 * 1000));

    return Math.ceil((daysDifference + 1) / 7);
  };

  const currentWeekNumber = getCurrentWeekNumber();
  return currentWeekNumber === weekNumber;
}

const EventCalendar: FC<CalendarProps> = ({ cal }) => {
  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const months = [
    "Januar", "Februar", "Mars", "April", "Mai", "Juni", 
    "Juli", "August", "September", "Oktober", "November", "Desember"
  ];

  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="text-foreground bg-slate-3 inline-flex items-center justify-center rounded-md p-1 my-4">
          <a
            href="/events"
            className="text-slate-9 inline-flex items-center justify-center rounded-[0.185rem] px-3 py-1.5 transition-all cursor-pointer hover:text-slate-12"
          >
            <Icon icon="tabler:layout-list" width={22} height={22} />
          </a>
          <div
            className="text-slate-12 bg-slate-2 shadow-sm inline-flex items-center justify-center rounded-[0.185rem] px-3 py-1.5"
          >
            <Icon icon="tabler:calendar-month" width={22} height={22} />
          </div>
        </div>
        <div className='flex items-center gap-4 justify-between sm:justify-end'>
          <h2>{months[cal.month]} {cal.year}</h2>
          <div className='flex pb-2'>
            <Link 
              className='rounded-full hover:bg-slate-4 flex p-2 duration-200'
              href={`/events/calendar/${cal.month === 0 ? cal.year - 1 : cal.year}/${cal.month === 0 ? 12 : cal.month}`}
            >
              <Icon icon="tabler:chevron-left" width={24} height={24} />
            </Link>
            <Link 
              className='rounded-full hover:bg-slate-4 flex p-2 duration-200'
              href={`/events/calendar/${cal.month === 11 ? cal.year + 1 : cal.year}/${cal.month === 11 ? 1 : cal.month + 2}`}
            >
              <Icon icon="tabler:chevron-right" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-7 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr]">
          <div className='hidden sm:block w-6 pr-2 text-slate-10 text-xs leading-5'>Uke</div>
          {weekdays.map((day, index) => (
            <div
              key={index}
              className={`
                text-center sm:text-end sm:pr-3 leading-5
                ${(nowDate.getDay() === 0 ? 6 : nowDate.getDay() - 1) === index ? "font-semibold text-sm" : "text-slate-10 text-xs"}
              `}
            >
              <span className="sm:hidden">{day[0]}</span>
              <span className="hidden sm:block">{day}</span>
            </div>
          ))}
        </div>
        {cal.weeks.map((week, weekIndex) => (
          <div className="relative min-h-28" key={weekIndex}>
            <div className="grid grid-cols-7 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] bottom-0 top-0 absolute w-full h-full">
              <div
                className={`hidden sm:flex w-6 pr-2 items-center justify-center ${
                  isWeekActive(getWeekNum(week.dates[1]))
                    ? 'font-semibold text-sm'
                    : 'text-slate-10 text-xs'
                }`}
              >
                {getWeekNum(week.dates[1])}
              </div>
              {week.dates.map((day, index) => (
                <div
                  key={index}
                  className={`
                    py-1 pr-1 relative flex flex-col items-center sm:items-end border-slate-8
                    ${index % 7 === 0 ? "p-l-[5px]" : "pl-1 border-l-[1px]"}
                    ${weekIndex > 0 ? "border-t-[1px]" : ""}
                  `}
                >
                  <span
                    className={`
                      text-sm w-7 h-7 leading-7 text-center
                      ${new Date(day).getTime() > nowDate.getTime() ? "" : "text-slate-10"}
                      ${new Date(day).getTime() === nowDate.getTime() ? "font-semibold rounded-full bg-red-10 text-white" : ""}
                    `}
                  >
                    {new Date(day).getDate()}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative pt-10 pb-1">
              {week.events.map((row, rowIndex) => (
                <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr]" key={rowIndex}>
                  <div className="w-0 sm:w-6 sm:pr-2"></div>
                  {row.map((event) => (
                    <EventCalendarItem 
                      event={event}
                      classNames={`
                        col-start-${event.startCol + 2} col-span-${event.span}
                        ${event.leftEdge ? 'sm:border-l-4 rounded-l-md' : ''}
                        ${event.rightEdge ? 'rounded-r-md' : ''}
                      `}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default EventCalendar;

// import { FC } from 'react';
// import { CalendarData, Event } from './types';
// import './EventCalendar.css';
// import { HoverCard, HoverCardContent, HoverCardTrigger } from '@dotkomonline/ui';
// import Link from 'next/link';
// import { Icon } from "@dotkomonline/ui"

// interface CalendarProps {
//   cal: CalendarData;
// }

// type EventStyle = {
//   bgColor: string;
//   bordColor: string;
//   bgColorLight: string;
//   bordColorLight: string;
//   textColor: string;
//   textColorLight: string;
// };

// function getColor(active: boolean, type: Event['type']): string {
//   const eventTypes = new Map<Event['type'], EventStyle>([
//     ["sosialt", { 
//       bgColor: 'bg-green-4 hover:bg-green-5', 
//       bordColor: 'border-green-9', 
//       bgColorLight: 'bg-green-3 hover:bg-green-4', 
//       bordColorLight: 'border-green-5',
//       textColor: 'text-green-11',
//       textColorLight: 'text-green-12/60'
//     }],
//     ["bedpres", { 
//       bgColor: 'bg-blue-4 hover:bg-blue-5', 
//       bordColor: 'border-blue-9', 
//       bgColorLight: 'bg-blue-3 hover:bg-blue-4', 
//       bordColorLight: 'border-blue-5',
//       textColor: 'text-blue-11',
//       textColorLight: 'text-blue-12/60'
//     }],
//     ["kurs", { 
//       bgColor: 'bg-red-4 hover:bg-red-5', 
//       bordColor: 'border-red-9', 
//       bgColorLight: 'bg-red-3 hover:bg-red-4', 
//       bordColorLight: 'border-red-5',
//       textColor: 'text-red-11',
//       textColorLight: 'text-red-12/60'
//     }]
//   ]);

//   const eventType = eventTypes.get(type);

//   if (!eventType) {
//     return 'bg-slate-2 border-slate-4';
//   }

//   return active
//     ? `${eventType.bgColor} ${eventType.bordColor} ${eventType.textColor}`
//     // : `${eventType.bgColorLight} ${eventType.bordColorLight} ${eventType.textColorLight}`;
//     : `bg-slate-4 hover:bg-slate-5 ${eventType.bordColorLight} text-slate-11`;
// }

// function getWeekNum(date: Date): number {
//   // Ensure it's a valid date
//   if (isNaN(date.getTime())) {
//     throw new Error("Invalid date");
//   }

//   // Create a new date object to avoid mutating the original
//   const currentDate = new Date(date.getTime());

//   // Move to the nearest Thursday (ISO-8601 trick)
//   currentDate.setUTCDate(currentDate.getUTCDate() + 3 - ((currentDate.getUTCDay() + 6) % 7));

//   // Get the start of the year and align to the nearest Thursday
//   const startOfYear = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 4));
//   const startYearThursday = new Date(startOfYear);
//   startYearThursday.setUTCDate(startYearThursday.getUTCDate() - ((startYearThursday.getUTCDay() + 6) % 7));

//   // Calculate the difference in days between the two dates
//   const daysDifference = Math.floor((currentDate.getTime() - startYearThursday.getTime()) / (24 * 60 * 60 * 1000));

//   // Calculate and return the ISO week number
//   return Math.ceil((daysDifference + 1) / 7);
// }

// function isWeekActive(weekNumber: number): boolean {
//   // Helper function to get the current ISO week number
//   const getCurrentWeekNumber = (): number => {
//     const today = new Date();

//     // Move to the nearest Thursday (ISO-8601 rule)
//     today.setUTCDate(today.getUTCDate() + 3 - ((today.getUTCDay() + 6) % 7));

//     // Get the start of the year
//     const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 4));
//     const startYearThursday = new Date(startOfYear);
//     startYearThursday.setUTCDate(startYearThursday.getUTCDate() - ((startYearThursday.getUTCDay() + 6) % 7));

//     // Calculate the difference in days
//     const daysDifference = Math.floor((today.getTime() - startYearThursday.getTime()) / (24 * 60 * 60 * 1000));

//     // Return the ISO week number
//     return Math.ceil((daysDifference + 1) / 7);
//   };

//   // Get the current week number
//   const currentWeekNumber = getCurrentWeekNumber();

//   // Check if the week is active
//   return currentWeekNumber === weekNumber;
// }

// const EventCalendar: FC<CalendarProps> = ({ cal }) => {
//   const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
//   const nowDate = new Date();
//   nowDate.setHours(0, 0, 0, 0);

//   return (
//     <div className="w-full py-10">
//         <div className="grid grid-cols-7 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr]">
//           <div className='hidden sm:block w-4 text-slate-10 text-xs leading-5'>Uke</div>
//           {weekdays.map((day, index) => (
//             <div
//               key={index}
//               className={`
//                 text-center sm:text-end sm:pr-3 leading-5
//                 ${(nowDate.getDay() === 0 ? 6 : nowDate.getDay() - 1) === index ? "font-semibold text-sm" : "text-slate-10 text-xs"}
//               `}
//             >
//               <span className="sm:hidden">{day[0]}</span>
//               <span className="hidden sm:block">{day}</span>
//             </div>
//           ))}
//         </div>

//         {cal.weeks.map((week, weekIndex) => (
//           <div className="relative min-h-28" key={weekIndex}>
//             <div className="grid grid-cols-7 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] bottom-0 top-0 absolute w-full h-full">
//               <div
//                 className={`hidden sm:flex w-4 items-center justify-center ${
//                   isWeekActive(getWeekNum(week.dates[1]))
//                     ? 'font-semibold text-sm'
//                     : 'text-slate-10 text-xs'
//                 }`}
//               >
//                 {getWeekNum(week.dates[1])}
//               </div>
//               {week.dates.map((day, index) => (
//                 <div
//                   key={index}
//                   className={`
//                     py-1 pr-1 relative flex flex-col items-center sm:items-end border-slate-8
//                     ${index % 7 === 0 ? "p-l-[5px]" : "pl-1 border-l-[1px]"}
//                     ${weekIndex > 0 ? "border-t-[1px]" : ""}
//                   `}
//                 >
//                   <span
//                     className={`
//                       text-sm w-7 h-7 leading-7 text-center
//                       ${new Date(day).getTime() > nowDate.getTime() ? "" : "text-slate-10"}
//                       ${new Date(day).getTime() === nowDate.getTime() ? "rounded-full bg-red-10 text-white" : ""}
//                     `}
//                   >
//                     {new Date(day).getDate()}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             <div className="relative pt-10 pb-1">
//               {week.events.map((row, rowIndex) => (
//                 <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr]" key={rowIndex}>
//                   <div className="w-0 sm:w-4"></div>
//                   {row.map((event, eventIndex) => (
//                     <HoverCard>
//                       <HoverCardTrigger asChild>
//                         <div
//                           key={eventIndex}
//                           className={`
//                             event-text leading-4 my-0.5 m-[2px] pl-1 sm:pl-[0.4rem] pr-[0.1rem] sm:pr-1 py-[0.45rem] truncate
//                             col-start-${event.startCol + 2} col-span-${event.span}
//                             ${event.leftEdge ? 'sm:border-l-4 rounded-l-md' : ''}
//                             ${event.rightEdge ? 'rounded-r-md' : ''}
//                             ${getColor(event.active, event.type)}
//                             text-xs sm:text-sm sm:mx-1
//                             cursor-pointer
//                           `}
//                         >
//                           {event.name}
//                         </div>
//                       </HoverCardTrigger>
//                       <HoverCardContent className="HoverCardContent" sideOffset={5}>
//                         <Link
//                           href={`/events/${event.id}`}
//                           className="text-blue-12 hover:bg-blue-4 flex w-full cursor-pointer flex-row gap-x-2 rounded-md px-3 py-2"
//                         >
//                           <div className="flex flex-row gap-x-4">
//                             <Icon icon="tabler:map-pin" width={24} height={24} />
//                             <span className="flex-row-gap-x-4 flex">{event.name}</span>
//                             <p>{event.name}</p>
//                           </div>
//                         </Link>
//                       </HoverCardContent>
//                     </HoverCard>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//     </div>
//   );
// };

// export default EventCalendar;


