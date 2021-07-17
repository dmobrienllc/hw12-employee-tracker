const mysql2 = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { config } = require('./config/creds');
const Employee = require("./models/employee");
const Department = require("./models/department");
const Role = require("./models/role");
//const TeamController = require("./models/team-controller");

const connection = mysql2.createConnection(config);

connection.connect((err) => {
    if (err) throw err;
    runSearch();
});

const runSearch = () => {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Departments',
                'View All Roles',
                'View All Non-Manager Roles',
                'View All Managers',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Update Employee Role',
                'Exit',
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'View All Employees':
                    getAllEmployees()
                        .then((response) => {
                            displayResults(response);
                        })
                        .then(() => runSearch())
                        .catch((err) => console.error('Promise rejected:', err));
                    break;

                case 'View All Departments':
                    getAllDepartments()
                        .then((response) => {
                            displayResults(response);
                        })
                        .then(() => runSearch())
                        .catch((err) => console.error('Promise rejected:', err));
                    break;

                case 'View All Roles':
                    getAllRoles()
                        .then((response) => {
                            displayResults(response);
                        })
                        .then(() => runSearch())
                        .catch((err) => console.error('Promise rejected:', err));
                    break;

                case 'View All Managers':
                    getAllManagers()
                        .then((response) => {
                            displayResults(response);
                        })
                        .then(() => runSearch())
                        .catch((err) => console.error('Promise rejected:', err));
                    break;

                case 'View All Non-Manager Roles':
                    getEmployeeRoles()
                        .then((response) => {
                            displayResults(response);
                        })
                        .then(() => runSearch())
                        .catch((err) => console.error('Promise rejected:', err));
                    break;

                case 'Add Role':
                    addRole();
                    break;

                case 'Add Department':
                    addDepartment();
                break;

                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;

                case 'Exit':
                    connection.end();
                    break;

                default:
                    console.log(`Invalid action, try again: ${answer.action}`);
                    runSearch();
                    break;
            }
        });
};


const getEmployeesByCriteria = () => {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'View all employees by....',
            choices: [
                'Manager',
                'Role'
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'Manager':
                    getManagers();
                    break;

                case 'Role':
                    getAllRoles();
                    break;
            }
        });
};

const multiSearch = () => {
    const query =
        'SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1';
    connection.query(query, (err, res) => {
        if (err) throw err;
        res.forEach(({ artist }) => console.log(artist));
        runSearch();
    });
};

const rangeSearch = () => {
    inquirer
        .prompt([
            {
                name: 'start',
                type: 'input',
                message: 'Enter starting position: ',
                validate(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                },
            },
            {
                name: 'end',
                type: 'input',
                message: 'Enter ending position: ',
                validate(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                },
            },
        ])
        .then((answer) => {
            const query =
                'SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?';
            connection.query(query, [answer.start, answer.end], (err, res) => {
                if (err) throw err;
                res.forEach(({ position, song, artist, year }) =>
                    console.log(
                        `Position: ${position} || Song: ${song} || Artist: ${artist} || Year: ${year}`
                    )
                );
                runSearch();
            });
        });
};

const songSearch = () => {
    inquirer
        .prompt({
            name: 'song',
            type: 'input',
            message: 'What song would you like to look for?',
        })
        .then((answer) => {
            console.log(`You searched for "${answer.song}"`);
            connection.query(
                'SELECT * FROM top5000 WHERE ?',
                { song: answer.song },
                (err, res) => {
                    if (err) throw err;
                    if (res[0]) {
                        console.log(
                            `Position: ${res[0].position} || Song: ${res[0].song} || Artist: ${res[0].artist} || Year: ${res[0].year}`
                        );
                        runSearch();
                    } else {
                        console.error('Song not found :(\n');
                        runSearch();
                    }
                }
            );
        });
};

//BEGIN VIEW LAYER
const displayResults = (input) => {
    console.table(input);
}
//END VIEW LAYER

