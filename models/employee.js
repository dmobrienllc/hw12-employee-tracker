class Employee {
    constructor(id, name,title,salary,department,manager) {
      this.id = id;
      this.name = name;
      this.title = title;
      this.salary = salary;
      this.department = department;
      this.manager = manager;
      this.isManager = (manager.length > 3 ? 'No' : 'Yes');
    }

    getId(){
      return this.id;
    }

    getName(){
      return this.name;
    }

    getRole(){
      return this.title;
    }

    getSalary(){
      return this.salary;
    }

    getDepartment(){
      return this.department;
    }

    getManager(){
      return this.manager;
    }
  }
  module.exports = Employee;