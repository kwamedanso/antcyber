import { FiEdit, FiTrash } from 'react-icons/fi';


const columns = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => row,
    sortable: true,
    minWidth: "150px",
    // sticky: 'left',
    link: (row) => `/employee/${row.id}`,
    renderCell: (value) => (
      <span>{value.title} {value.name}</span>
    )
  },
  {
    id: "fullName",
    header: "Full Name",
    accessor: (row) => `${row.title} ${row.name}`,
    sortable: true
  },
  {
    id: "email",
    header: "Email",
    accessor: "email",
    minWidth: "150px",
    sortable: true
  },
  {
    id: "role",
    header: "Role",
    accessor: "role",
    minWidth: "150px",
    align: "left"
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    renderCell: (value) => (
      <span style={{ color: value === 'Active' ? 'green' : 'red' }}>{value}</span>
    )
  },
  {
    id: "age",
    header: "Age",
    accessor: "age",
  },
  {
    id: "supervisor",
    header: "Supervisor",
    accessor: "supervisor",
  },
  {
    id: "salary",
    header: "Salary",
    accessor: "salary",
    renderCell: (value) => (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    )
  },
  {
    id: "salary_",
    header: "Salary",
    accessor: "salary",
    renderCell: (value) => (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    )
  }
]


const rowActions = [
  {
    label: 'Edit',
    icon: <FiEdit size={14} />,
    onClick: (row) => navigate(`/`),
  },
  {
    type: 'divider',
  },
  {
    label: 'Delete',
    icon: <FiTrash size={14} />,
    onClick: (row) => alert(`Delete item: ${row.id}`),
    variant: 'danger',
    // show: (row) => userRole === "admin",
  },
];

const filterOptions = [
  {
    id: 'role',
    label: 'Role',
    value: "",
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ]
  },
  {
    id: 'status',
    label: 'Status',
    value: "",
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Suspended', label: 'Suspended' },
      { value: 'Inactive', label: 'Inactive' },
    ]
  }
];



