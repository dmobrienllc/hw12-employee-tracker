class Employee {
    constructor(id, firstName, lastName,roleId,managerId) {
      this.id = id;
      this.firstName = firstName;
      this.lastName = lastName;
      this.roleId = roleId;
      this.roleId = managerId;
    }

    getId(){
      return this.id;
    }

    getName(){
      return (this.lastName + ", " + this.firstName);
    }

    getRoleId(){
      return this.roleId;
    }

    getManagerId(){
      return this.managerId;
    }
  }
  module.exports = Employee;