const mysql = require('mysql2');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_database_name',
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');

  // Seed data for departments
  const departments = [
    { name: 'Sales' },
    { name: 'Engineering' },
    { name: 'Marketing' },
    { name: 'Human Resources' },
  ];

  // Seed data for roles
  const roles = [
    { title: 'Sales Manager', salary: 80000, department_id: 1 },
    { title: 'Sales Representative', salary: 50000, department_id: 1 },
    { title: 'Software Engineer', salary: 90000, department_id: 2 },
    { title: 'Marketing Coordinator', salary: 55000, department_id: 3 },
    { title: 'HR Manager', salary: 75000, department_id: 4 },
  ];

  // Seed data for employees
  const employees = [
    { first_name: 'John', last_name: 'Doe', role_id: 1, manager_id: null },
    { first_name: 'Jane', last_name: 'Smith', role_id: 2, manager_id: 1 },
    { first_name: 'Mike', last_name: 'Johnson', role_id: 3, manager_id: 1 },
    { first_name: 'Sarah', last_name: 'Williams', role_id: 4, manager_id: null },
    { first_name: 'Chris', last_name: 'Lee', role_id: 5, manager_id: 4 },
  ];

  // Insert departments
  connection.query('INSERT INTO departments SET ?', departments, (err, results) => {
    if (err) throw err;
    console.log(`${results.affectedRows} departments inserted.`);

    // Get the inserted department IDs
    const departmentIds = results.insertId + departments.length - 1;

    // Update department_id for roles
    roles.forEach((role) => {
      role.department_id += departmentIds;
    });

    // Insert roles
    connection.query('INSERT INTO roles SET ?', roles, (err, results) => {
      if (err) throw err;
      console.log(`${results.affectedRows} roles inserted.`);

      // Get the inserted role IDs
      const roleIds = results.insertId + roles.length - 1;

      // Update role_id for employees
      employees.forEach((employee) => {
        employee.role_id += roleIds;
      });

      // Insert employees
      connection.query('INSERT INTO employees SET ?', employees, (err, results) => {
        if (err) throw err;
        console.log(`${results.affectedRows} employees inserted.`);
        connection.end(); // Close the connection after seeding
      });
    });
  });
});