//BEGIN DATABASE ACCESS, TO BE MOVED TO CONTROLLER CLASS
const addEmployee = () => {
    let roles = [];

    getEmployeeRoles()
        .then((response) => {
            roles = response;

            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the employees first name?",
                    name: "fname"
                },
                {
                    type: "input",
                    message: "What is the employees last name?",
                    name: "lname"
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'Please assign employee to role:',
                    choices: roles
                }
            ]).then(({ fname, lname, role }) => {
                insertEmployeeRecord(fname, lname, role)
                    .catch((err) => console.error('Promise rejected:', err));
            }).then(() => runSearch())
        }
        ).catch((err) => console.error('Promise rejected:', err));
}

const updateEmployeeRole = () => {
    let employees = [];
    let roles = [];

    getAllEmployees()
        .then((response) => {
            employees = response;

            getEmployeeRoles()
            .then((response) => {
                roles = response;

                inquirer.prompt([
                {
                    name: 'employee_name',
                    type: 'list',
                    message: 'Please choose employee to assign new role:',
                    choices: employees
                },
                {
                    name: 'new_role',
                    type: 'list',
                    message: 'Please assign employee to new role:',
                    choices: roles
                }
                ]).then(({ employee_name, new_role}) => {
                    updateEmployeeRoleRecord(employee_name, new_role)
                        .catch((err) => console.error('Promise rejected:', err));
                }).then(() => runSearch())
            }).catch((err) => console.error('Promise rejected:', err));
        }).catch((err) => console.error('Promise rejected:', err));
}

const addRole = () => {
    let departments = [];

    getAllDepartments()
        .then((response) => {
            departments = response;
  
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the new role title?",
                    name: "role_title"
                },
                {
                    type: "input",
                    message: "What is the new role salary?",
                    name: "role_salary"
                },
                {
                    name: 'is_manager_role',
                    type: 'list',
                    message: 'Is this a managerial role?',
                    choices: [
                        'Yes',
                        'No'
                    ]
                },
                {
                    name: 'role_department',
                    type: 'list',
                    message: 'Please assign role to department:',
                    choices: departments
                }
            ]).then(({ role_title, role_salary,is_manager_role,role_department }) => {
                insertRoleRecord(role_title, role_salary,is_manager_role,role_department )
                    .catch((err) => console.error('Promise rejected:', err));
            }).then(() => runSearch())
        }
        ).catch((err) => console.error('Promise rejected:', err));
}

const addDepartment = () => {

    inquirer.prompt([
        {
            type: "input",
            message: "What is the Department name?",
            name: "dname"
        },
        {
            type: "input",
            message: "What is the new Manager Role name?",
            name: "rolename"
        },
        {
            type: 'input',
            message: 'What is the new managers first name?',
            name: 'firstname'
        },
        {
            type: 'input',
            message: 'What is the new managers last name?',
            name: 'lastname'
        },
        {
            type: 'input',
            message: 'What is the new role salary?',
            name: 'salary'
        }
    ]).then(({ dname,rolename,firstname, lastname, salary }) => {
        insertDepartmentRecord(dname,rolename,firstname, lastname, salary)
            .catch((err) => console.error('Promise rejected:', err));
    }).then(() => runSearch())
}

const updateEmployeeRoleRecord = (employee_name, new_role) => {
    let parsedName = employee_name.split(" ");
    let first_name = parsedName[0];
    let last_name = parsedName[1];

    return new Promise((resolve, reject) => {
        connection.query("call UpdateEmployeeRole2(?,?,?)", [first_name, last_name,new_role], (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }
            resolve("Success");
        })
    });
}

let getAllEmployees = () => {
    let query = `SELECT emp.id,
                CONCAT(emp.first_name,' ',emp.last_name) AS employee,
                role.title,
                SUBSTRING_INDEX(role.salary, ".", 1) AS salary,
                dept.name AS dept_name,
                CONCAT(mgr.first_name,' ',mgr.last_name) AS manager
                FROM employee_management_db.employee AS emp
                INNER JOIN employee_management_db.role AS role
                ON emp.role_id = role.id
                INNER JOIN employee_management_db.department AS dept
                    ON dept.id = role.department_id
                INNER JOIN employee_management_db.employee AS mgr
                ON emp.manager_id = mgr.id;`

    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }

            let employees = [];

            res.forEach(({ id, employee, title, salary, dept_name, manager }) => {
                let emp = new Employee(id, employee, title, salary, dept_name, manager);
                employees.push(emp);
            });
            resolve(employees);
        })
    });
};