const data = [
  { id: 1, name: "John Doe", email: "johndoe@gmail.com", role: "Admin", status: "Active", createdAt: "2022-01-01", updatedAt: "2022-01-01", age: "24", title: "Mr", supervisor: "John Doe", salary: "100000" },
  { id: 2, name: "Jane Smith", email: "janesmith@gmail.com", role: "Manager", status: "Active", createdAt: "2021-05-12", updatedAt: "2023-02-15", age: "31", title: "Ms", supervisor: "John Doe", salary: "85000" },
  { id: 3, name: "Robert Brown", email: "robertbrown@yahoo.com", role: "Developer", status: "Inactive", createdAt: "2020-11-03", updatedAt: "2022-08-20", age: "28", title: "Mr", supervisor: "Jane Smith", salary: "72000" },
  { id: 4, name: "Emily Davis", email: "emilydavis@outlook.com", role: "Designer", status: "Active", createdAt: "2023-03-22", updatedAt: "2023-03-22", age: "26", title: "Ms", supervisor: "Jane Smith", salary: "68000" },
  { id: 5, name: "Michael Wilson", email: "michaelwilson@gmail.com", role: "Developer", status: "Active", createdAt: "2019-07-19", updatedAt: "2023-01-10", age: "35", title: "Mr", supervisor: "Robert Brown", salary: "95000" },
  { id: 6, name: "Sarah Johnson", email: "sarahjohnson@company.com", role: "HR", status: "Active", createdAt: "2021-09-30", updatedAt: "2022-12-05", age: "29", title: "Ms", supervisor: "John Doe", salary: "60000" },
  { id: 7, name: "David Miller", email: "davidmiller@gmail.com", role: "Admin", status: "Suspended", createdAt: "2018-04-17", updatedAt: "2023-02-28", age: "42", title: "Mr", supervisor: "John Doe", salary: "120000" },
  { id: 8, name: "Laura Garcia", email: "lauragarcia@yahoo.com", role: "Manager", status: "Active", createdAt: "2022-06-11", updatedAt: "2023-01-14", age: "33", title: "Ms", supervisor: "David Miller", salary: "89000" },
  { id: 9, name: "James Martinez", email: "jamesmartinez@gmail.com", role: "Developer", status: "Active", createdAt: "2020-12-01", updatedAt: "2022-09-18", age: "27", title: "Mr", supervisor: "Laura Garcia", salary: "77000" },
  { id: 10, name: "Linda Robinson", email: "lindarobinson@outlook.com", role: "Designer", status: "Inactive", createdAt: "2019-02-25", updatedAt: "2021-11-30", age: "38", title: "Ms", supervisor: "Jane Smith", salary: "71000" },
  { id: 11, name: "Thomas Clark", email: "thomasclark@company.com", role: "QA", status: "Active", createdAt: "2023-01-09", updatedAt: "2023-03-01", age: "24", title: "Mr", supervisor: "Michael Wilson", salary: "55000" },
  { id: 12, name: "Patricia Rodriguez", email: "patriciarodriguez@gmail.com", role: "HR", status: "Active", createdAt: "2021-08-14", updatedAt: "2022-10-22", age: "41", title: "Ms", supervisor: "John Doe", salary: "64000" },
  { id: 13, name: "Daniel Lewis", email: "daniellewis@yahoo.com", role: "Developer", status: "Active", createdAt: "2020-05-05", updatedAt: "2023-02-17", age: "30", title: "Mr", supervisor: "Laura Garcia", salary: "82000" },
  { id: 14, name: "Jessica Walker", email: "jessicawalker@gmail.com", role: "Admin", status: "Active", createdAt: "2018-10-20", updatedAt: "2022-06-13", age: "45", title: "Ms", supervisor: "David Miller", salary: "115000" },
  { id: 15, name: "Paul Hall", email: "paulhall@outlook.com", role: "Manager", status: "Inactive", createdAt: "2019-12-07", updatedAt: "2021-05-19", age: "36", title: "Mr", supervisor: "Jessica Walker", salary: "91000" },
  { id: 16, name: "Karen Young", email: "karenyoung@gmail.com", role: "Designer", status: "Active", createdAt: "2022-09-18", updatedAt: "2023-02-01", age: "28", title: "Ms", supervisor: "Jane Smith", salary: "69000" },
  { id: 17, name: "Steven Allen", email: "stevenallen@company.com", role: "Developer", status: "Active", createdAt: "2021-04-23", updatedAt: "2022-11-29", age: "32", title: "Mr", supervisor: "Michael Wilson", salary: "88000" },
  { id: 18, name: "Donna King", email: "donnaking@yahoo.com", role: "QA", status: "Suspended", createdAt: "2020-08-16", updatedAt: "2022-07-04", age: "26", title: "Ms", supervisor: "Thomas Clark", salary: "56000" },
  { id: 19, name: "Matthew Wright", email: "matthewwright@gmail.com", role: "HR", status: "Active", createdAt: "2023-02-10", updatedAt: "2023-03-15", age: "34", title: "Mr", supervisor: "Patricia Rodriguez", salary: "62000" },
  { id: 20, name: "Susan Lopez", email: "susanlopez@outlook.com", role: "Admin", status: "Active", createdAt: "2017-11-28", updatedAt: "2022-12-20", age: "48", title: "Ms", supervisor: "John Doe", salary: "130000" },
  { id: 21, name: "Christopher Hill", email: "christopherhill@gmail.com", role: "Manager", status: "Active", createdAt: "2019-06-13", updatedAt: "2022-04-10", age: "39", title: "Mr", supervisor: "Susan Lopez", salary: "94000" },
  { id: 22, name: "Betty Scott", email: "bettyscott@company.com", role: "Developer", status: "Inactive", createdAt: "2021-01-27", updatedAt: "2022-09-05", age: "29", title: "Ms", supervisor: "Christopher Hill", salary: "76000" },
  { id: 23, name: "Andrew Green", email: "andrewgreen@yahoo.com", role: "Designer", status: "Active", createdAt: "2022-11-04", updatedAt: "2023-01-18", age: "25", title: "Mr", supervisor: "Karen Young", salary: "67000" },
  { id: 24, name: "Ashley Adams", email: "ashleyadams@gmail.com", role: "QA", status: "Active", createdAt: "2020-10-09", updatedAt: "2022-08-11", age: "27", title: "Ms", supervisor: "Thomas Clark", salary: "58000" },
  { id: 25, name: "Joshua Baker", email: "joshuabaker@outlook.com", role: "Developer", status: "Active", createdAt: "2018-09-03", updatedAt: "2023-01-05", age: "37", title: "Mr", supervisor: "Laura Garcia", salary: "93000" },
  { id: 26, name: "Kimberly Gonzalez", email: "kimberlygonzalez@gmail.com", role: "HR", status: "Active", createdAt: "2021-12-19", updatedAt: "2022-10-30", age: "31", title: "Ms", supervisor: "Patricia Rodriguez", salary: "63000" },
  { id: 27, name: "Brian Nelson", email: "briannelson@company.com", role: "Admin", status: "Suspended", createdAt: "2019-03-22", updatedAt: "2021-08-17", age: "44", title: "Mr", supervisor: "Susan Lopez", salary: "125000" },
  { id: 28, name: "Megan Carter", email: "megancarter@yahoo.com", role: "Manager", status: "Active", createdAt: "2022-07-15", updatedAt: "2023-02-25", age: "35", title: "Ms", supervisor: "Brian Nelson", salary: "87000" },
  { id: 29, name: "Kevin Mitchell", email: "kevinmitchell@gmail.com", role: "Developer", status: "Active", createdAt: "2020-04-29", updatedAt: "2022-12-12", age: "33", title: "Mr", supervisor: "Megan Carter", salary: "84000" },
  { id: 30, name: "Rebecca Perez", email: "rebeccaperez@outlook.com", role: "Designer", status: "Inactive", createdAt: "2021-02-18", updatedAt: "2022-06-24", age: "30", title: "Ms", supervisor: "Andrew Green", salary: "70000" },
  { id: 31, name: "Jason Roberts", email: "jasonroberts@gmail.com", role: "QA", status: "Active", createdAt: "2023-01-30", updatedAt: "2023-03-10", age: "23", title: "Mr", supervisor: "Ashley Adams", salary: "54000" },
  { id: 32, name: "Stephanie Turner", email: "stephanieturner@company.com", role: "Developer", status: "Active", createdAt: "2019-11-11", updatedAt: "2022-09-22", age: "40", title: "Ms", supervisor: "Kevin Mitchell", salary: "99000" },
  { id: 33, name: "Eric Phillips", email: "ericphillips@yahoo.com", role: "HR", status: "Active", createdAt: "2020-06-08", updatedAt: "2023-01-27", age: "28", title: "Mr", supervisor: "Kimberly Gonzalez", salary: "61000" },
  { id: 34, name: "Michelle Campbell", email: "michellecampbell@gmail.com", role: "Admin", status: "Active", createdAt: "2018-01-14", updatedAt: "2022-11-08", age: "50", title: "Ms", supervisor: "John Doe", salary: "140000" },
  { id: 35, name: "Timothy Parker", email: "timothyparker@outlook.com", role: "Manager", status: "Active", createdAt: "2021-10-26", updatedAt: "2022-12-28", age: "37", title: "Mr", supervisor: "Michelle Campbell", salary: "92000" },
  { id: 36, name: "Amanda Evans", email: "amandaevans@gmail.com", role: "Developer", status: "Inactive", createdAt: "2022-02-09", updatedAt: "2022-08-15", age: "26", title: "Ms", supervisor: "Timothy Parker", salary: "75000" },
  { id: 37, name: "Ryan Edwards", email: "ryanedwards@company.com", role: "Designer", status: "Active", createdAt: "2020-09-21", updatedAt: "2023-02-08", age: "29", title: "Mr", supervisor: "Rebecca Perez", salary: "72000" },
  { id: 38, name: "Melissa Collins", email: "melissacollins@yahoo.com", role: "QA", status: "Active", createdAt: "2019-08-04", updatedAt: "2022-10-19", age: "34", title: "Ms", supervisor: "Jason Roberts", salary: "57000" },
  { id: 39, name: "Brandon Stewart", email: "brandonstewart@gmail.com", role: "Developer", status: "Active", createdAt: "2021-07-29", updatedAt: "2023-03-03", age: "31", title: "Mr", supervisor: "Stephanie Turner", salary: "86000" },
  { id: 40, name: "Heather Sanchez", email: "heatherevans@gmail.com", role: "HR", status: "Active", createdAt: "2022-12-14", updatedAt: "2023-02-20", age: "27", title: "Ms", supervisor: "Eric Phillips", salary: "59000" },
  { id: 41, name: "Justin Morris", email: "justinmorris@outlook.com", role: "Admin", status: "Suspended", createdAt: "2018-05-18", updatedAt: "2021-09-12", age: "46", title: "Mr", supervisor: "Michelle Campbell", salary: "128000" },
  { id: 42, name: "Christina Rogers", email: "christinarogers@gmail.com", role: "Manager", status: "Active", createdAt: "2020-03-12", updatedAt: "2022-12-02", age: "38", title: "Ms", supervisor: "Justin Morris", salary: "90000" },
  { id: 43, name: "Gregory Reed", email: "gregoryreed@company.com", role: "Developer", status: "Active", createdAt: "2021-11-17", updatedAt: "2023-01-31", age: "32", title: "Mr", supervisor: "Christina Rogers", salary: "83000" },
  { id: 44, name: "Katherine Cook", email: "katherinecook@yahoo.com", role: "Designer", status: "Inactive", createdAt: "2019-04-09", updatedAt: "2021-07-22", age: "35", title: "Ms", supervisor: "Ryan Edwards", salary: "74000" },
  { id: 45, name: "Samuel Morgan", email: "samuelmorgan@gmail.com", role: "QA", status: "Active", createdAt: "2023-02-22", updatedAt: "2023-03-18", age: "22", title: "Mr", supervisor: "Melissa Collins", salary: "53000" },
  { id: 46, name: "Danielle Bell", email: "daniellebell@outlook.com", role: "Developer", status: "Active", createdAt: "2020-07-30", updatedAt: "2022-09-09", age: "30", title: "Ms", supervisor: "Brandon Stewart", salary: "81000" },
  { id: 47, name: "Dylan Murphy", email: "dylanmurphy@gmail.com", role: "HR", status: "Active", createdAt: "2018-12-24", updatedAt: "2022-08-27", age: "41", title: "Mr", supervisor: "Heather Sanchez", salary: "65000" },
  { id: 48, name: "Olivia Bailey", email: "oliviabailey@company.com", role: "Admin", status: "Active", createdAt: "2022-05-06", updatedAt: "2023-02-14", age: "36", title: "Ms", supervisor: "John Doe", salary: "110000" },
  { id: 49, name: "Nathan Rivera", email: "nathanrivera@yahoo.com", role: "Manager", status: "Active", createdAt: "2019-10-02", updatedAt: "2022-11-25", age: "39", title: "Mr", supervisor: "Olivia Bailey", salary: "96000" },
  { id: 50, name: "Madison Cooper", email: "madisoncooper@gmail.com", role: "Developer", status: "Inactive", createdAt: "2021-03-15", updatedAt: "2022-05-17", age: "28", title: "Ms", supervisor: "Nathan Rivera", salary: "78000" },
  { id: 51, name: "Tyler Richardson", email: "tylerrichardson@outlook.com", role: "Designer", status: "Active", createdAt: "2020-01-08", updatedAt: "2023-01-12", age: "33", title: "Mr", supervisor: "Katherine Cook", salary: "73000" },
  { id: 52, name: "Hannah Cox", email: "hannahcox@gmail.com", role: "QA", status: "Active", createdAt: "2022-08-19", updatedAt: "2022-12-15", age: "25", title: "Ms", supervisor: "Samuel Morgan", salary: "56000" },
  { id: 53, name: "Zachary Howard", email: "zacharyhoward@company.com", role: "Developer", status: "Active", createdAt: "2019-01-31", updatedAt: "2022-10-03", age: "37", title: "Mr", supervisor: "Danielle Bell", salary: "91000" },
  { id: 54, name: "Victoria Ward", email: "victoriaward@yahoo.com", role: "HR", status: "Active", createdAt: "2021-06-21", updatedAt: "2022-09-29", age: "32", title: "Ms", supervisor: "Dylan Murphy", salary: "62000" },
  { id: 55, name: "Ethan Torres", email: "ethantorres@gmail.com", role: "Admin", status: "Suspended", createdAt: "2018-08-07", updatedAt: "2021-12-14", age: "47", title: "Mr", supervisor: "Olivia Bailey", salary: "132000" },
  { id: 56, name: "Grace Peterson", email: "gracepeterson@outlook.com", role: "Manager", status: "Active", createdAt: "2022-04-28", updatedAt: "2023-02-22", age: "34", title: "Ms", supervisor: "Ethan Torres", salary: "88000" },
  { id: 57, name: "Noah Gray", email: "noahgray@gmail.com", role: "Developer", status: "Active", createdAt: "2020-11-15", updatedAt: "2022-12-09", age: "29", title: "Mr", supervisor: "Grace Peterson", salary: "85000" },
  { id: 58, name: "Alyssa Ramirez", email: "alyssaramirez@company.com", role: "Designer", status: "Inactive", createdAt: "2019-09-27", updatedAt: "2021-06-18", age: "36", title: "Ms", supervisor: "Tyler Richardson", salary: "75000" },
  { id: 59, name: "Logan James", email: "loganjames@yahoo.com", role: "QA", status: "Active", createdAt: "2023-01-12", updatedAt: "2023-03-05", age: "24", title: "Mr", supervisor: "Hannah Cox", salary: "55000" },
  { id: 60, name: "Chloe Watson", email: "chloewatson@gmail.com", role: "Developer", status: "Active", createdAt: "2021-05-03", updatedAt: "2023-01-22", age: "31", title: "Ms", supervisor: "Zachary Howard", salary: "87000" },
  { id: 61, name: "Caleb Brooks", email: "calebbrooks@outlook.com", role: "HR", status: "Active", createdAt: "2018-02-26", updatedAt: "2022-07-07", age: "43", title: "Mr", supervisor: "Victoria Ward", salary: "66000" },
  { id: 62, name: "Samantha Kelly", email: "samanthakelly@gmail.com", role: "Admin", status: "Active", createdAt: "2022-10-11", updatedAt: "2023-02-27", age: "38", title: "Ms", supervisor: "Ethan Torres", salary: "118000" },
  { id: 63, name: "Elijah Sanders", email: "elijahsanders@company.com", role: "Manager", status: "Active", createdAt: "2020-02-14", updatedAt: "2022-11-11", age: "40", title: "Mr", supervisor: "Samantha Kelly", salary: "97000" },
  { id: 64, name: "Natalie Price", email: "natalieprice@yahoo.com", role: "Developer", status: "Inactive", createdAt: "2019-07-22", updatedAt: "2021-10-29", age: "27", title: "Ms", supervisor: "Elijah Sanders", salary: "79000" },
  { id: 65, name: "Owen Bennett", email: "owenbennett@gmail.com", role: "Designer", status: "Active", createdAt: "2021-12-05", updatedAt: "2023-02-04", age: "30", title: "Mr", supervisor: "Alyssa Ramirez", salary: "71000" },
  { id: 66, name: "Lillian Wood", email: "lillianwood@outlook.com", role: "QA", status: "Active", createdAt: "2018-11-19", updatedAt: "2022-08-30", age: "45", title: "Ms", supervisor: "Logan James", salary: "58000" },
  { id: 67, name: "Isaac Barnes", email: "isaacbarnes@gmail.com", role: "Developer", status: "Active", createdAt: "2022-03-17", updatedAt: "2022-12-23", age: "26", title: "Mr", supervisor: "Chloe Watson", salary: "82000" },
  { id: 68, name: "Ella Ross", email: "ellaross@company.com", role: "HR", status: "Active", createdAt: "2020-10-25", updatedAt: "2023-01-19", age: "33", title: "Ms", supervisor: "Caleb Brooks", salary: "63000" },
  { id: 69, name: "Luke Henderson", email: "lukehenderson@yahoo.com", role: "Admin", status: "Suspended", createdAt: "2019-05-16", updatedAt: "2021-11-09", age: "49", title: "Mr", supervisor: "Samantha Kelly", salary: "135000" },
  { id: 70, name: "Zoe Coleman", email: "zoecoleman@gmail.com", role: "Manager", status: "Active", createdAt: "2021-09-09", updatedAt: "2023-03-08", age: "35", title: "Ms", supervisor: "Luke Henderson", salary: "93000" },
  { id: 71, name: "Jack Jenkins", email: "jackjenkins@outlook.com", role: "Developer", status: "Active", createdAt: "2018-06-12", updatedAt: "2022-09-16", age: "38", title: "Mr", supervisor: "Zoe Coleman", salary: "98000" },
  { id: 72, name: "Lily Perry", email: "lilyperry@gmail.com", role: "Designer", status: "Inactive", createdAt: "2022-01-25", updatedAt: "2022-06-09", age: "28", title: "Ms", supervisor: "Owen Bennett", salary: "69000" },
  { id: 73, name: "Grayson Powell", email: "graysonpowell@company.com", role: "QA", status: "Active", createdAt: "2020-12-20", updatedAt: "2023-02-18", age: "31", title: "Mr", supervisor: "Lillian Wood", salary: "57000" },
  { id: 74, name: "Aubrey Long", email: "aubreylong@yahoo.com", role: "Developer", status: "Active", createdAt: "2019-08-29", updatedAt: "2022-11-14", age: "34", title: "Ms", supervisor: "Isaac Barnes", salary: "89000" },
  { id: 75, name: "Carter Patterson", email: "carterpatterson@gmail.com", role: "HR", status: "Active", createdAt: "2021-04-11", updatedAt: "2022-10-26", age: "29", title: "Mr", supervisor: "Ella Ross", salary: "64000" },
  { id: 76, name: "Penelope Hughes", email: "penelopehughes@outlook.com", role: "Admin", status: "Active", createdAt: "2018-03-05", updatedAt: "2022-12-17", age: "52", title: "Ms", supervisor: "Luke Henderson", salary: "145000" },
  { id: 77, name: "Wyatt Flores", email: "wyattflores@gmail.com", role: "Manager", status: "Active", createdAt: "2022-06-27", updatedAt: "2023-01-08", age: "36", title: "Mr", supervisor: "Penelope Hughes", salary: "95000" },
  { id: 78, name: "Addison Washington", email: "addisonwashington@company.com", role: "Developer", status: "Inactive", createdAt: "2020-09-02", updatedAt: "2022-05-21", age: "27", title: "Ms", supervisor: "Wyatt Flores", salary: "77000" },
  { id: 79, name: "Jonathan Butler", email: "jonathanbutler@yahoo.com", role: "Designer", status: "Active", createdAt: "2019-01-18", updatedAt: "2023-02-11", age: "41", title: "Mr", supervisor: "Lily Perry", salary: "76000" },
  { id: 80, name: "Nora Simmons", email: "norasimmons@gmail.com", role: "QA", status: "Active", createdAt: "2021-11-30", updatedAt: "2022-12-30", age: "26", title: "Ms", supervisor: "Grayson Powell", salary: "56000" },
  { id: 81, name: "Lincoln Foster", email: "lincolndoster@outlook.com", role: "Developer", status: "Active", createdAt: "2018-10-08", updatedAt: "2022-08-03", age: "44", title: "Mr", supervisor: "Aubrey Long", salary: "102000" },
  { id: 82, name: "Scarlett Gonzales", email: "scarlettgonzales@gmail.com", role: "HR", status: "Active", createdAt: "2022-02-28", updatedAt: "2023-03-12", age: "30", title: "Ms", supervisor: "Carter Patterson", salary: "61000" },
  { id: 83, name: "Mateo Bryant", email: "mateobryant@company.com", role: "Admin", status: "Suspended", createdAt: "2019-12-14", updatedAt: "2021-08-22", age: "46", title: "Mr", supervisor: "Penelope Hughes", salary: "130000" },
  { id: 84, name: "Mila Alexander", email: "milaalexander@yahoo.com", role: "Manager", status: "Active", createdAt: "2020-05-22", updatedAt: "2023-01-25", age: "37", title: "Ms", supervisor: "Mateo Bryant", salary: "91000" },
  { id: 85, name: "Asher Russell", email: "asherrussell@gmail.com", role: "Developer", status: "Active", createdAt: "2021-08-01", updatedAt: "2022-11-21", age: "32", title: "Mr", supervisor: "Mila Alexander", salary: "86000" },
  { id: 86, name: "Layla Griffin", email: "laylagriffin@outlook.com", role: "Designer", status: "Inactive", createdAt: "2018-04-23", updatedAt: "2022-06-28", age: "39", title: "Ms", supervisor: "Jonathan Butler", salary: "78000" },
  { id: 87, name: "Julian Diaz", email: "juliandiaz@gmail.com", role: "QA", status: "Active", createdAt: "2022-09-07", updatedAt: "2023-02-26", age: "25", title: "Mr", supervisor: "Nora Simmons", salary: "55000" },
  { id: 88, name: "Violet Hayes", email: "violethayes@company.com", role: "Developer", status: "Active", createdAt: "2020-03-18", updatedAt: "2022-10-11", age: "33", title: "Ms", supervisor: "Lincoln Foster", salary: "88000" },
  { id: 89, name: "Leo Myers", email: "leomyers@yahoo.com", role: "HR", status: "Active", createdAt: "2019-06-30", updatedAt: "2023-01-15", age: "35", title: "Mr", supervisor: "Scarlett Gonzales", salary: "65000" },
  { id: 90, name: "Aurora Ford", email: "auroraford@gmail.com", role: "Admin", status: "Active", createdAt: "2021-10-13", updatedAt: "2022-12-08", age: "42", title: "Ms", supervisor: "Mateo Bryant", salary: "125000" },
  { id: 91, name: "Ezra Hamilton", email: "ezrahamilton@outlook.com", role: "Manager", status: "Active", createdAt: "2018-07-21", updatedAt: "2022-09-23", age: "48", title: "Mr", supervisor: "Aurora Ford", salary: "99000" },
  { id: 92, name: "Emily Graham", email: "emilygraham@gmail.com", role: "Developer", status: "Active", createdAt: "2022-04-04", updatedAt: "2023-02-19", age: "29", title: "Ms", supervisor: "Ezra Hamilton", salary: "83000" },
  { id: 93, name: "Michael Sullivan", email: "michaelsullivan@company.com", role: "Designer", status: "Inactive", createdAt: "2020-08-11", updatedAt: "2021-12-27", age: "34", title: "Mr", supervisor: "Layla Griffin", salary: "73000" },
  { id: 94, name: "Sarah Wallace", email: "sarahwallace@yahoo.com", role: "QA", status: "Active", createdAt: "2019-02-05", updatedAt: "2022-11-04", age: "31", title: "Ms", supervisor: "Julian Diaz", salary: "58000" },
  { id: 95, name: "David Woods", email: "davidwoods@gmail.com", role: "Developer", status: "Active", createdAt: "2021-05-19", updatedAt: "2023-03-07", age: "36", title: "Mr", supervisor: "Violet Hayes", salary: "92000" },
  { id: 96, name: "Laura Cole", email: "lauracole@outlook.com", role: "HR", status: "Active", createdAt: "2018-12-11", updatedAt: "2022-08-14", age: "40", title: "Ms", supervisor: "Leo Myers", salary: "67000" },
  { id: 97, name: "James West", email: "jameswest@gmail.com", role: "Admin", status: "Suspended", createdAt: "2022-07-22", updatedAt: "2023-01-28", age: "39", title: "Mr", supervisor: "Aurora Ford", salary: "115000" },
  { id: 98, name: "Linda Jordan", email: "lindajordan@company.com", role: "Manager", status: "Active", createdAt: "2020-01-26", updatedAt: "2022-10-31", age: "44", title: "Ms", supervisor: "James West", salary: "94000" },
  { id: 99, name: "Robert Owens", email: "robertowens@yahoo.com", role: "Developer", status: "Active", createdAt: "2019-09-12", updatedAt: "2023-02-06", age: "33", title: "Mr", supervisor: "Linda Jordan", salary: "87000" },
  { id: 100, name: "Patricia Reynolds", email: "patriciareynolds@gmail.com", role: "Designer", status: "Inactive", createdAt: "2021-02-24", updatedAt: "2022-05-05", age: "28", title: "Ms", supervisor: "Michael Sullivan", salary: "70000" },
  { id: 101, name: "Christopher Fisher", email: "christopherfisher@outlook.com", role: "QA", status: "Active", createdAt: "2018-09-16", updatedAt: "2022-12-19", age: "42", title: "Mr", supervisor: "Sarah Wallace", salary: "60000" },
  { id: 102, name: "Jessica Ellis", email: "jessicaellis@gmail.com", role: "Developer", status: "Active", createdAt: "2022-11-28", updatedAt: "2023-03-14", age: "27", title: "Ms", supervisor: "David Woods", salary: "81000" },
  { id: 103, name: "Daniel Harrison", email: "danielharrison@company.com", role: "HR", status: "Active", createdAt: "2020-06-17", updatedAt: "2022-09-07", age: "37", title: "Mr", supervisor: "Laura Cole", salary: "66000" },
  { id: 104, name: "Karen Gibson", email: "karengibson@yahoo.com", role: "Admin", status: "Active", createdAt: "2019-11-20", updatedAt: "2023-01-30", age: "50", title: "Ms", supervisor: "James West", salary: "142000" },
  { id: 105, name: "Matthew McDonald", email: "matthewmcdonald@gmail.com", role: "Manager", status: "Active", createdAt: "2021-07-04", updatedAt: "2022-11-17", age: "38", title: "Mr", supervisor: "Karen Gibson", salary: "98000" },
  { id: 106, name: "Susan Cruz", email: "susancruz@outlook.com", role: "Developer", status: "Inactive", createdAt: "2018-05-30", updatedAt: "2021-10-15", age: "45", title: "Ms", supervisor: "Matthew McDonald", salary: "103000" },
  { id: 107, name: "Steven Marshall", email: "stevenmarshall@gmail.com", role: "Designer", status: "Active", createdAt: "2022-08-15", updatedAt: "2023-02-12", age: "32", title: "Mr", supervisor: "Patricia Reynolds", salary: "74000" },
  { id: 108, name: "Donna Ortiz", email: "donnaortiz@company.com", role: "QA", status: "Active", createdAt: "2020-10-29", updatedAt: "2022-12-24", age: "29", title: "Ms", supervisor: "Christopher Fisher", salary: "57000" },
  { id: 109, name: "Andrew Gomez", email: "andrewgomez@yahoo.com", role: "Developer", status: "Active", createdAt: "2019-04-02", updatedAt: "2023-01-17", age: "35", title: "Mr", supervisor: "Jessica Ellis", salary: "89000" },
  { id: 110, name: "Betty Murray", email: "bettymurray@gmail.com", role: "HR", status: "Active", createdAt: "2021-12-23", updatedAt: "2022-08-09", age: "31", title: "Ms", supervisor: "Daniel Harrison", salary: "63000" },
  { id: 111, name: "Joshua Freeman", email: "joshuafreeman@outlook.com", role: "Admin", status: "Suspended", createdAt: "2018-02-12", updatedAt: "2021-11-18", age: "47", title: "Mr", supervisor: "Karen Gibson", salary: "128000" },
  { id: 112, name: "Kimberly Wells", email: "kimberlywells@gmail.com", role: "Manager", status: "Active", createdAt: "2022-05-09", updatedAt: "2023-03-02", age: "36", title: "Ms", supervisor: "Joshua Freeman", salary: "93000" },
  { id: 113, name: "Brian Webb", email: "brianwebb@company.com", role: "Developer", status: "Active", createdAt: "2020-04-18", updatedAt: "2022-10-15", age: "34", title: "Mr", supervisor: "Kimberly Wells", salary: "85000" },
  { id: 114, name: "Megan Simpson", email: "megansimpson@yahoo.com", role: "Designer", status: "Inactive", createdAt: "2019-07-09", updatedAt: "2022-06-05", age: "30", title: "Ms", supervisor: "Steven Marshall", salary: "72000" },
  { id: 115, name: "Kevin Stevens", email: "kevinstevens@gmail.com", role: "QA", status: "Active", createdAt: "2021-10-19", updatedAt: "2023-01-04", age: "28", title: "Mr", supervisor: "Donna Ortiz", salary: "56000" },
  { id: 116, name: "Rebecca Tucker", email: "rebeccatucker@outlook.com", role: "Developer", status: "Active", createdAt: "2018-08-08", updatedAt: "2022-09-12", age: "41", title: "Ms", supervisor: "Andrew Gomez", salary: "96000" },
  { id: 117, name: "Jason Porter", email: "jasonporter@gmail.com", role: "HR", status: "Active", createdAt: "2022-01-14", updatedAt: "2022-12-01", age: "33", title: "Mr", supervisor: "Betty Murray", salary: "62000" },
  { id: 118, name: "Stephanie Hunter", email: "stephaniehunter@company.com", role: "Admin", status: "Active", createdAt: "2020-09-28", updatedAt: "2023-02-23", age: "43", title: "Ms", supervisor: "Joshua Freeman", salary: "122000" },
  { id: 119, name: "Eric Hicks", email: "erichicks@yahoo.com", role: "Manager", status: "Active", createdAt: "2019-03-23", updatedAt: "2022-11-28", age: "39", title: "Mr", supervisor: "Stephanie Hunter", salary: "97000" },
  { id: 120, name: "Michelle Crawford", email: "michellecrawford@gmail.com", role: "Developer", status: "Inactive", createdAt: "2021-06-07", updatedAt: "2022-07-19", age: "29", title: "Ms", supervisor: "Eric Hicks", salary: "79000" },
  { id: 121, name: "Timothy Henry", email: "timothyhenry@outlook.com", role: "Designer", status: "Active", createdAt: "2018-01-22", updatedAt: "2023-01-21", age: "46", title: "Mr", supervisor: "Megan Simpson", salary: "77000" },
  { id: 122, name: "Amanda Boyd", email: "amandaboyd@gmail.com", role: "QA", status: "Active", createdAt: "2022-10-02", updatedAt: "2023-02-16", age: "26", title: "Ms", supervisor: "Kevin Stevens", salary: "55000" },
  { id: 123, name: "Ryan Mason", email: "ryanmason@company.com", role: "Developer", status: "Active", createdAt: "2020-02-20", updatedAt: "2022-10-09", age: "37", title: "Mr", supervisor: "Rebecca Tucker", salary: "91000" },
  { id: 124, name: "Melissa Morrison", email: "melissamorrison@yahoo.com", role: "HR", status: "Active", createdAt: "2019-10-14", updatedAt: "2023-01-24", age: "34", title: "Ms", supervisor: "Jason Porter", salary: "64000" },
  { id: 125, name: "Brandon Chavez", email: "brandonchavez@gmail.com", role: "Admin", status: "Suspended", createdAt: "2021-09-01", updatedAt: "2022-12-14", age: "38", title: "Mr", supervisor: "Stephanie Hunter", salary: "118000" },
  { id: 126, name: "Heather Rogers", email: "heatherrogers@outlook.com", role: "Manager", status: "Active", createdAt: "2018-11-04", updatedAt: "2022-08-28", age: "44", title: "Ms", supervisor: "Brandon Chavez", salary: "96000" },
  { id: 127, name: "Justin Reyes", email: "justinreyes@gmail.com", role: "Developer", status: "Active", createdAt: "2022-03-29", updatedAt: "2023-03-09", age: "31", title: "Mr", supervisor: "Heather Rogers", salary: "84000" },
  { id: 128, name: "Christina Gutierrez", email: "christinagutierrez@company.com", role: "Designer", status: "Inactive", createdAt: "2020-07-07", updatedAt: "2022-05-28", age: "32", title: "Ms", supervisor: "Timothy Henry", salary: "73000" },
  { id: 129, name: "Gregory Fernandez", email: "gregoryfernandez@yahoo.com", role: "QA", status: "Active", createdAt: "2019-01-29", updatedAt: "2022-11-07", age: "35", title: "Mr", supervisor: "Amanda Boyd", salary: "59000" },
  { id: 130, name: "Katherine Bowman", email: "katherinebowman@gmail.com", role: "Developer", status: "Active", createdAt: "2021-11-10", updatedAt: "2023-02-02", age: "30", title: "Ms", supervisor: "Ryan Mason", salary: "88000" },
  { id: 131, name: "Samuel Webb", email: "samuelwebb@outlook.com", role: "HR", status: "Active", createdAt: "2018-06-18", updatedAt: "2022-09-25", age: "42", title: "Mr", supervisor: "Melissa Morrison", salary: "67000" },
  { id: 132, name: "Danielle Riley", email: "daniellebrown@gmail.com", role: "Admin", status: "Active", createdAt: "2022-08-23", updatedAt: "2023-01-10", age: "37", title: "Ms", supervisor: "Brandon Chavez", salary: "112000" },
  { id: 133, name: "Dylan Thomas", email: "dylanthomas@company.com", role: "Manager", status: "Active", createdAt: "2020-12-03", updatedAt: "2022-12-26", age: "36", title: "Mr", supervisor: "Danielle Riley", salary: "92000" },
  { id: 134, name: "Olivia Evans", email: "oliviaevans@yahoo.com", role: "Developer", status: "Inactive", createdAt: "2019-05-27", updatedAt: "2021-09-16", age: "28", title: "Ms", supervisor: "Dylan Thomas", salary: "78000" },
  { id: 135, name: "Nathan Turner", email: "nathanturner@gmail.com", role: "Designer", status: "Active", createdAt: "2021-04-16", updatedAt: "2023-02-28", age: "33", title: "Mr", supervisor: "Christina Gutierrez", salary: "75000" },
  { id: 136, name: "Madison Parker", email: "madisonparker@outlook.com", role: "QA", status: "Active", createdAt: "2018-10-31", updatedAt: "2022-08-18", age: "43", title: "Ms", supervisor: "Gregory Fernandez", salary: "60000" },
  { id: 137, name: "Tyler Collins", email: "tylercollins@gmail.com", role: "Developer", status: "Active", createdAt: "2022-06-14", updatedAt: "2023-03-11", age: "27", title: "Mr", supervisor: "Katherine Bowman", salary: "82000" },
  { id: 138, name: "Hannah Stewart", email: "hannahstewart@company.com", role: "HR", status: "Active", createdAt: "2020-05-09", updatedAt: "2022-10-21", age: "35", title: "Ms", supervisor: "Samuel Webb", salary: "65000" },
  { id: 139, name: "Zachary Sanchez", email: "zacharysanchez@yahoo.com", role: "Admin", status: "Suspended", createdAt: "2019-08-19", updatedAt: "2021-12-07", age: "46", title: "Mr", supervisor: "Danielle Riley", salary: "132000" },
  { id: 140, name: "Victoria Morris", email: "victoriamorris@gmail.com", role: "Manager", status: "Active", createdAt: "2021-01-12", updatedAt: "2023-01-26", age: "39", title: "Ms", supervisor: "Zachary Sanchez", salary: "95000" },
  { id: 141, name: "Ethan Rogers", email: "ethanrogers@outlook.com", role: "Developer", status: "Active", createdAt: "2018-04-09", updatedAt: "2022-11-30", age: "41", title: "Mr", supervisor: "Victoria Morris", salary: "101000" },
  { id: 142, name: "Grace Reed", email: "gracereed@gmail.com", role: "Designer", status: "Inactive", createdAt: "2022-12-18", updatedAt: "2023-02-24", age: "24", title: "Ms", supervisor: "Nathan Turner", salary: "68000" },
  { id: 143, name: "Noah Cook", email: "noahcook@company.com", role: "QA", status: "Active", createdAt: "2020-11-01", updatedAt: "2022-12-13", age: "32", title: "Mr", supervisor: "Madison Parker", salary: "57000" },
  { id: 144, name: "Alyssa Bailey", email: "alyssabailey@yahoo.com", role: "Developer", status: "Active", createdAt: "2019-03-15", updatedAt: "2023-01-20", age: "34", title: "Ms", supervisor: "Tyler Collins", salary: "86000" },
  { id: 145, name: "Logan Rivera", email: "loganrivera@gmail.com", role: "HR", status: "Active", createdAt: "2021-08-25", updatedAt: "2022-09-13", age: "30", title: "Mr", supervisor: "Hannah Stewart", salary: "62000" },
  { id: 146, name: "Chloe Cooper", email: "chloecooper@outlook.com", role: "Admin", status: "Active", createdAt: "2018-12-29", updatedAt: "2022-10-07", age: "49", title: "Ms", supervisor: "Zachary Sanchez", salary: "138000" },
  { id: 147, name: "Caleb Richardson", email: "calebrichardson@gmail.com", role: "Manager", status: "Active", createdAt: "2022-04-20", updatedAt: "2023-02-09", age: "35", title: "Mr", supervisor: "Chloe Cooper", salary: "89000" },
  { id: 148, name: "Samantha Cox", email: "samanthacox@company.com", role: "Developer", status: "Active", createdAt: "2020-08-05", updatedAt: "2022-11-23", age: "29", title: "Ms", supervisor: "Caleb Richardson", salary: "83000" },
  { id: 149, name: "Elijah Howard", email: "elijahhoward@yahoo.com", role: "Designer", status: "Inactive", createdAt: "2019-12-28", updatedAt: "2021-11-11", age: "36", title: "Mr", supervisor: "Grace Reed", salary: "76000" },
  { id: 150, name: "Natalie Ward", email: "natalieward@gmail.com", role: "QA", status: "Active", createdAt: "2021-05-31", updatedAt: "2023-03-16", age: "27", title: "Ms", supervisor: "Noah Cook", salary: "58000" }
];


export { data, columns, rowActions, filterOptions };