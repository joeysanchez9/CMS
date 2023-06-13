const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create a connection to the MySQL database
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'work_db',
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
  start();
});

// Main menu function
function start() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartments();
          break;

        case 'View all roles':
          viewRoles();
          break;

        case 'View all employees':
          viewEmployees();
          break;

        case 'Add a department':
          addDepartment();
          break;

        case 'Add a role':
          addRole();
          break;

        case 'Add an employee':
          addEmployee();
          break;

        case 'Update an employee role':
          updateEmployeeRole();
          break;

        case 'Exit':
          connection.end();
          break;

        default:
          console.log('Invalid option.');
          start();
      }
    });
}

// Function to view all departments
function viewDepartments() {
  connection.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all roles
function viewRoles() {
  const query =
    'SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles INNER JOIN departments ON roles.department_id = departments.id';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all employees
function viewEmployees() {
  const query =
    'SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees manager ON employees.manager_id = manager.id';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt({
      name: 'name',
      type: 'input',
      message: 'Enter the name of the department:',
    })
    .then((answer) => {
      connection.query(
        'INSERT INTO departments SET ?',
        { name: answer.name },
        (err) => {
          if (err) throw err;
          console.log('Department added successfully!');
          start();
        }
      );
    });
}

// Function to add a role
function addRole() {
  connection.query('SELECT * FROM departments', (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'Enter the title of the role:',
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Enter the salary for the role:',
        },
        {
          name: 'department',
          type: 'list',
          message: 'Select the department for the role:',
          choices: departments.map((department) => department.name),
        },
      ])
      .then((answers) => {
        const department = departments.find(
          (dept) => dept.name === answers.department
        );

        connection.query(
          'INSERT INTO roles SET ?',
          {
            title: answers.title,
            salary: answers.salary,
            department_id: department.id,
          },
          (err) => {
            if (err) throw err;
            console.log('Role added successfully!');
            start();
          }
        );
      });
  });
}

// Function to add an employee
function addEmployee() {
  connection.query('SELECT * FROM roles', (err, roles) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'firstName',
          type: 'input',
          message: "Enter the employee's first name:",
        },
        {
          name: 'lastName',
          type: 'input',
          message: "Enter the employee's last name:",
        },
        {
          name: 'role',
          type: 'list',
          message: "Select the employee's role:",
          choices: roles.map((role) => role.title),
        },
        {
          name: 'manager',
          type: 'list',
          message: "Select the employee's manager:",
          choices: ['None'].concat(
            employees.map((employee) =>
              `${employee.first_name} ${employee.last_name}`
            )
          ),
        },
      ])
      .then((answers) => {
        const role = roles.find((role) => role.title === answers.role);
        const managerName = answers.manager.split(' ');
        const managerFirstName = managerName[0];
        const managerLastName = managerName[1];

        connection.query(
          'INSERT INTO employees SET ?',
          {
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: role.id,
            manager_id: null,
          },
          (err) => {
            if (err) throw err;
            console.log('Employee added successfully!');
            start();
          }
        );
      });
  });
}

// Function to update an employee's role
function updateEmployeeRole() {
  connection.query('SELECT * FROM employees', (err, employees) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'employee',
          type: 'list',
          message: 'Select the employee to update:',
          choices: employees.map((employee) =>
            `${employee.first_name} ${employee.last_name}`
          ),
        },
        {
          name: 'role',
          type: 'list',
          message: 'Select the new role for the employee:',
          choices: roles.map((role) => role.title),
        },
      ])
      .then((answers) => {
        const employeeName = answers.employee.split(' ');
        const employeeFirstName = employeeName[0];
        const employeeLastName = employeeName[1];
        const role = roles.find((role) => role.title === answers.role);

        connection.query(
          'UPDATE employees SET role_id = ? WHERE first_name = ? AND last_name = ?',
          [role.id, employeeFirstName, employeeLastName],
          (err) => {
            if (err) throw err;
            console.log('Employee role updated successfully!');
            start();
          }
        );
      });
  });
}