let getAllManagers = () => {
    let query = `SELECT emp.id,
                    CONCAT(emp.first_name,' ',emp.last_name) AS employee,
                    role.title,
                    SUBSTRING_INDEX(role.salary, ".", 1) AS salary,
                    dept.name AS dept_name,
                    'N/A' AS manager
                FROM employee_management_db.employee AS emp
                INNER JOIN employee_management_db.role AS role
                    ON emp.role_id = role.id
                INNER JOIN employee_management_db.department AS dept
                    ON dept.id = role.department_id
                WHERE role.is_manager = 1;`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }

            let employees = [];

            res.forEach(({ id, employee, title, salary, dept_name, manager }) => {
                let emp = new Employee(id, employee, title, salary, dept_name, manager);
                employees.push(emp);
            });
            resolve(employees);
        })
    });
};

let getAllRoles = () => {
    const query = 'SELECT id,title,salary,department_id FROM role;';

    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }

            let roles = [];

            res.forEach(({ id, title, salary, department_id }) => {
                let role = new Role(id, title, salary, department_id);

                roles.push(role);
            });
            resolve(roles);
        })
    });
};

let insertDepartmentRecord = (dept_nm, role_nm, mgr_fname,mgr_lname,role_salary) => {

    return new Promise((resolve, reject) => {
        connection.query("call InsertDepartment(?,?,?,?,?)", [dept_nm, role_nm, mgr_fname,mgr_lname,role_salary], (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }
            resolve("Success");
        })
    });
}

let insertRoleRecord = (role_title, role_salary,is_manager_role,role_department) => {
    return new Promise((resolve, reject) => {
        connection.query("call InsertRole4(?,?,?,?)", [role_title, role_salary,is_manager_role,role_department], (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }
            resolve("Success");
        })
    });
};

let insertEmployeeRecord = (first_name, last_name, role) => {
    const query = `INSERT INTO employee_management_db.employee(first_name,last_name,role_id,manager_id)
                    SELECT '${first_name}','${last_name}',emp_role.id, mgr.mgr_id
                    FROM employee_management_db.role AS emp_role
                    INNER JOIN employee_management_db.department AS emp_dept
                        ON emp_role.department_id = emp_dept.id
                    inner join 
                    (
                        select tmp_mgr.id AS mgr_id,
                                tmp_dept.id AS dept_id
                        from  employee_management_db.employee AS tmp_mgr
                        INNER JOIN employee_management_db.role AS tmp_role
                            ON tmp_mgr.role_id = tmp_role.id
                        INNER JOIN employee_management_db.department tmp_dept
                            ON tmp_role.department_id = tmp_dept.id
                        WHERE tmp_role.is_manager = 1
                    
                    ) AS mgr on emp_dept.id = mgr.dept_id
                    WHERE emp_role.title = '${role}';`

    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }
            resolve("Success");
        })
    });
};

let getEmployeeRoles = () => {
    const query = `SELECT role.title FROM employee_management_db.role AS role 
                   WHERE id NOT IN (SELECT emp.role_id FROM employee_management_db.employee AS emp 
                    WHERE emp.manager_id IS NULL)`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }

            let roles = [];

            res.forEach(({ title }) => {
                roles.push(title);
            });
            resolve(roles);
        })
    });
};

let getAllDepartments = () => {
    const query = 'SELECT name FROM department;';

    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) {
                reject(new Error(err.message));
            }
            let departments = [];

            res.forEach(({ id, name }) => {
                let dept = new Department(id, name);

                departments.push(dept);
            });
            resolve(departments);
        })
    });
};

//END DATABASE ACCESS
