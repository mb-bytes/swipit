export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const QUARTERS = [
  { id: 1, label: "Q1", name: "Q1 (Jan - Mar)", months: [0, 1, 2] },
  { id: 2, label: "Q2", name: "Q2 (Apr - Jun)", months: [3, 4, 5] },
  { id: 3, label: "Q3", name: "Q3 (Jul - Sep)", months: [6, 7, 8] },
  { id: 4, label: "Q4", name: "Q4 (Oct - Dec)", months: [9, 10, 11] },
];

export const SYNC_PERIOD_OPTIONS = [
  { value: "last-30-days", label: "Last 30 Days", quarterNumber: null },
  { value: "Q1", label: "Q1 (Jan – Mar)", quarterNumber: 1 },
  { value: "Q2", label: "Q2 (Apr – Jun)", quarterNumber: 2 },
  { value: "Q3", label: "Q3 (Jul – Sep)", quarterNumber: 3 },
  { value: "Q4", label: "Q4 (Oct – Dec)", quarterNumber: 4 },
];
