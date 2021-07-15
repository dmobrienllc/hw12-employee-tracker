const mysql2 = require('mysql2');
const Employee = require("./employee");
const {config } = require('../config/creds');

class TeamController {
    constructor() {
        this.connection = mysql2.createConnection(config);
        //this.employees = [];
    }

  endConnection(){
    this.connection.end();
  }

  getAllEmployees(){
      let employees = [];

      const query = 'SELECT id,first_name, last_name, manager_id,role_id FROM employee;';
      this.connection.query(query,(err, res) => {
        if (err) throw err;

        res.forEach(({ id, first_name, last_name, manager_id,roleId }) => {
            let emp = new Employee(id,first_name,last_name,manager_id,roleId);
            
            employees.push(emp);
        });

      return employees;
    });
  }
    

    addIntern(id, name,email,school){
        let intern = new Intern(id, name,email,school);
        this.teamMembers.push(intern);
    }

    addEngineer(id, name,email,gitHubAcct){
      let engineer = new Engineer(id, name,email,gitHubAcct);
      this.teamMembers.push(engineer);
  }

    getTeamName(){
        return this.teamName;
      }
  
    getTeamMemberCount(){
        return this.teamMembers.length;
      }
  
    getNextTeamMember(){
        return this.teamMembers.shift()[0];
    }

    getManager(){
        return this.teamMembers.filter(member => (member.getRole() === "Manager"))[0];
    }
  }

  module.exports = TeamController;


    
